import { getLeadCount, getLeadsByStage, getAllLeads } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const totalLeads = await getLeadCount();
    const byStage = await getLeadsByStage();

    const stageMap = {};
    byStage.forEach(row => { stageMap[row.stage] = parseInt(row.count); });

    const outreachSent = stageMap['Outreach Sent'] || 0;
    const qualified = stageMap['Qualified'] || 0;
    const closedWon = stageMap['Closed Won'] || 0;

    const allLeads = await getAllLeads({});
    const sourceMap = {};
    allLeads.forEach(lead => {
      const src = lead.leadSource || 'Unknown';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const opportunityMap = {};
    allLeads.forEach(lead => {
      const opp = lead.opportunityLevel || 'unknown';
      opportunityMap[opp] = (opportunityMap[opp] || 0) + 1;
    });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentLeads = allLeads.filter(l => l.createdAt >= weekAgo).length;

    return NextResponse.json({
      kpis: { totalLeads, outreachSent, qualified, closedWon, recentLeads },
      byStage: stageMap,
      bySource: sourceMap,
      byOpportunity: opportunityMap,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
