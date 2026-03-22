import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { searchPlaces } from '@/lib/places';
import { enrichWithEmails } from '@/lib/scraper';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, maxResults = 5 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const limit = Math.min(Number(maxResults), 10);
    const startTime = Date.now();

    // ── PHASE 1: Discovery via Google Places ──────────────────
    let candidates;
    try {
      candidates = await searchPlaces(query, limit);
    } catch (err) {
      console.error('Phase 1 (Places) failed:', err.message);
      return NextResponse.json({ error: `Search failed: ${err.message}` }, { status: 500 });
    }

    if (candidates.length === 0) {
      return NextResponse.json({ leads: [], model: 'google-places + gpt-4o-mini', message: 'No businesses found for this query.' });
    }

    // Over-fetch: take up to limit*2 to have a buffer for email filtering
    const pool = candidates.slice(0, Math.min(limit * 2, candidates.length));

    // ── PHASE 2: Email Enrichment ─────────────────────────────
    // Overall time budget for scraping: 25 seconds max
    const scrapingTimeout = 25000;
    let enriched;
    try {
      enriched = await Promise.race([
        enrichWithEmails(pool, 5),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Scraping timeout')), scrapingTimeout)
        ),
      ]);
    } catch {
      // If scraping times out, just use unenriched pool
      enriched = pool.map(l => ({ ...l, email: null, emailMissing: true }));
    }

    // Sort: leads with email first, then phone, then rest
    enriched.sort((a, b) => {
      const aScore = (a.email ? 2 : 0) + (a.phone ? 1 : 0);
      const bScore = (b.email ? 2 : 0) + (b.phone ? 1 : 0);
      return bScore - aScore;
    });

    // Take exactly `limit` leads (trimming any extras)
    const finalLeads = enriched.slice(0, limit);

    // ── PHASE 3: AI Qualification ─────────────────────────────
    const elapsed = Date.now() - startTime;
    const aiTimeout = Math.max(10000, 55000 - elapsed); // leave at least 10s for AI

    let qualifiedLeads;
    try {
      const businessList = finalLeads.map((lead, i) => (
        `Business ${i + 1}:
- Name: ${lead.companyName}
- Location: ${lead.location}
- Website: ${lead.website || 'N/A'}
- Phone: ${lead.phone || 'N/A'}
- Email: ${lead.email || 'Not found'}
- Types: ${(lead.types || []).slice(0, 3).join(', ')}`
      )).join('\n\n');

      const aiPrompt = `You are a B2B sales intelligence analyst. Review the following ${finalLeads.length} businesses found for the query: "${query}"

For EACH business, provide:
1. niche: Their specific 2-4 word industry sub-niche (e.g. "Custom Hat Manufacturing", "Residential Roofing")
2. contactName: An educated guess at the decision-maker title (e.g. "Owner", "Marketing Manager") — not a name
3. summary: 1-2 sentences about what makes this specific business unique based on their location and type
4. why: A UNIQUE, SPECIFIC reason why they are a good lead. Each why MUST be different. Base it on their business type, location, and web presence. Examples: "No online booking system despite high review volume", "Services multiple counties but no geo-targeted landing pages", "Local competitor ranking above them on Google"

CRITICAL RULES:
- No two "why" fields can be the same or similar
- Do NOT say "outdated website" more than once across all leads
- Each "why" should be specific to what you know about that business

${businessList}

Return ONLY valid JSON:
{
  "results": [
    { "index": 0, "niche": "...", "contactName": "...", "summary": "...", "why": "..." },
    ...
  ]
}`;

      const aiResponse = await Promise.race([
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: aiPrompt }],
          temperature: 0.85,
          response_format: { type: 'json_object' },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), aiTimeout)),
      ]);

      const aiData = JSON.parse(aiResponse.choices[0].message.content);
      const aiResults = aiData.results || [];

      qualifiedLeads = finalLeads.map((lead, i) => {
        const ai = aiResults.find(r => r.index === i) || {};
        return {
          companyName: lead.companyName,
          contactName: ai.contactName || 'Owner',
          phone: lead.phone || null,
          email: lead.email || null,
          emailMissing: lead.emailMissing || false,
          website: lead.website || null,
          location: lead.location,
          niche: ai.niche || (lead.types?.[0]?.replace(/_/g, ' ') || 'Business'),
          summary: ai.summary || '',
          why: ai.why || '',
        };
      });
    } catch (err) {
      console.error('Phase 3 (AI) failed:', err.message);
      // Return leads without AI enrichment rather than failing entirely
      qualifiedLeads = finalLeads.map(lead => ({
        companyName: lead.companyName,
        contactName: 'Owner',
        phone: lead.phone || null,
        email: lead.email || null,
        emailMissing: lead.emailMissing || false,
        website: lead.website || null,
        location: lead.location,
        niche: (lead.types?.[0]?.replace(/_/g, ' ') || 'Business'),
        summary: '',
        why: '',
      }));
    }

    return NextResponse.json({
      leads: qualifiedLeads,
      model: 'google-places + gpt-4o-mini',
      meta: {
        discovered: candidates.length,
        enriched: enriched.filter(l => l.email).length,
        returned: qualifiedLeads.length,
        elapsedMs: Date.now() - startTime,
      },
    });

  } catch (error) {
    console.error('Prospect API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate leads' }, { status: 500 });
  }
}
