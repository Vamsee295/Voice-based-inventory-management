'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import VoiceMateLogo from './VoiceMateLogo';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Unable to reach the authentication service.' };
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      // Successful authentication -> redirect to Voice console or inventory
      router.push('/home');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setInfoMessage('Google Workspace SSO is configured for enterprise accounts. Please use your standard workspace login above.');
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-8 sm:p-10">
      
      {/* Header with Centered Logo & Audited Core */}
      <div className="text-center mb-6">
        <VoiceMateLogo size="md" align="center" showSubtitle={false} showAuditedCore={true} />
        <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight mt-4">
          Sign in to your Workspace
        </h2>
        <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1">
          Access your inventory, documents and operations.
        </p>
      </div>

      {/* Inline Feedback Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 bg-rose-50 text-rose-700 p-3.5 rounded-xl text-[13px] mb-5 border border-rose-200/80 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="flex items-start gap-2.5 bg-blue-50 text-blue-700 p-3.5 rounded-xl text-[13px] mb-5 border border-blue-200/80 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{infoMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-800 mb-1.5" htmlFor="email-input">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2457FF] focus:ring-2 focus:ring-[#2457FF]/15 transition-all"
              placeholder="operator@store.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-semibold text-slate-800" htmlFor="password-input">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-[#2457FF] hover:text-[#1D49DB] hover:underline transition-colors"
              tabIndex={0}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-11 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2457FF] focus:ring-2 focus:ring-[#2457FF]/15 transition-all"
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] text-white rounded-xl text-[14px] font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white/90" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-white px-3 text-slate-400">OR</span>
          </div>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full h-12 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[14px] font-medium transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          {/* Official Google multicolored G logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
          </svg>
          <span>Continue with Google</span>
        </button>

      </form>

      {/* Registration Link */}
      <div className="mt-7 text-center text-[13px] text-slate-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#2457FF] font-semibold hover:underline">
          Register Workspace
        </Link>
      </div>

    </div>
  );
}
