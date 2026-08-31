import React from 'react';
import { 
  ShieldCheck, 
  ArrowUpFromLine, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserPositionState, VaultPool } from '../types';

interface UserPositionCardProps {
  positions: UserPositionState[];
  pools: VaultPool[];
  onWithdrawClick: (pool: VaultPool) => void;
  onExploreVaults: () => void;
  isLoading: boolean;
}

export const UserPositionCard: React.FC<UserPositionCardProps> = ({
  positions,
  pools,
  onWithdrawClick,
  onExploreVaults,
  isLoading,
}) => {
  const activePositions = (positions || []).filter((p) => Number(p.shares) > 0);

  const totalDepositedUsd = activePositions.reduce((acc, pos) => {
    return acc + (Number(pos.depositedAmount) || 0) * 0.12; // Approx USD
  }, 0);

  const totalYieldClaimedUsd = activePositions.reduce((acc, pos) => {
    return acc + (Number(pos.totalYieldClaimed) || 0) * 0.12;
  }, 0);


  return (
    <section className="py-8">
      <div className="layout-container">
        {/* Section Header with 3D Graphic */}
        <div className="glass-panel-card rounded-3xl p-6 sm:p-8 mb-8 border border-white/[0.08] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <span className="rounded-full bg-[#00E599]/15 px-3 py-1 text-xs font-bold text-[#00E599] border border-[#00E599]/30 inline-block mb-3">
              Institutional Portfolio Management
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">My Staked Positions & Portfolio</h2>
            <p className="mt-2 text-sm text-slate-300">
              Real-time Soroban smart contract yield positions, proportional share appreciation, and continuous 15-minute DEX fee compounding.
            </p>
          </div>
          <div className="w-40 sm:w-48 h-32 sm:h-36 relative shrink-0">
            <img
              src="/images/yield-growth-3d.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero-vault-3d.svg';
              }}
              alt="Exponential Yield Growth 3D"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,229,153,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Portfolio Summary Bar */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-5">

          <div className="glass-panel-card rounded-2xl p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Portfolio Value</span>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-white">
              ${totalDepositedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-[#00E599] font-medium mt-1 inline-block">Active Principal Staked</span>
          </div>

          <div className="glass-panel-card rounded-2xl p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cumulative Yield Claimed</span>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-[#00E599]">
              ${totalYieldClaimedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Direct Payouts</span>
          </div>

          <div className="glass-panel-card rounded-2xl p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Vault Strategies</span>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-blue-400">
              {activePositions.length} Vaults
            </div>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Automated Reinvestment</span>
          </div>
        </div>

        {/* Positions List */}
        {isLoading ? (
          <div className="glass-panel-card rounded-3xl p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00E599] border-t-transparent"></div>
            <p className="mt-4 text-sm text-slate-300">Querying on-chain Soroban contract state...</p>
          </div>
        ) : activePositions.length === 0 ? (
          <div className="glass-panel-card rounded-3xl p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-400 mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Active Staked Positions Found</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Deposit into any of the automated yield strategy vaults to start earning continuous AMM fee yields.
            </p>
            <button
              onClick={onExploreVaults}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00E599] px-6 py-3 text-xs font-bold text-[#06080D] shadow-md hover:bg-[#00C280] transition-all"
            >
              <span>Explore Active Vaults</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePositions.map((pos) => {
              const matchedPool = pools.find((p) => p.id === pos.poolId);
              return (
                <div
                  key={pos.poolId}
                  className="glass-panel-card glass-panel-hover rounded-3xl p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E599]/15 text-[#00E599]">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">{matchedPool?.name || pos.poolId}</h4>
                          <span className="text-xs text-slate-400 font-mono">Vault ID: {pos.poolId}</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#00E599]/15 px-3 py-1 font-mono text-xs font-extrabold text-[#00E599]">
                        {matchedPool ? `${matchedPool.totalApy.toFixed(1)}% APY` : 'Active'}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                        <span className="text-xs text-slate-400">Principal Staked:</span>
                        <div className="mt-1 font-mono text-lg font-bold text-white">
                          {pos.depositedAmount} XLM
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                        <span className="text-xs text-slate-400">Vault Shares Held:</span>
                        <div className="mt-1 font-mono text-lg font-bold text-[#00E599]">
                          {pos.shares}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Total Yield Claimed:</span>
                        <span className="font-mono font-bold text-white">{pos.totalYieldClaimed} XLM</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex justify-end">
                    {matchedPool && (
                      <button
                        onClick={() => onWithdrawClick(matchedPool)}
                        className="flex items-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-5 py-2.5 text-xs font-bold text-white transition-all"
                      >
                        <ArrowUpFromLine className="h-4 w-4" />
                        <span>Withdraw / Redeem</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
