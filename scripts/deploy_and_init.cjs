const fs = require('fs');
const path = require('path');
const StellarSdk = require('@stellar/stellar-sdk');

async function deployAndInit() {
  console.log('🚀 Deploying & Initializing YieldVault Soroban Contract on Stellar Testnet...');
  
  const rpcUrl = 'https://soroban-testnet.stellar.org';
  const horizonUrl = 'https://horizon-testnet.stellar.org';
  const networkPassphrase = StellarSdk.Networks.TESTNET;
  const server = new StellarSdk.rpc.Server(rpcUrl);
  const horizon = new StellarSdk.Horizon.Server(horizonUrl);

  // 1. Generate / Fund Deployer Keypair via Friendbot
  const keypair = StellarSdk.Keypair.random();
  console.log('🔑 Deployer / Admin Public Key:', keypair.publicKey());
  
  console.log('💧 Funding admin account via Friendbot...');
  const friendbotRes = await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
  if (!friendbotRes.ok) {
    throw new Error('Friendbot funding failed: ' + await friendbotRes.text());
  }
  console.log('✅ Admin account funded with 10,000 testnet XLM!');

  // Wait 4s for ledger ingestion
  await new Promise((r) => setTimeout(r, 4000));
  let account = await server.getAccount(keypair.publicKey());

  // 2. Read WASM file
  const wasmPath = path.join(__dirname, '../contracts/yield_vault/target/wasm32v1-none/release/yield_vault.wasm');
  const wasmBytes = fs.readFileSync(wasmPath);
  const wasmHash = StellarSdk.hash(wasmBytes);
  console.log(`📦 Loaded WASM binary: ${wasmBytes.length} bytes, SHA-256 Hash: ${wasmHash.toString('hex')}`);

  // Helper to submit transaction via RPC simulation & wait via Horizon
  async function submitTx(builderOp) {
    account = await server.getAccount(keypair.publicKey());
    let tx = new StellarSdk.TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase,
    })
      .addOperation(builderOp)
      .setTimeout(60)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(sim)) {
      throw new Error('Simulation failed: ' + JSON.stringify(sim.error));
    }

    tx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
    tx.sign(keypair);

    const sendRes = await server.sendTransaction(tx);
    if (sendRes.status === 'ERROR') {
      throw new Error('Send TX failed: ' + JSON.stringify(sendRes.errorResult));
    }
    const hash = sendRes.hash;
    console.log(`⏳ TX submitted (${hash.slice(0, 10)}...), waiting on Horizon confirmation...`);

    // Poll Horizon
    let confirmed = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const txRecord = await horizon.transactions().transaction(hash).call();
        if (txRecord.successful) {
          console.log(`✅ TX Confirmed on Ledger #${txRecord.ledger_attr}!`);
          confirmed = true;
          return { sim, hash, txRecord };
        }
      } catch (e) {
        // Still pending
      }
    }
    if (!confirmed) throw new Error('Transaction confirmation timed out for ' + hash);
  }

  // 3. Upload WASM
  console.log('\n--- Step 1: Upload WASM Bytecode ---');
  const uploadOp = StellarSdk.Operation.uploadContractWasm({ wasm: wasmBytes });
  await submitTx(uploadOp);
  console.log('✅ WASM installed on Testnet!');

  // 4. Create Contract Instance
  console.log('\n--- Step 2: Deploy Contract Instance ---');
  const createOp = StellarSdk.Operation.createCustomContract({
    address: StellarSdk.Address.fromString(keypair.publicKey()),
    wasmHash: wasmHash,
  });
  const { sim: createSim } = await submitTx(createOp);
  const contractId = StellarSdk.Address.fromScVal(createSim.result.retval).toString();
  console.log(`🎉 CONTRACT CREATED: ${contractId}`);


  // 5. Initialize Contract
  console.log('\n--- Step 3: Initialize Governance Admin ---');
  const contract = new StellarSdk.Contract(contractId);
  const adminAddressScVal = StellarSdk.Address.fromString(keypair.publicKey()).toScVal();
  
  const initOp = contract.call('initialize', adminAddressScVal);
  await submitTx(initOp);
  console.log('✅ Contract Initialized with Admin!');

  // 6. Initialize Pool (XLM_USDC)
  console.log('\n--- Step 4: Register Pool XLM_USDC (19.8% APY) ---');
  const poolIdScVal = StellarSdk.xdr.ScVal.scvSymbol('XLM_USDC');
  // Native SAC token address for XLM on testnet: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
  const xlmSacAddress = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
  const tokenScVal = StellarSdk.Address.fromString(xlmSacAddress).toScVal();
  const apyScVal = StellarSdk.xdr.ScVal.scvU32(1980); // 19.8% in bps

  const initPoolOp = contract.call(
    'initialize_pool',
    adminAddressScVal,
    poolIdScVal,
    tokenScVal,
    apyScVal
  );
  await submitTx(initPoolOp);
  console.log('✅ XLM_USDC Strategy Pool Registered!');

  console.log('\n======================================================');
  console.log('🎊 ALL STEPS COMPLETED SUCCESSFULLY! 🎊');
  console.log('📜 CONTRACT ID:', contractId);
  console.log('🔑 ADMIN PUBLIC KEY:', keypair.publicKey());
  console.log('🔐 ADMIN SECRET KEY:', keypair.secret());
  console.log('🔗 EXPLORER:', `https://stellar.expert/explorer/testnet/contract/${contractId}`);
  console.log('======================================================\n');

  // Update .env and stellar.ts
  const envContent = `VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_CONTRACT_ID=${contractId}
VITE_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet
VITE_ADMIN_PUBLIC_KEY=${keypair.publicKey()}
VITE_ADMIN_SECRET_KEY=${keypair.secret()}
`;
  fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
  console.log('📝 Updated .env with new Contract ID!');
}

deployAndInit().catch(err => {
  console.error('❌ Error during deployment & init:', err);
  process.exit(1);
});
