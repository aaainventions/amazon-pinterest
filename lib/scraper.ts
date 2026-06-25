import * as cheerio from 'cheerio';

export function extractASIN(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/?([A-Z0-9]{10})(?:\/|\?|$)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function scrapeAmazonProduct(affiliateUrl: string) {
  const asin = extractASIN(affiliateUrl);
  if (!asin) throw new Error('Could not extract ASIN from URL');

  // Use Amazon product page with clean URL
  const cleanUrl = `https://www.amazon.com/dp/${asin}`;

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Referer: 'https://www.amazon.com/',
  };

  const res = await fetch(cleanUrl, { headers, redirect: 'follow' });
  if (!res.ok) throw new Error(`Amazon fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Title
  const title =
    $('#productTitle').text().trim() ||
    $('h1.a-size-large').text().trim() ||
    $('span#productTitle').text().trim() ||
    'Unknown Product';

  // Image - try multiple selectors
  const image =
    $('#imgBlkFront').attr('src') ||
    $('#landingImage').attr('src') ||
    $('#imgTagWrapperId img').attr('src') ||
    $('img#main-image').attr('src') ||
    (() => {
      // Try data-a-dynamic-image
      const imgEl = $('#landingImage, #imgBlkFront').first();
      const dynData = imgEl.attr('data-a-dynamic-image');
      if (dynData) {
        try {
          const parsed = JSON.parse(dynData);
          return Object.keys(parsed)[0];
        } catch {}
      }
      return '';
    })();

  // Price
  const price =
    $('.a-price .a-offscreen').first().text().trim() ||
    $('#priceblock_ourprice').text().trim() ||
    $('#priceblock_dealprice').text().trim() ||
    $('.a-price-whole').first().text().trim() ||
    '';

  // Rating
  const rating =
    $('#acrPopover').attr('title') ||
    $('span.a-icon-alt').first().text().trim() ||
    '';

  // Description - feature bullets
  const bullets: string[] = [];
  $('#feature-bullets ul li span.a-list-item').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.toLowerCase().includes('make sure this fits')) {
      bullets.push(text);
    }
  });
  const description = bullets.slice(0, 3).join(' • ') || $('meta[name="description"]').attr('content') || '';

  return {
    asin,
    title,
    image,
    price,
    rating,
    description,
    affiliateUrl,
  };
}
