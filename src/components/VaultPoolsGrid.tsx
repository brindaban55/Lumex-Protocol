/**
 * ==============================================================================
 * Lumex Protocol — Active Yield Strategy Vaults Grid Component
 * ==============================================================================
 * 
 * Displays modular strategy vault cards with real-time on-chain stats:
 * - Dynamic APY breakdown (Base DEX AMM trading fees + Soroban auto-compound multiplier)
 * - Risk classification filter (Conservative, Moderate)
 * - Proportional vault share valuation and staker position tracker
 * - Modals for deposits and withdrawals with spendable reserve safety bounds
 */

import React, { useState } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles, 
  Users, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { VaultPool, UserPositionState } from '../types';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { STELLAR_CONFIG } from '../config/stellar';

interface VaultPoolsGridProps {
  pools: VaultPool[];
  userAddress: string | null;
  userSpendableBalance: number;
  positions: { [poolId: string]: UserPositionState };
  isRefreshing: boolean;
  onRefreshPools: () => void;
  onDeposit: (poolId: string, amount: number) => Promise<string>;
  onWithdraw: (poolId: string, shares: number) => Promise<string>;
  onEmergencyWithdraw: (poolId: string) => Promise<string>;
  onRefreshBalances: () => void;
}

export const VaultPoolsGrid: React.FC<VaultPoolsGridProps> = ({
  pools,
  userAddress,
  userSpendableBalance,
  positions,
  isRefreshing,
  onRefreshPools,
  onDeposit,
  onWithdraw,
  onEmergencyWithdraw,
  onRefreshBalances,
}) => {
  const [selectedDepositPool, setSelectedDepositPool] = useState<VaultPool | null>(null);
  const [selectedWithdrawPool, setSelectedWithdrawPool] = useState<VaultPool | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('All');

  const filteredPools = pools.filter((p) => {
    if (filterRisk === 'All') return true;
    return p.riskLevel === filterRisk;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Section Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Active Yield Strategy Vaults
            </h2>
            <button
              onClick={onRefreshPools}
              className={`p-1.5 rounded-lg bg-surface hover:bg-surface-light text-slate-400 hover:text-primary transition-colors min-touch-target flex items-center justify-center ${
                isRefreshing ? 'animate-spin text-primary' : ''
              }`}
              title="Refresh on-chain Horizon pool data"
              aria-label="Refresh Pools"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated liquidity yield harvesting powered by Soroban smart contracts on Stellar DEX.
          </p>
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-surface border border-surface-border self-start sm:self-auto">
          {['All', 'Conservative', 'Moderate'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRisk === risk
                  ? 'bg-surface-light text-primary border border-primary/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPools.map((pool) => {
          const userPos = positions[pool.id];
          const hasPosition = userPos && userPos.shares > 0;

          return (
            <div
              key={pool.id}
              className="glass-panel rounded-3xl border border-surface-border p-6 flex flex-col justify-between glass-panel-hover group relative overflow-hidden"
            >
              {/* Top Accent Gradient Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent group-hover:via-primary transition-all duration-500" />

              <div>
                {/* Card Top: Assets & Risk Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-xl bg-surface-light border-2 border-surface flex items-center justify-center font-mono font-bold text-xs text-primary shadow-sm">
                        {pool.assetA.symbol}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-stellar-blue/20 border-2 border-surface flex items-center justify-center font-mono font-bold text-xs text-stellar-cyan shadow-sm">
                        {pool.assetB.symbol}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                        {pool.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>Soroban Vault</span>
                        <span>•</span>
                        <a
                          href={`${STELLAR_CONFIG.explorerBaseUrl}/contract/${pool.underlyingToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary flex items-center space-x-0.5"
                        >
                          <span>SAC</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                      pool.riskLevel === 'Conservative'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {pool.riskLevel}
                  </span>
                </div>

                {/* Main Dynamic APY Box */}
                <div className="p-4 rounded-2xl bg-surface-light border border-surface-border mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Net Compounded APY
                      </div>
                      <div className="text-3xl font-black text-primary font-mono tracking-tight glow-emerald mt-0.5">
                        {pool.totalApy.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right text-xs space-y-0.5">
                      <div className="text-slate-300 font-medium">
                        Base DEX: <span className="font-mono text-white font-bold">{pool.baseApy}%</span>
                      </div>
                      <div className="text-primary font-medium flex items-center justify-end space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Boost: +{pool.boostApy}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pool Metric Details */}
                <div className="space-y-2.5 text-xs font-medium mb-6">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Total Value Locked (TVL):</span>
                    <span className="font-mono font-bold text-white">
                      ${pool.tvlUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Est. 24h DEX Fees:</span>
                    <span className="font-mono font-bold text-primary">
                      ${pool.dailyFeeVolumeUsd.toFixed(2)}/day
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Total Stakers:</span>
                    <span className="font-mono text-white flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{pool.stakersCount}</span>
                    </span>
                  </div>

                  {/* Active User Position Badge if staker */}
                  {hasPosition && (
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
                      <span className="text-primary font-bold">Your Staked Position:</span>
                      <span className="font-mono font-black text-white">
                        {userPos.shares.toFixed(2)} {pool.assetA.symbol}
                      </span>
                    </div>
                  )}
                </div>

                {/* Strategy Summary */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-6">
                  {pool.strategyDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface-border">
                <button
                  onClick={() => setSelectedDepositPool(pool)}
                  className="py-3 rounded-xl bg-primary hover:bg-primary-light text-background font-bold text-xs flex items-center justify-center space-x-1.5 shadow-glow-primary transition-all min-touch-target"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>

                <button
                  onClick={() => setSelectedWithdrawPool(pool)}
                  disabled={!hasPosition}
                  className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all min-touch-target ${
                    hasPosition
                      ? 'bg-surface-light hover:bg-surface-border border-surface-border text-white hover:text-stellar-cyan'
                      : 'bg-surface/50 border-surface-border text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedDepositPool && (
        <DepositModal
          pool={selectedDepositPool}
          userAddress={userAddress}
          userSpendableBalance={userSpendableBalance}
          isOpen={!!selectedDepositPool}
          onClose={() => setSelectedDepositPool(null)}
          onDeposit={onDeposit}
          onRefreshBalances={onRefreshBalances}
        />
      )}

      {selectedWithdrawPool && (
        <WithdrawModal
          pool={selectedWithdrawPool}
          userAddress={userAddress}
          position={positions[selectedWithdrawPool.id]}
          isOpen={!!selectedWithdrawPool}
          onClose={() => setSelectedWithdrawPool(null)}
          onWithdraw={onWithdraw}
          onEmergencyWithdraw={onEmergencyWithdraw}
          onRefreshBalances={onRefreshBalances}
        />
      )}

    </section>
  );
};
