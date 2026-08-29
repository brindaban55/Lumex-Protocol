import React from 'react';
import { 
  Activity, 
  Server, 
  Cpu, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Globe
} from 'lucide-react';
import { ProtocolTelemetry, OnChainTransactionProof } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';

interface AnalyticsMonitoringProps {
  telemetry: ProtocolTelemetry;
  txHistory: OnChainTransactionProof[];
}

export const AnalyticsMonitoring: React.FC<AnalyticsMonitoringProps> = ({
  telemetry,
  txHistory,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Protocol Telemetry & System Health
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Monitoring
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time performance metrics, network block confirmation latency, and Soroban contract telemetry.
          </p>
        </div>
      </div>

      {/* Grid of System Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Horizon Endpoint Status */}
        <div className="glass-panel p-5 rounded-3xl border border-surface-border">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Horizon Node</span>
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">{telemetry.horizonLatencyMs} ms</div>
            <span className="text-xs text-primary font-semibold">Latency</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Horizon Testnet Synchronized</span>
          </div>
        </div>

        {/* Soroban RPC Status */}
        <div className="glass-panel p-5 rounded-3xl border border-surface-border">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Soroban RPC</span>
            <Cpu className="w-4 h-4 text-stellar-cyan" />
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">#{telemetry.rpcBlockHeight}</div>
            <span className="text-xs text-slate-400 font-mono">Ledger</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-stellar-cyan font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>Sub-second RPC Simulation</span>
          </div>
        </div>

        {/* Average Confirmation Speed */}
        <div className="glass-panel p-5 rounded-3xl border border-surface-border">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Confirmation</span>
            <Clock className="w-4 h-4 text-stellar-purple" />
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">3.8 s</div>
            <span className="text-xs text-slate-400">Finality</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-primary font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Stellar Consensus Protocol (SCP)</span>
          </div>
        </div>

        {/* Average Transaction Cost */}
        <div className="glass-panel p-5 rounded-3xl border border-surface-border">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Network Fee</span>
            <Globe className="w-4 h-4 text-stellar-gold" />
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">&lt; $0.00001</div>
            <span className="text-xs text-slate-400">/ Tx</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100 Stroops Base Fee</span>
          </div>
        </div>

      </div>

      {/* Contract & Environment Specs Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        <div className="lg:col-span-6 glass-panel rounded-3xl border border-surface-border p-6 space-y-4">
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Contract Verification & Architecture Specs</span>
          </h3>

          <div className="space-y-3 text-xs font-medium">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-surface-border">
              <span className="text-slate-400">Deployed Soroban Contract:</span>
              <a
                href={`${STELLAR_CONFIG.explorerBaseUrl}/contract/${STELLAR_CONFIG.contractId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-primary hover:underline flex items-center space-x-1"
              >
                <span>{STELLAR_CONFIG.contractId.substring(0, 14)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-surface-border">
              <span className="text-slate-400">Runtime Protocol Version:</span>
              <span className="font-mono font-bold text-white">Stellar Protocol 22/27</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-surface-border">
              <span className="text-slate-400">State Storage Model:</span>
              <span className="font-mono font-bold text-stellar-cyan">Persistent Storage + 180d TTL Extension</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-surface-border">
              <span className="text-slate-400">Vault Accounting Standard:</span>
              <span className="font-mono font-bold text-white">ERC-4626 / SEP-41 Token Interface</span>
            </div>
          </div>
        </div>

        {/* Live Session Activity Feed */}
        <div className="lg:col-span-6 glass-panel rounded-3xl border border-surface-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white flex items-center space-x-2 mb-4">
              <Activity className="w-4 h-4 text-stellar-cyan" />
              <span>Current Session Activity Feed</span>
            </h3>

            {txHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No transactions executed in this session yet. Deposit, withdraw, or compound to see live transaction receipts.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {txHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-surface-light border border-surface-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-bold text-white">{tx.action}</span>
                      <span className="font-mono text-slate-400">{tx.amount}</span>
                    </div>

                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline flex items-center space-x-1"
                    >
                      <span>Ledger #{tx.ledger}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-surface-border flex items-center justify-between">
            <span>Network: Stellar Testnet</span>
            <span className="text-primary font-semibold">100% Non-Custodial Vaults</span>
          </div>
        </div>

      </div>

    </section>
  );
};
