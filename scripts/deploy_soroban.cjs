const fs = require('fs');
const path = require('path');
const StellarSdk = require('@stellar/stellar-sdk');

async function deploy() {
  console.log('🚀 Starting Soroban Contract Deployment to Stellar Testnet...');
  
  const rpcUrl = 'https://soroban-testnet.stellar.org';
  const networkPassphrase = StellarSdk.Networks.TESTNET;
  const server = new StellarSdk.rpc.Server(rpcUrl);

  // 1. Generate / Fund Deployer Keypair via Friendbot
  const keypair = StellarSdk.Keypair.random();
  console.log('🔑 Deployer Public Key:', keypair.publicKey());
  
  console.log('💧 Funding deployer account via Friendbot...');
  const friendbotRes = await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
  if (!friendbotRes.ok) {
    throw new Error('Friendbot funding failed: ' + await friendbotRes.text());
  }
  console.log('✅ Deployer account funded with 10,000 testnet XLM!');

  // Wait 3s for ledger ingestion
  await new Promise((r) => setTimeout(r, 3000));
  let account = await server.getAccount(keypair.publicKey());

  // 2. Read WASM file
  const wasmPath = path.join(__dirname, '../contracts/yield_vault/target/wasm32v1-none/release/yield_vault.wasm');
  const wasmBytes = fs.readFileSync(wasmPath);
  console.log(`📦 Loaded WASM binary (wasm32v1-none): ${wasmBytes.length} bytes`);


  // 3. Upload Contract WASM
  console.log('📤 Uploading Contract WASM to Testnet...');
  const uploadOp = StellarSdk.Operation.uploadContractWasm({ wasm: wasmBytes });
  
  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase,
  })
    .addOperation(uploadOp)
    .setTimeout(30)
    .build();

  // Simulate
  const simUpload = await server.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simUpload)) {
    throw new Error('Upload WASM simulation failed: ' + JSON.stringify(simUpload.error));
  }

  tx = StellarSdk.rpc.assembleTransaction(tx, simUpload).build();
  tx.sign(keypair);

  const uploadRes = await server.sendTransaction(tx);
  console.log('⏳ Upload TX submitted:', uploadRes.hash);

  let uploadStatus = await server.getTransaction(uploadRes.hash);
  let pollAttempts = 0;
  while (uploadStatus.status === 'NOT_FOUND' && pollAttempts < 15) {
    await new Promise((r) => setTimeout(r, 1500));
    uploadStatus = await server.getTransaction(uploadRes.hash);
    pollAttempts++;
  }

  if (uploadStatus.status !== 'SUCCESS') {
    throw new Error('Upload WASM failed: ' + JSON.stringify(uploadStatus));
  }
  
  const wasmHash = simUpload.result?.retval?.bytes()?.toString('hex') || StellarSdk.hash(wasmBytes).toString('hex');
  console.log('✅ WASM uploaded successfully! Hash:', wasmHash);

  // 4. Create Contract Instance
  console.log('🏗️ Creating Contract Instance...');
  account = await server.getAccount(keypair.publicKey());
  
  const createOp = StellarSdk.Operation.createCustomContract({
    address: StellarSdk.Address.fromString(keypair.publicKey()),
    wasmHash: Buffer.from(wasmHash, 'hex'),
  });

  let createTx = new StellarSdk.TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase,
  })
    .addOperation(createOp)
    .setTimeout(30)
    .build();

  const simCreate = await server.simulateTransaction(createTx);
  if (StellarSdk.rpc.Api.isSimulationError(simCreate)) {
    throw new Error('Create Contract simulation failed: ' + JSON.stringify(simCreate.error));
  }

  createTx = StellarSdk.rpc.assembleTransaction(createTx, simCreate).build();
  createTx.sign(keypair);

  const createRes = await server.sendTransaction(createTx);
  console.log('⏳ Create Contract TX submitted:', createRes.hash);

  let createStatus = await server.getTransaction(createRes.hash);
  pollAttempts = 0;
  while (createStatus.status === 'NOT_FOUND' && pollAttempts < 15) {
    await new Promise((r) => setTimeout(r, 1500));
    createStatus = await server.getTransaction(createRes.hash);
    pollAttempts++;
  }

  if (createStatus.status !== 'SUCCESS') {
    throw new Error('Create Contract failed: ' + JSON.stringify(createStatus));
  }

  const contractAddress = simCreate.result?.retval?.address()?.toString();
  console.log('🎉 CONTRACT DEPLOYED SUCCESSFULLY!');
  console.log('📜 Contract ID:', contractAddress);
  console.log('🔗 Explorer:', `https://stellar.expert/explorer/testnet/contract/${contractAddress}`);

  return {
    contractId: contractAddress,
    adminPublicKey: keypair.publicKey(),
    adminSecretKey: keypair.secret(),
    wasmHash,
  };
}

deploy().catch(err => {
  console.error('❌ Deployment Error:', err);
  process.exit(1);
});
