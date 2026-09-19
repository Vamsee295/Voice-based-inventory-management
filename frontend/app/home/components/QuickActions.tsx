'use client';

export default function QuickActions() {
  const actions = [
    { icon: 'inventory_2', label: 'Inventory', desc: 'Manage products and stock.' },
    { icon: 'barcode_scanner', label: 'Scan', desc: 'Scan a product barcode.' },
    { icon: 'receipt_long', label: 'Invoice', desc: 'Add stock from a supplier invoice.' },
    { icon: 'chat', label: 'Ask', desc: 'Ask VoiceMate about inventory.' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {actions.map((action, i) => (
        <button 
          key={i}
          className="flex flex-col text-left p-4 rounded-lg bg-[#FFFFFF] border border-[#E5E5E0] hover:bg-[#F4F4F1] transition-colors group"
        >
          <div className="w-8 h-8 rounded bg-[#F0F0EB] text-[#2457FF] flex items-center justify-center mb-3 group-hover:bg-[#FFFFFF] transition-colors">
            <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
          </div>
          <h4 className="text-[14px] font-semibold text-[#111318] mb-1">{action.label}</h4>
          <p className="text-[12px] text-[#5F6673] line-clamp-2">{action.desc}</p>
        </button>
      ))}
    </div>
  );
}
