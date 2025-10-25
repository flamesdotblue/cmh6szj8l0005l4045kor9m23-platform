import { useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import Calendar from './components/Calendar';
import PdfCreator from './components/PdfCreator';
import DocumentList from './components/DocumentList';
import { Calendar as CalendarIcon, FileText } from 'lucide-react';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getTodayISO() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const docs = JSON.parse(localStorage.getItem('docs_v1') || '[]');
      const evts = JSON.parse(localStorage.getItem('events_v1') || '[]');
      setDocuments(Array.isArray(docs) ? docs : []);
      setEvents(Array.isArray(evts) ? evts : []);
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('docs_v1', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('events_v1', JSON.stringify(events));
  }, [events]);

  const docsById = useMemo(() => {
    const map = new Map();
    documents.forEach((d) => map.set(d.id, d));
    return map;
  }, [documents]);

  const handleSaveDocument = (doc) => {
    if (!doc.id) doc.id = uid();
    setDocuments((prev) => {
      const exists = prev.find((d) => d.id === doc.id);
      if (exists) {
        return prev.map((d) => (d.id === doc.id ? { ...d, ...doc } : d));
      }
      return [{ ...doc, createdAt: doc.createdAt || new Date().toISOString() }, ...prev];
    });
  };

  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setEvents((prev) => prev.map((e) => (e.documentId === id ? { ...e, documentId: undefined } : e)));
  };

  const handleAddEvent = ({ date, title, documentId }) => {
    const newEvent = { id: uid(), date, title: title || 'Untitled', documentId };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeroCover />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><CalendarIcon size={18} /></div>
              <h2 className="text-lg font-semibold">Calendar</h2>
            </div>
            <Calendar
              events={events}
              documents={documents}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              docsById={docsById}
            />
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><FileText size={18} /></div>
              <h2 className="text-lg font-semibold">Create PDF</h2>
            </div>
            <PdfCreator
              onSaveDocument={handleSaveDocument}
              onAddToCalendar={(date, doc, title) => handleAddEvent({ date, documentId: doc.id, title })}
              defaultDate={getTodayISO()}
            />
          </div>
        </section>

        <section className="mt-6">
          <DocumentList
            documents={documents}
            onDelete={handleDeleteDocument}
          />
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center text-neutral-400">
        <p className="text-sm">Your schedule and documents, together.</p>
      </footer>
    </div>
  );
}
