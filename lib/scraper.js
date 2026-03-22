// lib/scraper.js — Concurrent email extractor with semaphore + timeout

import * as cheerio from 'cheerio';

// Simple email regex — catches most formats
const EMAIL_REGEX = /\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b/gi;

// Domains we don't want to treat as contact emails
const EMAIL_BLOCKLIST = ['example.com', 'sentry.io', 'wixpress.com', 'squarespace.com'];

function isValidEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (EMAIL_BLOCKLIST.some(b => domain.includes(b))) return false;
  if (email.endsWith('.png') || email.endsWith('.jpg')) return false;
  return true;
}

async function fetchWithTimeout(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });
    const text = await res.text();
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractEmails(html, baseUrl) {
  if (!html) return null;
  const $ = cheerio.load(html);

  // 1. mailto: links
  const mailtoEmails = [];
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const email = href.replace('mailto:', '').split('?')[0].trim();
    if (email) mailtoEmails.push(email);
  });
  if (mailtoEmails.length > 0) {
    const valid = mailtoEmails.find(isValidEmail);
    if (valid) return valid;
  }

  // 2. Regex across full page text
  const text = $.text();
  const matches = text.match(EMAIL_REGEX) || [];
  const valid = matches.find(isValidEmail);
  return valid || null;
}

/**
 * Concurrently scrape a list of websites for email addresses.
 * @param {Array<{website: string, ...}>} leads
 * @param {number} concurrency Max simultaneous requests
 * @returns {Promise<Array>} leads with email field populated best-effort
 */
export async function enrichWithEmails(leads, concurrency = 5) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < leads.length) {
      const current = index++;
      const lead = leads[current];

      if (!lead.website) {
        results[current] = { ...lead, email: null, emailMissing: true };
        continue;
      }

      // Try homepage first, then /contact
      let email = null;
      const homepage = await fetchWithTimeout(lead.website);
      email = extractEmails(homepage, lead.website);

      if (!email) {
        const contactUrl = lead.website.replace(/\/$/, '') + '/contact';
        const contactPage = await fetchWithTimeout(contactUrl);
        email = extractEmails(contactPage, lead.website);
      }

      // Also try /contact-us as last resort
      if (!email) {
        const contactUsUrl = lead.website.replace(/\/$/, '') + '/contact-us';
        const contactUsPage = await fetchWithTimeout(contactUsUrl);
        email = extractEmails(contactUsPage, lead.website);
      }

      results[current] = {
        ...lead,
        email,
        emailMissing: !email,
      };
    }
  }

  // Launch `concurrency` workers in parallel
  const workers = Array.from({ length: Math.min(concurrency, leads.length) }, worker);
  await Promise.all(workers);

  return results;
}
