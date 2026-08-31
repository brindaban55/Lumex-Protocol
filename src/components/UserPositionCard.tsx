/**
 * ==============================================================================
 * Lumex Protocol — User Position & Portfolio Tracker Component
 * ==============================================================================
 * 
 * Displays active staker positions, accrued yield distributions, and vault actions:
 * - Desktop: Clean responsive table with deposited principal, shares, and APY.
 * - Mobile: Modular responsive cards with touch targets for Add, Withdraw, and Compound.
 * - Strict Zero-Mock Policy: When disconnected, displays clean empty state without phantom assets.
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Wallet, 
  Coins
} from 'lucide-react';
import { VaultPool, UserPositionState } from '../types';
import { WithdrawModal } from './WithdrawModal';
import { DepositModal } from './DepositModal';

interface UserPositionCardProps {
  userAddress: string | null;
  pools: VaultPool[];
  positions: { [poolId: string]: UserPositionState };
  userSpendableBalance: number;
  onDeposit: (poolId: string, amount: number) => Promise<string>;
  onWithdraw: (poolId: string, shares: number) => Promise<string>;
  onEmergencyWithdraw: (poolId: string) => Promise<string>;
  onCompoundYield: (poolId: string) => Promise<string>;
  onConnectWallet: () => void;
  onRefreshBalances: () => void;
}

export const UserPositionCard: React.FC<UserPositionCardProps> = ({
  userAddress,
  pools,
  positions,
  userSpendableBalance,
  onDeposit,
  onWithdraw,
  onEmergencyWithdraw,
  onCompoundYield,
  onConnectWallet,
  onRefreshBalances,
}) => {
  const [selectedWithdrawPool, setSelectedWithdrawPool] = useState<VaultPool | null>(null);
  const [selectedDepositPool, setSelectedDepositPool] = useState<VaultPool | null>(null);

  // Filter active staked positions
  const activePoolPositions = pools
    .map((pool) => ({
      pool,
      position: positions[pool.id],
    }))
    .filter((item) => item.position && item.position.shares > 0);

  const totalUserDeposits = activePoolPositions.reduce(
    (acc, curr) => acc + (curr.position?.depositedAmount || 0),
    0
  );
  const totalUserYield = activePoolPositions.reduce(
    (acc, curr) => acc + (curr.position?.accruedYield || 0),
    0
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your Active Staking Positions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time on-chain position tracking, accrued yield shares, and non-custodial capital controls.
          </p>
        </div>
      </div>

      {/* Disconnected State - STRICT ZERO-MOCK POLICY */}
      {!userAddress ? (
        <div className="glass-panel rounded-3xl border border-surface-border p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center mx-auto text-slate-400">
            <Wallet className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">No Wallet Connected</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
              Connect your Freighter wallet or launch an instant 1-Click Guest Testnet account to view live on-chain positions and deposit into yield vaults.
            </p>
          </div>

          <button
            onClick={onConnectWallet}
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-background font-bold text-sm shadow-glow-primary transition-all min-touch-target"
          >
            Connect Wallet
          </button>
        </div>
      ) : activePoolPositions.length === 0 ? (
        /* Connected but No Active Positions */
        <div className="glass-panel rounded-3xl border border-surface-border p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <Coins className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">No Active Vault Deposits</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
              You haven't deposited into any Soroban yield vaults yet. Select a strategy from the Vaults section to start earning up to 31.8% dynamic APY.
            </p>
          </div>
        </div>
      ) : (
        /* Active Staker Portfolio View */
        <div className="space-y-6">
          
          {/* Portfolio Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Staked Principal
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-2">
                ${totalUserDeposits.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Across {activePoolPositions.length} strategy vault(s)</div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accumulated Fee Yield
              </span>
              <div className="text-2xl sm:text-3xl font-black text-primary font-mono mt-2 glow-emerald">
                +${totalUserYield.toFixed(2)}
              </div>
              <div className="text-xs text-primary font-medium mt-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reinvested into share valuation</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Capital Safety
              </span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6" />
                <span>Non-Custodial</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Instant emergency exit anytime</div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block glass-panel rounded-3xl border border-surface-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-light/80 text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="py-4 px-6">Strategy Pool</th>
                    <th className="py-4 px-6">Deposited</th>
                    <th className="py-4 px-6">Vault Shares</th>
                    <th className="py-4 px-6">Accrued Yield</th>
                    <th className="py-4 px-6">Net APY</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-medium">
                  {activePoolPositions.map(({ pool, position }) => (
                    <tr key={pool.id} className="hover:bg-surface-light/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-surface-light border border-surface-border flex items-center justify-center font-mono font-bold text-xs text-primary">
                            {pool.assetA.symbol}
                          </div>
                          <div>
                            <div className="font-bold text-white">{pool.name}</div>
                            <div className="text-xs text-slate-400 font-mono">
                              Staked {new Date(position.entryTimestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {position.depositedAmount.toFixed(2)} {pool.assetA.symbol}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-300">
                        {position.shares.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-primary">
                        +{position.accruedYield.toFixed(2)} {pool.assetA.symbol}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs">
                          {pool.totalApy.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedDepositPool(pool)}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-primary/40 text-xs font-bold text-slate-200 hover:text-primary transition-colors"
                        >
                          + Add
                        </button>

                        <button
                          onClick={() => setSelectedWithdrawPool(pool)}
                          className="px-3 py-1.5 rounded-lg bg-stellar-cyan/10 border border-stellar-cyan/20 hover:bg-stellar-cyan/20 text-xs font-bold text-stellar-cyan transition-colors"
                        >
                          Withdraw
                        </button>

                        <button
                          onClick={() => onCompoundYield(pool.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-xs font-bold text-primary transition-colors"
                          title="Harvest fees & compound shares"
                        >
                          Compound
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Cards View */}
          <div className="md:hidden space-y-4">
            {activePoolPositions.map(({ pool, position }) => (
              <div key={pool.id} className="glass-panel p-5 rounded-2xl border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-base">{pool.name}</div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs">
                    {pool.totalApy.toFixed(1)}% APY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-surface-border">
                  <div>
                    <span className="text-slate-400">Deposited:</span>
                    <div className="font-mono font-bold text-white">{position.depositedAmount.toFixed(2)} {pool.assetA.symbol}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Accrued Yield:</span>
                    <div className="font-mono font-bold text-primary">+{position.accruedYield.toFixed(2)} {pool.assetA.symbol}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedDepositPool(pool)}
                    className="py-2.5 rounded-xl bg-surface border border-surface-border text-xs font-bold text-white text-center min-touch-target"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => setSelectedWithdrawPool(pool)}
                    className="py-2.5 rounded-xl bg-stellar-cyan/10 border border-stellar-cyan/30 text-stellar-cyan text-xs font-bold text-center min-touch-target"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => onCompoundYield(pool.id)}
                    className="py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold text-center min-touch-target"
                  >
                    Compound
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Modals */}
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

    </section>
  );
};
