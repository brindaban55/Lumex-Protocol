import React, { useState } from 'react';
import { X, ArrowDownRight, ShieldCheck, AlertTriangle, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VaultPool } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';

interface DepositModalProps {
  pool: VaultPool;
  userAddress: string | null;
  userSpendableBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (poolId: string, amount: number) => Promise<string>;
  onRefreshBalances: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  pool,
  userAddress,
  userSpendableBalance,
  isOpen,
  onClose,
  onDeposit,
  onRefreshBalances,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(depositAmount) || 0;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= userSpendableBalance;

  // Projected Yield Calculations
  const projectedDailyYield = (parsedAmount * (pool.totalApy / 100)) / 365;
  const projectedMonthlyYield = (parsedAmount * (pool.totalApy / 100)) / 12;
  const projectedYearlyYield = parsedAmount * (pool.totalApy / 100);

  const handlePercentageSelect = (pct: number) => {
    const calculated = (userSpendableBalance * pct) / 100;
    setDepositAmount(calculated > 0 ? calculated.toFixed(2) : '0');
  };

  const handleConfirmDeposit = async () => {
    if (!isAmountValid) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setTxHash(null);

    try {
      const hash = await onDeposit(pool.id, parsedAmount);
      setTxHash(hash);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00E599', '#3E7BFA', '#00E5FF'],
      });
      onRefreshBalances();
    } catch (err: any) {
      setErrorMessage(err.message || 'Deposit transaction failed on Stellar testnet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-border p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary to-stellar-cyan rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{pool.name}</h3>
              <p className="text-xs text-primary font-semibold flex items-center space-x-1">
                <span>{pool.totalApy.toFixed(1)}% Dynamic APY</span>
                <span className="text-slate-400">({pool.baseApy}% Base + {pool.boostApy}% Boost)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface hover:bg-surface-light text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {txHash ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-glow-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Deposit Successful!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Your funds have been deposited into the Soroban strategy vault.
              </p>
            </div>

            <div className="p-3 bg-surface-light rounded-xl border border-surface-border text-left space-y-1 text-xs">
              <div className="text-slate-400">Transaction Hash:</div>
              <div className="font-mono text-primary break-all">{txHash}</div>
            </div>

            <div className="flex space-x-3 pt-2">
              <a
                href={`${STELLAR_CONFIG.explorerBaseUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-surface-light border border-surface-border text-xs font-bold text-slate-200 hover:text-white"
              >
                <span>View on StellarExpert</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setTxHash(null);
                  setDepositAmount('');
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-background text-xs font-bold shadow-glow-primary"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Input View */
          <div className="space-y-4">
            
            {/* Amount Input Box */}
            <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Deposit Amount</span>
                <span className="font-mono">
                  Spendable: <strong className="text-white">{userSpendableBalance.toFixed(2)}</strong> {pool.assetA.symbol}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl font-mono font-black text-white focus:outline-none placeholder:text-slate-600"
                  min="0"
                  step="0.01"
                />
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-bold text-white font-mono">
                  <span>{pool.assetA.symbol}</span>
                </div>
              </div>

              {/* Quick % Selector Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageSelect(pct)}
                    className="flex-1 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-primary/40 text-[11px] font-bold text-slate-300 hover:text-primary transition-colors"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Yield Earnings Preview */}
            <div className="p-3.5 rounded-xl bg-surface/80 border border-surface-border space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Est. Daily Yield:</span>
                </span>
                <span className="font-mono font-bold text-primary">
                  +${projectedDailyYield.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Est. Monthly Yield:</span>
                <span className="font-mono font-bold text-white">
                  +${projectedMonthlyYield.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Est. Yearly Return ({pool.totalApy}% APY):</span>
                <span className="font-mono font-bold text-stellar-cyan">
                  +${projectedYearlyYield.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirmDeposit}
              disabled={!isAmountValid || isSubmitting || !userAddress}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                !userAddress
                  ? 'bg-surface-light text-slate-500 cursor-not-allowed border border-surface-border'
                  : !isAmountValid || isSubmitting
                  ? 'bg-surface-light text-slate-500 cursor-not-allowed border border-surface-border'
                  : 'bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-background shadow-glow-primary'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Soroban Transaction...</span>
                </>
              ) : !userAddress ? (
                <span>Connect Wallet to Deposit</span>
              ) : (
                <span>Deposit {parsedAmount > 0 ? `${parsedAmount.toFixed(2)} ${pool.assetA.symbol}` : ''}</span>
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>Includes 0.5 XLM protocol reserve protection. No lockup period.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
