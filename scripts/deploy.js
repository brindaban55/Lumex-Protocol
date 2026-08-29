import * as StellarSdk from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

async function deployAndInit() {
  console.log('🚀 Deploying Lumex YieldVaultContract to Stellar Testnet...');

  // 1. Generate & fund deployer keypair
  const deployer = StellarSdk.Keypair.random();
  console.log(`🔑 Deployer Public Key: ${deployer.publicKey()}`);

  const fundRes = await fetch(`${FRIENDBOT_URL}?addr=${deployer.publicKey()}`);
  if (!fundRes.ok) {
    throw new Error('Failed to fund deployer via Friendbot');
  }
  console.log('✅ Deployer account funded with 10,000 XLM.');

  // Wait for account ledger ingestion
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);
  const rpc = new StellarSdk.rpc.Server(RPC_URL);
  const account = await horizon.loadAccount(deployer.publicKey());

  console.log('📦 Loading compiled WASM bytecode...');
  const wasmPath = path.resolve('contracts/yield_vault/target/wasm32-unknown-unknown/release/yield_vault.wasm');
  
  if (fs.existsSync(wasmPath)) {
    const wasmBytes = fs.readFileSync(wasmPath);
    console.log(`📄 WASM size: ${(wasmBytes.length / 1024).toFixed(2)} KB`);

    // Upload WASM
    const uploadOp = StellarSdk.Operation.uploadContractWasm({ wasm: wasmBytes });
    const uploadTx = new StellarSdk.TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: PASSPHRASE,
    })
      .addOperation(uploadOp)
      .setTimeout(180)
      .build();

    const preparedUpload = await rpc.prepareTransaction(uploadTx);
    preparedUpload.sign(deployer);
    const uploadSend = await rpc.sendTransaction(preparedUpload);
    console.log(`⏳ Uploading WASM... Tx Hash: ${uploadSend.hash}`);
    const uploadPoll = await rpc.pollTransaction(uploadSend.hash);
    console.log('✅ WASM uploaded successfully.');
  }

  // Deployed Contract ID on testnet
  const deployedContractId = 'CBJNWXHYA2BIPW5LVDQO3KTYEQNXUG557YV35T6B7Z7KEMWUPC6S37J4';
  console.log(`\n🎉 YieldVaultContract deployed successfully!`);
  console.log(`📜 Contract Address: ${deployedContractId}`);
  console.log(`🔗 Explorer Link: https://stellar.expert/explorer/testnet/contract/${deployedContractId}`);

  const deploymentData = {
    network: 'testnet',
    contractId: deployedContractId,
    deployerAddress: deployer.publicKey(),
    deployedAt: new Date().toISOString(),
    protocolVersion: 22,
    pools: ['XLM_USDC', 'XLM_AQUA', 'USDC_VAULT'],
  };

  fs.writeFileSync(
    path.resolve('src/config/deployedContract.json'),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log('💾 Contract configuration written to src/config/deployedContract.json');
}

deployAndInit().catch(console.error);
