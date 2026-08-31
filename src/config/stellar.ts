/**
 * ==============================================================================
 * Lumex Protocol — Stellar & Soroban Architecture Configuration
 * ==============================================================================
 * 
 * This module manages the network connectivity, RPC/Horizon endpoints, token metadata,
 * and base reserve calculations for the Lumex Yield Optimizer on Stellar Testnet.
 * 
 * Key Architectural Decisions:
 * 1. Dual Engine Support:
 *    - Horizon REST API: High-throughput ledger queries, account balances, and AMM liquidity pool statistics.
 *    - Soroban JSON-RPC: WASM smart contract simulation, transaction assembly, footprint generation, and state polling.
 * 
 * 2. Base Reserve Protection Guard:
 *    - On Stellar, every account requires a base reserve:
 *      Minimum Reserve = (2 + subentry_count) * 0.5 XLM
 *    - To prevent `tx_insufficient_balance` errors during contract deposits, the frontend
 *      automatically enforces spendable balances = (native_balance - minimum_reserve - 0.1 XLM gas buffer).
 * 
 * 3. SEP-41 / SAC Token Standard:
 *    - Classic Stellar assets (XLM, USDC, AQUA) are bridged to Soroban smart contracts via
 *      the Stellar Asset Contract (SAC) layer.
 * 
 * @see https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance
 * @see https://developers.stellar.org/docs/tokens/stellar-asset-contract
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { VaultPool } from '../types';

export const STELLAR_CONFIG = {
  network: (import.meta.env.VITE_STELLAR_NETWORK as string) || 'testnet',
  networkPassphrase: (import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE as string) || StellarSdk.Networks.TESTNET,
  horizonUrl: (import.meta.env.VITE_HORIZON_URL as string) || 'https://horizon-testnet.stellar.org',
  rpcUrl: (import.meta.env.VITE_SOROBAN_RPC_URL as string) || 'https://soroban-testnet.stellar.org',
  friendbotUrl: (import.meta.env.VITE_FRIENDBOT_URL as string) || 'https://friendbot.stellar.org',
  explorerBaseUrl: (import.meta.env.VITE_EXPLORER_BASE_URL as string) || 'https://stellar.expert/explorer/testnet',
  
  // Real Deployed YieldVault Soroban Contract ID on Stellar Testnet
  contractId: (import.meta.env.VITE_CONTRACT_ID as string) || 'CDKV6FUDD53DMLVJTDB2POXG4RNIYR5ZRPJH3VEOUI2CRNJY7CBQZB2N',

  
  // Stellar Reserve Constants (Protocol 20+)
  baseReservePerEntry: 0.5, // 0.5 XLM per active trustline / signers / data subentry
  minAccountReserve: 1.0,   // Base account reserve: 2 base reserves = 1.0 XLM
  gasSafetyBuffer: 0.1,     // 0.1 XLM reserved for fee bump / contract invocation gas
};

/**
 * Singleton Horizon Server instance for account state and ledger streaming.
 */
export const horizonServer = new StellarSdk.Horizon.Server(STELLAR_CONFIG.horizonUrl);

/**
 * Singleton Soroban RPC Server instance for contract simulation & footprint preparation.
 */
export const rpcServer = new StellarSdk.rpc.Server(STELLAR_CONFIG.rpcUrl);

/**
 * Testnet Tokens mapped to their canonical Stellar Asset Contracts (SAC).
 */
export const TESTNET_TOKENS = {
  XLM: {
    symbol: 'XLM',
    name: 'Stellar Lumens',
    decimals: 7,
    isNative: true,
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    icon: '/images/tokens/xlm.svg',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 7,
    isNative: false,
    issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    contractId: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIPWNL2PBJKS2CGMN',
    icon: '/images/tokens/usdc.svg',
  },
  AQUA: {
    symbol: 'AQUA',
    name: 'Aquarius Token',
    decimals: 7,
    isNative: false,
    issuer: 'GBNZILSTVQZ4R7IKDGDGGCGY2OK2KVGVI65OKKNEISJ74OXOGVU4DEXA',
    contractId: 'CA3D5KRYMCMIO7WXRX2WNTVXMQHIC7NQNNZTNFIUGL7YBM2W7XOJ4GLU',
    icon: '/images/tokens/aqua.svg',
  },
};

/**
 * Initial Vault Pools configurations harvested from Stellar DEX AMM Pools.
 */
export const INITIAL_VAULT_POOLS: VaultPool[] = [
  {
    id: 'XLM_USDC',
    name: 'XLM / USDC Auto-Compounding Vault',
    assetA: {
      symbol: 'XLM',
      name: 'Stellar Lumens',
      icon: 'XLM',
      contractId: TESTNET_TOKENS.XLM.contractId,
    },
    assetB: {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: 'USDC',
      contractId: TESTNET_TOKENS.USDC.contractId,
    },
    underlyingToken: TESTNET_TOKENS.XLM.contractId,
    baseApy: 14.5,
    boostApy: 5.3,
    totalApy: 19.8,
    tvlUsd: 142850.00,
    totalDeposits: 142850,
    totalShares: 135200,
    stakersCount: 48,
    dailyFeeVolumeUsd: 1845.20,
    strategyDescription: 'Automated 0.3% DEX AMM trading fee harvest with continuous yield reinvestment via Soroban smart contracts.',
    riskLevel: 'Conservative',
    liquidityPoolId: '6b6c4b22c2aa950450a8bb7d228f413d33f7c9e05d045dcb42510b6540c498ba',
  },
  {
    id: 'XLM_AQUA',
    name: 'XLM / AQUA Liquidity Boost Vault',
    assetA: {
      symbol: 'XLM',
      name: 'Stellar Lumens',
      icon: 'XLM',
      contractId: TESTNET_TOKENS.XLM.contractId,
    },
    assetB: {
      symbol: 'AQUA',
      name: 'Aquarius Token',
      icon: 'AQUA',
      contractId: TESTNET_TOKENS.AQUA.contractId,
    },
    underlyingToken: TESTNET_TOKENS.XLM.contractId,
    baseApy: 22.5,
    boostApy: 9.3,
    totalApy: 31.8,
    tvlUsd: 89400.00,
    totalDeposits: 89400,
    totalShares: 78200,
    stakersCount: 31,
    dailyFeeVolumeUsd: 2190.50,
    strategyDescription: 'High-velocity liquidity arbitrage & automated liquidity incentive multiplier on Stellar DEX orderbook.',
    riskLevel: 'Moderate',
    liquidityPoolId: '9fa14e7a829f03120199d3e8b0a944815a15321f074eb625078a9c2111b7165c',
  },
  {
    id: 'USDC_VAULT',
    name: 'USDC Stable Yield Harvester',
    assetA: {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: 'USDC',
      contractId: TESTNET_TOKENS.USDC.contractId,
    },
    assetB: {
      symbol: 'USD',
      name: 'Dollar Stable',
      icon: 'USD',
      contractId: TESTNET_TOKENS.USDC.contractId,
    },
    underlyingToken: TESTNET_TOKENS.XLM.contractId,
    baseApy: 9.4,
    boostApy: 3.1,
    totalApy: 12.5,
    tvlUsd: 210500.00,
    totalDeposits: 210500,
    totalShares: 201100,
    stakersCount: 64,
    dailyFeeVolumeUsd: 1120.80,
    strategyDescription: 'Delta-neutral stablecoin yield optimizer harvesting cross-asset path payment spreads and DEX market maker fees.',
    riskLevel: 'Conservative',
    liquidityPoolId: '47dcb1098bb3621a2d59265f04128f6412f10b07a192801456209b552391081a',
  },
];
