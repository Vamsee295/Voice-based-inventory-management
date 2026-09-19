'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import DocumentUploadModal from './components/DocumentUploadModal';
import InvoiceReviewDrawer from './components/InvoiceReviewDrawer';
import { InvoiceDocument } from '../../lib/inventory/models/document';
import { documentRepository } from '../../lib/inventory/repositories/documentRepository';
import { documentProcessingService } from '../../lib/inventory/services/documentProcessingService';

export default function InvoicesPage() {
  const [documents, setDocuments] = useState<InvoiceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<InvoiceDocument | null>(null);

  const currentOperator = 'Suresh R.';

  useEffect(() => {
    const fetchDocs = async () => {
      const data = await documentRepository.getAll();
      setDocuments(data);
      setIsLoading(false);
    };
    fetchDocs();

    const unsubscribe = documentRepository.subscribe(async () => {
      const data = await documentRepository.getAll();
      setDocuments(data);
    });

    return () => unsubscribe();
  }, []);

  const pendingDocuments = useMemo(() => {
    return documents.filter(d => d.status === 'REVIEW_REQUIRED' || d.status === 'READY_TO_APPLY');
  }, [documents]);

  const recentDocuments = useMemo(() => {
    return documents.filter(d => d.status === 'APPLIED' || d.status === 'REJECTED');
  }, [documents]);

  const handleSimulateUpload = async (type: 'INVOICE' | 'CHALLAN' | 'AMBIGUOUS') => {
    setIsUploadModalOpen(false);
    try {
      const fakeFile = { name: type === 'CHALLAN' ? 'challan.pdf' : type === 'AMBIGUOUS' ? 'ambiguous.pdf' : 'invoice.pdf', type: 'application/pdf' };
      const doc = await documentProcessingService.uploadAndProcess(fakeFile as any, currentOperator);
      setSelectedDocument(doc);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'READY_TO_APPLY': return 'bg-[#EDF7F2] text-[#16794A] border-[#C3E4D1]';
      case 'REVIEW_REQUIRED': return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
      case 'APPLIED': return 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';
      case 'REJECTED': return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default: return 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';
    }
  };

  if (isLoading) {
    return <div className="flex h-screen bg-[#F7F7F4] items-center justify-center font-sans">Loading Document Services...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader customStatus="DOCUMENT ENGINE ACTIVE" />

        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[20px] text-[#2457FF]">receipt_long</span>
                <h1 className="text-[18px] font-bold text-[#111318] tracking-tight">Invoices & Challans</h1>
              </div>
              <p className="text-[12px] text-[#5F6673]">Review incoming inventory documents before applying stock.</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#2457FF] text-[#FFFFFF] hover:bg-[#1D4ED8] px-5 py-2.5 rounded-md text-[13px] font-bold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              UPLOAD DOCUMENT
            </button>
          </div>

          {/* Pending Review Queue */}
          <section className="mb-10">
            <h2 className="text-[11px] font-bold text-[#8E95A2] uppercase tracking-widest mb-3">Pending Review</h2>
            
            {pendingDocuments.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#E5E5E0] border-dashed rounded-lg p-6 text-center shadow-sm">
                <p className="text-[12px] text-[#8E95A2] font-medium">No documents waiting for review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingDocuments.map(doc => (
                  <div key={doc.id} className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`material-symbols-outlined text-[16px] ${doc.documentType === 'CHALLAN' ? 'text-[#2457FF]' : 'text-[#16794A]'}`}>
                            {doc.documentType === 'CHALLAN' ? 'local_shipping' : 'receipt'}
                          </span>
                          <h3 className="text-[14px] font-bold text-[#111318]">{doc.supplierName}</h3>
                        </div>
                        <p className="text-[11px] text-[#5F6673] font-mono">{doc.documentNumber}</p>
                      </div>
                      <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getStatusStyle(doc.status)}`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F4F4F1]">
                      <div>
                        <p className="text-[10px] text-[#8E95A2]">Items / Amount</p>
                        <p className="text-[12px] font-semibold text-[#111318]">
                          {doc.items.length} items <span className="text-[#E5E5E0] mx-1">|</span> ₹{doc.total.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="text-[#2457FF] text-[12px] font-bold hover:underline"
                      >
                        REVIEW NOW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Documents Table */}
          <section>
            <h2 className="text-[11px] font-bold text-[#8E95A2] uppercase tracking-widest mb-3">Recent Documents</h2>
            <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F4F1] border-b border-[#ECECE8]">
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Document</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Supplier</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Date</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Items</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Amount</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Status</th>
                      <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0EB]">
                    {recentDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-[#8E95A2]">No recent documents found.</td>
                      </tr>
                    ) : (
                      recentDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-[#F9F9F7] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[16px] ${doc.documentType === 'CHALLAN' ? 'text-[#2457FF]' : 'text-[#16794A]'}`}>
                                {doc.documentType === 'CHALLAN' ? 'local_shipping' : 'receipt'}
                              </span>
                              <span className="text-[12px] font-mono font-medium text-[#111318]">{doc.documentNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[12px] font-semibold text-[#111318]">{doc.supplierName}</td>
                          <td className="px-4 py-3 text-[12px] text-[#5F6673]">{new Date(doc.documentDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-[12px] text-[#5F6673]">{doc.items.length}</td>
                          <td className="px-4 py-3 text-[12px] font-medium text-[#111318]">₹{doc.total.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getStatusStyle(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="text-[11px] font-bold text-[#2457FF] hover:underline"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* Modals & Drawers */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSimulateUpload={handleSimulateUpload}
      />

      <InvoiceReviewDrawer
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onApplied={() => {}}
        operatorName={currentOperator}
      />
    </div>
  );
}
