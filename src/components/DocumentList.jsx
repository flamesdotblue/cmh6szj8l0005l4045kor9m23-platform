import { Printer, Trash } from 'lucide-react';

export default function DocumentList({ documents = [], onDelete }) {
  const printDoc = (doc) => openPrintWindow(doc);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Documents</h3>
        <span className="text-sm text-neutral-400">{documents.length} total</span>
      </div>
      {documents.length === 0 ? (
        <p className="text-neutral-400 text-sm">No documents saved yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {documents.map((d) => (
            <li key={d.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-neutral-400">Created {new Date(d.createdAt || Date.now()).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => printDoc(d)} className="px-3 py-2 rounded-lg bg-neutral-200 text-neutral-900 hover:bg-white/90 flex items-center gap-2"><Printer size={16} /> Print</button>
                <button onClick={() => onDelete(d.id)} className="px-3 py-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500 flex items-center gap-2"><Trash size={16} /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function openPrintWindow(doc) {
  const w = window.open('', '_blank');
  if (!w) return;
  const style = `
    <style>
      @page { size: A4; margin: 20mm; }
      body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; }
      h1 { margin: 0 0 8px; font-size: 22px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
      .content { white-space: pre-wrap; line-height: 1.5; font-size: 14px; }
    </style>
  `;
  w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>${escapeHtml(doc.title)} - PDF</title>${style}</head><body>`);
  w.document.write(`<h1>${escapeHtml(doc.title)}</h1>`);
  w.document.write(`<div class="meta">Created: ${new Date(doc.createdAt || Date.now()).toLocaleString()}</div>`);
  w.document.write(`<div class="content">${escapeHtml(doc.content || '')}</div>`);
  w.document.write('</body></html>');
  w.document.close();
  w.focus();
  w.print();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
