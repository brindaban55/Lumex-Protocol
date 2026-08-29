import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Users, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  Activity,
  Layers
} from 'lucide-react';
import { ProtocolTelemetry } from '../types';

interface HeroTelemetryProps {
  telemetry: ProtocolTelemetry;
  onExploreVaults: () => void;
  onOpenCompounder: () => void;
}

export const HeroTelemetry: React.FC<HeroTelemetryProps> = ({
  telemetry,
  onExploreVaults,
  onOpenCompounder,
}) => {
  return (
    <div className="relative pt-8 pb-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-stellar-blue/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-surface-light border border-primary/30 text-xs font-mono text-primary mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-semibold uppercase tracking-wider">Stellar DEX Yield Optimization Layer</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Institutional Yield Vaults <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-stellar-cyan bg-clip-text text-transparent">
              Compounded on Soroban
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8">
            Harness Stellar DEX Automated Market Maker (AMM) 0.3% liquidity fees, automated rebalancing, and decentralized keeper harvest loops with near-zero transaction costs.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreVaults}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-background font-bold text-sm shadow-glow-primary hover:shadow-lg transition-all"
            >
              <span>Explore Active Vaults</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCompounder}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-surface-light hover:bg-surface-border border border-surface-border text-white font-bold text-sm transition-all"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span>Launch Keeper Compounder</span>
            </button>
          </div>
        </div>

        {/* Live Dynamic Protocol Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          
          {/* Card 1: Total Value Locked */}
          <div className="glass-panel p-5 rounded-2xl border border-surface-border glass-panel-hover">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Value Locked</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${telemetry.totalTvlUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-primary font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live DEX AMM Reserves</span>
            </div>
          </div>

          {/* Card 2: 24h Compounded Yield */}
          <div className="glass-panel p-5 rounded-2xl border border-surface-border glass-panel-hover">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">24h Fees Harvested</span>
              <div className="w-8 h-8 rounded-lg bg-stellar-blue/10 border border-stellar-blue/20 flex items-center justify-center text-stellar-cyan">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${telemetry.totalYieldHarvestedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-stellar-cyan" />
              <span>Continuous 15m Reinvestment</span>
            </div>
          </div>

          {/* Card 3: Average Dynamic APY */}
          <div className="glass-panel p-5 rounded-2xl border border-surface-border glass-panel-hover">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Max Vault APY</span>
              <div className="w-8 h-8 rounded-lg bg-stellar-purple/10 border border-stellar-purple/20 flex items-center justify-center text-stellar-purple">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono tracking-tight glow-emerald">
              {telemetry.avgProtocolApy.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Base AMM + Compound Boost</span>
            </div>
          </div>

          {/* Card 4: Active Stakers & Testnet Telemetry */}
          <div className="glass-panel p-5 rounded-2xl border border-surface-border glass-panel-hover">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Active Stakers</span>
              <div className="w-8 h-8 rounded-lg bg-stellar-gold/10 border border-stellar-gold/20 flex items-center justify-center text-stellar-gold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {telemetry.activeStakersCount}
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-400 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ledger #{telemetry.rpcBlockHeight} ({telemetry.horizonLatencyMs}ms)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
