'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Server error: Unable to parse response' };
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/inventory');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F4] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#E5E5E0] p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-[#111318] tracking-tight">VoiceMate</h1>
          <p className="text-[12px] text-[#5F6673] mt-1 uppercase tracking-wider font-bold">Audited Core</p>
        </div>

        <h2 className="text-[18px] font-bold text-[#111318] mb-6 text-center">Sign in to your Workspace</h2>

        {error && (
          <div className="bg-[#FEF2ED] text-[#C2410C] p-3 rounded-lg text-[13px] mb-4 border border-[#F9D8C9]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#111318] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F9F9F8] border border-[#E5E5E0] rounded-lg p-3 text-[14px] text-[#111318] focus:border-[#2457FF] focus:ring-1 focus:ring-[#2457FF] outline-none transition-colors"
              placeholder="operator@store.com"
            />
          </div>
          
          <div>
            <label className="block text-[12px] font-bold text-[#111318] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F9F9F8] border border-[#E5E5E0] rounded-lg p-3 text-[14px] text-[#111318] focus:border-[#2457FF] focus:ring-1 focus:ring-[#2457FF] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111318] text-white rounded-lg py-3 text-[14px] font-bold hover:bg-[#2A2F3A] transition-colors disabled:opacity-70 flex justify-center mt-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-[13px] text-[#5F6673]">
          Don't have an account? <Link href="/register" className="text-[#2457FF] font-bold hover:underline">Register Workspace</Link>
        </div>
      </div>
    </div>
  );
}
