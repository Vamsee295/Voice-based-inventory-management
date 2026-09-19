'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  live?: boolean;  // true = active working module
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'VOICE OPERATIONS',
    items: [
      { label: 'Voice Console', href: '/home', icon: 'mic', live: true },
      { label: 'Inventory', href: '/inventory', icon: 'inventory_2', live: true },
      { label: 'Invoices & Challans', href: '/invoices', icon: 'receipt_long', live: true },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Replenishment Engine', href: '/replenishment', icon: 'shopping_cart', live: true },
      { label: 'Expiry & Shelf Clock', href: '/expiry', icon: 'schedule', live: true },
      { label: 'Scan / Barcode / PO', href: '/scan', icon: 'barcode_scanner', live: true },
    ],
  },
  {
    label: 'LEDGER & AUDIT',
    items: [
      { label: 'Transaction Stream', href: '/transactions', icon: 'receipt_long', live: true },
      { label: 'Conversational Assistant', href: '/assistant', icon: 'chat', live: true },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'Trade Unit Config', href: '#', icon: 'tune', live: false },
      { label: 'Settings', href: '#', icon: 'settings', live: false },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-[#FFFFFF] border-r border-[#E5E5E0] flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-[#E5E5E0]">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-[15px] font-bold text-[#111318] tracking-tight">VoiceMate</span>
          <span className="text-[9px] font-bold text-[#2457FF] tracking-widest uppercase border border-[#2457FF] px-1 rounded-sm">
            Audited Core
          </span>
        </div>
        <p className="text-[10px] text-[#8E95A2]">Voice Inventory Intelligence</p>
      </div>

      {/* Active Store Context */}
      <div className="px-4 py-2.5 border-b border-[#ECECE8] bg-[#F4F4F1]">
        <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest mb-0.5">
          Active Store
        </p>
        <p className="text-[12px] font-semibold text-[#111318] leading-snug truncate">
          Sri Balaji Wholesale &amp; Retail
        </p>
        <p className="text-[10px] text-[#5F6673]">Kukatpally, Terminal #01</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16794A]" />
          <span className="text-[10px] font-semibold text-[#16794A]">Sync Active</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-4 pt-2 pb-1">
              <span className="text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">
                {section.label}
              </span>
            </div>
            {section.items.map((item) => {
              const isActive = item.live
                ? item.href === '/home'
                  ? pathname === '/home' || pathname === '/'
                  : pathname?.startsWith(item.href)
                : false;

              if (!item.live) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 px-4 py-1.5 text-[12px] text-[#C0C4CC] cursor-default select-none"
                    title="Coming soon"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#D6D6D0]">
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                    <span className="text-[8px] font-bold tracking-wider text-[#C0C4CC] border border-[#E5E5E0] px-1 py-0 rounded-sm shrink-0">
                      SOON
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-1.5 text-[12px] transition-colors ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#2457FF] font-bold border-r-2 border-[#2457FF]'
                      : 'text-[#5F6673] hover:bg-[#F4F4F1] hover:text-[#111318] font-medium'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isActive ? 'text-[#2457FF]' : 'text-[#8E95A2]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-[#E5E5E0] p-3 bg-[#FAFAF8]">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-[#2457FF] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">SR</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#111318] truncate">Suresh R.</p>
            <p className="text-[10px] text-[#8E95A2] truncate">Owner / Supervisor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
