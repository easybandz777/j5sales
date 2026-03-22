import { createLead } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have a header and at least one row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = { imported: 0, errors: [] };

    const fieldMap = {
      'company': 'companyName', 'company name': 'companyName', 'companyname': 'companyName',
      'contact': 'contactName', 'contact name': 'contactName', 'contactname': 'contactName', 'name': 'contactName',
      'email': 'email', 'email address': 'email',
      'phone': 'phone', 'phone number': 'phone',
      'website': 'website', 'url': 'website',
      'linkedin': 'linkedinUrl', 'linkedin url': 'linkedinUrl',
      'niche': 'niche', 'industry': 'niche',
      'location': 'location', 'city': 'location',
      'category': 'businessCategory', 'business category': 'businessCategory',
      'source': 'leadSource', 'lead source': 'leadSource',
      'notes': 'notes',
    };

    const mappedHeaders = headers.map(h => fieldMap[h.toLowerCase()] || null);

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (const char of lines[i]) {
          if (char === '"') { inQuotes = !inQuotes; }
          else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
          else { current += char; }
        }
        values.push(current.trim());

        const row = {};
        mappedHeaders.forEach((field, idx) => {
          if (field && values[idx]) {
            row[field] = values[idx];
          }
        });

        if (row.companyName && row.contactName) {
          await createLead(row);
          results.imported++;
        } else {
          results.errors.push('Row ' + (i + 1) + ': missing companyName or contactName');
        }
      } catch (err) {
        results.errors.push('Row ' + (i + 1) + ': ' + err.message);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('POST /api/leads/import error:', error);
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 });
  }
}
