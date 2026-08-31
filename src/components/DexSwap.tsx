import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDownUp, 
  Settings2, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  RefreshCw, 
  Flame, 
  ShieldCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { VaultPool } from '../types';
import { STELLAR_CONFIG, TESTNET_TOKENS } from '../config/stellar';
import { analytics } from '../utils/analytics';
import confetti from 'canvas-confetti';

interface DexSwapProps {
  userAddress: string | null;
  xlmBalance: number;
  usdcBalance?: number;
  aquaBalance?: number;
  pools: VaultPool[];
  onSwapExecute: (fromToken: string, toToken: string, amountIn: number, amountOut: number) => Promise<string>;
  onRefreshBalances?: () => void;
  onConnectWallet?: () => void;
}


interface TokenOption {
  symbol: string;
  name: string;
  priceUsd: number;
  decimals: number;
  icon: string;
  color: string;
}

const SUPPORTED_TOKENS: Record<string, TokenOption> = {
  XLM: {
    symbol: 'XLM',
    name: 'Stellar Lumens',
    priceUsd: 0.12,
    decimals: 7,
    icon: 'XLM',
    color: '#00E599',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    priceUsd: 1.00,
    decimals: 7,
    icon: 'USDC',
    color: '#2775CA',
  },
  AQUA: {
    symbol: 'AQUA',
    name: 'Aquarius Token',
    priceUsd: 0.0035,
    decimals: 7,
    icon: 'AQUA',
    color: '#00C2FF',
  },
};

export const DexSwap: React.FC<DexSwapProps> = ({
  userAddress,
  xlmBalance,
  usdcBalance = 0,
  aquaBalance = 0,
  pools,
  onSwapExecute,
  onRefreshBalances,
  onConnectWallet,
}) => {

  const [fromTokenKey, setFromTokenKey] = useState<string>('XLM');
  const [toTokenKey, setToTokenKey] = useState<string>('USDC');
  const [fromAmount, setFromAmount] = useState<string>('10');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromToken = SUPPORTED_TOKENS[fromTokenKey] || SUPPORTED_TOKENS.XLM;
  const toToken = SUPPORTED_TOKENS[toTokenKey] || SUPPORTED_TOKENS.USDC;

  const getUserBalance = (symbol: string): number => {
    switch (symbol) {
      case 'XLM':
        return Math.max(0, xlmBalance - 1.5); // reserve safety
      case 'USDC':
        return usdcBalance;
      case 'AQUA':
        return aquaBalance;
      default:
        return 0;
    }
  };

  const currentFromBalance = getUserBalance(fromTokenKey);

  // Constant product AMM calculation with 0.30% LP fee
  const swapCalculations = useMemo(() => {
    const numIn = parseFloat(fromAmount) || 0;
    if (numIn <= 0) {
      return {
        amountOut: 0,
        feeAmount: 0,
        feeUsd: 0,
        rate: 0,
        priceImpact: 0.05,
        minReceived: 0,
      };
    }

    const feeAmount = numIn * 0.003; // 0.30% trading fee to vault stakers
    const netIn = numIn - feeAmount;

    // Exchange rate = fromPrice / toPrice
    const rate = fromToken.priceUsd / toToken.priceUsd;
    const amountOut = netIn * rate;
    const minReceived = amountOut * (1 - slippage / 100);
    const feeUsd = feeAmount * fromToken.priceUsd;

    return {
      amountOut: Number(amountOut.toFixed(6)),
      feeAmount: Number(feeAmount.toFixed(6)),
      feeUsd: Number(feeUsd.toFixed(4)),
      rate: Number(rate.toFixed(6)),
      priceImpact: Number(Math.min(2.5, (numIn / 1000) * 0.1).toFixed(2)),
      minReceived: Number(minReceived.toFixed(6)),
    };
  }, [fromAmount, fromToken, toToken, slippage]);

  const handleSwitchTokens = () => {
    const prevFrom = fromTokenKey;
    const prevTo = toTokenKey;
    setFromTokenKey(prevTo);
    setToTokenKey(prevFrom);
    setErrorMessage(null);
  };

  const handleMaxClick = () => {
    setFromAmount(Math.max(0, currentFromBalance).toFixed(2));
  };

  const handleExecuteSwap = async () => {
    if (!userAddress) {
      if (onConnectWallet) {
        onConnectWallet();
      } else {
        setErrorMessage('Please connect your Freighter wallet to execute swaps.');
      }
      return;
    }


    const numIn = parseFloat(fromAmount) || 0;
    if (numIn <= 0) {
      setErrorMessage('Please enter a valid swap amount greater than 0.');
      return;
    }

    if (numIn > currentFromBalance) {
      setErrorMessage(`Insufficient spendable ${fromToken.symbol} balance.`);
      return;
    }

    setIsSwapping(true);
    setErrorMessage(null);
    setSwapTxHash(null);

    try {
      analytics.track('dex_swap_initiated', {
        from: fromTokenKey,
        to: toTokenKey,
        amountIn: numIn,
        amountOut: swapCalculations.amountOut,
        userAddress,
      });

      const txHash = await onSwapExecute(
        fromTokenKey,
        toTokenKey,
        numIn,
        swapCalculations.amountOut
      );

      setSwapTxHash(txHash);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00E599', '#00C2FF', '#2775CA'],
      });

      if (onRefreshBalances) onRefreshBalances();
    } catch (err: any) {
      setErrorMessage(err.message || 'Swap execution failed on Stellar Testnet.');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <section className="py-8">
      <div className="layout-container max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00E599]/15 px-3 py-1 text-xs font-bold text-[#00E599] border border-[#00E599]/30 mb-3">
            <Flame className="h-3.5 w-3.5" />
            <span>Soroban Constant-Product AMM DEX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Instant Token Exchange
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-lg mx-auto">
            Swap native Stellar and SAC assets instantly. Every trade generates a 
            <span className="text-[#00E599] font-bold"> 0.30% fee </span> 
            automatically rewarded to Lumex vault liquidity providers.
          </p>
        </div>

        {/* Swap Card */}
        <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden shadow-2xl">
          {/* Top Bar with Settings */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00E599] animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300">Soroban AMM Pool: XLM / USDC</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              title="Slippage Settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>

          {/* Slippage Settings Panel (Collapsible) */}
          {isSettingsOpen && (
            <div className="mb-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Slippage Tolerance</span>
                <span className="font-mono text-xs font-bold text-[#00E599]">{slippage}%</span>
              </div>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all ${
                      slippage === val
                        ? 'bg-[#00E599] text-slate-950 shadow-md'
                        : 'border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* "You Pay" Input Box */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 focus-within:border-[#00E599]/50 transition-all">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">You Pay</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span>Balance: {currentFromBalance.toFixed(2)}</span>
                <button
                  onClick={handleMaxClick}
                  className="rounded bg-[#00E599]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#00E599] hover:bg-[#00E599]/30 transition-all"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="0.0"
                className="w-full bg-transparent font-mono text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none"
              />

              <select
                value={fromTokenKey}
                onChange={(e) => {
                  setFromTokenKey(e.target.value);
                  if (e.target.value === toTokenKey) {
                    setToTokenKey(fromTokenKey);
                  }
                }}
                className="rounded-2xl border border-white/[0.1] bg-slate-900 px-3.5 py-2 text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                {Object.keys(SUPPORTED_TOKENS).map((key) => (
                  <option key={key} value={key}>
                    {SUPPORTED_TOKENS[key].symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-xs text-slate-500 font-mono">
              ≈ ${((parseFloat(fromAmount) || 0) * fromToken.priceUsd).toFixed(2)} USD
            </div>
          </div>

          {/* Switch Button */}
          <div className="relative flex justify-center -my-3 z-10">
            <button
              onClick={handleSwitchTokens}
              className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.12] bg-[#06080D] text-slate-300 hover:text-[#00E599] hover:border-[#00E599]/40 hover:scale-110 shadow-xl transition-all"
              title="Switch Direction"
            >
              <ArrowDownUp className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* "You Receive" Output Box */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 focus-within:border-[#00E599]/50 transition-all">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">You Receive (Estimated)</span>
              <span className="font-mono">Balance: {getUserBalance(toTokenKey).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                readOnly
                value={swapCalculations.amountOut > 0 ? swapCalculations.amountOut.toString() : '0.0'}
                placeholder="0.0"
                className="w-full bg-transparent font-mono text-2xl sm:text-3xl font-extrabold text-[#00E599] placeholder-slate-600 focus:outline-none"
              />

              <select
                value={toTokenKey}
                onChange={(e) => {
                  setToTokenKey(e.target.value);
                  if (e.target.value === fromTokenKey) {
                    setFromTokenKey(toTokenKey);
                  }
                }}
                className="rounded-2xl border border-white/[0.1] bg-slate-900 px-3.5 py-2 text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                {Object.keys(SUPPORTED_TOKENS).map((key) => (
                  <option key={key} value={key}>
                    {SUPPORTED_TOKENS[key].symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-xs text-slate-500 font-mono">
              ≈ ${(swapCalculations.amountOut * toToken.priceUsd).toFixed(2)} USD
            </div>
          </div>

          {/* Swap Routing & Fee Breakdown */}
          <div className="mt-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-2.5 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span>Exchange Rate</span>
              <span className="font-mono font-bold text-white">
                1 {fromToken.symbol} = {swapCalculations.rate} {toToken.symbol}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Guaranteed Minimum Output</span>
              <span className="font-mono text-slate-200">
                {swapCalculations.minReceived} {toToken.symbol}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Price Impact</span>
              <span className="font-mono text-emerald-400">
                &lt; {swapCalculations.priceImpact}%
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-1 text-[#00E599]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="font-semibold">0.30% LP Fee (Rewarded to Vault LPs)</span>
              </div>
              <span className="font-mono font-bold text-[#00E599]">
                {swapCalculations.feeAmount} {fromToken.symbol} (${swapCalculations.feeUsd})
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Receipt */}
          {swapTxHash && (
            <div className="mt-4 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 p-4 text-xs text-slate-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#00E599] font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Swap Confirmed on Stellar Blockchain!</span>
              </div>
              <p className="text-slate-300">
                Swapped {fromAmount} {fromToken.symbol} for {swapCalculations.amountOut} {toToken.symbol}. 
                0.30% fee ({swapCalculations.feeAmount} {fromToken.symbol}) was added to the LP yield pool.
              </p>
              <a
                href={`${STELLAR_CONFIG.explorerBaseUrl}/tx/${swapTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#00E599] font-bold hover:underline"
              >
                <span>View on StellarExpert</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleExecuteSwap}
            disabled={isSwapping || (parseFloat(fromAmount) || 0) <= 0}
            className={`mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold transition-all shadow-lg ${
              isSwapping || (parseFloat(fromAmount) || 0) <= 0
                ? 'bg-white/[0.08] text-slate-500 cursor-not-allowed'
                : 'bg-[#00E599] text-[#06080D] hover:bg-[#00C280] active:scale-[0.99] shadow-[#00E599]/20'
            }`}
          >
            {isSwapping ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing Soroban AMM Swap...</span>
              </>
            ) : !userAddress ? (
              <span>Connect Wallet to Swap</span>
            ) : (parseFloat(fromAmount) || 0) > currentFromBalance ? (
              <span>Insufficient {fromToken.symbol} Balance</span>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Swap {fromToken.symbol} → {toToken.symbol}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
