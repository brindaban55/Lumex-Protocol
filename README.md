# Lumex Protocol - Automated Stellar Yield Optimizer & Vault Infrastructure

Institutional-grade, non-custodial automated yield optimization protocol built natively on Stellar and Soroban.

## Overview
Lumex leverages Stellar's native Automated Market Maker (AMM) DEX liquidity pools, ultra-low transaction fees ($0.00001), and sub-second settlement to execute dynamic yield optimization, decentralized fee compounding, and multi-asset vault management.

## Key Features
- **Auto-Compounding Soroban Vaults**: Automated reinvestment of Stellar AMM 0.3% liquidity pool fees to maximize staker APYs.
- **Dynamic Horizon Telemetry**: Live querying of Stellar DEX liquidity pools (`/liquidity_pools`), reserve ratios, 24h volumes, and real-time APY calculation.
- **Decentralized Keeper Network**: 1-click keeper harvest terminal with incentive bounties for decentralized yield compounding.
- **Dual Wallet Architecture**: Support for Freighter Wallet and 1-Click Funded Testnet Guest Accounts.
- **Safety First**: Non-custodial instant emergency exit hatch, storage TTL management, and base reserve protection.
- **Verifiable Proof of Usage**: Live on-chain telemetry with 10+ real testnet staker interactions and verifiable transaction hashes on StellarExpert.

## Architecture
- **Smart Contracts**: Soroban (`soroban-sdk` v27, Rust)
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, `@stellar/stellar-sdk`
- **Network**: Stellar Testnet
