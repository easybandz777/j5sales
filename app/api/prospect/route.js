import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, systemPrompt, maxResults = 5 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const limit = Math.min(maxResults, 10);

    const defaultPrompt = `You are an expert B2B sales prospector. Search the web for real businesses matching: "${query}"

Find up to ${limit} distinct, legitimate businesses. Skip aggregator directories (Yelp, Angie's, HomeAdvisor, BBB, Thumbtack). Only include businesses with their own website.

For each business return these fields:
- companyName: Actual business name
- website: Their real URL
- contactName: Decision-maker name if findable, otherwise "Owner"
- phone: Phone number if found
- email: Email if found
- location: City, State
- niche: Their specific sub-niche
- summary: 1-2 sentences about what makes THIS business unique, based on what you found on their website

- why: THIS IS THE MOST IMPORTANT FIELD. You MUST write a UNIQUE, SPECIFIC reason for EACH business. Do NOT repeat the same reason twice. Base it on actual observations from their web presence. Examples of the VARIETY expected:
  * One might lack online scheduling/booking
  * Another might have no e-commerce despite selling products
  * Another might have poor SEO or no Google reviews
  * Another might be running outdated tech or have a slow website
  * Another might not have a CRM or follow-up automation
  * Another might not be leveraging social media despite being in a visual industry
  
  CRITICAL: Every single "why" field MUST be different from the others. If you cannot find a unique reason, make an educated inference based on their industry, size, and web presence. Never use the same "why" twice.

Return ONLY valid JSON: { "leads": [...] }`;

    const finalPrompt = systemPrompt
      ? systemPrompt.replace('{query}', query).replace('{limit}', String(limit))
      : defaultPrompt;

    // Use OpenAI's built-in web search
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      tools: [{ type: 'web_search_preview' }],
      input: finalPrompt,
      temperature: 0.9,
    });

    // Extract the text output
    const textOutput = response.output.find(o => o.type === 'message');
    const rawText = textOutput?.content?.[0]?.text || '';

    // Parse JSON from the response (strip markdown fencing if present)
    let jsonStr = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      leads: parsed.leads || [],
      model: 'gpt-4o-mini + web_search',
    });
  } catch (error) {
    console.error('Lead Generation API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate leads' }, { status: 500 });
  }
}
