"use client";

import { useState } from 'react';
import { Search, Sparkles, Loader2, Save, ExternalLink, MapPin, Mail, Phone, Globe, CheckCircle, ChevronDown, ChevronUp, Settings2, AlertCircle } from 'lucide-react';

export default function ProspectingPage() {
  const [query, setQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [phase, setPhase] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxResults, setMaxResults] = useState(5);
  const [meta, setMeta] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setLeads([]);
    setSavedIds(new Set());
    setPhase('searching');

    // Simulate phase transitions for UX
    const phaseTimer = setTimeout(() => setPhase('analyzing'), 2000);

    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), maxResults }),
      });

      clearTimeout(phaseTimer);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate leads');
      }

      const data = await res.json();
      setLeads(data.leads || []);
      setMeta(data.meta || null);
      setPhase('done');
    } catch (err) {
      setError(err.message);
      setPhase('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (lead, index) => {
    setSavingId(index);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: lead.companyName,
          contactName: lead.contactName || 'Owner',
          email: lead.email || '',
          phone: lead.phone || '',
          website: lead.website || '',
          niche: lead.niche || '',
          location: lead.location || '',
          leadSource: 'AI Prospecting',
          opportunityLevel: 'high',
          stage: 'New Lead',
          notes: `WHY: ${lead.why || ''}\n\nSUMMARY: ${lead.summary || ''}`,
        }),
      });

      if (res.ok) {
        setSavedIds(prev => new Set([...prev, index]));
      }
    } catch (err) {
      console.error('Failed to save lead:', err);
    } finally {
      setSavingId(null);
    }
  };

  const phaseMessages = {
    searching: 'Scouring the web for businesses...',
    analyzing: 'AI is analyzing and extracting prospects...',
  };

  return (
    <div className="prospects-page">
      <div className="header-row">
        <div>
          <h1>AI Prospecting</h1>
          <p className="text-muted">Describe your target market and let AI find real prospects with contact info.</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="panel" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "Roofers in Dallas" or "Manufacturing companies in Ohio"'
              style={{ width: '100%', paddingLeft: '42px', fontSize: '1rem', height: '48px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
            style={{
              height: '48px',
              paddingInline: 'var(--space-6)',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-primary))',
              border: 'none',
              fontSize: '0.9375rem',
            }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Find Prospects'}
          </button>
        </div>

        {/* Suggestion Pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
          {['Plumbers in Chicago', 'HVAC contractors in Austin TX', 'Custom apparel companies in LA', 'Landscaping businesses in Atlanta'].map(suggestion => (
            <button
              key={suggestion}
              type="button"
              className="btn btn-ghost"
              onClick={() => setQuery(suggestion)}
              style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              {suggestion}
            </button>
          ))}
        </div>
        {/* Advanced Settings Toggle */}
        <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-ghost"
            style={{ fontSize: '0.8125rem', padding: '4px 8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings2 size={14} />
            Advanced Settings
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Max Results: <strong style={{ color: 'var(--text-primary)' }}>{maxResults}</strong></label>
              <input type="range" min={1} max={10} value={maxResults} onChange={e => setMaxResults(Number(e.target.value))} style={{ flex: 1, maxWidth: '200px' }} />
            </div>
          )}
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="panel" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Loader2 size={36} className="spin" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '1.0625rem', marginBottom: 'var(--space-2)' }}>{phaseMessages[phase] || 'Working...'}</p>
          <p className="text-muted" style={{ fontSize: '0.8125rem' }}>This typically takes 5–15 seconds</p>

          {/* Skeleton Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="panel" style={{ padding: 'var(--space-5)', opacity: 0.4 + (i * 0.15), animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}>
                <div style={{ height: '20px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)', width: '60%' }} />
                <div style={{ height: '14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)', width: '40%' }} />
                <div style={{ height: '14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', width: '80%' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="panel" style={{ padding: 'var(--space-5)', borderLeft: '3px solid var(--accent-danger)' }}>
          <p style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>Generation Failed</p>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {leads.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              <CheckCircle size={16} style={{ color: 'var(--accent-success)', marginRight: '6px', verticalAlign: '-2px' }} />
              Found {leads.length} prospects for "{query}"
            </p>
            {meta && (
              <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>🔍 {meta.discovered} discovered</span>
                <span>📧 {meta.enriched} with email</span>
                <span>⏱ {(meta.elapsedMs / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-4)' }}>
            {leads.map((lead, i) => {
              const isSaved = savedIds.has(i);
              const isSaving = savingId === i;

              return (
                <div key={i} className="panel" style={{
                  padding: 'var(--space-5)',
                  transition: 'all 0.2s ease',
                  border: isSaved ? '1px solid var(--accent-success)' : undefined,
                  opacity: isSaved ? 0.75 : 1,
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>{lead.companyName}</h3>
                      {lead.contactName && <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '2px' }}>{lead.contactName}</p>}
                    </div>
                    {lead.niche && (
                      <span style={{
                        fontSize: '0.6875rem',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--accent-indigo-alpha)',
                        color: 'var(--accent-indigo)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                      }}>
                        {lead.niche}
                      </span>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--space-4)', fontSize: '0.8125rem' }}>
                    {lead.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {lead.location}
                      </div>
                    )}
                    {lead.email ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {lead.email}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', opacity: 0.6 }}>
                        <AlertCircle size={13} style={{ flexShrink: 0 }} /> Email not found
                      </div>
                    )}
                    {lead.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {lead.phone}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', opacity: 0.6 }}>
                        <AlertCircle size={13} style={{ flexShrink: 0 }} /> Phone not found
                      </div>
                    )}
                    {lead.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {lead.summary && (
                    <div style={{ marginBottom: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {lead.summary}
                    </div>
                  )}

                  {/* Why This Lead */}
                  {lead.why && (
                    <div style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--accent-success-alpha)',
                      marginBottom: 'var(--space-4)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                    }}>
                      <strong style={{ color: 'var(--accent-success)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Why this lead?
                      </strong>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{lead.why}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {isSaved ? (
                      <button className="btn btn-secondary" disabled style={{ flex: 1, opacity: 0.6 }}>
                        <CheckCircle size={15} /> Saved to Pipeline
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleSave(lead, i)}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                        {isSaving ? 'Saving...' : 'Save to Pipeline'}
                      </button>
                    )}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary icon-btn" title="Visit Website">
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && leads.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
          <Sparkles size={48} style={{ color: 'var(--accent-purple)', marginBottom: 'var(--space-4)', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Describe your ideal customer</h3>
          <p className="text-muted" style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Enter a trade and location above. The AI will search the web, find real businesses, and tell you exactly why each one is a good prospect.
          </p>
        </div>
      )}
    </div>
  );
}
