'use client';

import { useState, useEffect, useCallback } from 'react';

interface Product {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  rating: string;
  affiliateUrl: string;
  asin: string;
  createdAt: string;
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={filled ? '#E60023' : 'none'} stroke="#E60023" strokeWidth={2}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function RatingStars({ ratingText }: { ratingText: string }) {
  const match = ratingText.match(/(\d+\.?\d*)/);
  const rating = match ? parseFloat(match[1]) : 0;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.round(rating)} />
      ))}
      {rating > 0 && <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: (id: string) => void }) {
  const [pinned, setPinned] = useState(false);
  const [imgError, setImgError] = useState(false);

  const pinToPinterest = () => {
    const pageUrl = encodeURIComponent(product.affiliateUrl);
    const mediaUrl = encodeURIComponent(product.image);
    const description = encodeURIComponent(`${product.title} ${product.price ? '- ' + product.price : ''}`);
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${mediaUrl}&description=${description}`;
    window.open(pinterestUrl, '_blank', 'width=750,height=550');
    setPinned(true);
    setTimeout(() => setPinned(false), 3000);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {product.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" className="w-16 h-16" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
        <button
          onClick={() => onDelete(product._id)}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          title="Remove product"
        >
          <TrashIcon />
        </button>
        {product.price && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-bold px-2 py-1 rounded-lg shadow-sm">
            {product.price}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.title}</h3>
        {product.rating && <RatingStars ratingText={product.rating} />}
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="mt-auto pt-2 flex gap-2">
          <button
            onClick={pinToPinterest}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-3 rounded-xl transition-all ${
              pinned ? 'bg-green-500 text-white' : 'bg-[#E60023] hover:bg-[#c0001d] text-white'
            }`}
          >
            {pinned ? <>&#10003; Pinned!</> : <><PinterestIcon />Pin It</>}
          </button>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-2.5 rounded-xl transition-all"
            title="View on Amazon"
          >
            <LinkIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ saved: number; errors: string[] } | null>(null);
  const [showImporter, setShowImporter] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleScrape = async () => {
    const urls = urlInput.split('\n').map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) return;
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      setScrapeResult({ saved: data.saved, errors: data.errors || [] });
      if (data.saved > 0) {
        setUrlInput('');
        await fetchProducts();
      }
    } catch (e) {
      console.error(e);
      setScrapeResult({ saved: 0, errors: ['Network error'] });
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="min-h-screen bg-[#f9f7f5]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E60023] rounded-xl flex items-center justify-center shadow-sm">
              <PinterestIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Amazon &#8594; Pinterest</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Import products. Pin with one click.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <span className="text-sm text-gray-400 hidden sm:block">{products.length} products</span>
            )}
            <button
              onClick={() => setShowImporter(!showImporter)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <span className="text-lg leading-none">+</span>
              Add Products
            </button>
          </div>
        </div>
      </header>

      {showImporter && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl">
              <h2 className="text-base font-semibold text-gray-800 mb-1">Import Amazon Products</h2>
              <p className="text-sm text-gray-500 mb-4">
                Paste your Amazon affiliate links below, one per line. We will fetch the title, image, price, and description automatically.
              </p>
              <textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.amazon.com/dp/B08N5KWB9H?tag=yourtag-20&#10;https://amzn.to/3xYzAbc"
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 resize-none transition-all"
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleScrape}
                  disabled={scraping || !urlInput.trim()}
                  className="flex items-center gap-2 bg-[#E60023] hover:bg-[#c0001d] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  {scraping ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Fetching...
                    </>
                  ) : (
                    'Fetch and Import'
                  )}
                </button>
                {scrapeResult && (
                  <div className={`text-sm ${scrapeResult.errors.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {scrapeResult.saved > 0 && `Saved ${scrapeResult.saved} product${scrapeResult.saved > 1 ? 's' : ''}`}
                    {scrapeResult.errors.length > 0 && ` - ${scrapeResult.errors.length} failed`}
                  </div>
                )}
              </div>
              {scrapeResult?.errors && scrapeResult.errors.length > 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Errors:</p>
                  {scrapeResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-amber-600">{e}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <svg className="animate-spin w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-[#E60023] opacity-30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              Click Add Products above and paste your Amazon affiliate links to get started.
            </p>
            <button
              onClick={() => setShowImporter(true)}
              className="bg-[#E60023] hover:bg-[#c0001d] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Import your first products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
