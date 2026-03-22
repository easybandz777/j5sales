"use client";

import { useState } from 'react';
import { Package, Check, ChevronRight } from 'lucide-react';
import { SOLUTION_CATEGORIES } from '@/lib/mockData';

export default function OfferMapper({ lead }) {
  const [selectedSolutions, setSelectedSolutions] = useState(lead.solutions || []);

  const toggleSolution = (solution) => {
    setSelectedSolutions(prev => 
      prev.includes(solution) 
        ? prev.filter(s => s !== solution)
        : [...prev, solution]
    );
  };

  return (
    <div className="panel p-6">
      <div className="header-row">
        <div>
          <h3 className="section-title" style={{ marginBottom: '4px' }}>Offer Mapping</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Select the productized services that solve {lead.companyName}'s diagnosed weaknesses.</p>
        </div>
        <button className="btn btn-primary" disabled={selectedSolutions.length === 0}>
          Save Mapping
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        {SOLUTION_CATEGORIES.map(category => {
          const isSelected = selectedSolutions.includes(category);
          return (
            <div 
              key={category}
              onClick={() => toggleSolution(category)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: isSelected ? 'var(--accent-primary-alpha)' : 'var(--bg-hover)',
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '4px',
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {isSelected && <Check size={14} />}
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', display: 'block', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {category}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSolutions.length > 0 && (
        <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--space-2)' }}>Generated Solution Angle</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            "Based on our analysis, we recommend implementing a <strong>{selectedSolutions.join(' and ')}</strong> to fix the friction in your current workflow and capture lost revenue."
          </p>
          <button className="btn btn-secondary btn-ghost" style={{ marginTop: 'var(--space-4)', padding: 0 }}>
            Use in Outreach <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
