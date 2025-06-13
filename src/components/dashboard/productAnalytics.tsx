import React from 'react';
import { Product } from '@/types/Product';

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

interface ProductAnalyticsProps {
  productScores: ProductScore[];
  products: Product[];
}

export default function ProductAnalytics({ productScores, products }: ProductAnalyticsProps) {
  // Create a map of product IDs to names for quick lookup
  const productNameMap = products.reduce((acc, product) => {
    acc[product.id.toString()] = product.name;
    return acc;
  }, {} as Record<string, string>);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressWidth = (score: number): string => {
    return `${Math.min(100, Math.max(0, score))}%`;
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Product Performance Analytics</h2>
      
      {productScores.length === 0 ? (
        <div className="text-center text-zinc-400 text-lg bg-zinc-800 rounded-lg p-8">
          No analytics data yet. Start browsing products to see data here!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analytics Summary Stats */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Analytics Summary</h3>
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
                  className="bg-zinc-800 border border-zinc-700 rounded-xl p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        #{index + 1}
                      </div>
                      <h3 className="text-xl font-semibold">
                        {productNameMap[score.productId.toString()] || `Product ${score.productId}`}
                      </h3>
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
                          (score.normalizedScore || 0) >= 80 ? 'bg-green-400' :
                          (score.normalizedScore || 0) >= 60 ? 'bg-yellow-400' :
                          (score.normalizedScore || 0) >= 40 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: getProgressWidth(score.normalizedScore || 0) }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-zinc-700 p-3 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">2s Hovers</div>
                      <div className="text-lg font-semibold text-blue-400">
                        {score.eventCounts?.hover_2s || 0}
                      </div>
                      <div className="text-xs text-zinc-500">+3 pts each</div>
                    </div>
                    
                    <div className="bg-zinc-700 p-3 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">5s Hovers</div>
                      <div className="text-lg font-semibold text-blue-400">
                        {score.eventCounts?.hover_5s || 0}
                      </div>
                      <div className="text-xs text-zinc-500">+5 pts each</div>
                    </div>
                    
                    <div className="bg-zinc-700 p-3 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">Clicks</div>
                      <div className="text-lg font-semibold text-purple-400">
                        {score.eventCounts?.product_click || 0}
                      </div>
                      <div className="text-xs text-zinc-500">+8 pts each</div>
                    </div>
                    
                    <div className="bg-zinc-700 p-3 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">Add to Cart</div>
                      <div className="text-lg font-semibold text-green-400">
                        {score.eventCounts?.add_to_cart || 0}
                      </div>
                      <div className="text-xs text-zinc-500">+15 pts each</div>
                    </div>
                    
                    <div className="bg-zinc-700 p-3 rounded-lg text-center">
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
  );
}