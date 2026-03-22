"use client";

import { useState, useEffect } from 'react';
import { Send, Sparkles, User, RefreshCw, Save } from 'lucide-react';
import SequenceTimeline from '@/components/SequenceTimeline';

export default function OutreachPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailCopy, setEmailCopy] = useState('');

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
      }
    }
    fetchLeads();
  }, []);

  const lead = leads.find(l => l.id === selectedLeadId);
  const [subjectLine, setSubjectLine] = useState('');

  const handleGenerate = async () => {
    if (!lead) return;
    setIsGenerating(true);
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
      } else {
        setEmailCopy('Error: ' + (data.error || 'Failed to generate'));
      }
    } catch (err) {
      setEmailCopy('Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="outreach-page">
      <div className="header-row">
        <div>
          <h1>Outreach Generator</h1>
          <p className="text-muted">Generate and sequence personalized emails based on business audits.</p>
        </div>
      </div>

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 'var(--space-6)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="panel" style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <User size={18} className="text-muted" />
              <select 
                value={selectedLeadId} 
                onChange={(e) => setSelectedLeadId(e.target.value)}
                style={{ width: '100%', maxWidth: '300px', backgroundColor: 'transparent', border: 'none', padding: 0 }}
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.companyName} ({l.contactName})</option>
                ))}
              </select>
            </div>
            <div style={{ padding: 'var(--space-4)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-secondary icon-btn" title="Save Template"><Save size={16} /></button>
            </div>
          </div>

          <div className="panel p-6" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="header-row">
              <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>Step 1: First Touchpoint</h3>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate} 
                disabled={isGenerating || !lead}
                style={{ backgroundColor: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
              >
                {isGenerating ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Generating...' : 'Generate via LLM'}
              </button>
            </div>

            <div style={{ marginTop: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Subject Line</label>
              <input type="text" value={subjectLine} onChange={e => setSubjectLine(e.target.value)} placeholder="Subject line will be AI-generated..." style={{ width: '100%', marginBottom: 'var(--space-4)' }} />
              
              <label className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Message Body</label>
              <textarea 
                style={{ width: '100%', flex: 1, fontFamily: 'monospace', minHeight: '200px', resize: 'vertical' }}
                value={emailCopy}
                onChange={(e) => setEmailCopy(e.target.value)}
                placeholder="Click 'Generate via LLM' to write a personalized email based on the business audit..."
              />
            </div>

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary">Test Send</button>
              <button className="btn btn-primary" style={{ gap: 'var(--space-2)' }}><Send size={16} /> Schedule Sequence</button>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="section-title" style={{ fontSize: '0.875rem' }}>Sequence Timeline</h3>
          <SequenceTimeline />
        </div>

      </div>
    </div>
  );
}
