import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Users, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight 
} from 'lucide-react';
import { ProtocolMetrics } from '../types';

interface HeroTelemetryProps {
  metrics: ProtocolMetrics;
  onExploreVaults: () => void;
  onLaunchKeeper: () => void;
}

export const HeroTelemetry: React.FC<HeroTelemetryProps> = ({
  metrics,
  onExploreVaults,
  onLaunchKeeper,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12">
      <div className="layout-container">
        {/* Hero Header & Value Proposition */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00E599]/30 bg-[#00E599]/10 px-4 py-1.5 text-xs font-semibold text-[#00E599] shadow-sm mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>STELLAR DEX AUTOMATED YIELD PROTOCOL</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Institutional Yield Vaults <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#00E599] via-[#38EF7D] to-[#3B82F6] bg-clip-text text-transparent">
              Compounded on Soroban
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Harness Stellar DEX Automated Market Maker (AMM) 0.3% liquidity fees, automated
            share rebalancing, and decentralized keeper harvest loops with sub-second finality.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreVaults}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E599] to-[#00B074] px-6 py-3.5 text-sm font-bold text-[#06080D] shadow-lg shadow-[#00E599]/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Layers className="h-4 w-4" />
              <span>Explore Active Vaults</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              onClick={onLaunchKeeper}
              className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.08] hover:border-[#00E599]/40 transition-all"
            >
              <Zap className="h-4 w-4 text-[#00E599]" />
              <span>Launch Keeper Compounder</span>
            </button>
          </div>
        </div>

        {/* Full-Width Telemetry Metrics Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: TVL */}
          <div className="glass-panel-card glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Value Locked</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E599]/10 text-[#00E599]">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 font-mono text-3xl font-extrabold text-white tracking-tight">
              ${metrics.totalValueLockedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#00E599] font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Live DEX AMM Reserves</span>
            </div>
          </div>

          {/* Metric 2: 24H Fees Harvested */}
          <div className="glass-panel-card glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">24h Fees Harvested</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 font-mono text-3xl font-extrabold text-white tracking-tight">
              ${metrics.totalFeesHarvestedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <Zap className="h-3.5 w-3.5" />
              <span>Continuous 15m Reinvestment</span>
            </div>
          </div>

          {/* Metric 3: Max Vault APY */}
          <div className="glass-panel-card glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max Vault APY</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 font-mono text-3xl font-extrabold text-[#00E599] tracking-tight">
              {metrics.averageApy.toFixed(1)}%
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00E599]" />
              <span>Base AMM + Compound Boost</span>
            </div>
          </div>

          {/* Metric 4: Active Stakers */}
          <div className="glass-panel-card glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Stakers</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 font-mono text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalStakers}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Ledger #{metrics.activeLedger} ({metrics.ledgerLatencyMs}ms)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
