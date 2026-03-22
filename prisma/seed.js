// Seed script for Neon PostgreSQL (uses pg for local CLI)
const { Client } = require('pg');
const { readFileSync } = require('fs');
const { randomUUID } = require('crypto');

// Load .env.local
const envContent = readFileSync('.env.local', 'utf8');
let dbUrl = '';
envContent.split('\n').forEach(line => {
  const match = line.match(/^DATABASE_URL="?([^"]+)"?$/);
  if (match) dbUrl = match[1];
});

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log('Connected to Neon PostgreSQL.');

  console.log('Creating Lead table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Lead" (
      id TEXT PRIMARY KEY,
      "companyName" TEXT NOT NULL,
      "contactName" TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      website TEXT,
      "linkedinUrl" TEXT,
      "instagramUrl" TEXT,
      "facebookUrl" TEXT,
      niche TEXT NOT NULL,
      location TEXT,
      "businessCategory" TEXT,
      "leadSource" TEXT DEFAULT 'Manual Entry',
      "opportunityLevel" TEXT DEFAULT 'medium',
      stage TEXT DEFAULT 'New Lead',
      notes TEXT,
      "assignedTo" TEXT,
      solutions TEXT,
      "analysisData" TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
      "lastActivityAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Table ready.');

  // Clear existing data
  await client.query('DELETE FROM "Lead"');

  const leads = [
    { companyName: 'Apex Manufacturing', contactName: 'Sarah Jenkins', email: 'sarah.j@apex-mfg.com', phone: '555-0192', website: 'https://apex-mfg.example.com', niche: 'Industrial Supply', location: 'Chicago, IL', businessCategory: 'B2B Wholesale', leadSource: 'Apollo Data', opportunityLevel: 'high', stage: 'New Lead', notes: 'Old website, no clear way to order wholesale parts online.' },
    { companyName: 'Glow & Glam Studio', contactName: 'Michelle Torres', email: 'michelle@glowglamstudio.com', phone: '555-0876', website: 'https://glowglamstudio.com', niche: 'Beauty & Cosmetics', location: 'Miami, FL', businessCategory: 'D2C Retail', leadSource: 'Inbound Form', opportunityLevel: 'critical', stage: 'Researched', notes: 'Uses Shopify but has a painful custom product builder.' },
    { companyName: 'TrueForm Athletics', contactName: 'Derek Olson', email: 'derek@trueformathletics.com', phone: '555-0345', niche: 'Sports & Fitness', location: 'Austin, TX', businessCategory: 'D2C Ecommerce', leadSource: 'Cold Outbound', opportunityLevel: 'high', stage: 'Outreach Sent', notes: 'Custom jersey builder is slow and outdated.' },
    { companyName: 'Pioneer Roofing Co.', contactName: 'James Carter', email: 'james@pioneerroofing.com', phone: '555-0512', niche: 'Roofing', location: 'Denver, CO', leadSource: 'LinkedIn', opportunityLevel: 'medium', stage: 'Qualified', notes: 'Needs a booking/scheduling tool for estimates.' },
    { companyName: 'AutoWrap Kings', contactName: 'Ray Gonzalez', email: 'ray@autowrapkings.com', phone: '555-0999', niche: 'Automotive', location: 'Los Angeles, CA', businessCategory: 'Custom Services', leadSource: 'Cold Outbound', opportunityLevel: 'high', stage: 'Closed Lost', notes: 'They sell custom car wraps. Need a wrap visualizer tool.' },
  ];

  for (const lead of leads) {
    const id = 'c' + randomUUID().replace(/-/g, '').substring(0, 24);
    const now = new Date().toISOString();
    await client.query(
      `INSERT INTO "Lead" (id, "companyName", "contactName", email, phone, website, niche, location, "businessCategory", "leadSource", "opportunityLevel", stage, notes, "createdAt", "updatedAt", "lastActivityAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [id, lead.companyName, lead.contactName, lead.email||null, lead.phone||null, lead.website||null, lead.niche, lead.location||null, lead.businessCategory||null, lead.leadSource, lead.opportunityLevel, lead.stage, lead.notes||null, now, now, now]
    );
    console.log('  ✓ ' + lead.companyName);
  }

  console.log('\nDone! ' + leads.length + ' leads seeded.');
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
