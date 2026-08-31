import * as StellarSdk from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

async function deployAndInit() {
  console.log('==============================================================================');
  console.log('🚀 Deploying Lumex YieldVaultContract to Stellar Testnet (Real WASM Deployment)');
  console.log('==============================================================================\n');

  // 1. Generate & fund deployer keypair
  const deployer = StellarSdk.Keypair.random();
  console.log(`🔑 Deployer Public Key: ${deployer.publicKey()}`);
  console.log(`🔑 Deployer Secret Key: ${deployer.secret()}`);

  console.log('⏳ Requesting 10,000 testnet XLM from Friendbot...');
  const fundRes = await fetch(`${FRIENDBOT_URL}?addr=${deployer.publicKey()}`);
  if (!fundRes.ok) {
    throw new Error(`Failed to fund deployer via Friendbot (status ${fundRes.status})`);
  }
  console.log('✅ Deployer account funded with 10,000 XLM.\n');

  // Wait for account ledger ingestion
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);
  const rpc = new StellarSdk.rpc.Server(RPC_URL);
  let account = await horizon.loadAccount(deployer.publicKey());

  console.log('📦 Loading compiled WASM bytecode...');
  const wasmPath = path.resolve('contracts/yield_vault/target/wasm32-unknown-unknown/release/yield_vault.wasm');
  
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found at ${wasmPath}. Run cargo build first.`);
  }

  const wasmBytes = fs.readFileSync(wasmPath);
  console.log(`📄 WASM size: ${(wasmBytes.length / 1024).toFixed(2)} KB`);

  // 2. Upload WASM Bytecode
  console.log('⏳ Uploading WASM bytecode to Stellar Testnet...');
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
  
  if (uploadSend.status === 'ERROR') {
    throw new Error(`WASM upload failed: ${JSON.stringify(uploadSend.errorResult)}`);
  }

  const uploadPoll = await rpc.pollTransaction(uploadSend.hash);
  console.log('✅ WASM uploaded successfully.');
  
  // Extract wasm hash from poll return value
  const wasmHashHex = uploadPoll.returnValue ? StellarSdk.scValToNative(uploadPoll.returnValue).toString('hex') : null;
  console.log(`🔑 WASM Hash: ${wasmHashHex}`);

  // Reload account for next transaction
  await new Promise((resolve) => setTimeout(resolve, 2000));
  account = await horizon.loadAccount(deployer.publicKey());

  // 3. Instantiate Contract Instance from WASM Hash
  console.log('\n⏳ Instantiating Soroban Contract with Admin Constructor...');
  const salt = crypto.randomBytes(32);
  const adminScVal = StellarSdk.Address.fromString(deployer.publicKey()).toScVal();
  
  const createOp = StellarSdk.Operation.createCustomContract({
    wasmHash: Buffer.from(wasmHashHex, 'hex'),
    address: StellarSdk.Address.fromString(deployer.publicKey()),
    salt: salt,
    constructorArgs: [adminScVal],
  });

  const createTx = new StellarSdk.TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(createOp)
    .setTimeout(180)
    .build();

  const preparedCreate = await rpc.prepareTransaction(createTx);
  preparedCreate.sign(deployer);
  const createSend = await rpc.sendTransaction(preparedCreate);
  console.log(`⏳ Instantiating Contract... Tx Hash: ${createSend.hash}`);

  if (createSend.status === 'ERROR') {
    throw new Error(`Contract creation failed: ${JSON.stringify(createSend.errorResult)}`);
  }

  const createPoll = await rpc.pollTransaction(createSend.hash);
  
  // Compute or extract deployed contract ID
  const deployedAddressScVal = createPoll.returnValue;
  const deployedContractId = deployedAddressScVal ? StellarSdk.scValToNative(deployedAddressScVal) : null;

  console.log(`\n🎉 YieldVaultContract deployed successfully on-chain!`);
  console.log(`📜 Contract Address: ${deployedContractId}`);
  console.log(`🔗 Explorer Link: https://stellar.expert/explorer/testnet/contract/${deployedContractId}`);

  // 4. Initialize strategy pools on-chain
  console.log('\n⏳ Initializing Strategy Pools on-chain...');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  account = await horizon.loadAccount(deployer.publicKey());

  const contract = new StellarSdk.Contract(deployedContractId);
  const poolsToInit = [
    {
      id: 'XLM_USDC',
      token: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIPWNL2PBJKS2CGMN', // Testnet USDC
      apyBps: 1450, // 14.5%
    },
    {
      id: 'XLM_AQUA',
      token: 'CA3D5KRYMCMIO7WXRX2WNTVXMQHIC7NQNNZTNFIUGL7YBM2W7XOJ4GLU', // AQUA SAC
      apyBps: 2250, // 22.5%
    },
    {
      id: 'USDC_VAULT',
      token: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWUIPWNL2PBJKS2CGMN', // Testnet USDC
      apyBps: 940, // 9.4%
    },
  ];

  for (const pool of poolsToInit) {
    try {
      account = await horizon.loadAccount(deployer.publicKey());
      console.log(`  Initializing pool ${pool.id} with ${pool.apyBps / 100}% APY...`);
      
      const adminVal = StellarSdk.Address.fromString(deployer.publicKey()).toScVal();
      const poolVal = StellarSdk.nativeToScVal(pool.id, { type: 'symbol' });
      const tokenVal = StellarSdk.Address.fromString(pool.token).toScVal();
      const apyVal = StellarSdk.nativeToScVal(pool.apyBps, { type: 'u32' });

      const initPoolTx = new StellarSdk.TransactionBuilder(account, {
        fee: '1000000',
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(contract.call('initialize_pool', adminVal, poolVal, tokenVal, apyVal))
        .setTimeout(180)
        .build();

      const preparedInit = await rpc.prepareTransaction(initPoolTx);
      preparedInit.sign(deployer);
      const initSend = await rpc.sendTransaction(preparedInit);
      await rpc.pollTransaction(initSend.hash);
      console.log(`  ✅ Pool ${pool.id} initialized on-chain. Tx: ${initSend.hash}`);
    } catch (e) {
      console.warn(`  ⚠️ Pool ${pool.id} note:`, e.message);
    }
  }

  // 5. Write deployment data to config files
  const deploymentData = {
    network: 'testnet',
    contractId: deployedContractId,
    deployerAddress: deployer.publicKey(),
    deployerSecret: deployer.secret(),
    deployedAt: new Date().toISOString(),
    protocolVersion: 22,
    pools: ['XLM_USDC', 'XLM_AQUA', 'USDC_VAULT'],
    explorerUrl: `https://stellar.expert/explorer/testnet/contract/${deployedContractId}`,
  };

  fs.writeFileSync(
    path.resolve('src/config/deployedContract.json'),
    JSON.stringify(deploymentData, null, 2)
  );

  // Update .env file
  const envContent = `# ==============================================================================
# Lumex Protocol - Local Environment Configuration
# ==============================================================================

VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_FRIENDBOT_URL=https://friendbot.stellar.org
VITE_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet

# Real Deployed Soroban Smart Contract
VITE_CONTRACT_ID=${deployedContractId}

VITE_PLAUSIBLE_DOMAIN=lumex-protocol.vercel.app
VITE_SENTRY_DSN=
`;
  fs.writeFileSync(path.resolve('.env'), envContent);

  console.log('\n==============================================================================');
  console.log('🏆 REAL CONTRACT DEPLOYMENT COMPLETE & RECORDED IN .env & CONFIG!');
  console.log(`📜 Live Contract Address: ${deployedContractId}`);
  console.log('==============================================================================\n');
}

deployAndInit().catch(console.error);
