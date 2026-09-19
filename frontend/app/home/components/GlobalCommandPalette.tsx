'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Package, ArrowRightLeft, ShoppingCart, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl z-50 p-4 outline-none">
          <div className="bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col outline-none">
            <Command 
              className="flex flex-col w-full h-full max-h-[400px] outline-none"
              label="Global Command Menu"
              shouldFilter={true}
            >
              <div className="flex items-center border-b border-[var(--border)] px-4 py-3 gap-3">
                <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                <Command.Input 
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search products, transactions, reorders..." 
                  className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none border-none ring-0"
                  autoFocus
                />
                <Dialog.Close className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--surface-low)] outline-none">
                  <X className="w-4 h-4" />
                </Dialog.Close>
              </div>

              <Command.List className="overflow-y-auto p-2 outline-none">
                <Command.Empty className="py-6 text-center text-[14px] text-[var(--text-secondary)]">
                  No results found for "{search}"
                </Command.Empty>

                <Command.Group heading="Products" className="px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider [&_[cmdk-group-items]]:mt-1">
                  <Command.Item 
                    onSelect={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[14px] text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)] transition-colors outline-none"
                  >
                    <Package className="w-4 h-4 opacity-70" />
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">Sona Masoori Rice</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">RICE-SM-25K</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[14px] text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)] transition-colors outline-none"
                  >
                    <Package className="w-4 h-4 opacity-70" />
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">Tata Salt Crystal</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">SALT-CRYSTAL</span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Transactions" className="px-2 pt-3 pb-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider [&_[cmdk-group-items]]:mt-1">
                  <Command.Item 
                    onSelect={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[14px] text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)] transition-colors outline-none"
                  >
                    <ArrowRightLeft className="w-4 h-4 opacity-70" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-medium">tx-1789820266883</span>
                      <span className="text-[12px] font-semibold text-[var(--danger)]">-10 Bags</span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Reorders" className="px-2 pt-3 pb-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider [&_[cmdk-group-items]]:mt-1">
                  <Command.Item 
                    onSelect={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[14px] text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)] transition-colors outline-none"
                  >
                    <ShoppingCart className="w-4 h-4 opacity-70" />
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">RO-20260919-328</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">Tata Salt Crystal (7 packets)</span>
                    </div>
                  </Command.Item>
                </Command.Group>

              </Command.List>
            </Command>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
