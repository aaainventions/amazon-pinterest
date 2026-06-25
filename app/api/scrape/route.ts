import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { scrapeAmazonProduct } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Please provide an array of URLs' }, { status: 400 });
    }

    await connectDB();

    const results = await Promise.allSettled(
      urls.map(async (url: string) => {
        const data = await scrapeAmazonProduct(url.trim());
        // Upsert by ASIN
        const product = await Product.findOneAndUpdate(
          { asin: data.asin },
          { ...data },
          { upsert: true, new: true }
        );
        return product;
      })
    );

    const succeeded = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason?.message || 'Unknown error');

    return NextResponse.json({ saved: succeeded.length, errors: failed, products: succeeded });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
