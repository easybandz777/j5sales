"use client";

import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function PromptRulesEditor() {
  const [rules, setRules] = useState([
    { id: 1, niche: 'Apparel & Uniforms', step: 'First Touchpoint', tone: 'Direct, problem-focused', maxSentences: 5, cta: '10-min chat' },
    { id: 2, niche: 'Industrial Supply', step: 'First Touchpoint', tone: 'Consultative, ROI-focused', maxSentences: 4, cta: 'Send a case study' },
    { id: 3, niche: 'All Niches', step: 'Follow-up 1', tone: 'Helpful, nudging', maxSentences: 3, cta: 'Any thoughts?' }
  ]);

  return (
    <div className="prompt-rules-editor">
      <div className="header-row" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>System Prompt Templates</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Configure rules that the LLM uses to generate outreach sequences.</p>
        </div>
        <button className="btn btn-primary btn-sm"><Plus size={16} /> Add Rule</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {rules.map((rule, i) => (
          <div key={rule.id} className="panel p-6" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Target Niche</label>
                <select className="input" style={{ width: '100%' }} defaultValue={rule.niche}>
                  <option>All Niches</option>
                  <option>Apparel & Uniforms</option>
                  <option>Industrial Supply</option>
                  <option>Manufacturing</option>
                </select>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Sequence Step</label>
                <select className="input" style={{ width: '100%' }} defaultValue={rule.step}>
                  <option>First Touchpoint</option>
                  <option>Follow-up 1</option>
                  <option>Follow-up 2</option>
                  <option>Breakup Message</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost icon-btn" style={{ color: 'var(--accent-danger)' }}><Trash2 size={18} /></button>
              </div>
            </div>

            <div>
              <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Tone & Guidelines</label>
              <textarea 
                className="input" 
                style={{ width: '100%', minHeight: '80px', fontFamily: 'monospace' }} 
                defaultValue={`Write in a ${rule.tone.toLowerCase()} tone. Keep it under ${rule.maxSentences} sentences. Must end with CTA: '${rule.cta}'. Do NOT use generic pleasantries like 'I hope this finds you well.'`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary"><Save size={16} /> Save All Changes</button>
      </div>
    </div>
  );
}
