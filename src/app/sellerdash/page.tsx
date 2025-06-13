'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { getAllProductScores } from '../../lib/analytics';
import { Product } from '@/types/Product';
import BundlesSection from '@/components/dashboard/BundleSection';
import { AddProductForm } from '@/components/AddProductForm';
import { EditProductForm } from '@/components/EditProductForm';
import { ProductList } from '@/components/ProductList';
import SalesAnalytics from '@/components/dashboard/salesAnalytics';
import ProductAnalytics from '@/components/dashboard/productAnalytics';
import RestockManager from '@/components/dashboard/restockManager';

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

export default function IntegratedSellerDashboard() {
  // States
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productScores, setProductScores] = useState<ProductScore[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Product management states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Common states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

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
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Product;
      });
      
      setProducts(productList);

      // Fetch sales data
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const salesList = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SalesData[];

      setSalesData(salesList);
      
      // Fetch analytics scores
      try {
        const scores = await getAllProductScores();
        setProductScores(scores);
      } catch (analyticsError) {
        console.error('Error fetching analytics scores:', analyticsError);
        setProductScores([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Product management functions
  const refreshProducts = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchAllData();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    refreshProducts();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingProduct(null);
    refreshProducts();
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingProduct(null);
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

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowProductManager(!showProductManager)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showProductManager ? 'Hide' : 'Manage'} Products
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Product Management Section */}
      {showProductManager && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Product Management</h2>
          <div className="bg-zinc-800 rounded-lg p-6">
            <ProductList 
              onEdit={handleEditProduct}
              key={refreshTrigger}
            />
          </div>
        </div>
      )}

      {/* Restock Manager Section */}
      <RestockManager products={products} onRestockComplete={refreshProducts} />

      {/* Sales Analytics Section */}
      <SalesAnalytics salesData={salesData} products={products} />

      {/* Bundles Section */}
      <BundlesSection />

      {/* Product Analytics Section */}
      <ProductAnalytics productScores={productScores} products={products} />

      {/* Add Product Modal */}
      {showAddForm && (
        <AddProductForm
          onSuccess={handleAddSuccess}
          onCancel={handleAddCancel}
        />
      )}

      {/* Edit Product Modal */}
      {showEditForm && editingProduct && (
        <EditProductForm
          product={editingProduct}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}
      
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