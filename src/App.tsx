/**
 * ==============================================================================
 * Lumex Protocol — Main Application Shell & State Controller
 * ==============================================================================
 * 
 * Orchestrates multi-wallet connectivity, Horizon DEX telemetry streams,
 * Soroban contract invocation life-cycle, and responsive view routing.
 * 
 * View Structure:
 * - Vaults: Active AMM strategy cards, APY analytics, and deposit/withdrawal modals.
 * - Portfolio: Real-time user position tracker and non-custodial capital redemption.
 * - Terminal: Decentralized keeper harvest daemon with 1% bounty distributor.
 * - Analytics: RPC/Horizon latency monitoring, block height, and protocol vitals.
 * - Proofs: Verifiable table of on-chain testnet transactions.
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroTelemetry } from './components/HeroTelemetry';
import { VaultPoolsGrid } from './components/VaultPoolsGrid';
import { UserPositionCard } from './components/UserPositionCard';
import { AutoCompoundTerminal } from './components/AutoCompoundTerminal';
import { AnalyticsMonitoring } from './components/AnalyticsMonitoring';
import { ProofOfInteractions } from './components/ProofOfInteractions';
import { UserFeedbackModal } from './components/UserFeedbackModal';
import { useFreighter } from './hooks/useFreighter';
import { useGuestWallet } from './hooks/useGuestWallet';
import { useLivePools } from './hooks/useLivePools';
import { useVaultContract } from './hooks/useVaultContract';
import { STELLAR_CONFIG } from './config/stellar';
import { 
  Zap, 
  ExternalLink, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('vaults');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  // Wallets
  const {
    wallet: freighterWallet,
    connectWallet: connectFreighter,
    disconnectWallet: disconnectFreighter,
    signTx: signFreighterTx,
    refreshBalances: refreshFreighterBalances,
  } = useFreighter();

  const {
    guestState,
    createAndFundGuest,
    clearGuest,
    signGuestTx,
    refreshGuestBalances,
  } = useGuestWallet();

  // Active wallet determination (Freighter takes precedence if connected, else Guest)
  const isFreighterActive = freighterWallet.isConnected && !!freighterWallet.address;
  const isGuestActive = guestState.isGuestActive && !!guestState.publicKey;

  const activeAddress = isFreighterActive
    ? freighterWallet.address
    : isGuestActive
    ? guestState.publicKey
    : null;

  const activeWalletType: 'freighter' | 'guest' | null = isFreighterActive
    ? 'freighter'
    : isGuestActive
    ? 'guest'
    : null;

  const activeXlmBalance = isFreighterActive
    ? freighterWallet.xlmBalance
    : isGuestActive
    ? guestState.xlmBalance
    : 0;

  const activeSpendableBalance = isFreighterActive
    ? freighterWallet.spendableXlmBalance
    : isGuestActive
    ? guestState.spendableXlmBalance
    : 0;

  const activeSigner = isFreighterActive
    ? signFreighterTx
    : isGuestActive
    ? signGuestTx
    : null;

  const refreshActiveBalances = () => {
    if (isFreighterActive) refreshFreighterBalances();
    if (isGuestActive) refreshGuestBalances();
  };

  const handleDisconnectAll = () => {
    if (isFreighterActive) disconnectFreighter();
    if (isGuestActive) clearGuest();
  };

  // Pools & Telemetry
  const { pools, telemetry, isRefreshing, refreshPools } = useLivePools();

  // Vault Contract Actions
  const {
    positions,
    deposit,
    withdraw,
    compoundYield,
    emergencyWithdraw,
    txHistory,
    error: contractError,
    clearError,
  } = useVaultContract(activeAddress, activeSigner);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-primary/30 selection:text-primary">
      
      {/* Navigation Header */}
      <Navbar
        userAddress={activeAddress}
        walletType={activeWalletType}
        xlmBalance={activeXlmBalance}
        spendableXlmBalance={activeSpendableBalance}
        isFreighterInstalled={freighterWallet.isFreighterInstalled}
        onConnectFreighter={connectFreighter}
        onConnectGuest={createAndFundGuest}
        onDisconnect={handleDisconnectAll}
        isGuestFunding={guestState.isFunding}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Contract Error Banner */}
      {contractError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{contractError}</span>
            </div>
            <button
              onClick={clearError}
              className="text-xs font-bold underline hover:text-white min-touch-target flex items-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Areas based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'vaults' && (
          <>
            <HeroTelemetry
              telemetry={telemetry}
              onExploreVaults={() => {
                const el = document.getElementById('vaults-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenCompounder={() => setActiveTab('terminal')}
            />

            <div id="vaults-section">
              <VaultPoolsGrid
                pools={pools}
                userAddress={activeAddress}
                userSpendableBalance={activeSpendableBalance}
                positions={positions}
                isRefreshing={isRefreshing}
                onRefreshPools={refreshPools}
                onDeposit={deposit}
                onWithdraw={withdraw}
                onEmergencyWithdraw={emergencyWithdraw}
                onRefreshBalances={refreshActiveBalances}
              />
            </div>
          </>
        )}

        {activeTab === 'portfolio' && (
          <UserPositionCard
            userAddress={activeAddress}
            pools={pools}
            positions={positions}
            userSpendableBalance={activeSpendableBalance}
            onDeposit={deposit}
            onWithdraw={withdraw}
            onEmergencyWithdraw={emergencyWithdraw}
            onCompoundYield={compoundYield}
            onConnectWallet={connectFreighter}
            onRefreshBalances={refreshActiveBalances}
          />
        )}

        {activeTab === 'terminal' && (
          <AutoCompoundTerminal
            pools={pools}
            userAddress={activeAddress}
            onCompoundYield={compoundYield}
            onConnectWallet={connectFreighter}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsMonitoring
            telemetry={telemetry}
            txHistory={txHistory}
          />
        )}

        {activeTab === 'proofs' && (
          <ProofOfInteractions txHistory={txHistory} />
        )}
      </main>

      {/* User Feedback Modal */}
      <UserFeedbackModal
        userAddress={activeAddress}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface-light/50 py-10 sm:py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Lumex Protocol</div>
              <p className="text-xs text-slate-400">Non-Custodial Stellar & Soroban Yield Vaults</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <a
              href={`${STELLAR_CONFIG.explorerBaseUrl}/contract/${STELLAR_CONFIG.contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center space-x-1"
            >
              <span>Contract on StellarExpert</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://developers.stellar.org/docs/build"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center space-x-1"
            >
              <span>Stellar Developers</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hover:text-primary transition-colors flex items-center space-x-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Submit Feedback</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Stellar Testnet • Protocol 22/27
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
