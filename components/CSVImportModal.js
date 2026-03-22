"use client";

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function CSVImportModal({ isOpen, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1, 6).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; }
          else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
          else { current += char; }
        }
        values.push(current.trim());
        return values;
      });
      setPreview({ headers, rows, totalRows: lines.length - 1 });
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/leads/import', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) {
        onImportComplete?.();
      }
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h2 style={{ margin: 0 }}>Import Leads from CSV</h2>
          <button className="btn btn-ghost icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {!file && !result && (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Click to upload CSV file</p>
            <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
              Columns: Company Name, Contact Name, Email, Phone, Website, Niche, Location
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        )}

        {preview && !result && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 600 }}>{file.name}</span>
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>({preview.totalRows} rows)</span>
            </div>
            <div style={{ overflowX: 'auto', marginBottom: 'var(--space-4)' }}>
              <table style={{ width: '100%', fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    {preview.headers.map((h, i) => (
                      <th key={i} style={{ padding: 'var(--space-2)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.totalRows > 5 && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--space-2)' }}>Showing first 5 of {preview.totalRows} rows</p>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary" onClick={reset}>Choose Different File</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={loading}>
                {loading ? 'Importing...' : 'Import ' + preview.totalRows + ' Leads'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            {result.error ? (
              <>
                <AlertCircle size={48} style={{ color: 'var(--status-error)', marginBottom: 'var(--space-3)' }} />
                <p style={{ color: 'var(--status-error)', fontWeight: 600 }}>{result.error}</p>
              </>
            ) : (
              <>
                <CheckCircle size={48} style={{ color: 'var(--status-success)', marginBottom: 'var(--space-3)' }} />
                <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{result.imported} leads imported successfully!</p>
                {result.errors?.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', textAlign: 'left' }}>
                    <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: 'var(--space-2)' }}>{result.errors.length} rows skipped:</p>
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i} style={{ fontSize: '0.75rem', color: 'var(--status-warning)' }}>{err}</p>
                    ))}
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
              <button className="btn btn-secondary" onClick={reset}>Import More</button>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
