import React, { useState } from 'react';
import { X, Sparkles, Send, FileText, Upload, CheckCircle2, Bot, BookOpen, AlertTriangle } from 'lucide-react';
import { Declaration } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedDeclarationResult: (data: any) => void;
  activeDeclarationForContext?: Declaration | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onParsedDeclarationResult,
  activeDeclarationForContext,
}) => {
  const [activeTab, setActiveTab] = useState<'OCR' | 'MEVZUAT'>('OCR');

  // OCR state
  const [docType, setDocType] = useState<'GB' | 'IBKB'>('GB');
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [ocrError, setOcrError] = useState('');

  // Mevzuat Chat state
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Merhaba! Ben TCMB İhracat Genelgesi ve Gümrük Mevzuatı Yapay Zeka Asistanıyım. 180 günlük yasal süreler, %30-%40 zorunlu döviz satışı, 30.000 USD terkin istisnası veya banka ek süre prosedürleri hakkında dilediğinizi sorabilirsiniz.',
    },
  ]);

  if (!isOpen) return null;

  const handleParseDocument = async () => {
    if (!rawText.trim()) {
      setOcrError('Lütfen belge metnini yapıştırın.');
      return;
    }
    setOcrError('');
    setIsParsing(true);
    setParseResult(null);

    try {
      const res = await fetch('/api/gemini/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          documentType: docType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Ayrıştırma başarısız oldu.');
      }

      setParseResult(json.data);
    } catch (err: any) {
      setOcrError(err?.message || 'Hata oluştu.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyParseResult = () => {
    if (parseResult) {
      onParsedDeclarationResult(parseResult);
      onClose();
    }
  };

  const handleAskMevzuat = async () => {
    if (!question.trim()) return;
    const userQ = question;
    setQuestion('');

    setChatHistory((prev) => [...prev, { sender: 'user', text: userQ }]);
    setIsAsking(true);

    try {
      const res = await fetch('/api/gemini/mevzuat-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          declarationContext: activeDeclarationForContext || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Mevzuat danışmanına erişilemedi.');
      }

      setChatHistory((prev) => [...prev, { sender: 'ai', text: json.answer || 'Yanıt yok.' }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: `⚠️ Hata oluştu: ${err?.message || 'Mevzuat sunucusuna erişilemedi.'}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col h-[620px]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">AI EVRAK & MEVZUAT ASİSTANI</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gemini 2.5 Flash ile Otomatik OCR & TCMB Danışmanlığı</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('OCR')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'OCR'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Evrak Metni Otomatik Ayrıştırma</span>
          </button>

          <button
            onClick={() => setActiveTab('MEVZUAT')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'MEVZUAT'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>TCMB Mevzuat & İBKB Danışmanı</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'OCR' ? (
          <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
            
            <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-slate-500 font-black uppercase tracking-wider">Belge Türü:</span>
              <label className="flex items-center space-x-1.5 cursor-pointer font-extrabold text-slate-800">
                <input
                  type="radio"
                  name="docType"
                  checked={docType === 'GB'}
                  onChange={() => setDocType('GB')}
                  className="accent-indigo-600"
                />
                <span>Gümrük Beyannamesi (GB)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer font-extrabold text-slate-800">
                <input
                  type="radio"
                  name="docType"
                  checked={docType === 'IBKB'}
                  onChange={() => setDocType('IBKB')}
                  className="accent-indigo-600"
                />
                <span>İBKB / Banka Dekontu</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Gümrük Beyannamesi veya İBKB Metnini Yapıştırın:
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Örn: BEYANNAME NO: 24340100EX009812 TESCİL TARİHİ: 10/03/2026 ALICI: BERLIN TRADING GMBH TUTAR: 150000 USD..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleParseDocument}
                disabled={isParsing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-100 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isParsing ? 'YAPAY ZEKA AYRIŞTIRIYOR...' : 'YAPAY ZEKA İLE AYRIŞTIR'}</span>
              </button>
            </div>

            {ocrError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-bold">
                ⚠️ {ocrError}
              </div>
            )}

            {parseResult && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between text-indigo-900 font-black uppercase tracking-wider border-b border-indigo-100 pb-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Ayrıştırılan Veri Özeti
                  </span>
                  <button
                    onClick={handleApplyParseResult}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition shadow-md shadow-emerald-100"
                  >
                    Forma Aktar
                  </button>
                </div>

                <pre className="text-[11px] font-mono font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto">
                  {JSON.stringify(parseResult, null, 2)}
                </pre>
              </div>
            )}

          </div>
        ) : (
          /* Mevzuat Danışmanı Chat */
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            
            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 text-xs">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-md p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-bold shadow-md shadow-indigo-100'
                        : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isAsking && (
                <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider p-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>TCMB Mevzuatı inceleniyor...</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskMevzuat()}
                placeholder="Örn: 180 gün süresi dolan beyanname için ne yapılmalı?"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
              <button
                onClick={handleAskMevzuat}
                disabled={isAsking}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-black transition disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
