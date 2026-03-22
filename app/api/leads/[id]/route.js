import { getLeadById, updateLead, deleteLead } from '@/lib/db';
import { NextResponse } from 'next/server';

function parseLead(lead) {
  return {
    ...lead,
    solutions: lead.solutions ? (typeof lead.solutions === 'string' ? JSON.parse(lead.solutions) : lead.solutions) : [],
    analysisData: lead.analysisData ? (typeof lead.analysisData === 'string' ? JSON.parse(lead.analysisData) : lead.analysisData) : {},
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const lead = await getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json(parseLead(lead));
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const lead = await updateLead(id, body);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json(parseLead(lead));
  } catch (error) {
    console.error('PUT /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = await deleteLead(id);
    if (!success) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
