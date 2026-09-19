'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import VoiceMateLogo from '../components/auth/VoiceMateLogo';
import AuthMarketingPanel from '../components/auth/AuthMarketingPanel';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Registration server error' };
      }

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // 2. Auto Login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      let loginData: any = {};
      try {
        loginData = await loginRes.json();
      } catch {
        loginData = {};
      }

      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Registered, but auto-login failed. Please login manually.');
      }

      router.push('/home');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during setup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#2457FF]/10 selection:text-[#2457FF]">
      
      {/* Left Column: Marketing / Product Presentation */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] min-h-screen border-r border-slate-200/70">
        <AuthMarketingPanel />
      </div>

      {/* Right Column: Register Panel */}
      <div className="w-full lg:w-[46%] xl:w-[44%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative">
        
        {/* Top Right Tagline */}
        <div className="flex items-center justify-between lg:justify-end w-full">
          <div className="lg:hidden">
            <VoiceMateLogo size="sm" showSubtitle={false} />
          </div>
          <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 tracking-tight">
            Smarter Inventory. Happier Businesses.
          </p>
        </div>

        {/* Form Card */}
        <div className="flex-1 flex items-center justify-center my-6">
          <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-8 sm:p-10">
            
            <div className="text-center mb-6">
              <VoiceMateLogo size="md" align="center" showSubtitle={false} showAuditedCore={true} />
              <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight mt-4">
                Create a New Workspace
              </h2>
              <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1">
                Set up your store terminal and inventory ledger in seconds.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-50 text-rose-700 p-3.5 rounded-xl text-[13px] mb-5 border border-rose-200/80">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5" htmlFor="business-name">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="business-name"
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2457FF] focus:ring-2 focus:ring-[#2457FF]/15 transition-all"
                    placeholder="Sri Balaji Wholesale"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5" htmlFor="user-name">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="user-name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2457FF] focus:ring-2 focus:ring-[#2457FF]/15 transition-all"
                    placeholder="Suresh R."
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5" htmlFor="reg-email">
                  Store Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2457FF] focus:ring-2 focus:ring-[#2457FF]/15 transition-all"
                    placeholder="owner@store.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-11 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2457FF] focus:ring-2 focus:ring-[#2457FF]/15 transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] text-white rounded-xl text-[14px] font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/90" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center text-[13px] text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2457FF] font-semibold hover:underline">
                Sign In
              </Link>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center lg:justify-end gap-6 text-[12px] text-slate-400 font-medium">
          <Link href="#" className="hover:text-slate-600 transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-slate-600 transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-slate-600 transition-colors">
            Support
          </Link>
        </div>

      </div>

    </div>
  );
}
