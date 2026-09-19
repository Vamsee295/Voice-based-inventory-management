'use client';

import React from 'react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateUpload: (type: 'INVOICE' | 'CHALLAN' | 'AMBIGUOUS') => void;
}

export default function DocumentUploadModal({ isOpen, onClose, onSimulateUpload }: DocumentUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111318]/50 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E0] bg-[#F9F9F7]">
          <div>
            <h2 className="text-[16px] font-bold text-[#111318]">Upload Document</h2>
            <p className="text-[11px] text-[#5F6673]">Select a preset to simulate document extraction</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-[#8E95A2] hover:bg-[#E5E5E0] hover:text-[#111318] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="border-2 border-dashed border-[#C7D6FF] bg-[#F0F4FF] rounded-lg p-8 flex flex-col items-center justify-center text-center mb-6 cursor-pointer hover:bg-[#E5EDFF] transition-colors">
            <span className="material-symbols-outlined text-[40px] text-[#2457FF] mb-3">
              upload_file
            </span>
            <h3 className="text-[14px] font-bold text-[#2457FF] mb-1">Drag & Drop or Click to Upload</h3>
            <p className="text-[12px] text-[#5F6673]">Supports PDF, PNG, JPG/JPEG (Max 10MB)</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-[#8E95A2] uppercase tracking-widest">
              Simulation Presets
            </h4>
            
            <button
              onClick={() => onSimulateUpload('INVOICE')}
              className="w-full flex items-center justify-between p-3 border border-[#E5E5E0] rounded-lg hover:border-[#2457FF] hover:bg-[#F9F9F7] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#EDF7F2] text-[#16794A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111318] group-hover:text-[#2457FF] transition-colors">
                    Perfect Match Invoice
                  </p>
                  <p className="text-[11px] text-[#5F6673]">ABC Distributors (Sona Masoori, Sugar)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#8E95A2] text-[18px] group-hover:text-[#2457FF]">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => onSimulateUpload('CHALLAN')}
              className="w-full flex items-center justify-between p-3 border border-[#E5E5E0] rounded-lg hover:border-[#2457FF] hover:bg-[#F9F9F7] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#F0F4FF] text-[#2457FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111318] group-hover:text-[#2457FF] transition-colors">
                    Delivery Challan
                  </p>
                  <p className="text-[11px] text-[#5F6673]">Sri Sai Traders (Tata Salt, Aashirvaad Atta)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#8E95A2] text-[18px] group-hover:text-[#2457FF]">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => onSimulateUpload('AMBIGUOUS')}
              className="w-full flex items-center justify-between p-3 border border-[#E5E5E0] rounded-lg hover:border-[#C2410C] hover:bg-[#FEF2ED] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#FEF2ED] text-[#C2410C] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111318] group-hover:text-[#C2410C] transition-colors">
                    Ambiguous Invoice (Review Needed)
                  </p>
                  <p className="text-[11px] text-[#5F6673]">Metro Cash & Carry (Sunflower Refined Oil 15L)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#8E95A2] text-[18px] group-hover:text-[#C2410C]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
