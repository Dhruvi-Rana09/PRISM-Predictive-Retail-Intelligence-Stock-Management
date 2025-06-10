'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-config'; // Adjust the path to your Firebase config
import { useCart } from '../context/CartContext';
import { useProductAnalytics } from '../../hooks/useProductAnalytics';

// Define the product type based on your Firebase structure
interface FirebaseProduct {
  id: number;          // This is a number field in your Firebase document
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;    // Change back to camelCase if that's what your Firebase uses
  createdAt: any;
  updatedAt: any;
}

// Convert Firebase product to the format expected by your cart/analytics
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

// Product Card Component with Analytics
function ProductCard({ product }: { product: FirebaseProduct }) {
  const { addToCart } = useCart();
  
  // Initialize analytics for this product - product.id is already a number
  const {
    handleMouseEnter,
    handleMouseLeave,
    handleProductClick,
    handleAddToCart,
  } = useProductAnalytics({ 
    productId: product.id,
    userId: "pixel-pirates", // Add this when you have user authentication
  });

  const handleAddToCartClick = () => {
    // Convert to the format expected by your cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name || '',
      price: product.price || 0,
      image: product.image || '',
    };
    addToCart(cartProduct);
    handleAddToCart(); // Track analytics
  };

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleProductClick}
    >
      <div className="relative w-full h-56">
        <Image
          src={product?.image || '/placeholder.jpg'}
          alt={product?.name || 'Product'}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">{product?.name || 'Unnamed Product'}</h2>
        <p className="text-zinc-400 mt-1">₹{(product?.price || 0).toLocaleString()}</p>
        <p className="text-zinc-500 text-sm mt-1">{product?.description || 'No description available'}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-400 capitalize">{product?.category || 'uncategorized'}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            product?.inStock === true
              ? 'bg-green-800 text-green-200' 
              : 'bg-red-800 text-red-200'
          }`}>
            {product?.inStock === true ? 'In Stock' : 'Out of Stock'}
            {/* Debug info - remove this later */}
            <span className="ml-1 text-xs opacity-50">({String(product?.inStock)})</span>
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent product click event
            handleAddToCartClick();
          }}
          disabled={product?.inStock !== true}
          className={`mt-4 w-full font-semibold py-2 px-4 rounded transition ${
            product?.inStock === true
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}>
          {product?.inStock === true ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsCollection = collection(db, 'products'); // Replace 'products' with your collection name
        const productSnapshot = await getDocs(productsCollection);
        
        const productList: FirebaseProduct[] = productSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Product data from Firebase:', data); // Debug log
          return {
            id: data.id,           // Use the id field from the document data
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
            description: data.description,
            inStock: data.inStock, // Note: lowercase to match your Firebase field
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as FirebaseProduct;
        });
        
        setProducts(productList);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
        <h1 className="text-4xl font-bold mb-8 text-center text-white tracking-tight">
          Crafted for the Bold.
        </h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
        <h1 className="text-4xl font-bold mb-8 text-center text-white tracking-tight">
          Crafted for the Bold.
        </h1>
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <div className="text-red-400 text-center mb-4">
            <p className="text-xl mb-2">⚠️ {error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
        <h1 className="text-4xl font-bold mb-8 text-center text-white tracking-tight">
          Crafted for the Bold.
        </h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-zinc-400 text-xl">No products available at the moment.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
      <h1 className="text-4xl font-bold mb-8 text-center text-white tracking-tight">
        Crafted for the Bold.
      </h1>
      <div className="text-center mb-6">
        <p className="text-zinc-400">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}