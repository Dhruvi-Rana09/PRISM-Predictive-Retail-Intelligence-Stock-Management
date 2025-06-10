'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { getAllProductScores } from '../../lib/analytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import BundlesSection from '@/components/BundleSection';

// Types
interface SalesData {
  id: string;
  buyer: string;
  date: Timestamp;
  paymentMethod: string;
  price: number;
  productId: string;
  productName: string;
  quantity: number;
  region: string;
  total: number;
}

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

interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

interface MonthlyData {
  month: string;
  quantity: number;
  revenue: number;
  orders: number;
}

// Sample data for the original bar chart
const monthlyData = [
  { label: 'Jan', sales: 1200 },
  { label: 'Feb', sales: 2100 },
  { label: 'Mar', sales: 800 },
  { label: 'Apr', sales: 1600 },
  { label: 'May', sales: 900 },
  { label: 'Jun', sales: 2500 },
  { label: 'Jul', sales: 1200 },
  { label: 'Aug', sales: 2100 },
  { label: 'Sep', sales: 800 },
  { label: 'Oct', sales: 1600 },
  { label: 'Nov', sales: 900 },
  { label: 'Dec', sales: 2500 },
];

const weeklyData = [
  { label: 'Mon', sales: 300 },
  { label: 'Tue', sales: 500 },
  { label: 'Wed', sales: 400 },
  { label: 'Thu', sales: 600 },
  { label: 'Fri', sales: 550 },
  { label: 'Sat', sales: 900 },
  { label: 'Sun', sales: 800 },
];

// Helper functions for analytics
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getProgressWidth = (score: number): string => {
  return `${Math.min(100, Math.max(0, score))}%`;
};

export default function IntegratedSellerDashboard() {
  // States for original bar chart
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeFilter, setTimeFilter] = useState('monthly');

  // States for sales analytics
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [selectedSalesProduct, setSelectedSalesProduct] = useState<string>('all');
  const [salesMonthlyData, setSalesMonthlyData] = useState<MonthlyData[]>([]);
  const [chartType, setChartType] = useState<'quantity' | 'revenue'>('quantity');

  // States for product analytics
  const [productScores, setProductScores] = useState<ProductScore[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Common states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredData = timeFilter === 'weekly' ? weeklyData : monthlyData;

  // Create a map of product IDs to names for quick lookup
  const productNameMap = products.reduce((acc, product) => {
    acc[product.id.toString()] = product.name;
    return acc;
  }, {} as Record<string, string>);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (salesData.length > 0) {
      processSalesMonthlyData();
    }
  }, [salesData, selectedSalesProduct]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch products from Firebase
      const productsCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productsCollection);
      
      const productList: Product[] = productSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          category: data.category,
          price: data.price,
          image: data.image,
          description: data.description,
          inStock: data.inStock,
        } as Product;
      });
      
      setProducts(productList);

      // Fetch sales data
      const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
      const salesSnapshot = await getDocs(salesQuery);
      const salesList = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SalesData[];

      setSalesData(salesList);
      
      // Fetch analytics scores
      const scores = await getAllProductScores();
      setProductScores(scores);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const processSalesMonthlyData = () => {
    const filteredSales = selectedSalesProduct === 'all' 
      ? salesData 
      : salesData.filter(sale => sale.productName === selectedSalesProduct);

    const monthlyGroups: { [key: string]: SalesData[] } = {};
    
    filteredSales.forEach(sale => {
      const date = sale.date.toDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(sale);
    });

    const chartData: MonthlyData[] = Object.keys(monthlyGroups)
      .sort()
      .map(monthKey => {
        const sales = monthlyGroups[monthKey];
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
          .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        return {
          month: monthName,
          quantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
          revenue: sales.reduce((sum, sale) => sum + sale.total, 0),
          orders: sales.length
        };
      });

    setSalesMonthlyData(chartData);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getSalesStats = () => {
    const filteredSales = selectedSalesProduct === 'all' 
      ? salesData 
      : salesData.filter(sale => sale.productName === selectedSalesProduct);

    return {
      totalOrders: filteredSales.length,
      totalQuantity: filteredSales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      avgOrderValue: filteredSales.length > 0 
        ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length 
        : 0
    };
  };

  const customTooltipFormatter = (value: number | string, name: string) => {
    if (chartType === 'quantity') {
      return [`${value} units`, 'Quantity Sold'];
    } else {
      return [formatCurrency(Number(value)), 'Revenue'];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={fetchAllData} 
            className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const salesStats = getSalesStats();

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 text-center">Seller Dashboard</h1>

      {/* Sales Overview Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Sales Overview</h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select onValueChange={setSelectedProduct} defaultValue="all">
            <SelectTrigger className="w-[180px] bg-zinc-800 border-none text-white">
              <SelectValue placeholder="Filter by Product" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 text-white">
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="charger">Portable Charger</SelectItem>
              <SelectItem value="watch">Premium Watch</SelectItem>
              <SelectItem value="hoodie">Hoodie</SelectItem>
              <SelectItem value="keyboard">Keyboard</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setTimeFilter} defaultValue="monthly">
            <SelectTrigger className="w-[180px] bg-zinc-800 border-none text-white">
              <SelectValue placeholder="Filter by Time" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 text-white">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-zinc-800 text-white shadow-xl">
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="label" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analytics Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Detailed Sales Analytics</h2>
        
        {/* Controls */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Product
              </label>
              <select
                value={selectedSalesProduct}
                onChange={(e) => setSelectedSalesProduct(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-600 rounded-md bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'quantity' | 'revenue')}
                className="w-full px-3 py-2 border border-zinc-600 rounded-md bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="quantity">Quantity Sold</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Total Orders</h3>
            <p className="text-2xl font-bold text-white">{salesStats.totalOrders.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Total Quantity</h3>
            <p className="text-2xl font-bold text-white">{salesStats.totalQuantity.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(salesStats.totalRevenue)}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400">Avg Order Value</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(salesStats.avgOrderValue)}</p>
          </div>
        </div>

        {/* Sales Chart */}
        <Card className="bg-zinc-800 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              {chartType === 'quantity' ? 'Quantity Sold' : 'Revenue'} Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="month"
                  stroke="#ccc"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#ccc"
                  tick={{ fontSize: 12 }}
                  tickFormatter={chartType === 'revenue' ? (value: number) => `$${(value / 1000).toFixed(0)}k` : undefined}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={{ 
                    backgroundColor: '#222',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartType}
                  stroke={chartType === 'quantity' ? '#3B82F6' : '#10B981'}
                  strokeWidth={3}
                  name={chartType === 'quantity' ? 'Quantity Sold' : 'Revenue'}
                  dot={{ fill: chartType === 'quantity' ? '#3B82F6' : '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bundles Section */}
      <BundlesSection />

      {/* Product Analytics Section */}
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
                            score.normalizedScore >= 80 ? 'bg-green-400' :
                            score.normalizedScore >= 60 ? 'bg-yellow-400' :
                            score.normalizedScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
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
      
      <div className="mt-8 text-center">
        <button
          onClick={fetchAllData}
          className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
        >
          Refresh All Data
        </button>
      </div>
    </div>
  );
}