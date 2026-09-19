'use client';

import React from 'react';
import { Mic, CheckCircle2, Package, PlusCircle, Check } from 'lucide-react';

export default function AuthProductVisual() {
  return (
    <div className="relative w-full max-w-[440px] select-none">
      {/* Background Soft Glow */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 -right-10 w-64 h-64 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center">
        
        {/* Top Speech Pill with Sound Wave Sparks */}
        <div className="relative mb-3.5 self-start ml-4 z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-blue-100 shadow-[0_4px_12px_rgba(36,87,255,0.08)] backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-blue-50 text-[#2457FF] flex items-center justify-center">
              <Mic className="w-3 h-3" />
            </div>
            <span className="text-[12px] font-medium text-slate-800">
              Rice rendu bags vachayi
            </span>
          </div>

          {/* Acoustic Wave Sparks */}
          <div className="absolute -right-6 -top-2 flex gap-1 items-center pointer-events-none opacity-80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#2457FF]">
              <path d="M4 14C5.5 12 7 9 9 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12 18C12.5 14 13.5 10 15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 16C18.5 13 19 9 20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Central Glassmorphic Ledger Status Card */}
        <div className="w-full bg-white/80 backdrop-blur-lg border border-white/90 rounded-2xl p-5 shadow-[0_12px_36px_rgba(20,40,90,0.08)] relative z-10">
          {/* Status Header */}
          <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-slate-900 leading-tight">
                Updated Successfully
              </h4>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                +50 KG · Sona Masoori Rice
              </p>
            </div>
          </div>

          {/* Stock Details Rows */}
          <div className="pt-3 space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>Current Stock</span>
              </div>
              <span className="font-semibold text-slate-700">400 KG</span>
            </div>

            <div className="flex items-center justify-between py-1 px-1 bg-emerald-50/60 rounded-lg px-2">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added</span>
              </div>
              <span className="font-bold text-emerald-600">+50 KG</span>
            </div>

            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Check className="w-3.5 h-3.5 text-[#2457FF]" />
                <span>New Stock</span>
              </div>
              <span className="font-bold text-[#2457FF] text-[13px]">450 KG</span>
            </div>
          </div>
        </div>

        {/* 3D Pedestal and Jute Rice Sacks */}
        <div className="relative w-full -mt-3 pt-2 flex flex-col items-center">
          
          {/* Rice Bags resting on pedestal */}
          <div className="relative z-10 flex items-end justify-center -mb-2">
            
            {/* Primary Standing Rice Sack */}
            <div className="relative z-20 flex flex-col items-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
              {/* Tied neck ruffles */}
              <div className="w-14 h-4 bg-[#D3C4A7] rounded-t-lg border-b border-[#B8A688] flex items-center justify-center">
                <div className="w-8 h-1 bg-[#8F7D61] rounded-full" />
              </div>
              
              {/* Main Sack Body */}
              <div className="w-24 h-28 bg-gradient-to-b from-[#EFE5D2] via-[#E4D7BE] to-[#D5C6A8] rounded-b-2xl rounded-t-sm border border-[#C5B596] p-2 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                {/* Subtle sack woven texture overlay */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#8F7D61_1px,transparent_1px)] [background-size:4px_4px]" />
                
                {/* Brand Stamp on Sack */}
                <span className="text-[13px] font-black text-[#382F24] tracking-wider leading-none mt-1">
                  RICE
                </span>
                
                {/* Wheat Sheaf Icon */}
                <svg className="w-5 h-5 my-1 text-[#655541]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 4 10 7 7 8C10 9 12 12 12 14C12 12 14 9 17 8C14 7 12 4 12 2Z" />
                  <path d="M12 14C12 16 10 18 8 19C10 20 12 22 12 23C12 22 14 20 16 19C14 18 12 16 12 14Z" opacity="0.8" />
                  <path d="M11 7V23H13V7H11Z" opacity="0.6" />
                </svg>

                <span className="text-[10px] font-extrabold text-[#382F24] tracking-tight">
                  25 KG
                </span>
              </div>
            </div>

            {/* Leaning Secondary Bag */}
            <div className="relative -ml-5 mb-1 z-10 transform -rotate-12 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.1)]">
              <div className="w-18 h-20 bg-gradient-to-br from-[#E6D9C2] to-[#C7B799] rounded-2xl border border-[#B9A887] p-2 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#554737] tracking-wider transform -rotate-6">
                  25 KG
                </span>
              </div>
            </div>
          </div>

          {/* 3D Isometric Pedestal / Plinth */}
          <div className="relative w-[92%] h-12">
            {/* Pedestal Top Surface */}
            <div className="w-full h-8 bg-gradient-to-r from-[#E2EFFF] via-[#EDF5FF] to-[#DCEBFE] rounded-[24px] border border-blue-200/80 shadow-[0_8px_20px_rgba(36,87,255,0.12)] relative z-0" />
            {/* Pedestal Side Depth */}
            <div className="w-full h-4 bg-gradient-to-r from-[#B9D8FB] via-[#C8E2FD] to-[#B3D3F9] rounded-b-[24px] -mt-4 relative -z-10 shadow-md" />
          </div>

          {/* "Built for Bharat" handwritten inscription */}
          <div className="self-start ml-6 -mt-3 z-30 transform -rotate-6">
            <span className="text-[20px] sm:text-[22px] font-bold text-slate-600 italic tracking-tight font-serif select-none" style={{ fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', cursive, serif" }}>
              Built for Bharat
            </span>
            {/* Sketch underline */}
            <svg className="w-28 h-2 text-slate-500/70 -mt-1" viewBox="0 0 120 8" fill="none">
              <path d="M2 5C35 2 75 7 118 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
}
