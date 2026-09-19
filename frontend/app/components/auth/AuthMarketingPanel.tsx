'use client';

import React from 'react';
import { Mic, Package, FileText, Activity } from 'lucide-react';
import VoiceMateLogo from './VoiceMateLogo';
import AuthProductVisual from './AuthProductVisual';

const features = [
  {
    icon: Mic,
    title: 'Voice & Text Commands',
    desc: 'Fast. Natural. Multilingual.',
  },
  {
    icon: Package,
    title: 'Real-time Inventory',
    desc: 'Accurate stock, always.',
  },
  {
    icon: FileText,
    title: 'Invoices & Challans',
    desc: 'Process documents easily.',
  },
  {
    icon: Activity,
    title: 'Smart Alerts',
    desc: 'Never run out of stock.',
  },
];

export default function AuthMarketingPanel() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden bg-gradient-to-br from-white via-[#F4F8FE] to-[#EBF3FE]">
      {/* Ambient background blur circles matching reference image */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header with Logo */}
      <div className="relative z-10">
        <VoiceMateLogo size="md" showSubtitle={true} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 my-auto py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headlines & Features */}
          <div className="xl:col-span-6 flex flex-col justify-center">
            <h1 className="text-[38px] sm:text-[46px] xl:text-[50px] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-4">
              Talk to your <br />
              <span className="text-[#2457FF]">Inventory.</span>
            </h1>

            <p className="text-[14px] sm:text-[15px] text-slate-600 max-w-md leading-relaxed mb-8">
              Manage stock, invoices, and store operations using natural language — in English, Telugu or Tenglish.
            </p>

            {/* 4 Feature Rows */}
            <div className="space-y-4">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="flex items-center gap-3.5 group">
                    <div className="w-9 h-9 rounded-xl bg-blue-50/90 border border-blue-100/60 text-[#2457FF] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900 leading-tight">
                        {feat.title}
                      </h3>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Component */}
          <div className="xl:col-span-6 flex justify-center xl:justify-end">
            <AuthProductVisual />
          </div>

        </div>
      </div>

      {/* Bottom Area: Statement & Copyright */}
      <div className="relative z-10 pt-4 flex flex-col gap-4">
        {/* Quote Card */}
        <div className="max-w-md bg-blue-50/70 border border-blue-100/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <p className="text-[13px] font-medium text-slate-800 leading-snug">
            &ldquo;Technology should understand you, not the other way around.&rdquo;
          </p>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">
            — VoiceMate
          </p>
        </div>

        {/* Copyright */}
        <p className="text-[11px] font-medium text-slate-400 mt-1">
          &copy; 2026 VoiceMate. All rights reserved.
        </p>
      </div>
    </div>
  );
}
