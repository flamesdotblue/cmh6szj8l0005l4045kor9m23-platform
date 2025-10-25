import { useState } from 'react';
import { Save, Printer, CalendarPlus } from 'lucide-react';

export default function PdfCreator({ onSaveDocument, onAddToCalendar, defaultDate }) {
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(defaultDate);

  const save = () => {
    const doc = { title: title || 'Untitled Document', content, createdAt: new Date().toISOString() };
    onSaveDocument(doc);
  };

  const exportPdf = () => {
    const doc = { title: title || 'Untitled Document', content, createdAt: new Date().toISOString() };
    openPrintWindow(doc);
  };

  const addToCalendar = () => {
    const doc = { title: title || 'Untitled Document', content, createdAt: new Date().toISOString() };
    // Save first so it has an id
    const withId = { ...doc };
    // we cannot get back id from parent synchronously, so emulate by saving and then reading latest from localStorage
    onSaveDocument(withId);
    // tiny timeout to let state persist
    setTimeout(() => {
      try {
        const docs = JSON.parse(localStorage.getItem('docs_v1') || '[]');
        const matched = docs.find((d) => d.title === withId.title && d.content === withId.content);
        const chosen = matched || docs[0];
        if (chosen) {
          onAddToCalendar(date, chosen, withId.title);
        }
      } catch (e) {}
    }, 0);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-neutral-300">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40" />
      </div>
      <div>
        <label className="text-sm text-neutral-300">Content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Write your document content here..." className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-black font-medium hover:bg-blue-400"><Save size={16} /> Save</button>
        <button onClick={exportPdf} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-200 text-neutral-900 font-medium hover:bg-white/90"><Printer size={16} /> Export as PDF</button>
      </div>
      <div className="pt-2 border-t border-neutral-800">
        <label className="text-sm text-neutral-300">Add to Calendar</label>
        <div className="mt-2 flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2" />
          <button onClick={addToCalendar} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400"><CalendarPlus size={16} /> Add</button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">This will save the current document and create an event on the selected date.</p>
      </div>
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
