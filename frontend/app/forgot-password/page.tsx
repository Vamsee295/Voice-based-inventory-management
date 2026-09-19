'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import VoiceMateLogo from '../components/auth/VoiceMateLogo';
import AuthMarketingPanel from '../components/auth/AuthMarketingPanel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your workspace email address.');
      return;
    }

    setLoading(true);

    try {
      // Simulate real dispatch delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch {
      setError('Unable to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#2457FF]/10 selection:text-[#2457FF]">
      
      {/* Left Column: Marketing / Product Presentation */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] min-h-screen border-r border-slate-200/70">
        <AuthMarketingPanel />
      </div>

      {/* Right Column: Recovery Panel */}
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

        {/* Card */}
        <div className="flex-1 flex items-center justify-center my-8">
          <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-8 sm:p-10">
            
            <div className="text-center mb-6">
              <VoiceMateLogo size="md" align="center" showSubtitle={false} showAuditedCore={true} />
              <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight mt-4">
                Reset your Password
              </h2>
              <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1">
                Enter your registered workspace email to receive recovery instructions.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-50 text-rose-700 p-3.5 rounded-xl text-[13px] mb-5 border border-rose-200/80">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">Recovery Instructions Sent</h3>
                  <p className="text-[13px] text-slate-600 mt-1">
                    If an account is associated with <span className="font-semibold text-slate-800">{email}</span>, we have dispatched a password reset link.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#2457FF] hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-1.5" htmlFor="recovery-email">
                    Workspace Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="recovery-email"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] text-white rounded-xl text-[14px] font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white/90" />
                      <span>Dispatching link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-4 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}

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
