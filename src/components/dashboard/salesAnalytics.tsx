import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/Product';

interface SalesData {
  id: string;
  buyer: string;
  date: any;
  paymentMethod: string;
  price: number;
  productId: string;
  productName: string;
  quantity: number;
  region: string;
  total: number;
}

interface MonthlyData {
  month: string;
  quantity: number;
  revenue: number;
  orders: number;
}

interface SalesAnalyticsProps {
  salesData: SalesData[];
  products: Product[];
}

export default function SalesAnalytics({ salesData, products }: SalesAnalyticsProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [chartType, setChartType] = useState<'quantity' | 'revenue'>('quantity');
  const [salesMonthlyData, setSalesMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (salesData.length > 0) {
      processSalesMonthlyData();
    }
  }, [salesData, selectedProduct]);

  const processSalesMonthlyData = () => {
    const filteredSales = selectedProduct === 'all' 
      ? salesData 
      : salesData.filter(sale => sale.productName === selectedProduct);

    const monthlyGroups: { [key: string]: SalesData[] } = {};
    
    filteredSales.forEach(sale => {
      // Safe date handling
      let date: Date;
      if (sale.date && typeof sale.date.toDate === 'function') {
        date = sale.date.toDate();
      } else if (sale.date instanceof Date) {
        date = sale.date;
      } else {
        console.warn('Invalid date format for sale:', sale.id);
        return;
      }
      
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
          quantity: sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0),
          revenue: sales.reduce((sum, sale) => sum + (sale.total || 0), 0),
          orders: sales.length
        };
      });

    setSalesMonthlyData(chartData);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getSalesStats = () => {
    const filteredSales = selectedProduct === 'all' 
      ? salesData 
      : salesData.filter(sale => sale.productName === selectedProduct);

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalOrders = filteredSales.length;

    return {
      totalOrders,
      totalQuantity: filteredSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0),
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  };

  const customTooltipFormatter = (value: number | string, name: string) => {
    if (chartType === 'quantity') {
      return [`${value} units`, 'Quantity Sold'];
    } else {
      return [formatCurrency(Number(value)), 'Revenue'];
    }
  };

  const salesStats = getSalesStats();

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Sales Analytics</h2>

      {/* Enhanced Controls */}
      <div className="bg-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
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

      {/* Enhanced Bar Chart */}
      <Card className="bg-zinc-800 text-white shadow-xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            {chartType === 'quantity' ? 'Quantity Sold' : 'Revenue'} Trends
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesMonthlyData}>
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
              <Bar
                dataKey={chartType}
                fill={chartType === 'quantity' ? '#3B82F6' : '#10B981'}
                name={chartType === 'quantity' ? 'Quantity Sold' : 'Revenue'}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}