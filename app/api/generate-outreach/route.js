import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { lead, promptRules } = await request.json();

    if (!lead || !lead.companyName || !lead.contactName) {
      return NextResponse.json(
        { success: false, error: 'Lead data with companyName and contactName is required' },
        { status: 400 }
      );
    }

    // Build context from lead data
    const analysisContext = lead.analysisData && typeof lead.analysisData === 'object'
      ? Object.entries(lead.analysisData)
          .map(([key, val]) => `${key}: ${val.rating || 'N/A'} — ${val.notes || ''}`)
          .join('\n')
      : 'No analysis data available.';

    const solutionsContext = Array.isArray(lead.solutions) && lead.solutions.length > 0
      ? lead.solutions.join(', ')
      : 'General consulting';

    // Build the system prompt from promptRules or use default
    const defaultRules = {
      tone: 'Professional but conversational',
      maxLength: '150 words',
      callToAction: 'Suggest a short 10-minute call',
      avoidWords: 'synergy, leverage, disrupt',
      senderName: 'J5 Sales Team',
    };

    const rules = { ...defaultRules, ...(promptRules || {}) };

    const systemPrompt = `You are an expert B2B cold outreach copywriter. Write a personalized first-touch email.

RULES:
- Tone: ${rules.tone}
- Max length: ${rules.maxLength}
- Call to action: ${rules.callToAction}
- Never use these words: ${rules.avoidWords}
- Sign off as: ${rules.senderName}
- Reference SPECIFIC details from the business analysis below — don't be generic
- Lead with the PROBLEM you've identified, not with who you are
- No "I hope this finds you well" or other filler openers`;

    const userPrompt = `Write a cold outreach email for this prospect:

COMPANY: ${lead.companyName}
CONTACT: ${lead.contactName}
INDUSTRY: ${lead.niche || 'Unknown'}
LOCATION: ${lead.location || 'Unknown'}
WEBSITE: ${lead.website || 'N/A'}

BUSINESS ANALYSIS:
${analysisContext}

RECOMMENDED SOLUTIONS:
${solutionsContext}

NOTES:
${lead.notes || 'None'}

Generate ONLY the email — subject line on first line, then a blank line, then the body. No extra commentary.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;

    // Split subject from body
    const lines = content.split('\n');
    let subject = '';
    let body = content;

    // Try to extract subject line
    if (lines[0].toLowerCase().startsWith('subject:')) {
      subject = lines[0].replace(/^subject:\s*/i, '').trim();
      body = lines.slice(2).join('\n').trim(); // Skip subject + blank line
    } else {
      subject = lines[0].trim();
      body = lines.slice(2).join('\n').trim();
    }

    return NextResponse.json({
      success: true,
      subject,
      content: body,
      model: 'gpt-4o-mini',
      tokensUsed: response.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error('Error generating outreach:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate outreach' },
      { status: 500 }
    );
  }
}
