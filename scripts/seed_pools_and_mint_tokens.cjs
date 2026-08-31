const StellarSdk = require('@stellar/stellar-sdk');

async function seedPools() {
  console.log('Starting Testnet Asset Issuance and Pool Liquidity Seeding...');
  
  const horizonUrl = 'https://horizon-testnet.stellar.org';
  const networkPassphrase = StellarSdk.Networks.TESTNET;
  const horizon = new StellarSdk.Horizon.Server(horizonUrl);

  const adminKey = StellarSdk.Keypair.fromSecret('SDCIPLIVMDV25SYNGCW64AMRKVZGU4G77337BUSATABXHYK3XOI7JT2G');
  console.log('Vault Admin Account:', adminKey.publicKey());

  // 1. Create and Fund a Dedicated Testnet Token Issuer
  const issuerKey = StellarSdk.Keypair.random();
  console.log('New Token Issuer Public Key:', issuerKey.publicKey());
  
  console.log('Funding Issuer via Friendbot...');
  await fetch(`https://friendbot.stellar.org?addr=${issuerKey.publicKey()}`);
  await new Promise(r => setTimeout(r, 4000));
  console.log('Issuer account funded with testnet XLM.');

  // 2. Define Assets
  const usdcAsset = new StellarSdk.Asset('USDC', issuerKey.publicKey());
  const aquaAsset = new StellarSdk.Asset('AQUA', issuerKey.publicKey());

  // 3. Establish Trustlines on Admin Account
  console.log('Setting up trustlines on Admin account...');
  let adminAccount = await horizon.loadAccount(adminKey.publicKey());
  let trustTx = new StellarSdk.TransactionBuilder(adminAccount, {
    fee: '200',
    networkPassphrase,
  })
    .addOperation(StellarSdk.Operation.changeTrust({ asset: usdcAsset, limit: '10000000' }))
    .addOperation(StellarSdk.Operation.changeTrust({ asset: aquaAsset, limit: '10000000' }))
    .setTimeout(60)
    .build();

  trustTx.sign(adminKey);
  await horizon.submitTransaction(trustTx);
  console.log('Admin trustlines established for USDC and AQUA.');

  // 4. Mint / Transfer Initial Testnet Tokens from Issuer to Admin
  console.log('Minting 50,000 USDC and 500,000 AQUA into Protocol Liquidity Pool...');
  const issuerAccount = await horizon.loadAccount(issuerKey.publicKey());
  let mintTx = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: '200',
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: adminKey.publicKey(),
        asset: usdcAsset,
        amount: '50000.0000000',
      })
    )
    .addOperation(
      StellarSdk.Operation.payment({
        destination: adminKey.publicKey(),
        asset: aquaAsset,
        amount: '500000.0000000',
      })
    )
    .setTimeout(60)
    .build();

  mintTx.sign(issuerKey);
  await horizon.submitTransaction(mintTx);
  console.log('Successfully minted and seeded 50,000 USDC and 500,000 AQUA into the protocol!');

  // Check updated balances
  adminAccount = await horizon.loadAccount(adminKey.publicKey());
  console.log('\n--- Protocol Pool Reserves on Testnet ---');
  for (const b of adminAccount.balances) {
    if (b.asset_type === 'native') {
      console.log(`XLM Reserve: ${b.balance} XLM`);
    } else {
      console.log(`${b.asset_code} Reserve: ${b.balance} (Issuer: ${b.asset_issuer})`);
    }
  }

  return {
    issuerPublicKey: issuerKey.publicKey(),
    issuerSecretKey: issuerKey.secret(),
    usdcAsset,
    aquaAsset,
  };
}

seedPools().catch(console.error);
