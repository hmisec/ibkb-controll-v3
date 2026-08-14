const fs = require('fs');
let content = fs.readFileSync('src/components/NewsTicker.tsx', 'utf8');

const replacementFunc = `
function getValidUrl(item: NewsItem) {
  if (!item.url || item.url === '#' || item.url === '/' || !item.url.startsWith('http')) {
    return \`https://www.google.com/search?q=\${encodeURIComponent(item.text)}\`;
  }
  return item.url;
}
`;

// Insert the function before the component
content = content.replace('export const NewsTicker: React.FC', replacementFunc + '\nexport const NewsTicker: React.FC');

// Replace href={item.url} with href={getValidUrl(item)}
content = content.replace(/href=\{item\.url\}/g, 'href={getValidUrl(item)}');
// And for the toast:
content = content.replace(/href=\{criticalNews\.url\}/g, 'href={getValidUrl(criticalNews)}');


fs.writeFileSync('src/components/NewsTicker.tsx', content);
console.log('News links fixed.');
