import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Cpu, 
  Clock, 
  ExternalLink, 
  Layers, 
  Server, 
  CheckCircle2,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { ProtocolMetrics } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { getTelemetryEvents } from '../utils/analytics';

interface AnalyticsMonitoringProps {
  metrics: ProtocolMetrics;
}

export const AnalyticsMonitoring: React.FC<AnalyticsMonitoringProps> = ({ metrics }) => {
  const [telemetryLogs, setTelemetryLogs] = useState(getTelemetryEvents());

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryLogs(getTelemetryEvents());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8">
      <div className="layout-container">
        {/* Section Header */}
        <div className="border-b border-white/[0.08] pb-6 mb-8">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Protocol Telemetry & System Health
            </h2>
            <span className="rounded-full bg-[#00E599]/15 px-3 py-1 text-xs font-bold text-[#00E599] border border-[#00E599]/30">
              Live Monitoring
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time performance metrics, network block confirmation latency, and Soroban contract telemetry.
          </p>
        </div>

        {/* Infrastructure 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="glass-panel-card rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Horizon Node</span>
              <Server className="h-4 w-4 text-[#00E599]" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              {metrics.horizonLatencyMs} <span className="text-sm font-normal text-slate-400">ms</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#00E599]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Horizon Synchronized</span>
            </div>
          </div>

          <div className="glass-panel-card rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Soroban RPC</span>
              <Cpu className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              #{metrics.activeLedger}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Sub-second RPC Simulation</span>
            </div>
          </div>

          <div className="glass-panel-card rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Avg Confirmation</span>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              3.8 <span className="text-sm font-normal text-slate-400">s</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5 text-[#00E599]" />
              <span>Stellar Consensus Protocol (SCP)</span>
            </div>
          </div>

          <div className="glass-panel-card rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Network Fee</span>
              <Activity className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              &lt; $0.00001 <span className="text-sm font-normal text-slate-400">/ Tx</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <span>100 Stroops Base Fee</span>
            </div>
          </div>
        </div>

        {/* Contract Specs & Telemetry Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contract Architecture Specs */}
          <div className="glass-panel-card rounded-3xl p-7">
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4 mb-5">
              <Shield className="h-5 w-5 text-[#00E599]" />
              <h3 className="text-base font-bold text-white">Contract Verification & Architecture Specs</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 flex items-center justify-between">
                <span className="text-slate-400">Deployed Soroban Contract:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contractId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-[#00E599] hover:underline inline-flex items-center gap-1"
                >
                  <span>{STELLAR_CONFIG.contractId.slice(0, 12)}...{STELLAR_CONFIG.contractId.slice(-6)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 flex items-center justify-between">
                <span className="text-slate-400">Runtime Protocol Version:</span>
                <span className="font-semibold text-white">Stellar Protocol 22 / 27</span>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 flex items-center justify-between">
                <span className="text-slate-400">State Storage Model:</span>
                <span className="font-semibold text-blue-400">Persistent Storage + 180d TTL Extension</span>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 flex items-center justify-between">
                <span className="text-slate-400">Vault Accounting Standard:</span>
                <span className="font-semibold text-purple-400">ERC-4626 / SEP-41 Token Interface</span>
              </div>
            </div>
          </div>

          {/* Session Telemetry Activity Feed */}
          <div className="glass-panel-card rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4 mb-5">
                <Activity className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Current Session Activity Feed</h3>
              </div>

              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {telemetryLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No transactions executed in this session yet. Deposit, withdraw, or compound to see live transaction receipts.
                  </p>
                ) : (
                  telemetryLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#00E599]"></span>
                        <span className="font-semibold text-slate-200 capitalize">
                          {log.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
              <span>Network: Stellar Consensus Engine</span>
              <span>100% Non-Custodial Vaults</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
