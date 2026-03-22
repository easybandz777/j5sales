import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { searchPlaces } from '@/lib/places';
import { enrichWithEmails } from '@/lib/scraper';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function scoreLeadQuality(lead) {
  let score = 0;
  if (lead.email) score += 30;
  if (lead.phone) score += 15;
  if (lead.website) score += 10;
  if (lead.rating && lead.rating >= 3.5) score += 10;
  if (lead.reviewCount >= 10) score += 5;
  if (lead.reviewCount >= 50) score += 5;
  if (lead.aiQuality) score += lead.aiQuality;
  return Math.min(score, 100);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, maxResults = 5 } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please enter a more specific search (at least 3 characters).' },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(Number(maxResults) || 5, 1), 10);
    const startTime = Date.now();

    // ── PHASE 1: Discovery via Google Places ──────────────────
    let candidates;
    try {
      candidates = await searchPlaces(query, limit);
    } catch (err) {
      console.error('Phase 1 (Places) failed:', err.message);
      const userMessage = err.message.includes('API_KEY')
        ? 'Google Places API key is not configured. Contact your admin.'
        : 'Business search failed. Try a different query or check your connection.';
      return NextResponse.json({ error: userMessage }, { status: 500 });
    }

    if (candidates.length === 0) {
      return NextResponse.json({
        leads: [],
        meta: { discovered: 0, enriched: 0, returned: 0, elapsedMs: Date.now() - startTime },
        message: 'No businesses found. Try a broader location or different industry.',
      });
    }

    const pool = candidates.slice(0, Math.min(limit * 2, candidates.length));

    // ── PHASE 2: Email Enrichment ─────────────────────────────
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
      enriched = pool.map(l => ({ ...l, email: null, emailMissing: true }));
    }

    enriched.sort((a, b) => {
      const aScore = (a.email ? 3 : 0) + (a.phone ? 1 : 0) + (a.rating ? 1 : 0);
      const bScore = (b.email ? 3 : 0) + (b.phone ? 1 : 0) + (b.rating ? 1 : 0);
      return bScore - aScore;
    });

    const finalLeads = enriched.slice(0, limit);

    // ── PHASE 3: AI Qualification ─────────────────────────────
    const elapsed = Date.now() - startTime;
    const aiTimeout = Math.max(10000, 55000 - elapsed);

    let qualifiedLeads;
    try {
      const businessList = finalLeads.map((lead, i) => (
        `Business ${i + 1}:
- Name: ${lead.companyName}
- Location: ${lead.location}
- Website: ${lead.website || 'N/A'}
- Phone: ${lead.phone || 'N/A'}
- Email: ${lead.email || 'Not found'}
- Google Rating: ${lead.rating ? `${lead.rating}/5 (${lead.reviewCount} reviews)` : 'No data'}
- Business Types: ${(lead.types || []).slice(0, 4).join(', ')}`
      )).join('\n\n');

      const aiPrompt = `You are a senior B2B sales intelligence analyst specializing in identifying high-value outreach targets for a software/services agency. Review these ${finalLeads.length} businesses found for: "${query}"

For EACH business, provide:
1. niche: Precise 2-4 word sub-niche (e.g. "Custom Apparel Printing", "Residential Roofing", "Industrial Parts Distributor")
2. contactName: Decision-maker title based on business size and type (e.g. "Owner", "Marketing Director", "Operations Manager")
3. summary: 1-2 punchy sentences about what this business does and what makes them interesting as a prospect. Be specific to their location and industry.
4. why: A specific, actionable pain point or opportunity you can identify. Base it on:
   - Their Google presence (rating, review volume, missing reviews)
   - Their website quality (or lack thereof)
   - Their industry's typical digital gaps
   - Their location/market opportunity
   Examples: "Only 12 Google reviews despite 4.8 rating — not actively collecting social proof", "No online scheduling despite being a service business in a competitive metro", "Website has no product configurator despite selling custom products"
5. confidence: Rate 1-5 how good this lead is (5 = great contact info + clear pain point, 1 = missing info + generic)

CRITICAL RULES:
- Every "why" MUST be unique and specific to that business — never repeat angles
- Focus on actionable problems they could fix with software or services
- If a business has no website, their "why" should reference that gap specifically
- Be direct and concise, not salesy

${businessList}

Return ONLY valid JSON:
{
  "results": [
    { "index": 0, "niche": "...", "contactName": "...", "summary": "...", "why": "...", "confidence": 4 },
    ...
  ]
}`;

      const aiResponse = await Promise.race([
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: aiPrompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), aiTimeout)),
      ]);

      let aiData;
      try {
        aiData = JSON.parse(aiResponse.choices[0].message.content);
      } catch {
        aiData = { results: [] };
      }
      const aiResults = aiData.results || [];

      qualifiedLeads = finalLeads.map((lead, i) => {
        const ai = aiResults.find(r => r.index === i) || {};
        const enrichedLead = {
          companyName: lead.companyName,
          contactName: ai.contactName || 'Owner',
          phone: lead.phone || null,
          email: lead.email || null,
          emailMissing: lead.emailMissing || !lead.email,
          website: lead.website || null,
          location: lead.location,
          niche: ai.niche || (lead.types?.[0]?.replace(/_/g, ' ') || 'Business'),
          summary: ai.summary || '',
          why: ai.why || '',
          rating: lead.rating || null,
          reviewCount: lead.reviewCount || 0,
          aiQuality: (ai.confidence || 3) * 5,
        };
        enrichedLead.qualityScore = scoreLeadQuality(enrichedLead);
        return enrichedLead;
      });

      qualifiedLeads.sort((a, b) => b.qualityScore - a.qualityScore);
    } catch (err) {
      console.error('Phase 3 (AI) failed:', err.message);
      qualifiedLeads = finalLeads.map(lead => {
        const enrichedLead = {
          companyName: lead.companyName,
          contactName: 'Owner',
          phone: lead.phone || null,
          email: lead.email || null,
          emailMissing: lead.emailMissing || !lead.email,
          website: lead.website || null,
          location: lead.location,
          niche: (lead.types?.[0]?.replace(/_/g, ' ') || 'Business'),
          summary: '',
          why: '',
          rating: lead.rating || null,
          reviewCount: lead.reviewCount || 0,
          aiQuality: 0,
        };
        enrichedLead.qualityScore = scoreLeadQuality(enrichedLead);
        return enrichedLead;
      });
    }

    return NextResponse.json({
      leads: qualifiedLeads,
      meta: {
        query: query.trim(),
        discovered: candidates.length,
        enriched: enriched.filter(l => l.email).length,
        returned: qualifiedLeads.length,
        elapsedMs: Date.now() - startTime,
      },
    });

  } catch (error) {
    console.error('Prospect API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong generating leads. Please try again.' },
      { status: 500 }
    );
  }
}
