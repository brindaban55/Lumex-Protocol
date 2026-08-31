import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroTelemetry } from './components/HeroTelemetry';
import { VaultPoolsGrid } from './components/VaultPoolsGrid';
import { UserPositionCard } from './components/UserPositionCard';
import { AutoCompoundTerminal } from './components/AutoCompoundTerminal';
import { AnalyticsMonitoring } from './components/AnalyticsMonitoring';
import { ProofOfInteractions } from './components/ProofOfInteractions';
import { DexSwap } from './components/DexSwap';
import { UserFeedbackModal } from './components/UserFeedbackModal';
import { WithdrawModal } from './components/WithdrawModal';
import { NewUserTourModal } from './components/NewUserTourModal';
import { useLivePools } from './hooks/useLivePools';
import { useFreighter } from './hooks/useFreighter';
import { useGuestWallet } from './hooks/useGuestWallet';
import { useVaultContract } from './hooks/useVaultContract';
import { VaultPool } from './types';
import { Zap, Github, ExternalLink, ShieldCheck, Heart, MessageSquare } from 'lucide-react';
import { STELLAR_CONFIG } from './config/stellar';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('pools');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [withdrawModalPool, setWithdrawModalPool] = useState<VaultPool | null>(null);

  const freighter = useFreighter();
  const guestWallet = useGuestWallet();
  const activeAddress = freighter.isConnected ? freighter.publicKey : guestWallet.publicKey;
  const activeSigner = freighter.isConnected ? freighter.signTx : guestWallet.signTx;

  const { pools, metrics, isLoading, refreshPools } = useLivePools();
  const { 
    userPositions, 
    deposit, 
    withdraw, 
    emergencyWithdraw, 
    swapTokens,
    isLoadingPosition, 
    refreshUserPosition, 
    syncOnChainPositions 
  } = useVaultContract(activeAddress || undefined, activeSigner);

  // Automatically trigger onboarding walkthrough if new wallet connects
  useEffect(() => {
    if (activeAddress) {
      try {
        const hasSeen = localStorage.getItem(`lumex_tour_completed_${activeAddress}`);
        if (!hasSeen) {
          setIsTourOpen(true);
        }
      } catch (e) {}
    }
  }, [activeAddress]);

  const handleWithdrawClick = (pool: VaultPool) => {
    setWithdrawModalPool(pool);
  };


  return (
    <div className="min-h-screen bg-[#06080D] bg-ambient-mesh text-slate-100 flex flex-col justify-between selection:bg-[#00E599]/30 selection:text-[#00E599]">
      <div>
        {/* Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          openFeedbackModal={() => setIsFeedbackOpen(true)} 
          onOpenTour={() => setIsTourOpen(true)}
        />


        {/* Dynamic Tab Views */}
        <main className="pb-16 animate-in fade-in duration-200">
          {activeTab === 'pools' && (
            <>
              <HeroTelemetry
                metrics={metrics}
                onExploreVaults={() => {
                  const el = document.getElementById('vaults-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onLaunchKeeper={() => setActiveTab('autocompound')}
              />
              <div id="vaults-section">
                <VaultPoolsGrid
                  pools={pools}
                  userAddress={activeAddress}
                  onRefresh={() => {
                    refreshPools();
                    if (activeAddress) refreshUserPosition(pools[0]?.id || 'XLM_USDC');
                  }}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}

          {activeTab === 'swap' && (
            <DexSwap
              userAddress={activeAddress}
              xlmBalance={freighter.isConnected ? freighter.xlmBalance : guestWallet.xlmBalance}
              pools={pools}
              onSwapExecute={swapTokens}
              onRefreshBalances={() => {
                if (freighter.isConnected) {
                  freighter.refreshBalances();
                } else {
                  guestWallet.refreshGuestBalances();
                }
                syncOnChainPositions();
                refreshPools();
              }}
            />
          )}


          {activeTab === 'positions' && (
            <UserPositionCard
              positions={userPositions}
              pools={pools}
              onWithdrawClick={handleWithdrawClick}
              onExploreVaults={() => setActiveTab('pools')}
              isLoading={isLoadingPosition}
              onRefresh={syncOnChainPositions}
            />
          )}


          {activeTab === 'autocompound' && (
            <AutoCompoundTerminal
              pools={pools}
              userAddress={activeAddress}
              onSuccess={() => {
                refreshPools();
                if (activeAddress) syncOnChainPositions();
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsMonitoring metrics={metrics} />
          )}

          {activeTab === 'proofs' && (
            <ProofOfInteractions userAddress={activeAddress} />
          )}

        </main>
      </div>

      {/* Institutional Enterprise Footer */}
      <footer className="border-t border-white/[0.08] bg-[#05070B] py-10 text-xs text-slate-400">
        <div className="layout-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00E599]/15 text-[#00E599]">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">LUMEX PROTOCOL</div>
                <p className="text-[11px] text-slate-500">Automated Yield Optimizer on Stellar & Soroban</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${STELLAR_CONFIG.contractId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[#00E599] transition-colors"
              >
                <span>Smart Contract</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href="https://developers.stellar.org/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[#00E599] transition-colors"
              >
                <span>Stellar Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Developer Dispatch</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Stellar Protocol 22/27 • 100% Non-Custodial
            </div>
          </div>
        </div>
      </footer>

      {/* Developer Feedback Modal */}
      <UserFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        userAddress={activeAddress}
      />

      {/* Direct Withdraw Modal */}
      {withdrawModalPool && (
        <WithdrawModal
          pool={withdrawModalPool}
          userAddress={activeAddress}
          onClose={() => setWithdrawModalPool(null)}
          onSuccess={() => {
            setWithdrawModalPool(null);
            refreshPools();
            if (activeAddress) refreshUserPosition(withdrawModalPool.id);
          }}
        />
      )}

      {/* Interactive New User Guided Walkthrough Tour Modal */}
      <NewUserTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        userAddress={activeAddress}
      />
    </div>
  );
}


export default App;
