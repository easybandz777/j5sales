import { getAllLeads, createLead } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leads = await getAllLeads({
      search: searchParams.get('search') || '',
      stage: searchParams.get('stage') || '',
      source: searchParams.get('source') || '',
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
    });

    // Handle paginated vs flat response
    const rows = Array.isArray(leads) ? leads : leads.rows;
    const parsed = rows.map(lead => ({
      ...lead,
      solutions: lead.solutions ? (typeof lead.solutions === 'string' ? JSON.parse(lead.solutions) : lead.solutions) : [],
      analysisData: lead.analysisData ? (typeof lead.analysisData === 'string' ? JSON.parse(lead.analysisData) : lead.analysisData) : {},
    }));

    return NextResponse.json({ leads: parsed, total: parsed.length });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.companyName || !body.contactName) {
      return NextResponse.json(
        { error: 'companyName and contactName are required' },
        { status: 400 }
      );
    }
    const lead = await createLead(body);
    const parsed = {
      ...lead,
      solutions: lead.solutions ? (typeof lead.solutions === 'string' ? JSON.parse(lead.solutions) : lead.solutions) : [],
      analysisData: lead.analysisData ? (typeof lead.analysisData === 'string' ? JSON.parse(lead.analysisData) : lead.analysisData) : {},
    };
    return NextResponse.json(parsed, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
