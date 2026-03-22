import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const databaseUrl = (process.env.DATABASE_URL || '').replace(/[\r\n]+/g, '').trim();

if (!databaseUrl) {
  console.error('DATABASE_URL is not set!');
}

const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

// ── Lead queries ──────────────────────────────────────────

export async function getAllLeads({ search, stage, source, sort, order, page, limit } = {}) {
  let sql = 'SELECT * FROM "Lead" WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    sql += ` AND ("companyName" ILIKE $${paramIndex} OR "contactName" ILIKE $${paramIndex + 1} OR email ILIKE $${paramIndex + 2} OR niche ILIKE $${paramIndex + 3})`;
    const term = '%' + search + '%';
    params.push(term, term, term, term);
    paramIndex += 4;
  }
  if (stage) {
    sql += ` AND stage = $${paramIndex}`;
    params.push(stage);
    paramIndex++;
  }
  if (source) {
    sql += ` AND "leadSource" = $${paramIndex}`;
    params.push(source);
    paramIndex++;
  }

  const sortCol = ['companyName', 'createdAt', 'updatedAt', 'opportunityLevel', 'stage'].includes(sort) ? `"${sort}"` : '"createdAt"';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';
  sql += ' ORDER BY ' + sortCol + ' ' + sortDir;

  // Pagination
  if (page && limit) {
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await query(countSql, params);
    const total = parseInt(countResult[0].count);
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    const rows = await query(sql, params);
    return { rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  return await query(sql, params);
}

export async function getLeadById(id) {
  const rows = await query('SELECT * FROM "Lead" WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createLead(data) {
  const id = 'c' + crypto.randomUUID().replace(/-/g, '').substring(0, 24);
  const now = new Date().toISOString();

  const result = await query(`
    INSERT INTO "Lead" (
      id, "companyName", "contactName", email, phone, website,
      "linkedinUrl", "instagramUrl", "facebookUrl", niche, location,
      "businessCategory", "leadSource", "opportunityLevel", stage,
      notes, "assignedTo", solutions, "analysisData",
      "createdAt", "updatedAt", "lastActivityAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
    ) RETURNING *
  `, [
    id,
    data.companyName,
    data.contactName,
    data.email || null,
    data.phone || null,
    data.website || null,
    data.linkedinUrl || null,
    data.instagramUrl || null,
    data.facebookUrl || null,
    data.niche || 'General',
    data.location || null,
    data.businessCategory || null,
    data.leadSource || 'Manual Entry',
    data.opportunityLevel || 'medium',
    data.stage || 'New Lead',
    data.notes || null,
    data.assignedTo || null,
    data.solutions ? JSON.stringify(data.solutions) : null,
    data.analysisData ? JSON.stringify(data.analysisData) : null,
    now, now, now
  ]);

  return result[0];
}

export async function updateLead(id, data) {
  const existing = await getLeadById(id);
  if (!existing) return null;

  const updates = [];
  const params = [];
  const now = new Date().toISOString();
  let paramIndex = 1;

  const fields = [
    'companyName', 'contactName', 'email', 'phone', 'website',
    'linkedinUrl', 'instagramUrl', 'facebookUrl', 'niche', 'location',
    'businessCategory', 'leadSource', 'opportunityLevel', 'stage',
    'notes', 'assignedTo'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`"${field}" = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }
  if (data.solutions !== undefined) {
    updates.push(`solutions = $${paramIndex}`);
    params.push(JSON.stringify(data.solutions));
    paramIndex++;
  }
  if (data.analysisData !== undefined) {
    updates.push(`"analysisData" = $${paramIndex}`);
    params.push(JSON.stringify(data.analysisData));
    paramIndex++;
  }

  updates.push(`"updatedAt" = $${paramIndex}`);
  params.push(now);
  paramIndex++;
  updates.push(`"lastActivityAt" = $${paramIndex}`);
  params.push(now);
  paramIndex++;

  params.push(id);
  const result = await query(
    `UPDATE "Lead" SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );
  return result[0];
}

export async function deleteLead(id) {
  const existing = await getLeadById(id);
  if (!existing) return false;
  await query('DELETE FROM "Lead" WHERE id = $1', [id]);
  return true;
}

export async function getLeadCount() {
  const result = await query('SELECT COUNT(*) as count FROM "Lead"');
  return parseInt(result[0].count);
}

export async function getLeadsByStage() {
  return await query('SELECT stage, COUNT(*) as count FROM "Lead" GROUP BY stage');
}
