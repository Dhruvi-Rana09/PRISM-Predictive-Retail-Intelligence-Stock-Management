'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setIsLoggedIn(true);
        setIsAdmin(user.email === ADMIN_EMAIL);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isLoggedIn === null) return null; 

  return (
    <nav className="w-full bg-black px-6 py-4 shadow-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Shopcart</h1>

        <div className="ml-auto hidden md:flex items-center gap-8">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="block py-2 px-3 rounded hover:bg-zinc-800"
            >
              Login
            </Link>
          ) : (
            <>
              <ul className="flex gap-6 text-sm font-medium text-zinc-300">
                {isAdmin ? (
                  <>
                    <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                    <li><Link href="/sellerdash" className="hover:text-white transition-colors">Dashboard</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                    <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                  </>
                )}
              </ul>

              {!isAdmin && (
                <>
                  <User className="text-zinc-300 hover:text-white transition-colors cursor-pointer" />
                  <Link href="/cart">
                    <ShoppingCart className="text-zinc-300 hover:text-white transition-colors cursor-pointer" />
                  </Link>
                </>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-3 ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-zinc-300 hover:text-white focus:outline-none"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 px-2 space-y-2 text-zinc-200">
          {!isLoggedIn ? (
            <Link href="/login" className="block py-2 px-3 rounded hover:bg-zinc-800">Login</Link>
          ) : (
            <>
              {isAdmin ? (
                <>
                  <Link href="/" className="block py-2 px-3 rounded hover:bg-zinc-800">Home</Link>
                  <Link href="/sellerdash" className="block py-2 px-3 rounded hover:bg-zinc-800">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/" className="block py-2 px-3 rounded hover:bg-zinc-800">Home</Link>
                  <Link href="/shop" className="block py-2 px-3 rounded hover:bg-zinc-800">Shop</Link>
                  <div className="flex gap-4 mt-3 px-3">
                    <User className="text-zinc-300 hover:text-white cursor-pointer" />
                    <ShoppingCart className="text-zinc-300 hover:text-white cursor-pointer" />
                  </div>
                </>
              )}

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="block py-2 px-3 text-left text-red-400 hover:text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
