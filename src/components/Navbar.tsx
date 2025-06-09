'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-black px-6 py-4 shadow-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Shopcart</h1>

        <div className="ml-auto hidden md:flex items-center gap-8">
          
          <ul className="flex gap-6 text-sm font-medium text-zinc-300">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Deals</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
          </ul>
          <User className="text-zinc-300 hover:text-white transition-colors cursor-pointer" />
          <Link href="/cart"><ShoppingCart className="text-zinc-300 hover:text-white transition-colors cursor-pointer" /></Link>
        </div>

        <div className="md:hidden flex items-center gap-3 ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-zinc-300 hover:text-white focus:outline-none"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 px-2 space-y-2 text-zinc-200">
          <Link href="/" className="block py-2 px-3 rounded hover:bg-zinc-800">Home</Link>
          <Link href="/shop" className="block py-2 px-3 rounded hover:bg-zinc-800">Shop</Link>
          <Link href="#" className="block py-2 px-3 rounded hover:bg-zinc-800">Deals</Link>
          <Link href="/login" className="block py-2 px-3 rounded hover:bg-zinc-800">Login</Link>
          <div className="flex gap-4 mt-3 px-3">
            <User className="text-zinc-300 hover:text-white cursor-pointer" />
            <ShoppingCart className="text-zinc-300 hover:text-white cursor-pointer" />
          </div>
        </div>
      )}
    </nav>
  );
}
