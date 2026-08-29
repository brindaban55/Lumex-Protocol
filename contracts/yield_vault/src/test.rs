#![cfg(test)]
use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    token, Address, Env, Symbol,
};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract_address = e.register_stellar_asset_contract_v2(admin.clone()).address();
    (
        contract_address.clone(),
        token::Client::new(e, &contract_address),
        token::StellarAssetClient::new(e, &contract_address),
    )
}

fn setup_vault<'a>(
    env: &Env,
) -> (
    Address,
    YieldVaultContractClient<'a>,
    Address,
    token::Client<'a>,
    token::StellarAssetClient<'a>,
) {
    let admin = Address::generate(env);
    let contract_id = env.register(YieldVaultContract, (&admin,));
    let client = YieldVaultContractClient::new(env, &contract_id);

    let (token_addr, token_client, token_admin_client) = create_token_contract(env, &admin);

    // Initialize XLM_USDC pool with 14.5% APY (1450 bps)
    let pool_id = symbol_short!("XLM_USDC");
    client.initialize_pool(&admin, &pool_id, &token_addr, &1450);

    (admin, client, token_addr, token_client, token_admin_client)
}

#[test]
fn test_deposit_and_shares_issuance() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, client, _token_addr, _token_client, token_admin_client) = setup_vault(&env);
    let user1 = Address::generate(&env);
    let pool_id = symbol_short!("XLM_USDC");

    // Mint 1,000 tokens (1000 * 10^7 stroops)
    let deposit_amount: i128 = 1_000_0000000;
    token_admin_client.mint(&user1, &deposit_amount);

    // First depositor gets 1:1 shares
    let minted_shares = client.deposit(&user1, &pool_id, &deposit_amount);
    assert_eq!(minted_shares, deposit_amount);

    let position = client.get_user_position(&user1, &pool_id).unwrap();
    assert_eq!(position.deposited_amount, deposit_amount);
    assert_eq!(position.shares, deposit_amount);

    let vault_info = client.get_vault_info(&pool_id);
    assert_eq!(vault_info.total_deposits, deposit_amount);
    assert_eq!(vault_info.total_shares, deposit_amount);
    assert_eq!(vault_info.total_stakers, 1);
}

#[test]
fn test_compound_yield_increases_share_price() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, client, _token_addr, _token_client, token_admin_client) = setup_vault(&env);
    let user1 = Address::generate(&env);
    let keeper = Address::generate(&env);
    let pool_id = symbol_short!("XLM_USDC");

    let deposit_amount: i128 = 10_000_0000000; // 10,000 tokens
    token_admin_client.mint(&user1, &deposit_amount);
    client.deposit(&user1, &pool_id, &deposit_amount);

    // Fast forward ledger timestamp by 30 days (2,592,000 seconds)
    let current_time = env.ledger().timestamp();
    env.ledger().set_timestamp(current_time + 2_592_000);

    let harvested_yield = client.compound_yield(&keeper, &pool_id);
    assert!(harvested_yield > 0);

    let vault_info = client.get_vault_info(&pool_id);
    assert!(vault_info.accumulated_yield > 0);
}

#[test]
fn test_withdraw_principal_and_yield() {
    let env = Env::default();
    env.mock_all_auths();

    let (admin, client, _token_addr, token_client, token_admin_client) = setup_vault(&env);
    let user1 = Address::generate(&env);
    let keeper = Address::generate(&env);
    let pool_id = symbol_short!("XLM_USDC");

    let deposit_amount: i128 = 5_000_0000000;
    token_admin_client.mint(&user1, &deposit_amount);
    let shares = client.deposit(&user1, &pool_id, &deposit_amount);

    // Fast forward time and compound
    let current_time = env.ledger().timestamp();
    env.ledger().set_timestamp(current_time + 30 * 86400);
    let harvested = client.compound_yield(&keeper, &pool_id);

    // Mint extra tokens to contract to cover the accrued yield payout
    token_admin_client.mint(&client.address, &harvested);

    // Withdraw full shares
    let payout = client.withdraw(&user1, &pool_id, &shares);
    assert!(payout >= deposit_amount);
    assert_eq!(token_client.balance(&user1), payout);

    let position = client.get_user_position(&user1, &pool_id).unwrap();
    assert_eq!(position.shares, 0);
    assert_eq!(position.deposited_amount, 0);
}

#[test]
fn test_emergency_withdraw() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, client, _token_addr, token_client, token_admin_client) = setup_vault(&env);
    let user1 = Address::generate(&env);
    let pool_id = symbol_short!("XLM_USDC");

    let deposit_amount: i128 = 2_500_0000000;
    token_admin_client.mint(&user1, &deposit_amount);
    client.deposit(&user1, &pool_id, &deposit_amount);

    // Trigger emergency exit
    let returned = client.emergency_withdraw(&user1, &pool_id);
    assert_eq!(returned, deposit_amount);
    assert_eq!(token_client.balance(&user1), deposit_amount);

    let vault_info = client.get_vault_info(&pool_id);
    assert_eq!(vault_info.total_deposits, 0);
    assert_eq!(vault_info.total_shares, 0);
    assert_eq!(vault_info.total_stakers, 0);
}

#[test]
fn test_unauthorized_pool_init_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, client, token_addr, _token_client, _token_admin_client) = setup_vault(&env);
    let attacker = Address::generate(&env);
    let fake_pool = symbol_short!("ATTACK");

    let res = client.try_initialize_pool(&attacker, &fake_pool, &token_addr, &5000);
    assert!(res.is_err());
}

#[test]
fn test_zero_amount_deposit_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, client, _token_addr, _token_client, _token_admin_client) = setup_vault(&env);
    let user1 = Address::generate(&env);
    let pool_id = symbol_short!("XLM_USDC");

    let res = client.try_deposit(&user1, &pool_id, &0);
    assert!(res.is_err());
}
