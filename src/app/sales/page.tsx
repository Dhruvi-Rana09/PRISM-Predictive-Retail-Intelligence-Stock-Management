'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

interface Product {
  id: string;
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

const SalesAnalyticsPage: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'quantity' | 'revenue'>('quantity');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    processMonthlyData();
  }, [salesData, selectedProduct]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales data
      const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
      const salesSnapshot = await getDocs(salesQuery);
      const salesList = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SalesData[];

      // Fetch products data
      const productsQuery = query(collection(db, 'products'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      setSalesData(salesList);
      setProducts(productsList);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from Firebase');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = () => {
    // Filter sales data by selected product - FIXED: Match by productName instead of productId
    const filteredSales = selectedProduct === 'all' 
      ? salesData 
      : salesData.filter(sale => sale.productName === selectedProduct);

    // Group by month
    const monthlyGroups: { [key: string]: SalesData[] } = {};
    
    filteredSales.forEach(sale => {
      const date = sale.date.toDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(sale);
    });

    // Convert to chart data
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

    setMonthlyData(chartData);
  };

  const getSelectedProductName = () => {
    if (selectedProduct === 'all') return 'All Products';
    // FIXED: Return the selected product name directly since we're now storing names
    return selectedProduct;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getTotalStats = () => {
    // FIXED: Filter by productName instead of productId
    const filteredSales = selectedProduct === 'all' 
      ? salesData 
      : salesData.filter(sale => sale.productName === selectedProduct);

    return {
      totalOrders: filteredSales.length,
      totalQuantity: filteredSales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      avgOrderValue: filteredSales.length > 0 
        ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length 
        : 0
    };
  };

  // Custom tooltip formatter
  const customTooltipFormatter = (value: number | string, name: string) => {
    if (chartType === 'quantity') {
      return [`${value} units`, 'Quantity Sold'];
    } else {
      return [formatCurrency(Number(value)), 'Revenue'];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your e-commerce sales performance</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Products</option>
                {/* FIXED: Use product.name as both value and display text */}
                {products.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'quantity' | 'revenue')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quantity">Quantity Sold</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-6"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {chartType === 'quantity' ? 'Quantity Sold' : 'Revenue'} Trends - {getSelectedProductName()}
          </h2>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#d1d5db' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#d1d5db' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickFormatter={chartType === 'revenue' ? (value: number) => `$${(value / 1000).toFixed(0)}k` : undefined}
                />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                  activeDot={{ r: 6, stroke: chartType === 'quantity' ? '#3B82F6' : '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.date.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.buyer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.region}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;