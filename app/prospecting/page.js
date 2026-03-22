"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Loader2, Save, ExternalLink, MapPin, Mail, Phone, Globe, CheckCircle, ChevronDown, ChevronUp, Settings2, Star, ArrowRight, RefreshCw, Send, Shield } from 'lucide-react';

function QualityBar({ score }) {
  const color = score >= 70 ? 'var(--accent-success)' : score >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)';
  const label = score >= 70 ? 'Strong' : score >= 40 ? 'Fair' : 'Weak';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.6875rem' }}>
      <div style={{ width: '48px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--bg-hover)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', backgroundColor: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function ProspectingPage() {
  const router = useRouter();
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

    const phaseTimers = [
      setTimeout(() => setPhase('enriching'), 3000),
      setTimeout(() => setPhase('analyzing'), 8000),
    ];

    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), maxResults }),
      });

      phaseTimers.forEach(clearTimeout);

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
          opportunityLevel: lead.qualityScore >= 70 ? 'critical' : lead.qualityScore >= 40 ? 'high' : 'medium',
          stage: 'New Lead',
          notes: [
            lead.why ? `OPPORTUNITY: ${lead.why}` : '',
            lead.summary ? `SUMMARY: ${lead.summary}` : '',
            lead.rating ? `GOOGLE: ${lead.rating}/5 (${lead.reviewCount} reviews)` : '',
          ].filter(Boolean).join('\n\n'),
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

  const handleSaveAll = async () => {
    const unsavedLeads = leads
      .map((lead, i) => ({ lead, index: i }))
      .filter(({ index }) => !savedIds.has(index));

    for (const { lead, index } of unsavedLeads) {
      await handleSave(lead, index);
    }
  };

  const savedCount = savedIds.size;
  const unsavedCount = leads.length - savedCount;

  const phaseMessages = {
    searching: 'Finding businesses matching your criteria...',
    enriching: 'Scraping websites for contact info...',
    analyzing: 'AI is qualifying each prospect...',
  };

  return (
    <div className="prospects-page">
      <div className="header-row">
        <div>
          <h1>AI Prospecting</h1>
          <p className="text-muted">Search for businesses, review prospects, then save the best ones to your pipeline.</p>
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
            {loading ? 'Searching...' : 'Find Prospects'}
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
          <p className="text-muted" style={{ fontSize: '0.8125rem' }}>This typically takes 10–20 seconds</p>

          {/* Phase Steps */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-6)', fontSize: '0.75rem' }}>
            {[
              { key: 'searching', label: 'Discover' },
              { key: 'enriching', label: 'Enrich' },
              { key: 'analyzing', label: 'Qualify' },
            ].map((step, i) => {
              const phases = ['searching', 'enriching', 'analyzing'];
              const currentIdx = phases.indexOf(phase);
              const stepIdx = phases.indexOf(step.key);
              const isDone = stepIdx < currentIdx;
              const isActive = stepIdx === currentIdx;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isDone ? 'var(--accent-success)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 400 }}>
                  {isDone ? <CheckCircle size={14} /> : isActive ? <Loader2 size={14} className="spin" /> : <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid var(--border-strong)', display: 'inline-block' }} />}
                  {step.label}
                </div>
              );
            })}
          </div>

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

      {/* Error with retry */}
      {error && (
        <div className="panel" style={{ padding: 'var(--space-5)', borderLeft: '3px solid var(--accent-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--accent-danger)', fontWeight: 600, marginBottom: '4px' }}>Search Failed</p>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>{error}</p>
            </div>
            <button className="btn btn-secondary" onClick={handleSearch} style={{ flexShrink: 0 }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      {leads.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.0625rem' }}>
                {leads.length} prospects found
              </p>
              {meta && (
                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Search size={11} /> {meta.discovered} discovered</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> {meta.enriched} with email</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={11} /> {leads.filter(l => l.qualityScore >= 70).length} strong leads</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {unsavedCount > 0 && (
                <button className="btn btn-secondary" onClick={handleSaveAll} style={{ fontSize: '0.8125rem' }}>
                  <Save size={14} /> Save All ({unsavedCount})
                </button>
              )}
              {savedCount > 0 && (
                <button className="btn btn-primary" onClick={() => router.push('/outreach')} style={{ fontSize: '0.8125rem' }}>
                  <Send size={14} /> Write Outreach
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Result Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-4)' }}>
            {leads.map((lead, i) => {
              const isSaved = savedIds.has(i);
              const isSaving = savingId === i;

              return (
                <div key={i} className="panel" style={{
                  padding: 'var(--space-5)',
                  transition: 'all 0.2s ease',
                  border: isSaved ? '1px solid var(--accent-success)' : '1px solid var(--border-subtle)',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>{lead.companyName}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: '4px' }}>
                        {lead.contactName && <span className="text-muted" style={{ fontSize: '0.8125rem' }}>{lead.contactName}</span>}
                        {lead.rating && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--accent-warning)' }}>
                            <Star size={11} style={{ fill: 'var(--accent-warning)' }} />
                            {lead.rating}
                            <span style={{ color: 'var(--text-muted)' }}>({lead.reviewCount})</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
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
                      {lead.qualityScore != null && <QualityBar score={lead.qualityScore} />}
                    </div>
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
                        <Mail size={13} style={{ color: 'var(--accent-success)', flexShrink: 0 }} /> {lead.email}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', opacity: 0.6 }}>
                        <Mail size={13} style={{ flexShrink: 0 }} /> Email not found
                      </div>
                    )}
                    {lead.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {lead.phone}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', opacity: 0.6 }}>
                        <Phone size={13} style={{ flexShrink: 0 }} /> Phone not found
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
                        Opportunity
                      </strong>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{lead.why}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {isSaved ? (
                      <button className="btn btn-secondary" onClick={() => router.push('/outreach')} style={{ flex: 1, color: 'var(--accent-success)' }}>
                        <CheckCircle size={15} /> Saved — Write Outreach <ArrowRight size={14} />
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
          <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Enter a trade and location above. The AI will find real businesses, scrape their contact info, and tell you exactly why each one is worth reaching out to.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-8)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Search size={14} /> Find</div>
            <ArrowRight size={14} style={{ color: 'var(--border-strong)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14} /> Save</div>
            <ArrowRight size={14} style={{ color: 'var(--border-strong)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Send size={14} /> Outreach</div>
          </div>
        </div>
      )}
    </div>
  );
}
