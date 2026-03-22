"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import './PipelineBoard.css';

export default function PipelineBoard({ stages }) {
  const [leads, setLeads] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      }
    }
    fetchLeads();
  }, []);

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const leadId = e.dataTransfer.getData('leadId');
    
    if (leadId) {
      // Optimistic update
      setLeads(prevLeads => prevLeads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, stage: targetStage, lastActivityAt: new Date().toISOString() };
        }
        return lead;
      }));

      // Persist to API
      try {
        await fetch('/api/leads/' + leadId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: targetStage }),
        });
      } catch (err) {
        console.error('Failed to update lead stage:', err);
      }
    }
  };

  const groupedLeads = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => lead.stage === stage);
    return acc;
  }, {});

  if (!isClient) return null;

  return (
    <div className="pipeline-board">
      {stages.map(stage => {
        const stageLeads = groupedLeads[stage] || [];
        return (
          <div 
            key={stage} 
            className="pipeline-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="column-header">
              <h4 className="stage-name">{stage}</h4>
              <span className="lead-count">{stageLeads.length}</span>
            </div>
            
            <div className="column-content">
              {stageLeads.map(lead => {
                const lastActivityDate = new Date(lead.lastActivityAt);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate - lastActivityDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                let staleClass = diffDays > 7 ? 'stale-warning' : '';

                return (
                  <Link href={`/leads/${lead.id}`} key={lead.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div 
                      className="lead-card"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="card-header">
                        <strong className="company-name">{lead.companyName}</strong>
                      </div>
                      <div className="card-contact text-muted">{lead.contactName}</div>
                      
                      <div className="card-footer">
                        <span className="niche-tag">{lead.niche}</span>
                        <div className={`days-in-stage ${staleClass}`} title={`Last activity: ${diffDays} days ago`}>
                          <Clock size={12} />
                          {diffDays}d
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
