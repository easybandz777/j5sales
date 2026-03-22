"use client";

import { useState, useEffect } from 'react';
import { Users, Mail, Target, CheckCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import AnalyticsCharts from '@/components/AnalyticsCharts';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const kpis = data ? [
    { label: "Total Leads", value: String(data.kpis.totalLeads), icon: Users },
    { label: "Outreach Sent", value: String(data.kpis.outreachSent), icon: Mail },
    { label: "Qualified", value: String(data.kpis.qualified), icon: Target },
    { label: "Added This Week", value: String(data.kpis.recentLeads), icon: Clock },
  ] : [];

  return (
    <div className="analytics-page">
      <div className="header-row">
        <div>
          <h1>Analytics & Performance</h1>
          <p className="text-muted">Track pipeline health and lead flow from your database.</p>
        </div>
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p className="text-muted">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {kpis.map((kpi, i) => (
              <div key={i} className="panel" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                    <kpi.icon size={20} className="text-muted" />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: 'var(--space-1)' }}>
                  {kpi.value}
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Pipeline Breakdown */}
          {data && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div className="panel" style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Pipeline Stage</h3>
                {Object.entries(data.byStage).map(([stage, count]) => (
                  <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.875rem' }}>{stage}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{count}</span>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Lead Source</h3>
                {Object.entries(data.bySource).map(([source, count]) => (
                  <div key={source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.875rem' }}>{source}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnalyticsCharts />
        </>
      )}
    </div>
  );
}
