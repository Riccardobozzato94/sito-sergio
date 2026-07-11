import { useState, useEffect } from 'react';
import { getSiteContent, updateSiteContent } from '../lib/admin';
import { FileText, Check, AlertCircle, Save } from 'lucide-react';

export default function AdminContent() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editIt, setEditIt] = useState('');
  const [editEn, setEditEn] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadContent(); }, []);

  async function loadContent() {
    try {
      setLoading(true);
      const data = await getSiteContent();
      setEntries(data || []);
    } catch (err) {
      setError('Errore caricamento contenuti');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(entry) {
    setEditId(entry.id);
    setEditIt(entry.value_it || '');
    setEditEn(entry.value_en || '');
    setError('');
  }

  function cancelEdit() {
    setEditId(null);
    setEditIt('');
    setEditEn('');
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSiteContent(editId, editIt, editEn);
      setSuccess('Testo aggiornato!');
      await loadContent();
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Errore salvataggio');
    } finally {
      setSaving(false);
    }
  }

  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.section]) acc[entry.section] = [];
    acc[entry.section].push(entry);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading text-white tracking-tight mb-6">Testi del Sito</h1>
      <p className="text-text-dim text-sm mb-6">Modifica i testi principali del sito. Italiano (IT) e Inglese (EN).</p>

      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <Check size={16} className="text-green-400" />
          <span className="text-green-400 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-text-dim">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Ancora nessun contenuto. Esegui la migrazione SQL.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="mb-8">
            <h2 className="text-primary font-heading text-sm uppercase tracking-widest mb-3">
              {section === 'hero' ? 'Hero' : section === 'about' ? 'Chi Siamo' : section === 'footer' ? 'Footer' : section}
            </h2>
            <div className="space-y-2">
              {items.map((entry) => (
                <div key={entry.id} className="bg-[#201c17] border border-white/[0.04] rounded-xl overflow-hidden">
                  {editId === entry.id ? (
                    <div className="p-4">
                      <p className="text-text-dim text-xs mb-2 uppercase tracking-wider">{entry.key}</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-text-dim text-[10px] uppercase block mb-1">Italiano</label>
                          <textarea
                            value={editIt}
                            onChange={(e) => setEditIt(e.target.value)}
                            rows={2}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-text-dim text-[10px] uppercase block mb-1">English</label>
                          <textarea
                            value={editEn}
                            onChange={(e) => setEditEn(e.target.value)}
                            rows={2}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <button onClick={cancelEdit} className="px-4 py-2 rounded-lg border border-border text-text-dim hover:text-white text-xs">Annulla</button>
                        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-bg font-bold text-xs hover:bg-primary-light disabled:opacity-50 flex items-center gap-1">
                          <Save size={14} /> {saving ? 'Salvataggio...' : 'Salva'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(entry)} className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-text-dim text-xs uppercase tracking-wider">{entry.key}</span>
                        <span className="text-text-dim text-[10px]">{entry.updated_at ? new Date(entry.updated_at).toLocaleDateString('it-IT') : ''}</span>
                      </div>
                      <p className="text-white text-sm line-clamp-1"><span className="text-text-dim text-xs">IT:</span> {entry.value_it}</p>
                      <p className="text-text-dim text-sm line-clamp-1 mt-0.5"><span className="text-text-dim text-xs">EN:</span> {entry.value_en}</p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
