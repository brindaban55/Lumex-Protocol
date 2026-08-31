export interface VaultPool {
  id: string; // e.g. "XLM_USDC"
  name: string;
  assetA: {
    symbol: string;
    name: string;
    icon: string;
    contractId?: string;
  };
  assetB: {
    symbol: string;
    name: string;
    icon: string;
    contractId?: string;
  };
  underlyingToken: string; // Contract address of underlying SAC
  baseApy: number; // e.g. 11.2%
  boostApy: number; // e.g. 4.8% from auto-compounding
  totalApy: number; // base + boost
  tvlUsd: number;
  totalDeposits: number;
  totalShares: number;
  stakersCount: number;
  dailyFeeVolumeUsd: number;
  strategyDescription: string;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  liquidityPoolId: string;
}

export interface UserPositionState {
  poolId: string;
  depositedAmount: number;
  shares: number;
  shareValueUsd: number;
  accruedYield: number;
  totalYieldClaimed: number;
  entryTimestamp: number;
  lastHarvestTimestamp: number;
}

export type UserPositionData = UserPositionState;

export interface ProtocolTelemetry {
  totalTvlUsd: number;
  totalYieldHarvestedUsd: number;
  avgProtocolApy: number;
  activeStakersCount: number;
  totalTransactionsCount: number;
  horizonLatencyMs: number;
  rpcBlockHeight: number;
  networkStatus: 'Operational' | 'Degraded' | 'Synchronizing';
}

export interface ProtocolMetrics {
  totalValueLockedUsd: number;
  totalFeesHarvestedUsd: number;
  averageApy: number;
  totalStakers: number;
  activeLedger: number;
  ledgerLatencyMs: number;
  horizonLatencyMs: number;
}

export interface OnChainTransactionProof {
  id: string;
  txHash: string;
  userAddress: string;
  action: 'Deposit' | 'Auto-Compound' | 'Withdraw' | 'Emergency-Exit' | 'Initialize-Pool' | string;
  amount: string;
  poolId: string;
  ledger: number;
  timestamp: string;
  status: 'Confirmed' | 'Pending' | 'Failed' | string;
  explorerUrl: string;
  memo?: string;
}

export interface UserFeedbackItem {
  id: string;
  userAddress: string;
  rating: number; // 1-5
  category: 'Yield Performance' | 'Transaction Speed' | 'UI & Aesthetics' | 'Security & Wallets' | 'General' | string;
  feedbackText: string;
  timestamp: string;
}

