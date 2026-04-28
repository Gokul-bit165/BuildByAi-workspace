'use client';

import { useState, use } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';

// Component expects a searchParams Promise since Next.js 15
export default function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = use(searchParams);
  const redirectTo = params.redirectTo || '/workspace';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your team workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-md transition-colors mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This area is restricted to BuildByAI team members.</p>
          <Link href="/" className="text-blue-500 hover:text-blue-400 mt-2 inline-block">Return to home</Link>
        </div>
      </div>
    </div>
  );
}
