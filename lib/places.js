// lib/places.js — Google Places API v2 (new) Text Search helper

const PLACES_V2_URL = 'https://places.googleapis.com/v1/places:searchText';

const DIRECTORY_BLOCKLIST = [
  'yelp.com', 'yellowpages.com', 'bbb.org', 'thumbtack.com',
  'houzz.com', 'angi.com', 'angieslist.com', 'homeadvisor.com',
  'manta.com', 'mapquest.com', 'superpages.com', 'google.com',
  'facebook.com', 'instagram.com', 'linkedin.com', 'nextdoor.com',
  'tripadvisor.com', 'trustpilot.com', 'porch.com', 'bark.com',
  'alignable.com', 'chamberofcommerce.com',
];

function isDirectory(url) {
  if (!url) return true;
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return DIRECTORY_BLOCKLIST.some(d => hostname.endsWith(d));
  } catch {
    return true;
  }
}

/**
 * Search for businesses using Google Places API v2.
 * Returns candidates with guaranteed phone (from Google My Business).
 */
export async function searchPlaces(query, limit = 10) {
  const apiKey = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is not set');

  const candidates = [];
  // Over-fetch to have buffer after filtering — try to get limit*3 candidates
  const targetCount = Math.min(limit * 3, 20); // API max per call is 20

  let pageToken = null;
  const maxPages = 3;

  for (let page = 0; page < maxPages && candidates.length < targetCount; page++) {
    const body = {
      textQuery: query,
      maxResultCount: 20,
      ...(pageToken ? { pageToken } : {}),
    };

    const res = await fetch(PLACES_V2_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.displayName',
          'places.formattedAddress',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.types',
          'places.id',
          'places.rating',
          'places.userRatingCount',
          'places.businessStatus',
          'nextPageToken',
        ].join(','),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Places API v2 error ${res.status}: ${errText.substring(0, 200)}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`Places API error: ${data.error.message}`);
    }

    for (const place of data.places || []) {
      if (isDirectory(place.websiteUri)) continue;
      if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') continue;

      candidates.push({
        companyName: place.displayName?.text || 'Unknown',
        location: place.formattedAddress || '',
        phone: place.nationalPhoneNumber || null,
        website: place.websiteUri || null,
        placeId: place.id,
        types: place.types || [],
        rating: place.rating || null,
        reviewCount: place.userRatingCount || 0,
      });
    }

    pageToken = data.nextPageToken || null;
    if (!pageToken) break;

    // Small pause between pages
    if (page < maxPages - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return candidates;
}
