export function parseCsv(source) {
  const text = source.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(field);
  if (row.some(cell => cell.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('CSV needs a header and at least one row.');
  const header = rows.shift().map(cell => cell.trim().toLowerCase());
  const textIdx = header.indexOf('text');
  const labelIdx = header.indexOf('label');
  if (textIdx < 0) throw new Error('Missing required “text” column.');
  if (rows.length > 200) throw new Error('Maximum 200 rows allowed.');
  return rows.map((cells, i) => {
    const value = (cells[textIdx] || '').trim();
    const label = labelIdx < 0 ? '' : (cells[labelIdx] || '').trim().toLowerCase();
    if (!value || value.length > 5000) throw new Error(`Row ${i + 2}: text must contain 1–5000 characters.`);
    if (label && !['positive', 'neutral', 'negative'].includes(label)) throw new Error(`Row ${i + 2}: invalid label “${label}”.`);
    return { text: value, ...(label ? { label } : {}) };
  });
}

export function downloadCsv(rows, filename = 'sentiment-results.csv') {
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [ ['text', 'predicted', 'score', 'actual'].map(escape).join(',') ];
  rows.forEach(row => lines.push([row.text, row.predicted, row.score, row.actual].map(escape).join(',')));
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], {type: 'text/csv;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
