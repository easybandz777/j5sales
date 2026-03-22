"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, Plus, Filter } from 'lucide-react';
import LeadTable from '@/components/LeadTable';
import AddLeadModal from '@/components/AddLeadModal';
import CSVImportModal from '@/components/CSVImportModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (stageFilter) params.set('stage', stageFilter);
      const res = await fetch('/api/leads?' + params.toString());
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, stageFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="leads-page">
      <div className="header-row">
        <div>
          <h1>Lead Discovery</h1>
          <p className="text-muted">Manage your target businesses, contacts, and opportunities.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Download size={16} />
            Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
        <input 
          type="text" 
          placeholder="Search by company, contact, or niche..." 
          style={{ flex: 1 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="Researched">Researched</option>
            <option value="Qualified">Qualified</option>
            <option value="Outreach Sent">Outreach Sent</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          <button className="btn btn-secondary icon-btn" title="More Filters">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p className="text-muted">Loading leads...</p>
        </div>
      ) : (
        <LeadTable leads={leads} />
      )}

      <AddLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onLeadAdded={() => fetchLeads()}
      />
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => fetchLeads()}
      />
    </div>
  );
}
