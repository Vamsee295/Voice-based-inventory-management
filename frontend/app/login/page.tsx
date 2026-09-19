'use client';

import React from 'react';
import Link from 'next/link';
import AuthMarketingPanel from '../components/auth/AuthMarketingPanel';
import LoginForm from '../components/auth/LoginForm';
import VoiceMateLogo from '../components/auth/VoiceMateLogo';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#2457FF]/10 selection:text-[#2457FF]">
      
      {/* Left Column: Marketing / Product Presentation (Hidden on mobile, shown on lg+) */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] min-h-screen border-r border-slate-200/70">
        <AuthMarketingPanel />
      </div>

      {/* Right Column: Authentication Panel */}
      <div className="w-full lg:w-[46%] xl:w-[44%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative">
        
        {/* Top Right Tagline */}
        <div className="flex items-center justify-between lg:justify-end w-full">
          {/* Mobile-only Logo */}
          <div className="lg:hidden">
            <VoiceMateLogo size="sm" showSubtitle={false} />
          </div>

          <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 tracking-tight">
            Smarter Inventory. Happier Businesses.
          </p>
        </div>

        {/* Mobile Header Banner (Headline intro before card) */}
        <div className="lg:hidden mt-6 mb-4 text-center">
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Talk to your <span className="text-[#2457FF]">Inventory.</span>
          </h1>
          <p className="text-[13px] text-slate-600 mt-1 max-w-sm mx-auto">
            Manage stock, invoices, and store operations using natural language.
          </p>
        </div>

        {/* Centered Auth Card */}
        <div className="flex-1 flex items-center justify-center my-6">
          <LoginForm />
        </div>

        {/* Bottom Footer Links */}
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
