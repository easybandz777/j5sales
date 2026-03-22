"use client";

import { useEffect, useState } from 'react';

// Custom lightweight SVG charts to avoid heavy dependencies like Chart.js or Recharts
export default function AnalyticsCharts() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Mock data for bar chart
  const nichePerformance = [
    { niche: "Industrial", rate: 22, height: 80 },
    { niche: "Apparel", rate: 18, height: 60 },
    { niche: "Manufacturing", rate: 14, height: 45 },
    { niche: "Home Services", rate: 8, height: 25 },
    { niche: "Automotive", rate: 26, height: 95 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
      {/* Lead Conversion by Niche */}
      <div className="panel p-6">
        <h3 className="section-title" style={{ fontSize: '1rem', borderBottom: 'none', marginBottom: 'var(--space-6)' }}>Reply Rate by Niche</h3>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: 'var(--space-4)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
          {nichePerformance.map((item, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: `calc(${100 - item.height}% - 24px)`, width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.rate}%
              </div>
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '56px',
                  height: `${item.height}%`, 
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  opacity: 0.7 + (item.height / 300),
                }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
          {nichePerformance.map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.niche}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Funnel Data */}
      <div className="panel p-6">
        <h3 className="section-title" style={{ fontSize: '1rem', borderBottom: 'none', marginBottom: 'var(--space-6)' }}>Pipeline Funnel</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { label: 'Total Leads', count: 1245, width: '100%', color: 'var(--bg-hover)' },
            { label: 'Outreach Sent', count: 890, width: '71%', color: 'var(--accent-indigo-alpha)' },
            { label: 'Replied', count: 164, width: '13%', color: 'var(--accent-cyan-alpha)' },
            { label: 'Qualified', count: 85, width: '6.8%', color: 'var(--accent-warning-alpha)' },
            { label: 'Booked Calls', count: 42, width: '3.3%', color: 'var(--accent-success-alpha)' },
          ].map((stage, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{stage.label}</span>
                <span style={{ fontWeight: 600 }}>{stage.count}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ 
                  width: stage.width, 
                  height: '100%', 
                  backgroundColor: stage.color === 'var(--bg-hover)' ? 'var(--border-strong)' : stage.color.replace('-alpha', ''),
                  borderRadius: 'var(--radius-full)' 
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Angles */}
      <div className="panel p-6" style={{ gridColumn: '1 / -1' }}>
        <h3 className="section-title" style={{ fontSize: '1rem', borderBottom: 'none', marginBottom: 'var(--space-4)' }}>Top Performing angles</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: 'var(--space-3) 0', fontWeight: 500 }}>Messaging Angle</th>
              <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Niche Focus</th>
              <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Sent</th>
              <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Reply Rate</th>
              <th style={{ padding: 'var(--space-3) 0', fontWeight: 500, textAlign: 'right' }}>Book Rate</th>
            </tr>
          </thead>
          <tbody>
            {[
              { angle: 'Stop losing wholesale orders to friction (B2B Configurator)', niche: 'Industrial Supply', sent: 450, reply: '24.2%', book: '8.1%' },
              { angle: 'Manual logo upload is killing conversions (Digitizer API)', niche: 'Apparel & Uniforms', sent: 320, reply: '18.5%', book: '5.4%' },
              { angle: 'Automate quoting to win jobs faster (Estimator Tool)', niche: 'Manufacturing', sent: 210, reply: '15.8%', book: '4.2%' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-4) 0', color: 'var(--text-primary)', fontWeight: 500 }}>{row.angle}</td>
                <td style={{ padding: 'var(--space-4)' }}><span style={{ backgroundColor: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{row.niche}</span></td>
                <td style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)' }}>{row.sent}</td>
                <td style={{ padding: 'var(--space-4)', color: 'var(--accent-success)' }}>{row.reply}</td>
                <td style={{ padding: 'var(--space-4) 0', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 600 }}>{row.book}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
