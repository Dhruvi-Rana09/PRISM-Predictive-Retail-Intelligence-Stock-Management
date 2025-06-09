'use client';

import Image from 'next/image';
import { useCart } from '../context/CartContext';

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
];

export default function ShopPage() {
  const { addToCart } = useCart();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
      <h1 className="text-4xl font-bold mb-8 text-center text-white tracking-tight">
        Crafted for the Bold.
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out"
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
                onClick={() => addToCart(product)}
                className="mt-4 w-full bg-white text-black font-semibold py-2 px-4 rounded hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
