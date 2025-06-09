'use client';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useProductAnalytics } from '../../hooks/useProductAnalytics';

const products = [
  {
    id: 1,
    name: 'Dark Minimal Sneakers',
    price: 3499,
    image: '/sneaker.jpg',
  },
  {
    id: 2,
    name: 'Black Hoodie',
    price: 1999,
    image: '/hoodie.jpg',
  },
  {
    id: 3,
    name: 'Premium Watch',
    price: 7299,
    image: '/watch.jpg',
  },
  {
    id: 4,
    name: 'Noise Cancelling Headphones',
    price: 5999,
    image: '/headphones.jpg',
  },
  {
    id: 5,
    name: 'Minimalist Backpack',
    price: 2899,
    image: '/backpack.jpg',
  },
  {
    id: 6,
    name: 'Wireless Earbuds',
    price: 4299,
    image: '/earbuds.jpg',
  },
  {
    id: 7,
    name: 'Premium Leather Wallet',
    price: 1599,
    image: '/wallet.jpg',
  },
  {
    id: 8,
    name: 'Carbon Fiber Phone Case',
    price: 899,
    image: '/phonecase.jpg',
  },
  {
    id: 9,
    name: 'Titanium Sunglasses',
    price: 3999,
    image: '/sunglasses.jpg',
  },
  {
    id: 10,
    name: 'Smart Fitness Tracker',
    price: 2799,
    image: '/fitness-tracker.jpg',
  },
  {
    id: 11,
    name: 'Mechanical Keyboard',
    price: 6499,
    image: '/keyboard.jpg',
  },
  {
    id: 12,
    name: 'Portable Charger',
    price: 1299,
    image: '/charger.jpg',
  },
  {
    id: 13,
    name: 'Premium Denim Jacket',
    price: 4599,
    image: '/denim-jacket.jpg',
  },
  {
    id: 14,
    name: 'Stainless Steel Water Bottle',
    price: 799,
    image: '/water-bottle.jpg',
  },
  {
    id: 15,
    name: 'Bluetooth Speaker',
    price: 3299,
    image: '/speaker.jpg',
  },
  {
    id: 16,
    name: 'Gaming Mouse',
    price: 2199,
    image: '/gaming-mouse.jpg',
  },
];

// Product Card Component with Analytics
function ProductCard({ product }: { product: typeof products[0] }) {
  const { addToCart } = useCart();
  
  // Initialize analytics for this product
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
    addToCart(product);
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
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-zinc-400 mt-1">₹{product.price.toLocaleString()}</p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent product click event
            handleAddToCartClick();
          }}
          className="mt-4 w-full bg-white text-black font-semibold py-2 px-4 rounded hover:bg-gray-200 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
      <h1 className="text-4xl font-bold mb-8 text-center text-white tracking-tight">
        Crafted for the Bold.
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}