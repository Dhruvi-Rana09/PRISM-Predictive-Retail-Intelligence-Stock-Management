'use client';

import { useState, useEffect } from 'react';
import { bundleAnalysisService, ProductPair } from '@/app/bundle/bundle';

export default function BundlesSection() {
  const [bundles, setBundles] = useState<ProductPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        setError(null);
        const bundleData = await bundleAnalysisService.getBundleSuggestions(2);
        setBundles(bundleData);
      } catch (err) {
        console.error('Error fetching bundle data:', err);
        setError('Failed to load bundle suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900 p-8 rounded-xl mt-10">
        <h2 className="text-white text-2xl font-semibold text-center mb-8">
          Frequently Bought Together
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-zinc-700 rounded mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded mb-1"></div>
              <div className="h-3 bg-zinc-700 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-zinc-700 rounded w-16"></div>
                <div className="h-8 bg-zinc-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 p-8 rounded-xl mt-10">
        <h2 className="text-white text-2xl font-semibold text-center mb-8">
          Frequently Bought Together
        </h2>
        <div className="text-center text-red-400 p-8">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 p-8 rounded-xl mt-10">
      <h2 className="text-white text-2xl font-semibold text-center mb-8">
        Frequently Bought Together
      </h2>
      
      {bundles.length === 0 ? (
        <div className="text-center text-zinc-400 p-8">
          <p>No bundle opportunities found yet.</p>
          <p className="text-sm mt-2">Bundle suggestions will appear as customers purchase products together.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-zinc-400 text-sm">
              Showing top {Math.min(bundles.length, 6)} bundle opportunities
            </p>
            {bundles.length > 6 && (
              <span className="text-zinc-500 text-xs">
                {bundles.length - 6} more available
              </span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.slice(0, 6).map((bundle, index) => (
            <div
              key={`${bundle.product1.id}-${bundle.product2.id}`}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/20 transition-shadow"
            >
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white text-lg font-semibold">Bundle #{index + 1}</h3>
                  <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    {bundle.frequency} times
                  </span>
                </div>
                <ul className="text-zinc-300 text-sm list-disc list-inside space-y-1">
                  <li>{bundle.product1.name} - ₹{bundle.product1.price}</li>
                  <li>{bundle.product2.name} - ₹{bundle.product2.price}</li>
                </ul>
                <div className="mt-3 text-xs text-zinc-400">
                  <p>Bought by {bundle.buyers.length} unique customer{bundle.buyers.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Original Price:</span>
                  <span className="text-zinc-400 line-through">₹{bundle.originalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-400">Bundle Price:</span>
                  <span className="text-green-400 font-medium">₹{Math.round(bundle.bundlePrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-400">You Save:</span>
                  <span className="text-indigo-400 font-medium">
                    ₹{Math.round(bundle.discount)} ({bundle.discountPercentage}%)
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-700">
                <span className="text-white font-medium text-base">
                  ₹{Math.round(bundle.bundlePrice)}
                </span>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
                  Create Bundle
                </button>
              </div>
            </div>
                      ))}
          </div>
        </>
      )}
    </div>
  );
}