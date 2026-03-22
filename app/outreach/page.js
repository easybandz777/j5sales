"use client";

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Mail, MapPin, Building, Globe, FileText, AlertTriangle, Copy, Check } from 'lucide-react';

function LeadContextPanel({ lead }) {
  if (!lead) return null;

  const hasAnalysis = lead.analysisData && typeof lead.analysisData === 'object' && Object.keys(lead.analysisData).length > 0;
  const hasSolutions = Array.isArray(lead.solutions) && lead.solutions.length > 0;
  const hasNotes = lead.notes && lead.notes.trim().length > 0;
  const contextPieces = [
    lead.niche && 'Industry',
    lead.location && 'Location',
    lead.website && 'Website',
    hasNotes && 'Notes',
    hasAnalysis && 'Business audit',
    hasSolutions && 'Solutions',
  ].filter(Boolean);

  const contextStrength = contextPieces.length;
  const strengthLabel = contextStrength >= 4 ? 'Rich context' : contextStrength >= 2 ? 'Basic context' : 'Sparse context';
  const strengthColor = contextStrength >= 4 ? 'var(--accent-success)' : contextStrength >= 2 ? 'var(--accent-warning)' : 'var(--accent-danger)';

  return (
    <div className="panel p-6" style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Lead Context</h3>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: strengthColor, padding: '2px 10px', borderRadius: 'var(--radius-full)', backgroundColor: `color-mix(in srgb, ${strengthColor} 15%, transparent)` }}>
          {strengthLabel}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Building size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.niche || 'Unknown industry'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.location || 'Unknown'}</span>
        </div>
        {lead.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</span>
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

      {/* What the AI will use */}
      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 'var(--space-2)' }}>AI will use</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {contextPieces.map(piece => (
            <span key={piece} style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {piece}
            </span>
          ))}
          {contextStrength < 3 && (
            <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-warning-alpha)', color: 'var(--accent-warning)' }}>
              Add more data for better emails
            </span>
          )}
        </div>
      </div>

      {hasNotes && (
        <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <FileText size={12} style={{ color: 'var(--text-muted)', marginRight: '6px', verticalAlign: '-1px' }} />
          {lead.notes.length > 200 ? lead.notes.substring(0, 200) + '...' : lead.notes}
        </div>
      )}
    </div>
  );
}

export default function OutreachPage() {
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailCopy, setEmailCopy] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.leads?.length > 0) {
          setSelectedLeadId(data.leads[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      } finally {
        setLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  const lead = leads.find(l => l.id === selectedLeadId);

  const handleLeadChange = (newId) => {
    setSelectedLeadId(newId);
    setSubjectLine('');
    setEmailCopy('');
    setGenerationError('');
    setTokensUsed(0);
  };

  const handleGenerate = async () => {
    if (!lead) return;
    setIsGenerating(true);
    setGenerationError('');
    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });
      const data = await res.json();
      if (data.success) {
        setSubjectLine(data.subject || '');
        setEmailCopy(data.content || '');
        setTokensUsed(data.tokensUsed || 0);
      } else {
        setGenerationError(data.error || 'Failed to generate email');
      }
    } catch (err) {
      setGenerationError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullEmail = `Subject: ${subjectLine}\n\n${emailCopy}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasContent = subjectLine || emailCopy;

  return (
    <div className="outreach-page">
      <div className="header-row">
        <div>
          <h1>Outreach Generator</h1>
          <p className="text-muted">Select a saved lead, review their context, then generate a personalized email.</p>
        </div>
      </div>

      {loadingLeads ? (
        <div className="panel" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p className="text-muted">Loading your saved leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="panel" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
          <Mail size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)', opacity: 0.4 }} />
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>No leads saved yet</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto var(--space-6)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Use the AI Prospecting tool to find and save leads first, then come back here to generate personalized outreach.
          </p>
          <a href="/prospecting" className="btn btn-primary">
            <Sparkles size={16} /> Find Prospects
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>

          {/* Left: Lead Selection + Context */}
          <div>
            <div className="panel" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 'var(--space-2)' }}>
                Select Lead
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                style={{ width: '100%' }}
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.companyName} — {l.contactName}
                  </option>
                ))}
              </select>
            </div>

            <LeadContextPanel lead={lead} />

            {/* How it works */}
            <div style={{ padding: 'var(--space-4)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>How it works</p>
              <ol style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Select a lead from your pipeline</li>
                <li>Review the context the AI will use</li>
                <li>Click Generate to create a cold email</li>
                <li>Edit the draft, then copy it</li>
              </ol>
            </div>
          </div>

          {/* Right: Email Editor */}
          <div className="panel p-6" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  {hasContent ? 'Generated Email' : 'Email Composer'}
                </h3>
                {lead && (
                  <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                    To: {lead.contactName} at {lead.companyName}
                  </p>
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating || !lead}
                style={{ backgroundColor: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
              >
                {isGenerating ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Generating...' : hasContent ? 'Regenerate' : 'Generate Email'}
              </button>
            </div>

            {generationError && (
              <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-danger-alpha)', border: '1px solid var(--accent-danger)', fontSize: '0.8125rem' }}>
                <AlertTriangle size={14} style={{ color: 'var(--accent-danger)', marginRight: '6px', verticalAlign: '-2px' }} />
                {generationError}
              </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Subject Line</label>
              <input
                type="text"
                value={subjectLine}
                onChange={e => setSubjectLine(e.target.value)}
                placeholder={isGenerating ? 'Generating...' : 'Click Generate to create a subject line'}
                style={{ width: '100%', marginBottom: 'var(--space-4)' }}
                readOnly={isGenerating}
              />

              <label className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Message Body</label>
              <textarea
                style={{ width: '100%', flex: 1, minHeight: '250px', resize: 'vertical', lineHeight: 1.7 }}
                value={emailCopy}
                onChange={(e) => setEmailCopy(e.target.value)}
                placeholder={isGenerating ? 'Generating personalized email...' : 'Click Generate to write a personalized cold email based on this lead\'s data.'}
                readOnly={isGenerating}
              />
            </div>

            {/* Footer actions */}
            {hasContent && (
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {tokensUsed > 0 && `${tokensUsed} tokens used`}
                </span>
                <button className="btn btn-primary" onClick={handleCopy} style={{ gap: 'var(--space-2)' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Email'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
