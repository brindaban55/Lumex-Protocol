import React, { useState } from 'react';
import { 
  Shield, 
  TrendingUp, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RefreshCw, 
  Percent, 
  Zap, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { VaultPool } from '../types';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';

interface VaultPoolsGridProps {
  pools: VaultPool[];
  userAddress: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const VaultPoolsGrid: React.FC<VaultPoolsGridProps> = ({
  pools,
  userAddress,
  onRefresh,
  isLoading,
}) => {
  const [selectedPoolForDeposit, setSelectedPoolForDeposit] = useState<VaultPool | null>(null);
  const [selectedPoolForWithdraw, setSelectedPoolForWithdraw] = useState<VaultPool | null>(null);
  const [filterRisk, setFilterRisk] = useState<'All' | 'Conservative' | 'Moderate'>('All');

  const filteredPools = filterRisk === 'All' 
    ? pools 
    : pools.filter((p) => p.riskLevel === filterRisk);

  return (
    <section className="py-8">
      <div className="layout-container">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Active Yield Strategy Vaults</h2>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={`p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all ${
                  isLoading ? 'animate-spin text-[#00E599]' : ''
                }`}
                title="Refresh Live Pool Reserves"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Automated liquidity yield harvesting powered by Soroban smart contracts on Stellar DEX.
            </p>
          </div>

          {/* Risk Filter Buttons */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 self-start sm:self-auto">
            {(['All', 'Conservative', 'Moderate'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filterRisk === risk
                    ? 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Vault Strategies 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool) => {
            return (
              <div
                key={pool.id}
                className="glass-panel-card glass-panel-hover rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Top Badge: Risk & APY Highlight */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      pool.riskLevel === 'Conservative'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <Shield className="h-3 w-3" />
                      {pool.riskLevel} Risk
                    </span>

                    <span className="flex items-center gap-1 text-xs font-bold text-[#00E599] bg-[#00E599]/10 px-2.5 py-1 rounded-full border border-[#00E599]/20">
                      <Zap className="h-3.5 w-3.5" />
                      Auto-Compounds 15m
                    </span>
                  </div>

                  {/* Asset Pair Representation */}
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-[#0D1322] shadow-md">
                        <span className="font-mono text-xs font-extrabold text-[#00E599]">{pool.assetA.symbol}</span>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 border-2 border-[#0D1322] shadow-md">
                        <span className="font-mono text-xs font-extrabold text-blue-400">{pool.assetB.symbol}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00E599] transition-colors">
                        {pool.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {pool.assetA.symbol} / {pool.assetB.symbol} AMM Pair
                      </p>
                    </div>
                  </div>

                  {/* Strategy Description */}
                  <p className="mt-4 text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {pool.strategyDescription}
                  </p>

                  {/* APY Showcase Banner */}
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-medium">Net Compounded APY</span>
                      <div className="text-right">
                        <span className="font-mono text-2xl font-black text-[#00E599]">
                          {pool.totalApy.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-2 text-[11px] text-slate-400">
                      <div>Base AMM: <span className="font-mono text-slate-200">{pool.baseApy.toFixed(1)}%</span></div>
                      <div className="text-right">Compound Boost: <span className="font-mono text-[#00E599]">+{pool.boostApy.toFixed(1)}%</span></div>
                    </div>
                  </div>

                  {/* Pool Metrics Breakdown */}
                  <div className="mt-5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Value Locked (TVL):</span>
                      <span className="font-mono font-semibold text-white">
                        ${pool.tvlUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>24h Fee Volume:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        ${pool.dailyFeeVolumeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Active Stakers:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {pool.stakersCount} accounts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA Buttons */}
                <div className="mt-7 grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => setSelectedPoolForDeposit(pool)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#00E599] py-3 text-xs font-bold text-[#06080D] shadow-md hover:bg-[#00C280] active:scale-[0.98] transition-all"
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    <span>Deposit</span>
                  </button>

                  <button
                    onClick={() => setSelectedPoolForWithdraw(pool)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] py-3 text-xs font-bold text-white hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.98] transition-all"
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit Modal */}
      {selectedPoolForDeposit && (
        <DepositModal
          pool={selectedPoolForDeposit}
          userAddress={userAddress}
          onClose={() => setSelectedPoolForDeposit(null)}
          onSuccess={() => {
            setSelectedPoolForDeposit(null);
            onRefresh();
          }}
        />
      )}

      {/* Withdraw Modal */}
      {selectedPoolForWithdraw && (
        <WithdrawModal
          pool={selectedPoolForWithdraw}
          userAddress={userAddress}
          onClose={() => setSelectedPoolForWithdraw(null)}
          onSuccess={() => {
            setSelectedPoolForWithdraw(null);
            onRefresh();
          }}
        />
      )}
    </section>
  );
};
