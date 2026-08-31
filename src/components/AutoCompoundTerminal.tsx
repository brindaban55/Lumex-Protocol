import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Gift, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { VaultPool } from '../types';
import { useVaultContract } from '../hooks/useVaultContract';
import { useLivePools } from '../hooks/useLivePools';
import { useFreighter } from '../hooks/useFreighter';
import { useGuestWallet } from '../hooks/useGuestWallet';

interface AutoCompoundTerminalProps {
  pools: VaultPool[];
  userAddress: string | null;
  onSuccess: () => void;
}

export const AutoCompoundTerminal: React.FC<AutoCompoundTerminalProps> = ({
  pools,
  userAddress,
  onSuccess,
}) => {
  const freighter = useFreighter();
  const guestWallet = useGuestWallet();
  const activeSigner = freighter.isConnected ? freighter.signTx : guestWallet.signTx;

  const { compoundYield, isExecuting, txReceipt, clearReceipt } = useVaultContract(userAddress, activeSigner);
  const { lastCompoundTrigger, triggerManualCompoundSimulation } = useLivePools();

  const [selectedPoolId, setSelectedPoolId] = useState<string>(pools[0]?.id || 'XLM_USDC');
  const [bountyEarned, setBountyEarned] = useState<string | null>(null);

  const selectedPool = pools.find((p) => p.id === selectedPoolId) || pools[0];

  // 1% Keeper Bounty Calculation
  const estimatedHarvestUsd = (selectedPool?.dailyFeeVolumeUsd || 1500) / 96; // ~15m slice
  const keeperBountyUsd = estimatedHarvestUsd * 0.01;

  const handleCompound = async () => {
    if (!selectedPool) return;
    try {
      const res = await compoundYield(selectedPool.id, userAddress || undefined);
      if (res && res.success) {
        setBountyEarned(`+${(keeperBountyUsd / 0.12).toFixed(4)} XLM (~$${keeperBountyUsd.toFixed(3)})`);
        triggerManualCompoundSimulation(selectedPool.id);
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <section className="py-8">
      <div className="layout-container">
        {/* Section Header */}
        <div className="border-b border-white/[0.08] pb-6 mb-8">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Decentralized Keeper Auto-Compounder
            </h2>
            <span className="rounded-full bg-[#00E599]/15 px-3 py-1 text-xs font-bold text-[#00E599] border border-[#00E599]/30">
              1% Bounty Active
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Permissionless keeper engine: trigger on-chain fee harvest cycles and earn caller bounties directly on Stellar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Terminal Action Box */}
          <div className="glass-panel-card rounded-3xl p-7 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Keeper Harvest & Rebalance Loop</h3>
                    <span className="text-xs text-slate-400">Soroban Contract Execution</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-[#00E599]" />
                  <span>Cycle: Every 15 min</span>
                </div>
              </div>

              {/* Pool Selection Tabs */}
              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                  Select Strategy Vault to Compound:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pools.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPoolId(p.id);
                        clearReceipt();
                        setBountyEarned(null);
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        selectedPoolId === p.id
                          ? 'border-[#00E599] bg-[#00E599]/10 text-white shadow-md'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/[0.2] hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-sm text-white">{p.name}</div>
                      <div className="mt-1 font-mono text-xs text-[#00E599]">{p.totalApy.toFixed(1)}% APY</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Matrix */}
              <div className="mt-6 rounded-2xl bg-black/40 border border-white/[0.08] p-5 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Accrued 15m DEX Trading Fees:</span>
                  <span className="font-mono font-bold text-white">${estimatedHarvestUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net Reinvested Yield (99%):</span>
                  <span className="font-mono font-bold text-[#00E599]">
                    ${(estimatedHarvestUsd * 0.99).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                    <Gift className="h-4 w-4" />
                    <span>Caller 1% Keeper Bounty:</span>
                  </span>
                  <span className="font-mono font-black text-purple-400">
                    ${keeperBountyUsd.toFixed(3)} USD
                  </span>
                </div>
              </div>

              {/* Success Notification */}
              {txReceipt && (
                <div className="mt-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-xs text-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-white mb-1">
                    <CheckCircle2 className="h-4 w-4 text-[#00E599]" />
                    <span>Compound Transaction Confirmed on Stellar!</span>
                  </div>
                  <p className="text-slate-300">
                    Accrued fees reinvested and 1% keeper reward awarded.
                  </p>
                  {txReceipt.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txReceipt.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[#00E599] underline hover:text-white font-mono"
                    >
                      <span>Tx Hash: {txReceipt.txHash.slice(0, 16)}...</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Compound Button */}
            <div className="mt-8 pt-4 border-t border-white/[0.08]">
              <button
                onClick={handleCompound}
                disabled={isExecuting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00E599] via-[#00D08A] to-[#00B074] py-4 text-sm font-bold text-[#06080D] shadow-lg shadow-[#00E599]/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#06080D] border-t-transparent"></div>
                    <span>Simulating & Executing On-Chain Compound...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Compound Yield & Claim 1% Bounty</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Keeper Architecture Specs Card */}
          <div className="glass-panel-card rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <ShieldCheck className="h-5 w-5 text-[#00E599]" />
                <h3 className="text-base font-bold text-white">How Keeper Loops Work</h3>
              </div>

              {/* 3D Keeper Graphic */}
              <div className="my-4 rounded-2xl overflow-hidden glass-panel border border-purple-500/20 p-2 flex items-center justify-center relative h-36 bg-black/40">
                <img
                  src="/images/keeper-bot-3d.png"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/keeper-bot-3d.svg';
                  }}
                  alt="Decentralized Keeper Bot 3D"
                  className="h-full object-contain filter drop-shadow-[0_8px_20px_rgba(126,87,194,0.35)]"
                />
              </div>

              <ul className="mt-3 space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00E599] mt-1.5 shrink-0"></div>
                  <span>
                    <strong>Decentralized:</strong> Anyone or any bot can invoke `compound_yield` permissionlessly on Soroban.
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00E599] mt-1.5 shrink-0"></div>
                  <span>
                    <strong>Incentivized:</strong> 1% of the gross harvested DEX trading fees are minted directly to the caller as an execution bounty.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00E599] mt-1.5 shrink-0"></div>
                  <span>
                    <strong>Mathematical Share Growth:</strong> The remaining 99% is compounded into vault assets, increasing the redemption share price for all stakers.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-[11px] text-slate-400">
              Last Global Cycle: <span className="font-mono text-white">{lastCompoundTrigger || 'Active'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
