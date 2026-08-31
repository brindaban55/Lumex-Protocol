import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Wallet, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  Check, 
  LogOut, 
  Menu, 
  X, 
  Layers, 
  LineChart, 
  Cpu, 
  ShieldCheck, 
  Database,
  Smartphone,
  Laptop,
  ArrowDownUp,
  MessageSquare
} from 'lucide-react';
import { useFreighter } from '../hooks/useFreighter';
import { useGuestWallet } from '../hooks/useGuestWallet';
import { getDeviceInfo } from '../utils/deviceDetection';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openFeedbackModal?: () => void;
  onOpenTour?: () => void;
  freighterState?: ReturnType<typeof useFreighter>;
  guestWalletState?: ReturnType<typeof useGuestWallet>;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  openFeedbackModal,
  onOpenTour,
  freighterState,
  guestWalletState,
}) => {
  const localFreighter = useFreighter();
  const localGuestWallet = useGuestWallet();

  const freighter = freighterState || localFreighter;
  const guestWallet = guestWalletState || localGuestWallet;

  const [showWalletModal, setShowWalletModal] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active wallet state
  const isConnected = freighter.isConnected || guestWallet.isConnected;
  const activeAddress = freighter.isConnected ? freighter.publicKey : guestWallet.publicKey;
  const activeBalance = freighter.isConnected ? freighter.balance : guestWallet.balance;
  const activeSpendable = freighter.isConnected ? freighter.spendableBalance : guestWallet.spendableBalance;
  const walletType = freighter.isConnected ? 'Freighter' : guestWallet.isConnected ? 'Sandbox Account' : 'None';

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  // Click outside to close wallet dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    if (freighter.isConnected) {
      freighter.disconnect();
    } else {
      guestWallet.disconnect();
    }
    setShowDropdown(false);
  };

  const navItems = [
    { id: 'pools', label: 'Vault Strategies', icon: Layers },
    { id: 'swap', label: 'DEX Swap', icon: ArrowDownUp },
    { id: 'positions', label: 'My Positions', icon: ShieldCheck },
    { id: 'autocompound', label: 'Auto-Compounder', icon: Cpu },
    { id: 'analytics', label: 'Telemetry & Health', icon: LineChart },
    { id: 'proofs', label: 'On-Chain Proofs', icon: Database },
  ];


  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#06080D]/90 backdrop-blur-xl transition-all">
        <div className="layout-container">
          <div className="flex h-20 items-center justify-between">
            {/* Brand Logo & Protocol Identity */}
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setActiveTab('pools')} 
                className="group flex items-center gap-3.5 text-left focus:outline-none"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00E599] to-[#00B074] shadow-lg shadow-[#00E599]/20 transition-transform duration-300 group-hover:scale-105">
                  <Zap className="h-6 w-6 text-[#06080D]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-wider text-white">LUMEX</span>
                    <span className="rounded-full bg-[#00E599]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00E599] border border-[#00E599]/20">
                      PROTOCOL
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Automated Yield Optimizer</p>
                </div>
              </button>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-md">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#00E599]/15 text-[#00E599] shadow-sm border border-[#00E599]/30'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3.5">
              {/* Feedback Button */}
              {openFeedbackModal && (
                <button
                  onClick={openFeedbackModal}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#00E599]/40 hover:bg-[#00E599]/10 hover:text-[#00E599] transition-all active:scale-95 shadow-sm"
                  title="Share Feedback & Report Issues"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#00E599]" />
                  <span>Feedback</span>
                </button>
              )}

              {/* Quick Tour Walkthrough Button */}
              {onOpenTour && (
                <button
                  onClick={onOpenTour}
                  className="hidden md:flex items-center gap-1.5 rounded-lg border border-[#00E599]/30 bg-[#00E599]/10 px-2.5 py-1.5 text-xs font-semibold text-[#00E599] hover:bg-[#00E599]/20 transition-all active:scale-95"
                  title="Interactive How-It-Works Tour"
                >
                  <span>Quick Tour</span>
                </button>
              )}


              {/* Network Status Beacon */}
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E599] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E599]"></span>
                </span>
                <span className="text-xs font-medium text-slate-300">Stellar Network</span>
              </div>


              {/* Wallet Button & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                {!isConnected ? (
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#00E599] to-[#00C280] px-4 py-2.5 text-xs font-bold text-[#06080D] shadow-lg shadow-[#00E599]/20 transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-[#0E1524] px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:border-[#00E599]/40 transition-all"
                  >
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-[#00E599]">
                        {parseFloat(activeBalance || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {activeAddress ? `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}` : ''}
                      </div>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00E599]/10 text-[#00E599]">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                {showDropdown && isConnected && (
                  <div className="wallet-dropdown-panel absolute right-0 mt-3 w-84 rounded-2xl p-4 text-white animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          {walletType}
                        </span>
                        <div className="font-mono text-xs font-semibold text-slate-200">
                          {activeAddress ? `${activeAddress.slice(0, 8)}...${activeAddress.slice(-8)}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-colors"
                        title="Copy Public Key"
                      >
                        {copied ? <Check className="h-4 w-4 text-[#00E599]" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="my-3 space-y-2 rounded-xl bg-black/40 p-3 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Balance:</span>
                        <span className="font-mono font-medium text-white">{activeBalance} XLM</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Spendable (After Reserve):</span>
                        <span className="font-mono font-bold text-[#00E599]">{activeSpendable} XLM</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${activeAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Explorer</span>
                      </a>
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-300 lg:hidden hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-white/[0.08] bg-[#0A0E18] px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30'
                        : 'text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {openFeedbackModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openFeedbackModal();
                  }}
                  className="flex items-center gap-3 rounded-xl border border-[#00E599]/20 bg-[#00E599]/10 px-4 py-3 text-sm font-semibold text-[#00E599] hover:bg-[#00E599]/20 transition-all mt-1"
                >
                  <MessageSquare className="h-5 w-5 text-[#00E599]" />
                  <span>Share Feedback & Bug Report</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Wallet Connection Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0D1322] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E599]/10 text-[#00E599]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect Stellar Wallet</h3>
                  <p className="text-xs text-slate-400">
                    Detected: <span className="text-[#00E599] font-semibold">{deviceInfo.os}</span> ({deviceInfo.browser})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {/* Option 1: Freighter Extension */}
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  freighter.connect();
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left hover:border-[#00E599]/40 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Laptop className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00E599] transition-colors">
                      Freighter Wallet
                    </h4>
                    <p className="text-xs text-slate-400">Browser extension & official SDF signer</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  Extension
                </span>
              </button>

              {/* Option 2: 1-Click Instant Keypair */}
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  guestWallet.createGuestWallet();
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-[#00E599]/20 bg-[#00E599]/[0.03] p-4 text-left hover:border-[#00E599]/60 hover:bg-[#00E599]/[0.08] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E599]/15 text-[#00E599]">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00E599] transition-colors">
                      1-Click Sandbox Account
                    </h4>
                    <p className="text-xs text-slate-400">Instant cryptographic Ed25519 keypair</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#00E599]/15 px-2.5 py-1 text-[11px] font-bold text-[#00E599]">
                  1-Click
                </span>
              </button>

              {/* Option 3: LOBSTR Mobile (for Smartphone/Tablet) */}
              <a
                href={deviceInfo.recommendedWallets.find(w => w.name.includes('LOBSTR'))?.deepLinkUrl || 'https://lobstr.co/'}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left hover:border-[#00E599]/40 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00E599] transition-colors">
                      LOBSTR Mobile
                    </h4>
                    <p className="text-xs text-slate-400">Mobile app dApp browser deep-link</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  Mobile App
                </span>
              </a>
            </div>

            <p className="mt-5 text-center text-[11px] text-slate-500">
              Non-custodial. Your keys and assets remain 100% under your control on Stellar.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
