import { Declaration } from '../types';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
};

export const createExportSpreadsheet = async (
  accessToken: string,
  declarations: Declaration[]
): Promise<ExportResult> => {
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `TCMB İhracat & İBKB Takip Raporu - ${dateStr}`;

  // Build rows for Google Sheets
  const headers = [
    'Gümrük Beyanname No',
    'Tescil Tarihi',
    'Fiili İntaç Tarihi',
    'İhracatçı Firma',
    'İhracatçı VKN',
    'Alıcı Firma',
    'Varış Ülkesi',
    'Gümrük İdaresi',
    'Toplam Tutar',
    'Döviz Cinsi',
    'Kapatılan Tutar',
    'Kalan Açık Bakiye',
    'Kalan Süre (Gün)',
    'TCMB %40 Şartı',
    'Gerçekleşen Satış',
    'Durum',
    'Ek Süre Durumu',
    'Notlar'
  ];

  const dataRows = declarations.map((d) => [
    d.declarationNo,
    d.registrationDate,
    d.closingDate,
    d.exporterTitle,
    d.exporterTaxNo,
    d.importerTitle,
    d.destinationCountry,
    d.customsOffice,
    d.amount,
    d.currency,
    d.closedAmount,
    d.remainingAmount,
    d.daysLeft,
    d.tcmbMandatoryAmount,
    d.tcmbSoldAmount,
    d.status,
    d.hasExtension ? '+90 Gün Ek Süreli' : 'Standart 180 Gün',
    d.notes || ''
  ]);

  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'İhracat Beyannameleri',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: headers.map((h) => ({
                  userEnteredValue: { stringValue: h },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.2, green: 0.25, blue: 0.5 },
                  },
                })),
              },
              ...dataRows.map((row) => ({
                values: row.map((val, idx) => {
                  if (typeof val === 'number') {
                    return { userEnteredValue: { numberValue: val } };
                  }
                  return { userEnteredValue: { stringValue: String(val) } };
                }),
              })),
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Sheets oluşturulamadı: ${errText}`);
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  return { spreadsheetId, spreadsheetUrl };
};

export const fetchSheetData = async (
  accessToken: string,
  spreadsheetIdOrUrl: string,
  range: string = 'A1:Z100'
): Promise<string[][]> => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || 'Google Sheets verileri okunamadı.');
  }

  const data = await response.json();
  return data.values || [];
};
