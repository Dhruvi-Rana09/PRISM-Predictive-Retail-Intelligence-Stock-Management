'use client';
import React, { useState, useEffect } from 'react';
import { bundleAnalysisService, ProductPair } from '../bundle/bundle';
import { Package, TrendingUp, Users, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

const BundleSuggestionsPage = () => {
  const [bundles, setBundles] = useState<ProductPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minFrequency, setMinFrequency] = useState(2);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      setError(null);
      const suggestions = await bundleAnalysisService.getBundleSuggestions(minFrequency);
      setBundles(suggestions);
    } catch (err) {
      setError('Failed to fetch bundle suggestions. Please try again.');
      console.error('Error fetching bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, [minFrequency]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Analyzing sales data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-blue-600" />
                Bundle Suggestions
              </h1>
              <p className="mt-2 text-gray-600">
                Discover product combinations frequently bought together
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="minFreq" className="text-sm font-medium text-gray-700">
                  Min Frequency:
                </label>
                <select
                  id="minFreq"
                  value={minFrequency}
                  onChange={(e) => setMinFrequency(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={5}>5+</option>
                  <option value={10}>10+</option>
                </select>
              </div>
              <button
                onClick={fetchBundles}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bundles</p>
                <p className="text-2xl font-bold text-gray-900">{bundles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Buyers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bundles.reduce((acc, bundle) => acc + bundle.buyers.length, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bundles.length > 0 
                    ? formatCurrency(bundles.reduce((acc, bundle) => acc + bundle.discount, 0) / bundles.length)
                    : '$0.00'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Cards */}
        {bundles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bundle suggestions found</h3>
            <p className="mt-2 text-gray-600">
              Try lowering the minimum frequency or check if you have enough sales data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bundles.map((bundle, index) => (
              <div key={`${bundle.product1.id}-${bundle.product2.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Bundle Rank */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      #{index + 1} Most Popular
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {bundle.frequency} times
                    </span>
                  </div>

                  {/* Products */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{bundle.product1.name}</h4>
                        <p className="text-xs text-gray-600">ID: {bundle.product1.id}</p>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(bundle.product1.price)}</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-gray-400 text-sm font-medium">+</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{bundle.product2.name}</h4>
                        <p className="text-xs text-gray-600">ID: {bundle.product2.id}</p>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(bundle.product2.price)}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Original Price:</span>
                      <span className="text-sm line-through text-gray-500">{formatCurrency(bundle.originalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Bundle Price:</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(bundle.bundlePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">You Save:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(bundle.discount)} ({bundle.discountPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Unique Buyers:</span>
                      <span className="font-medium">{bundle.buyers.length}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    Create Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleSuggestionsPage;