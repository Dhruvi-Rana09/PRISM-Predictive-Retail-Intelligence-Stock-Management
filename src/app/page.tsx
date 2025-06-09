'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      
      <section className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Discover Elegance. <br />
          <span className="text-zinc-400">Style Meets Simplicity.</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-10">
          Elevate your everyday look with curated collections of premium fashion,
          crafted for those who stand out — even in the dark.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-white text-black text-lg font-semibold rounded hover:bg-zinc-200 transition"
        >
          Shop Now
        </Link>
      </section>

      <div className="absolute top-0 left-0 w-full h-full z-[-1] bg-gradient-to-br from-zinc-900 via-black to-zinc-950 opacity-80" />
    </main>
  );
}
