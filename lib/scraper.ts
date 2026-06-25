import * as cheerio from 'cheerio';

export function extractASIN(url: string): string | null {
  // Handle amzn.to short links — we'll resolve them in the API route
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]ASIN=([A-Z0-9]{10})/i,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

async function resolveShortUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
    });
    return res.url || url;
  } catch {
    return url;
  }
}

export async function scrapeAmazonProduct(affiliateUrl: string) {
  // Resolve short URLs (amzn.to, etc.)
  let resolvedUrl = affiliateUrl.trim();
  if (resolvedUrl.includes('amzn.to') || resolvedUrl.includes('amzn.com/')) {
    resolvedUrl = await resolveShortUrl(resolvedUrl);
  }

  const asin = extractASIN(resolvedUrl) || extractASIN(affiliateUrl);
  if (!asin) throw new Error(`Could not extract ASIN from URL: ${affiliateUrl}`);

  // Try multiple approaches in order
  const product = await tryFetchWithFallbacks(asin, affiliateUrl);
  return product;
}

async function tryFetchWithFallbacks(asin: string, affiliateUrl: string) {
  // Approach 1: Try scraping via a CORS-friendly proxy that adds proper headers
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.amazon.com/dp/${asin}`)}`,
    `https://corsproxy.io/?${encodeURIComponent(`https://www.amazon.com/dp/${asin}`)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const result = await fetchViaProxy(proxyUrl, asin, affiliateUrl);
      if (result && result.title && result.title !== 'Unknown Product') {
        return result;
      }
    } catch {
      // try next
    }
  }

  // Approach 2: Direct fetch with aggressive headers
  try {
    const result = await fetchDirect(asin, affiliateUrl);
    if (result) return result;
  } catch {
    // fall through
  }

  // Approach 3: Return partial data so the user can at least see something
  return {
    asin,
    title: `Amazon Product (${asin})`,
    image: `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`,
    price: '',
    rating: '',
    description: 'Product details could not be fetched automatically. Click the link to view on Amazon.',
    affiliateUrl,
  };
}

async function fetchViaProxy(proxyUrl: string, asin: string, affiliateUrl: string) {
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Proxy failed: ${res.status}`);

  let html = '';
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const json = await res.json();
    html = json.contents || json.body || '';
  } else {
    html = await res.text();
  }

  if (!html || html.length < 500) throw new Error('Empty proxy response');
  return parseAmazonHtml(html, asin, affiliateUrl);
}

async function fetchDirect(asin: string, affiliateUrl: string) {
  const url = `https://www.amazon.com/dp/${asin}`;
  const userAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Amazonbot/0.1 (+https://developer.amazon.com/support/amazonbot)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  ];

  for (const ua of userAgents) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept-Language': 'en-US,en;q=0.9',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.length < 500) continue;
      const parsed = parseAmazonHtml(html, asin, affiliateUrl);
      if (parsed.title !== 'Unknown Product') return parsed;
    } catch {
      continue;
    }
  }
  throw new Error('All direct fetch attempts failed');
}

function parseAmazonHtml(html: string, asin: string, affiliateUrl: string) {
  const $ = cheerio.load(html);

  // Title — try many selectors
  const title =
    $('#productTitle').text().trim() ||
    $('h1#title span').text().trim() ||
    $('h1.a-size-large').first().text().trim() ||
    $('meta[name="title"]').attr('content')?.trim() ||
    $('title').text().replace(/Amazon\.com\s*:?\s*/i, '').trim() ||
    'Unknown Product';

  // Image — try data attribute first (highest res), then src
  let image = '';
  const mainImg = $('#landingImage, #imgBlkFront, #main-image').first();
  const dynData = mainImg.attr('data-a-dynamic-image') || mainImg.attr('data-old-hires');
  if (dynData && dynData.startsWith('{')) {
    try {
      const parsed = JSON.parse(dynData);
      // Pick the largest image
      const sorted = Object.entries(parsed).sort((a: [string, unknown], b: [string, unknown]) => {
        const aSize = (a[1] as number[])[0] * (a[1] as number[])[1];
        const bSize = (b[1] as number[])[0] * (b[1] as number[])[1];
        return bSize - aSize;
      });
      image = sorted[0]?.[0] || '';
    } catch {}
  }
  if (!image) {
    image =
      mainImg.attr('src') ||
      $('img#main-image').attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`;
  }

  // Price
  const price =
    $('.a-price .a-offscreen').first().text().trim() ||
    $('#corePrice_feature_div .a-offscreen').first().text().trim() ||
    $('#priceblock_ourprice').text().trim() ||
    $('#priceblock_dealprice').text().trim() ||
    $('meta[name="twitter:title"]').attr('content')?.match(/\$[\d,.]+/)?.[0] ||
    '';

  // Rating
  const rating =
    $('#acrPopover').attr('title') ||
    $('span.a-icon-alt').first().text().trim() ||
    $('[data-hook="rating-out-of-text"]').first().text().trim() ||
    '';

  // Description bullets
  const bullets: string[] = [];
  $('#feature-bullets li span.a-list-item, #featurebullets_feature_div li span').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.toLowerCase().includes('make sure this fits') && text.length > 5) {
      bullets.push(text);
    }
  });
  const description =
    bullets.slice(0, 3).join(' • ') ||
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  return { asin, title, image, price, rating, description, affiliateUrl };
}
