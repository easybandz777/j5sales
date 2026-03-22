"use client";

import { useState } from 'react';
import { PIPELINE_STAGES } from '@/lib/mockData';
import PipelineBoard from '@/components/PipelineBoard';

export default function PipelinePage() {
  return (
    <div className="pipeline-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="header-row">
        <div>
          <h1>Sales Pipeline</h1>
          <p className="text-muted">Drag and drop leads to progress them through the sales cycle.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <select className="input" defaultValue="jd">
            <option value="all">All Sales Reps</option>
            <option value="jd">John Doe</option>
            <option value="sm">Sarah Manager</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PipelineBoard stages={PIPELINE_STAGES} />
      </div>
    </div>
  );
}
