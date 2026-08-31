import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Filter, 
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import rawProofData from '../data/userInteractionsProof.json';

interface ProofRecord {
  id: string | number;
  action: string;
  userAddress: string;
  amount: string;
  poolId: string;
  txHash: string;
  ledger: number;
  timestamp: string;
  status: string;
  explorerUrl: string;
  memo?: string;
}

export const ProofOfInteractions: React.FC = () => {
  const proofs: ProofRecord[] = rawProofData as unknown as ProofRecord[];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('All');

  const filteredProofs = proofs.filter((p) => {
    const matchesSearch =
      p.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.poolId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'All' || p.action.toLowerCase() === filterAction.toLowerCase();

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'deposit':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <ArrowDownToLine className="h-3 w-3" />
            Deposit
          </span>
        );
      case 'withdraw':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-400 border border-blue-500/20">
            <ArrowUpFromLine className="h-3 w-3" />
            Withdraw
          </span>
        );
      case 'auto-compound':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-bold text-purple-400 border border-purple-500/20">
            <Cpu className="h-3 w-3" />
            Auto-Compound
          </span>
        );
      case 'emergency-exit':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" />
            Emergency-Exit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2.5 py-0.5 text-[11px] font-bold text-slate-300 border border-slate-500/20">
            <Layers className="h-3 w-3" />
            {action}
          </span>
        );
    }
  };

  return (
    <section className="py-8">
      <div className="layout-container">
        {/* Section Header */}
        <div className="border-b border-white/[0.08] pb-6 mb-8">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Verifiable On-Chain Proofs of Interaction
            </h2>
            <span className="rounded-full bg-[#00E599]/15 px-3 py-1 text-xs font-bold text-[#00E599] border border-[#00E599]/30">
              {proofs.length} Confirmed Transactions
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Every transaction hash below is cryptographically signed, submitted, and publicly confirmed on the Stellar network.
          </p>
        </div>

        {/* Search & Action Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Tx Hash, Public Key, or Pool ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#00E599] focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {['All', 'Deposit', 'Auto-Compound', 'Withdraw', 'Emergency-Exit'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  filterAction === act
                    ? 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Proofs High-Density Table */}
        <div className="glass-panel-card rounded-3xl overflow-hidden border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">User Address</th>
                  <th className="py-4 px-6">Amount / Type</th>
                  <th className="py-4 px-6">Pool ID</th>
                  <th className="py-4 px-6">Ledger</th>
                  <th className="py-4 px-6">Timestamp (UTC)</th>
                  <th className="py-4 px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300 font-mono">
                {filteredProofs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                      No on-chain proof records match your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredProofs.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-sans">{getActionBadge(p.action)}</td>
                      <td className="py-4 px-6 text-slate-200">
                        {p.userAddress.slice(0, 4)}...{p.userAddress.slice(-4)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">{p.amount}</td>
                      <td className="py-4 px-6 text-slate-400">{p.poolId}</td>
                      <td className="py-4 px-6 text-[#00E599]">#{p.ledger}</td>
                      <td className="py-4 px-6 text-slate-400">{p.timestamp}</td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={p.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#00E599] hover:underline font-bold"
                        >
                          <span>{p.txHash.slice(0, 6)}...</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
