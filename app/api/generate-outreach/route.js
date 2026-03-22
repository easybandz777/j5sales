import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildLeadContext(lead) {
  const sections = [];

  sections.push(`COMPANY: ${lead.companyName}`);
  sections.push(`CONTACT: ${lead.contactName}`);
  if (lead.niche) sections.push(`INDUSTRY: ${lead.niche}`);
  if (lead.location) sections.push(`LOCATION: ${lead.location}`);
  if (lead.website) sections.push(`WEBSITE: ${lead.website}`);

  if (lead.analysisData && typeof lead.analysisData === 'object' && Object.keys(lead.analysisData).length > 0) {
    const auditLines = Object.entries(lead.analysisData)
      .map(([key, val]) => {
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        const rating = val?.rating || 'unknown';
        const notes = val?.notes || '';
        return `- ${label}: ${rating}${notes ? ` — ${notes}` : ''}`;
      })
      .join('\n');
    sections.push(`\nBUSINESS AUDIT (diagnosed pain points):\n${auditLines}`);
  }

  if (Array.isArray(lead.solutions) && lead.solutions.length > 0) {
    sections.push(`\nMATCHED SOLUTIONS: ${lead.solutions.join(', ')}`);
  }

  if (lead.notes && lead.notes.trim()) {
    sections.push(`\nINTERNAL NOTES:\n${lead.notes.trim()}`);
  }

  return sections.join('\n');
}

export async function POST(request) {
  try {
    const { lead, promptRules } = await request.json();

    if (!lead || !lead.companyName || !lead.contactName) {
      return NextResponse.json(
        { success: false, error: 'Select a lead with a company name and contact to generate outreach.' },
        { status: 400 }
      );
    }

    const hasAudit = lead.analysisData && typeof lead.analysisData === 'object' && Object.keys(lead.analysisData).length > 0;
    const hasNotes = lead.notes && lead.notes.trim().length > 0;

    const defaultRules = {
      tone: 'Professional but conversational — like a sharp colleague, not a marketer',
      maxLength: '120 words',
      callToAction: 'Suggest a quick 10-minute call this week',
      avoidWords: 'synergy, leverage, disrupt, innovative, cutting-edge, game-changer, scalable, I hope this finds you well',
      senderName: 'J5 Sales Team',
    };

    const rules = { ...defaultRules, ...(promptRules || {}) };

    const systemPrompt = `You are an elite B2B cold outreach copywriter. You write emails that get replies because they are specific, short, and lead with the prospect's problem — never with who you are.

HARD RULES:
- Tone: ${rules.tone}
- Maximum length: ${rules.maxLength}
- Call to action: ${rules.callToAction}
- NEVER use these words/phrases: ${rules.avoidWords}
- Sign off as: ${rules.senderName}
- First sentence MUST reference a specific detail about their business — their industry, location, website, or a diagnosed weakness
- NO filler openers ("Hi [Name], I came across your company...")
- NO generic claims ("We help businesses like yours...")
- The email should feel like you personally looked at their business
- Subject line must be short (under 8 words), specific, and curiosity-driven — no clickbait

${hasAudit ? 'You have a detailed business audit below. Reference the SPECIFIC weaknesses and matched solutions — this is your strongest angle.' : ''}
${hasNotes ? 'Pay attention to the internal notes — they contain prospecting insights about this lead.' : ''}

FORMAT: First line is the subject line prefixed with "Subject: ", then a blank line, then the email body. Nothing else.`;

    const leadContext = buildLeadContext(lead);

    const userPrompt = `Write a cold outreach email for this prospect:\n\n${leadContext}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;

    const lines = content.split('\n');
    let subject = '';
    let body = content;

    if (lines[0].toLowerCase().startsWith('subject:')) {
      subject = lines[0].replace(/^subject:\s*/i, '').trim();
      body = lines.slice(2).join('\n').trim();
    } else if (lines.length > 2) {
      subject = lines[0].trim();
      body = lines.slice(2).join('\n').trim();
    }

    return NextResponse.json({
      success: true,
      subject,
      content: body,
      tokensUsed: response.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error('Error generating outreach:', error);

    const userMessage = error.message?.includes('API key')
      ? 'OpenAI API key is not configured. Contact your admin.'
      : 'Failed to generate email. Please try again.';

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    );
  }
}
