import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash, Printer } from 'lucide-react';

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d;
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function toISO(date) {
  const tz = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
}
function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function Calendar({ events = [], documents = [], onAddEvent, onDeleteEvent, docsById }) {
  const [cursor, setCursor] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', documentId: '' });

  const days = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const startDay = start.getDay(); // 0-6
    const totalDays = end.getDate();

    const cells = [];
    // previous month's padding
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      cells.push({ day: d, iso: toISO(dayDate) });
    }
    // make full weeks (42 cells)
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const eventsByDate = useMemo(() => {
    const m = new Map();
    events.forEach((e) => {
      if (!m.has(e.date)) m.set(e.date, []);
      m.get(e.date).push(e);
    });
    return m;
  }, [events]);

  const openAdd = (iso) => {
    setSelectedDate(iso);
    setForm({ title: '', documentId: '' });
    setDialogOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    onAddEvent({ date: selectedDate, title: form.title, documentId: form.documentId || undefined });
    setDialogOpen(false);
  };

  const printDocument = (docId) => {
    if (!docId) return;
    const doc = docsById?.get(docId);
    if (!doc) return;
    openPrintWindow(doc);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700" onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
        <div className="text-center font-medium">{formatMonthYear(cursor)}</div>
        <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700" onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 text-xs text-neutral-400 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="p-2 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, idx) => (
          <div key={idx} className={`min-h-[96px] rounded-xl border border-neutral-800 bg-neutral-900/40 ${cell ? 'p-2' : 'bg-transparent border-transparent'}`}>
            {cell && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-neutral-300">{cell.day}</div>
                  <button onClick={() => openAdd(cell.iso)} className="p-1 rounded-md hover:bg-neutral-800"><Plus size={14} /></button>
                </div>
                <div className="space-y-1 overflow-auto">
                  {(eventsByDate.get(cell.iso) || []).map((e) => (
                    <div key={e.id} className="text-xs bg-neutral-800/70 border border-neutral-700 rounded-md px-2 py-1 flex items-center justify-between gap-2">
                      <span className="truncate">{e.title}</span>
                      <div className="flex items-center gap-1">
                        {e.documentId && (
                          <button title="Print linked document" onClick={() => printDocument(e.documentId)} className="p-1 rounded hover:bg-neutral-700"><Printer size={14} /></button>
                        )}
                        <button title="Delete event" onClick={() => onDeleteEvent(e.id)} className="p-1 rounded hover:bg-neutral-700 text-red-400"><Trash size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-4">
            <h3 className="font-medium mb-3">Add Event for {selectedDate}</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm text-neutral-300">Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="Meeting, Review..." />
              </div>
              <div>
                <label className="text-sm text-neutral-300">Attach Document (optional)</label>
                <select value={form.documentId} onChange={(e) => setForm((f) => ({ ...f, documentId: e.target.value }))} className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2">
                  <option value="">— None —</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDialogOpen(false)} className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400">Add Event</button>
              </div>
            </form>
          </div>
        </div>
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
