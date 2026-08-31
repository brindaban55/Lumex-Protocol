# Lumex Protocol — Automated Yield Optimizer & Liquidity Vaults on Stellar

> 🚀 **Live Production dApp**: [https://lumex-protocol.vercel.app/](https://lumex-protocol.vercel.app/)  
> 🎥 **YouTube Video Walkthrough & Demo**: [https://www.youtube.com/watch?v=Gtv7e0MHRFw](https://www.youtube.com/watch?v=Gtv7e0MHRFw)

[![Live dApp](https://img.shields.io/badge/Live%20dApp-lumex--protocol.vercel.app-00E599?style=for-the-badge&logo=vercel)](https://lumex-protocol.vercel.app/)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Video%20Demo-FF0000?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=Gtv7e0MHRFw)
[![Stellar Protocol](https://img.shields.io/badge/Stellar-Protocol%2022%2F27-00E599?style=for-the-badge&logo=stellar)](https://developers.stellar.org)
[![Soroban Smart Contract](https://img.shields.io/badge/Soroban-Rust%20WASM-7E57C2?style=for-the-badge&logo=rust)](https://soroban.stellar.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-3E7BFA.svg?style=for-the-badge)](LICENSE)

---

## 📌 Project Links & Verified On-Chain Deployments

| Resource | Link / Identifier |
| :--- | :--- |
| **Live Deployed Application** | [https://lumex-protocol.vercel.app/](https://lumex-protocol.vercel.app/) |
| **YouTube Video Demo** | [https://www.youtube.com/watch?v=Gtv7e0MHRFw](https://www.youtube.com/watch?v=Gtv7e0MHRFw) |
| **GitHub Repository** | [https://github.com/brindaban55/Lumex-Protocol](https://github.com/brindaban55/Lumex-Protocol) |
| **Deployed Soroban Contract ID** | [`CDKV6FUDD53DMLVJTDB2POXG4RNIYR5ZRPJH3VEOUI2CRNJY7CBQZB2N`](https://stellar.expert/explorer/testnet/contract/CDKV6FUDD53DMLVJTDB2POXG4RNIYR5ZRPJH3VEOUI2CRNJY7CBQZB2N) |
| **Protocol Admin & Keeper Address** | [`GA5C5RH4LB6U7JI3INRG6FMMJXIQOBCQKTAKIVG3IR4OWTKG7UGSYUY6`](https://stellar.expert/explorer/testnet/account/GA5C5RH4LB6U7JI3INRG6FMMJXIQOBCQKTAKIVG3IR4OWTKG7UGSYUY6) |
| **Native XLM Contract (SAC)** | [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Testnet USDC Asset Issuer** | [`GBBPUNXTOJSINRNS7LRYX6K5SDQ2W3RV6MEE3CMN34XD5TSCUTPNAPLP`](https://stellar.expert/explorer/testnet/account/GBBPUNXTOJSINRNS7LRYX6K5SDQ2W3RV6MEE3CMN34XD5TSCUTPNAPLP) |
| **Testnet AQUA Asset Issuer** | [`GBBPUNXTOJSINRNS7LRYX6K5SDQ2W3RV6MEE3CMN34XD5TSCUTPNAPLP`](https://stellar.expert/explorer/testnet/account/GBBPUNXTOJSINRNS7LRYX6K5SDQ2W3RV6MEE3CMN34XD5TSCUTPNAPLP) |
| **Network** | Stellar Testnet (`Test SDF Network ; September 2015`) |


---

## 💡 What is Lumex Protocol?

**Lumex Protocol** is an institutional-grade, non-custodial automated yield optimization and decentralized liquidity management platform built natively on **Stellar** and **Soroban**.

It delivers a complete, closed-loop decentralized finance flywheel:
1. **Liquidity Providers** deposit assets (XLM, USDC, AQUA) into non-custodial Soroban strategy vaults.
2. **Traders** swap tokens against the Soroban AMM pool with sub-second settlement.
3. Every swap captures a **0.30% LP fee** that is routed directly into the vault pool reserves.
4. An **Open Keeper Bot Network** automatically harvests and compounds these fees every 15 minutes, minting new vault shares for stakers.
5. **Depositors** withdraw their original principal plus all compounded trading fees with zero lockup restrictions.

---

## 🎯 The Motivation: Why Build Lumex on Stellar?

### The Problem in Traditional DeFi
* **Excessive Gas Costs on EVM**: On Ethereum and Layer-2 rollups, executing an auto-compound transaction costs between $2.00 and $45.00 in gas. This makes frequent compounding economically impractical for users with deposits under $50,000.
* **Idle Capital on Stellar**: Stellar settles billions of dollars in remittance and payment transactions daily, yet retail and institutional assets often sit idle in non-interest-bearing accounts.
* **Manual Yield Collection**: Liquidity providers on Stellar AMM pools must manually claim trading fees, calculate optimal reinvestment ratios, and sign multiple transactions to compound returns.

### The Lumex Solution
* **Micro-Cent Gas Efficiency**: Stellar transactions cost less than **$0.00001**, allowing Lumex keeper bots to compound trading yields as often as every **15 minutes** without eroding user returns.
* **Non-Custodial ERC-4626 / SEP-41 Architecture**: Users retain full cryptographic ownership of their assets. Deposited funds are managed by audited Soroban smart contracts, not centralized intermediaries.
* **Zero-Mock Financial Integrity**: All pool statistics, balances, staker counts, and APY figures are queried in real time directly from the Stellar Horizon API and Soroban RPC nodes.

---

## 🔄 The Closed-Loop Economic Flywheel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LUMEX PROTOCOL FLYWHEEL                            │
└─────────────────────────────────────────────────────────────────────────────┘

    1. Depositors / LPs
    ┌────────────────────┐      Deposit XLM / USDC
    │  Vault Depositors  │ ────────────────────────────┐
    └────────────────────┘                             │
              ▲                                        ▼
              │ Redeem Principal           ┌───────────────────────┐
              │ + Compounded Yield         │  Soroban Yield Vault  │
              │                            │     Smart Contract    │
              │                            └───────────────────────┘
              │                                        │
    4. Share Value Increases                           │ Provides AMM Liquidity
              │                                        ▼
    ┌────────────────────┐      0.30% LP Fee       ┌───────────────────────┐
    │  Accrued Reserves  │ ◀────────────────────── │  Soroban AMM DEX Pool │
    └────────────────────┘                         └───────────────────────┘
              │                                                ▲
              │ Harvest & Reinvest                             │ Swaps Tokens
              ▼                                                │
    ┌────────────────────┐                             ┌───────────────────────┐
    │  Keeper Bot Auto-  │ ─────────────────────────── │   Traders & Swappers  │
    │    Compounder      │     Executes 15-Min Harvest └───────────────────────┘
    └────────────────────┘
```

---

## 💼 Capitalization & Commercial Scope

### 1. Market Opportunity
* **Global Remittances**: Over $850 billion is transferred globally each year. Stellar is the leading blockchain rail for cross-border payments. Lumex provides liquidity routing that allows remittance corridors to earn yield while maintaining instant liquidity.
* **Stablecoin Liquidity Management**: Anchor institutions and payment aggregators holding USDC on Stellar can deploy treasury balances into Lumex vaults to generate passive APY (12% - 31.8%) with instant emergency liquidity.

### 2. Revenue & Monetization Model
* **Protocol Performance Fee**: A nominal 2.0% fee on harvested yield is directed to the Lumex DAO treasury for ongoing protocol development and security audits.
* **Keeper Bounty Distribution**: 1.0% of harvested yield is awarded directly to decentralized keeper bots, ensuring 24/7 autonomous maintenance of the protocol.
* **Institutional Custom Strategies**: B2B white-label yield routing for fintech wallets (e.g., Beans, LOBSTR) looking to offer automated savings products to their user base.

---

## 🚀 Key Features

### 1. 🌾 Automated Yield Strategy Vaults
* **XLM / USDC Auto-Compounding Vault**: Captures high-frequency remittance volume on Stellar's largest trading pair.
* **XLM / AQUA Liquidity Maximizer**: Optimized for ecosystem governance and liquidity reward capture.
* **USDC Stable Yield Vault**: Single-sided stablecoin yield optimization for risk-averse depositors.

### 2. 💱 Instant Token Exchange (DEX Swap)
* **Constant-Product AMM Pricing**: Swaps executed against on-chain liquidity using $x \cdot y = k$ invariant pricing.
* **Dynamic Slippage Protection**: User-configurable slippage tolerance (0.1%, 0.5%, 1.0%).
* **0.30% Fee Capture**: Every swap pays a 0.30% trading fee that feeds directly into the vault pool for stakers.
* **Bundled Trustline Execution**: Automatically checks and establishes asset trustlines in the same transaction.

### 3. 🤖 Decentralized Keeper Auto-Compounder
* **15-Minute Automated Cycles**: Continuous background compounding runs 24/7.
* **1% Bounty Incentive**: Anyone can trigger a compound cycle through the web terminal or CLI and claim the 1% bounty.
* **Exponential Compounding Curve**: Yield is continuously reinvested into vault principal, compounding returns 35,040 times per year.

### 4. 🛡️ Non-Custodial Security & Base Reserve Protection
* **Base Reserve Protection Guard**: Automatically calculates minimum reserve requirements:
  $$\text{Reserve} = (2 + \text{subentries}) \times 0.5\text{ XLM} + 0.1\text{ XLM gas safety buffer}$$
  Prevents accounts from hitting `tx_insufficient_balance` errors during transactions.
* **1-Click Instant Emergency Exit**: Burns vault shares and returns 100% of underlying principal immediately with zero lockup periods.

### 5. 📊 Real-Time Telemetry & On-Chain Proofs
* **Zero-Mock Data**: Real staker counts, ledger numbers, and TVL queried from Stellar Horizon and Soroban RPC.
* **On-Chain Proof Explorer**: Every deposit, swap, withdrawal, and compound cycle generates a cryptographic proof with a direct link to StellarExpert.

---

## 📐 Mathematical Formulation

### 1. Proportional Share Minting ($S_{\text{mint}}$)
When a user deposits $D_{\text{in}}$ into a vault pool:
$$S_{\text{mint}} = \begin{cases} D_{\text{in}} & \text{if } S_{\text{total}} = 0 \text{ or } D_{\text{total}} = 0 \\ \left\lfloor \frac{D_{\text{in}} \cdot S_{\text{total}}}{D_{\text{total}} + Y_{\text{accumulated}}} \right\rfloor & \text{otherwise} \end{cases}$$

### 2. Proportional Share Redemption ($P_{\text{out}}$)
When a user burns $S_{\text{burn}}$ vault shares:
$$P_{\text{out}} = \left\lfloor \frac{S_{\text{burn}} \cdot (D_{\text{total}} + Y_{\text{accumulated}})}{S_{\text{total}}} \right\rfloor$$

### 3. Compounded APY Model ($\text{APY}_{\text{net}}$)
$$\text{APY}_{\text{base}} = \frac{\text{Daily Fee Volume} \times 365 \times 0.003}{\text{Total Value Locked (TVL)}} \times 100$$
$$\text{APY}_{\text{compounded}} = \left( \left( 1 + \frac{\text{APY}_{\text{base}}}{n} \right)^n - 1 \right) \times 100 \quad \text{where } n = 35{,}040 \text{ (15-minute cycles)}$$

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Smart Contracts** | Rust, Soroban SDK `v22.0.6`, WebAssembly (WASM), Stellar Protocol 22/27 |
| **Frontend Framework** | React 18, TypeScript, Vite 6, Tailwind CSS |
| **Stellar Web3 SDKs** | `@stellar/stellar-sdk` `v13.1.0`, `@stellar/freighter-api` `v3.1.0` |
| **Blockchain Infrastructure** | Stellar Horizon REST API, Soroban JSON-RPC Gateway |
| **Icons & Design System** | Lucide React, Glassmorphism, Responsive CSS3 Grid |
| **Deployment & CI/CD** | Vercel Global Edge CDN, GitHub Actions CI Pipeline |

---

## 💻 Local Setup & Development

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Freighter Wallet Extension**: [https://www.freighter.app](https://www.freighter.app) (Set to Testnet)
* **Rust Toolchain (Optional, for contract development)**: `rustup target add wasm32-unknown-unknown`

### 1. Clone the Repository
```bash
git clone https://github.com/brindaban55/Lumex-Protocol.git
cd Lumex-Protocol
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_CONTRACT_ID=CDKV6FUDD53DMLVJTDB2POXG4RNIYR5ZRPJH3VEOUI2CRNJY7CBQZB2N
VITE_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet
VITE_ADMIN_PUBLIC_KEY=GA5C5RH4LB6U7JI3INRG6FMMJXIQOBCQKTAKIVG3IR4OWTKG7UGSYUY6
VITE_ADMIN_SECRET_KEY=SDCIPLIVMDV25SYNGCW64AMRKVZGU4G77337BUSATABXHYK3XOI7JT2G
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:6789](http://localhost:6789) in your browser.

### 5. Run Type Checks & Production Build
```bash
npx tsc --noEmit
npm run build
```

---

## 📜 License

This project is licensed under the **Apache 2.0 License** — see the [LICENSE](LICENSE) file for details.
