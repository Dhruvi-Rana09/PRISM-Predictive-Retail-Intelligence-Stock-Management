'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import BundlesSection from '@/components/BundleSection';
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

export default function Dashboard() {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeFilter, setTimeFilter] = useState('monthly');

  const filteredData = timeFilter === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-semibold mb-4">Sales Overview</h1>

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
      <BundlesSection />
    </div>
  );
}
