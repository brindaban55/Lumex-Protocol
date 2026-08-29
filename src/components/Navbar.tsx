import React, { useState } from 'react';
import { 
  Zap, 
  Wallet, 
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  ExternalLink, 
  UserCheck, 
  Activity, 
  Menu, 
  X,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

interface NavbarProps {
  userAddress: string | null;
  walletType: 'freighter' | 'guest' | null;
  xlmBalance: number;
  spendableXlmBalance: number;
  isFreighterInstalled: boolean;
  onConnectFreighter: () => void;
  onConnectGuest: () => void;
  onDisconnect: () => void;
  isGuestFunding: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userAddress,
  walletType,
  xlmBalance,
  spendableXlmBalance,
  isFreighterInstalled,
  onConnectFreighter,
  onConnectGuest,
  onDisconnect,
  isGuestFunding,
  activeTab,
  setActiveTab,
  onOpenFeedback,
}) => {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  const navItems = [
    { id: 'vaults', label: 'Vault Strategies', icon: Zap },
    { id: 'portfolio', label: 'My Positions', icon: ShieldCheck },
    { id: 'terminal', label: 'Auto-Compounder', icon: Sparkles },
    { id: 'analytics', label: 'Telemetry & Health', icon: Activity },
    { id: 'proofs', label: 'On-Chain Proofs', icon: ExternalLink },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-8">
          <div 
            onClick={() => setActiveTab('vaults')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-dark via-primary to-stellar-cyan flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 text-background fill-background" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">LUMEX</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Soroban Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Stellar Yield Optimizer</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-surface-light border border-primary/20 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-surface-light/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Status Pill, Feedback & Wallet */}
        <div className="hidden sm:flex items-center space-x-3">
          
          {/* Testnet Status Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-surface-light border border-surface-border text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-slate-300 font-medium">Stellar Testnet</span>
          </div>

          {/* User Feedback Modal Button */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-primary/30 text-slate-300 hover:text-primary transition-colors text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>

          {/* Connected State vs Connect Dropdown */}
          {userAddress ? (
            <div className="relative">
              <button
                onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-surface-light border border-surface-border hover:border-primary/40 transition-all shadow-sm"
              >
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white flex items-center justify-end space-x-1">
                    <span>{spendableXlmBalance.toFixed(2)}</span>
                    <span className="text-primary text-[10px]">XLM</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {shortenAddress(userAddress)}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  {walletType === 'freighter' ? (
                    <Wallet className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Wallet Dropdown Menu */}
              {isWalletMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="pb-3 border-b border-surface-border">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Connected Account ({walletType === 'freighter' ? 'Freighter Wallet' : '1-Click Guest Keypair'})
                    </div>
                    <div className="font-mono text-xs text-white break-all bg-background/60 p-2 rounded-lg border border-surface-border">
                      {userAddress}
                    </div>
                  </div>

                  <div className="py-3 border-b border-surface-border space-y-1.5 text-xs font-medium">
                    <div className="flex justify-between text-slate-300">
                      <span>Total Native Balance:</span>
                      <span className="font-mono font-bold text-white">{xlmBalance.toFixed(4)} XLM</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Spendable (after 0.5 XLM/reserve):</span>
                      <span className="font-mono font-bold text-primary">{spendableXlmBalance.toFixed(4)} XLM</span>
                    </div>
                  </div>

                  <div className="pt-3 flex space-x-2">
                    <a
                      href={`${STELLAR_CONFIG.explorerBaseUrl}/account/${userAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-surface border border-surface-border hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => {
                        setIsWalletMenuOpen(false);
                        onDisconnect();
                      }}
                      className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-dark to-primary hover:from-primary hover:to-primary-light text-background font-bold text-sm shadow-glow-primary hover:shadow-lg transition-all"
              >
                <Wallet className="w-4 h-4 fill-background" />
                <span>Connect Wallet</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Connect Options Dropdown */}
              {isWalletMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-4 shadow-2xl z-50 space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Select Connection Method
                  </div>

                  {/* Option 1: Freighter */}
                  <button
                    onClick={() => {
                      setIsWalletMenuOpen(false);
                      onConnectFreighter();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-light border border-surface-border hover:border-primary/40 hover:bg-surface-light/80 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Freighter Wallet</div>
                        <div className="text-xs text-slate-400">
                          {isFreighterInstalled ? 'Extension detected' : 'Click to connect or install'}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Option 2: 1-Click Testnet Guest Mode */}
                  <button
                    onClick={() => {
                      setIsWalletMenuOpen(false);
                      onConnectGuest();
                    }}
                    disabled={isGuestFunding}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-surface-light to-stellar-blue/10 border border-stellar-blue/30 hover:border-stellar-blue/60 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-stellar-blue/20 border border-stellar-blue/40 flex items-center justify-center text-stellar-blue group-hover:scale-105 transition-transform">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                          <span>1-Click Testnet Guest</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stellar-blue/20 text-stellar-cyan">
                            Instant
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {isGuestFunding ? 'Funding with 10k XLM...' : 'Auto-funds testnet wallet in 1-click'}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-light/95 backdrop-blur-2xl px-4 py-6 space-y-4 animate-in slide-in-from-top-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold ${
                    isActive
                      ? 'text-primary bg-surface border border-primary/20'
                      : 'text-slate-300 hover:bg-surface/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-surface-border space-y-2">
            {!userAddress ? (
              <>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onConnectFreighter();
                  }}
                  className="w-full py-3 rounded-xl bg-primary text-background font-bold text-sm text-center"
                >
                  Connect Freighter Wallet
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onConnectGuest();
                  }}
                  className="w-full py-3 rounded-xl bg-stellar-blue/20 border border-stellar-blue/40 text-stellar-cyan font-bold text-sm text-center"
                >
                  Launch 1-Click Guest Testnet Account
                </button>
              </>
            ) : (
              <div className="p-3 bg-surface rounded-xl border border-surface-border space-y-2">
                <div className="text-xs text-slate-400 font-mono break-all">{userAddress}</div>
                <div className="text-sm font-bold text-white">Spendable: {spendableXlmBalance.toFixed(2)} XLM</div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onDisconnect();
                  }}
                  className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
