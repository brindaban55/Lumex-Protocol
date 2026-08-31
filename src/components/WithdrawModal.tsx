/**
 * ==============================================================================
 * Lumex Protocol — Vault Share Redemption & Emergency Exit Modal
 * ==============================================================================
 * 
 * Manages the withdrawal and liquidation flow from Soroban yield vaults:
 * 1. Standard Share Redemption: Burns vault shares $S_{burn}$ to redeem principal
 *    plus accrued DEX fee yield ($P_{out} = S_{burn} \cdot (D_{total} + Y_{accumulated}) / S_{total}$).
 * 2. Instant Non-Custodial Emergency Exit Hatch: Calls `emergency_withdraw` to return
 *    100% of deposited principal instantaneously, bypassing yield locks.
 */

import React, { useState } from 'react';
import { X, ArrowUpRight, ShieldAlert, AlertTriangle, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { VaultPool, UserPositionState } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { useFreighter } from '../hooks/useFreighter';
import { useGuestWallet } from '../hooks/useGuestWallet';
import { useVaultContract } from '../hooks/useVaultContract';

interface WithdrawModalProps {
  pool: VaultPool;
  userAddress?: string | null;
  position?: UserPositionState | undefined;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onWithdraw?: (poolId: string, shares: number) => Promise<string>;
  onEmergencyWithdraw?: (poolId: string) => Promise<string>;
  onRefreshBalances?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  pool,
  userAddress: propUserAddress,
  position: propPosition,
  isOpen = true,
  onClose,
  onSuccess,
  onWithdraw,
  onEmergencyWithdraw,
  onRefreshBalances,
}) => {
  const freighter = useFreighter();
  const guestWallet = useGuestWallet();
  
  const activeAddress = propUserAddress || (freighter.isConnected ? freighter.publicKey : guestWallet.publicKey);
  const signTxFn = freighter.isConnected ? freighter.signTx : guestWallet.signTx;
  const { 
    positions, 
    withdraw: contractWithdraw, 
    emergencyWithdraw: contractEmergencyWithdraw 
  } = useVaultContract(activeAddress, signTxFn);

  const position = propPosition || positions[pool.id];

  const [withdrawShares, setWithdrawShares] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isOpen === false) return null;

  const totalUserShares = position?.shares || 0;
  const totalDeposited = position?.depositedAmount || 0;
  const accruedYield = position?.accruedYield || 0;

  const parsedShares = parseFloat(withdrawShares) || 0;
  const isSharesValid = parsedShares > 0 && parsedShares <= totalUserShares;

  const handlePercentageSelect = (pct: number) => {
    const calculated = (totalUserShares * pct) / 100;
    setWithdrawShares(calculated > 0 ? calculated.toFixed(2) : '0');
  };

  const handleConfirmWithdraw = async () => {
    if (!isSharesValid) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setTxHash(null);

    try {
      const hash = onWithdraw 
        ? await onWithdraw(pool.id, parsedShares)
        : await contractWithdraw(pool.id, parsedShares);
      setTxHash(hash);
      if (onRefreshBalances) onRefreshBalances();
      if (freighter.isConnected) freighter.refreshBalances();
      if (guestWallet.isConnected) guestWallet.refreshGuestBalances();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal transaction failed on Stellar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEmergency = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setTxHash(null);

    try {
      const hash = onEmergencyWithdraw 
        ? await onEmergencyWithdraw(pool.id)
        : await contractEmergencyWithdraw(pool.id);
      setTxHash(hash);
      if (onRefreshBalances) onRefreshBalances();
      if (freighter.isConnected) freighter.refreshBalances();
      if (guestWallet.isConnected) guestWallet.refreshGuestBalances();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Emergency exit failed on Stellar.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-border p-6 shadow-2xl relative overflow-hidden max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stellar-cyan/10 border border-stellar-cyan/20 flex items-center justify-center text-stellar-cyan">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Withdraw from {pool.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Active Shares: <strong className="text-white">{totalUserShares.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {txHash ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-glow-primary">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">
                {isEmergency ? 'Emergency Exit Completed' : 'Withdrawal Successful!'}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Your redeemed funds have been transferred directly to your connected wallet.
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
                className="flex-1 flex items-center justify-center space-x-1.5 py-3.5 rounded-xl bg-surface-light border border-surface-border text-xs font-bold text-slate-200 hover:text-white min-touch-target"
              >
                <span>View on StellarExpert</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setTxHash(null);
                  setWithdrawShares('');
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-xl bg-primary text-background text-xs font-bold shadow-glow-primary min-touch-target"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Input View */
          <div className="space-y-4">
            
            {/* Position Summary Banner */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-light border border-surface-border text-xs">
              <div>
                <span className="text-slate-400">Principal Deposited:</span>
                <div className="font-mono font-bold text-white mt-0.5">{totalDeposited.toFixed(2)} {pool.assetA.symbol}</div>
              </div>
              <div>
                <span className="text-slate-400">Accrued Yield:</span>
                <div className="font-mono font-bold text-primary mt-0.5">+{accruedYield.toFixed(2)} {pool.assetA.symbol}</div>
              </div>
            </div>

            {/* Shares Input Box */}
            <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Shares to Burn</span>
                <span className="font-mono">
                  Max: <strong className="text-white">{totalUserShares.toFixed(2)}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawShares}
                  onChange={(e) => setWithdrawShares(e.target.value)}
                  className="w-full bg-transparent text-2xl font-mono font-black text-white focus:outline-none placeholder:text-slate-600"
                  min="0"
                  step="0.01"
                />
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-bold text-slate-300 font-mono">
                  <span>SHARES</span>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageSelect(pct)}
                    className="flex-1 py-1.5 rounded-lg bg-surface border border-surface-border hover:border-stellar-cyan/40 text-[11px] font-bold text-slate-300 hover:text-stellar-cyan transition-colors min-touch-target"
                  >
                    {pct === 100 ? '100%' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Withdraw Button */}
            <button
              onClick={handleConfirmWithdraw}
              disabled={!isSharesValid || isSubmitting || totalUserShares === 0}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all min-touch-target ${
                !isSharesValid || isSubmitting || totalUserShares === 0
                  ? 'bg-surface-light text-slate-500 cursor-not-allowed border border-surface-border'
                  : 'bg-gradient-to-r from-stellar-cyan to-stellar-blue hover:from-stellar-blue hover:to-stellar-cyan text-white shadow-glow-blue'
              }`}
            >
              {isSubmitting && !isEmergency ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Withdrawal...</span>
                </>
              ) : totalUserShares === 0 ? (
                <span>No Active Shares to Withdraw</span>
              ) : (
                <span>Redeem {parsedShares > 0 ? `${parsedShares.toFixed(2)} Shares` : 'Shares'}</span>
              )}
            </button>

            {/* Emergency Exit Hatch Button */}
            <div className="pt-2 border-t border-surface-border">
              <button
                onClick={() => {
                  setIsEmergency(true);
                  handleConfirmEmergency();
                }}
                disabled={isSubmitting || totalDeposited === 0}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors min-touch-target"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Instant Emergency Exit (Return 100% Principal)</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
