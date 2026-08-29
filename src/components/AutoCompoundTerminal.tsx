import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Zap, 
  Coins, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { VaultPool } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';

interface AutoCompoundTerminalProps {
  pools: VaultPool[];
  userAddress: string | null;
  onCompoundYield: (poolId: string) => Promise<string>;
  onConnectWallet: () => void;
}

export const AutoCompoundTerminal: React.FC<AutoCompoundTerminalProps> = ({
  pools,
  userAddress,
  onCompoundYield,
  onConnectWallet,
}) => {
  const [selectedPoolId, setSelectedPoolId] = useState<string>(pools[0]?.id || 'XLM_USDC');
  const [isHarvesting, setIsHarvesting] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Soroban Keeper Network v1.0.4 initialized`,
    `[${new Date().toLocaleTimeString()}] Listening to Stellar DEX liquidity pool event streams...`,
    `[${new Date().toLocaleTimeString()}] AMM 0.3% LP fee accumulator active on Testnet`,
  ]);
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null);

  const activePool = pools.find((p) => p.id === selectedPoolId) || pools[0];

  // Simulated Pending Harvestable Fees
  const pendingFeesUsd = Number((activePool.tvlUsd * (activePool.baseApy / 100 / 365) * 0.42).toFixed(2));
  const estimatedKeeperBounty = Number((pendingFeesUsd * 0.01).toFixed(4));
  const estimatedSharePriceBoost = (activePool.boostApy / 100 / 365 * 100).toFixed(3);

  const handleExecuteCompound = async () => {
    if (!userAddress) {
      onConnectWallet();
      return;
    }

    setIsHarvesting(true);
    const logTime = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      `[${logTime}] Invoking compound_yield('${activePool.id}') on contract ${STELLAR_CONFIG.contractId.substring(0, 8)}...`,
      ...prev,
    ]);

    try {
      const hash = await onCompoundYield(activePool.id);
      setLatestTxHash(hash);
      setTerminalLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] SUCCESS: Reinvested $${pendingFeesUsd} DEX fees into ${activePool.name}`,
        `[${new Date().toLocaleTimeString()}] Keeper Bounty: +$${estimatedKeeperBounty} awarded to ${userAddress.substring(0, 6)}...`,
        `[${new Date().toLocaleTimeString()}] Tx Hash: ${hash}`,
        ...prev,
      ]);
    } catch (err: any) {
      setTerminalLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ERROR: ${err.message || 'Harvest failed'}`,
        ...prev,
      ]);
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Decentralized Keeper Auto-Compounder
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              1% Keeper Bounty
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Anyone can trigger fee compounding on Soroban. The smart contract automatically reinvests DEX fees into vault shares and distributes a 1% bounty to the caller.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Harvest Trigger Panel */}
        <div className="lg:col-span-5 glass-panel rounded-3xl border border-surface-border p-6 space-y-6">
          
          {/* Strategy Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Strategy Pool to Compound
            </label>
            <div className="grid grid-cols-1 gap-2">
              {pools.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPoolId(p.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    selectedPoolId === p.id
                      ? 'bg-surface-light border-primary/40 shadow-sm'
                      : 'bg-surface border-surface-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-xs text-primary">
                      {p.assetA.symbol}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">TVL: ${p.tvlUsd.toLocaleString()}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">{p.totalApy}% APY</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pending Harvest Metrics */}
          <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Pending DEX Fees to Harvest:</span>
              <span className="font-mono font-bold text-primary text-base">+${pendingFeesUsd}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Share Price Growth:</span>
              <span className="font-mono font-bold text-white">+{estimatedSharePriceBoost}%</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-border">
              <span className="text-stellar-cyan font-bold flex items-center space-x-1">
                <Coins className="w-3.5 h-3.5" />
                <span>Your Keeper Bounty Reward (1%):</span>
              </span>
              <span className="font-mono font-black text-stellar-cyan text-sm">+${estimatedKeeperBounty}</span>
            </div>
          </div>

          {/* Harvest Action Button */}
          <button
            onClick={handleExecuteCompound}
            disabled={isHarvesting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-stellar-cyan hover:from-primary-light hover:to-stellar-cyan text-background font-black text-sm flex items-center justify-center space-x-2 shadow-glow-primary transition-all"
          >
            {isHarvesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-background" />
                <span>Executing Soroban Compounder...</span>
              </>
            ) : !userAddress ? (
              <span>Connect Wallet to Compound & Claim Bounty</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-background" />
                <span>Trigger Auto-Compound & Claim Bounty</span>
              </>
            )}
          </button>

          {latestTxHash && (
            <div className="p-3 bg-surface-light rounded-xl border border-surface-border flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Last Tx Hash:</span>
              <a
                href={`${STELLAR_CONFIG.explorerBaseUrl}/tx/${latestTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline flex items-center space-x-1"
              >
                <span>{latestTxHash.substring(0, 10)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

        </div>

        {/* Right 7 Cols: Live Keeper Execution Terminal */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-surface-border p-6 flex flex-col justify-between">
          
          <div>
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">
                  lumex-keeper-daemon ~ testnet
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-primary font-mono">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Live Feed</span>
              </div>
            </div>

            {/* Log Stream Area */}
            <div className="bg-background/90 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2 h-72 overflow-y-auto border border-surface-border">
              {terminalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    log.includes('SUCCESS')
                      ? 'text-primary font-bold'
                      : log.includes('ERROR')
                      ? 'text-red-400 font-bold'
                      : log.includes('Invoking')
                      ? 'text-stellar-cyan'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Interval: Continuous 15m trigger cycles</span>
            </span>
            <span className="text-primary font-bold">Protocol Status: 100% On-Chain</span>
          </div>

        </div>

      </div>
    </section>
  );
};
