"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
    //login or registration logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center">
          {mode === "login" ? "Sign In" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Email address*
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Password*
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
          >
            {mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="text-center text-zinc-400">or continue with</div>

        <button className="w-full py-2 px-4 bg-white text-black font-medium rounded hover:bg-zinc-200 transition flex items-center justify-center gap-3">
            <svg
            className="w-5 h-5"
            viewBox="0 0 488 512"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path
                fill="#EA4335"
                d="M488 261.8C488 403.3 391.6 512 248 512 111 512 0 401 0 264S111 16 248 16c66.2 0 121.6 24 163.6 63.4l-66.2 63.2C319.2 108.1 286.6 96 248 96c-86.3 0-156.1 69.7-156.1 154.1S161.7 404.2 248 404.2c78.7 0 127.3-44.4 133.1-106.6h-133v-84h220.6c2.1 12.5 3.3 25.4 3.3 39.2z"
            />
            </svg>
            Continue with Google
        </button>


        <div className="text-sm text-zinc-400 text-center">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-400 hover:underline">
                Register
              </Link>{' '}
              |{' '}
              <a href="#" className="hover:underline">
                Forgot your password?
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:underline">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
