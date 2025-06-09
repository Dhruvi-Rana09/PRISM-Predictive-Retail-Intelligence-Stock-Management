'use client';

import { useEffect, useState } from 'react';
import { getAllProductScores } from '../../lib/analytics';

interface ProductScore {
  productId: string | number;
  rawScore: number;
  normalizedScore: number;
  eventCounts: {
    hover_2s: number;
    hover_5s: number;
    product_click: number;
    add_to_cart: number;
    cart_abandon: number;
  };
  lastUpdated: any;
}
const productNames: Record<string, string> = {
  '1': 'Dark Minimal Sneakers',
  '2': 'Black Hoodie',
  '3': 'Premium Watch',
  '4': 'Noise Cancelling Headphones',
  '5': 'Minimalist Backpack',
  '6': 'Wireless Earbuds',
  '7': 'Premium Leather Wallet',
  '8': 'Carbon Fiber Phone Case',
  '9': 'Titanium Sunglasses',
  '10': 'Smart Fitness Tracker',
  '11': 'Mechanical Keyboard',
  '12': 'Portable Charger',
  '13': 'Premium Denim Jacket',
  '14': 'Stainless Steel Water Bottle',
  '15': 'Bluetooth Speaker',
  '16': 'Gaming Mouse',
};


// Helper function to get score color based on normalized score
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

// Helper function to get progress bar width
const getProgressWidth = (score: number): string => {
  return `${Math.min(100, Math.max(0, score))}%`;
};

export default function AnalyticsPage() {
  const [productScores, setProductScores] = useState<ProductScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scores = await getAllProductScores();
        setProductScores(scores);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Product Analytics Dashboard</h1>
      
      <div className="max-w-6xl mx-auto">
        {productScores.length === 0 ? (
          <div className="text-center text-zinc-400 text-lg">
            No analytics data yet. Start browsing products to see data here!
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {productScores.reduce((sum, p) => sum + (p.eventCounts?.hover_2s || 0), 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Total 2s Hovers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {productScores.reduce((sum, p) => sum + (p.eventCounts?.product_click || 0), 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Total Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {productScores.reduce((sum, p) => sum + (p.eventCounts?.add_to_cart || 0), 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Total Cart Adds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {productScores.reduce((sum, p) => sum + (p.eventCounts?.cart_abandon || 0), 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Total Cart Abandons</div>
                </div>
              </div>
            </div>

            {/* Product Rankings */}
            <div className="grid gap-6">
              {productScores
                .sort((a, b) => (b.normalizedScore || 0) - (a.normalizedScore || 0))
                .map((score, index) => (
                  <div
                    key={score.productId}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <h2 className="text-xl font-semibold">
                          {productNames[score.productId.toString()] || `Product ${score.productId}`}
                        </h2>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(score.normalizedScore || 0)}`}>
                          {(score.normalizedScore || 0).toFixed(1)}/100
                        </div>
                        <div className="text-sm text-zinc-400">
                          Raw: {score.rawScore || 0} pts
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            score.normalizedScore >= 80 ? 'bg-green-400' :
                            score.normalizedScore >= 60 ? 'bg-yellow-400' :
                            score.normalizedScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: getProgressWidth(score.normalizedScore || 0) }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="bg-zinc-800 p-3 rounded-lg text-center">
                        <div className="text-sm text-zinc-400">2s Hovers</div>
                        <div className="text-lg font-semibold text-blue-400">
                          {score.eventCounts?.hover_2s || 0}
                        </div>
                        <div className="text-xs text-zinc-500">+3 pts each</div>
                      </div>
                      
                      <div className="bg-zinc-800 p-3 rounded-lg text-center">
                        <div className="text-sm text-zinc-400">5s Hovers</div>
                        <div className="text-lg font-semibold text-blue-400">
                          {score.eventCounts?.hover_5s || 0}
                        </div>
                        <div className="text-xs text-zinc-500">+5 pts each</div>
                      </div>
                      
                      <div className="bg-zinc-800 p-3 rounded-lg text-center">
                        <div className="text-sm text-zinc-400">Clicks</div>
                        <div className="text-lg font-semibold text-purple-400">
                          {score.eventCounts?.product_click || 0}
                        </div>
                        <div className="text-xs text-zinc-500">+8 pts each</div>
                      </div>
                      
                      <div className="bg-zinc-800 p-3 rounded-lg text-center">
                        <div className="text-sm text-zinc-400">Add to Cart</div>
                        <div className="text-lg font-semibold text-green-400">
                          {score.eventCounts?.add_to_cart || 0}
                        </div>
                        <div className="text-xs text-zinc-500">+15 pts each</div>
                      </div>
                      
                      <div className="bg-zinc-800 p-3 rounded-lg text-center">
                        <div className="text-sm text-zinc-400">Cart Abandon</div>
                        <div className="text-lg font-semibold text-red-400">
                          {score.eventCounts?.cart_abandon || 0}
                        </div>
                        <div className="text-xs text-zinc-500">-5 pts each</div>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-zinc-400">Click Rate</div>
                          <div className="font-semibold">
                            {(score.eventCounts?.hover_2s || 0) > 0 
                              ? (((score.eventCounts?.product_click || 0) / (score.eventCounts?.hover_2s || 1)) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-zinc-400">Cart Conversion</div>
                          <div className="font-semibold">
                            {(score.eventCounts?.product_click || 0) > 0 
                              ? (((score.eventCounts?.add_to_cart || 0) / (score.eventCounts?.product_click || 1)) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-zinc-400">Cart Exit Rate</div>
                          <div className="font-semibold">
                            {(score.eventCounts?.add_to_cart || 0) > 0 
                              ? (((score.eventCounts?.cart_abandon || 0) / (score.eventCounts?.add_to_cart || 1)) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
        >
          Refresh Data
        </button>
      </div>
    </main>
  );
}