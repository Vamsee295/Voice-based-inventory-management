'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Mic, 
  Package, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  ScanBarcode, 
  List, 
  MessageSquare, 
  Settings2, 
  Settings,
  ChevronDown,
  AudioWaveform,
  CheckCircle2
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  live?: boolean;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'VOICE OPERATIONS',
    items: [
      { label: 'Voice Console', href: '/home', icon: Mic, live: true },
      { label: 'Inventory', href: '/inventory', icon: Package, live: true },
      { label: 'Invoices & Challans', href: '/invoices', icon: FileText, live: true },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Replenishment', href: '/replenishment', icon: ArrowUpRight, live: true, badge: 1 },
      { label: 'Expiry & Shelf Clock', href: '/expiry', icon: Clock, live: true, badge: 4 },
      { label: 'Scan / Barcode / PO', href: '/scan', icon: ScanBarcode, live: true },
    ],
  },
  {
    label: 'LEDGER & INTELLIGENCE',
    items: [
      { label: 'Transaction Stream', href: '/transactions', icon: List, live: true },
      { label: 'Conversational Assistant', href: '/assistant', icon: MessageSquare, live: true },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { label: 'Trade Units', href: '/trade-units', icon: Settings2, live: true },
      { label: 'Settings', href: '/settings', icon: Settings, live: true },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] xl:w-[250px] shrink-0 bg-[var(--background)] border-r border-[var(--border)] flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="px-5 py-5 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <AudioWaveform className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={2.5} />
          <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">VoiceMate</span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] pl-[30px]">Inventory Intelligence</p>
      </div>

      {/* Active Store Context */}
      <div className="px-5 pb-5">
        <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-widest uppercase mb-2">
          Active Store
        </p>
        <div className="group cursor-pointer rounded-md bg-[var(--surface-low)] hover:bg-[var(--border)] transition-colors p-2.5 flex items-center justify-between border border-[var(--divider)]">
          <div>
            <p className="text-[13px] font-medium text-[var(--text-primary)] leading-tight truncate">
              Sri Balaji Wholesale
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[var(--text-secondary)]">Terminal #01</span>
              <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <div className="px-3 pb-1.5">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-widest uppercase">
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
                    className="flex items-center justify-between px-3 py-2 text-[14px] text-[var(--text-muted)] cursor-not-allowed select-none rounded-md group"
                    title="Coming soon"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 opacity-50" strokeWidth={2} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-medium tracking-wider text-[var(--text-muted)] bg-[var(--surface-low)] px-1.5 py-0.5 rounded shrink-0 border border-[var(--divider)]">
                      SOON
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-[14px] rounded-md transition-all duration-150 mb-0.5 group ${
                    isActive
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-low)] hover:text-[var(--text-primary)] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon 
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                      }`} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold text-[var(--text-primary)] bg-[var(--surface-low)] px-1.5 py-0.5 rounded-full shrink-0 group-hover:bg-[var(--border)] transition-colors">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-low)] transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] flex items-center justify-center shrink-0">
            <span className="text-[var(--surface)] text-[11px] font-bold tracking-wider">SR</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">Suresh R.</p>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">Admin / Supervisor</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
        </div>
      </div>
    </aside>
  );
}
