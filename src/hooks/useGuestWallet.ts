/**
 * ==============================================================================
 * Lumex Protocol — 1-Click Guest Testnet Keypair Hook
 * ==============================================================================
 * 
 * Provides an instantaneous, zero-install testing flow for evaluators and users:
 * 1. Generates a fresh cryptographic Ed25519 keypair in memory.
 * 2. Invokes Stellar Testnet Friendbot to fund the account with 10,000 testnet XLM.
 * 3. Signs transactions locally via `StellarSdk.Keypair.sign()` without browser extensions.
 * 4. Persists secret key in browser `sessionStorage` for seamless page reloads.
 */

import { useState, useEffect, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, horizonServer } from '../config/stellar';
import { analytics } from '../utils/analytics';
import { errorTracker } from '../utils/errorTracking';

const GUEST_SECRET_KEY_STORAGE = 'lumex_guest_secret_key';

export interface GuestWalletState {
  isGuestActive: boolean;
  publicKey: string | null;
  secretKey: string | null;
  xlmBalance: number;
  spendableXlmBalance: number;
  usdcBalance: number;
  aquaBalance: number;
  isFunding: boolean;
  error: string | null;
}

export function useGuestWallet() {
  const [guestState, setGuestState] = useState<GuestWalletState>({
    isGuestActive: false,
    publicKey: null,
    secretKey: null,
    xlmBalance: 0,
    spendableXlmBalance: 0,
    usdcBalance: 0,
    aquaBalance: 0,
    isFunding: false,
    error: null,
  });

  const fetchGuestBalances = useCallback(async (pubKey: string) => {
    try {
      const account = await horizonServer.loadAccount(pubKey);
      let xlm = 0;
      let usdc = 0;
      let aqua = 0;
      const subentries = account.subentry_count || 0;

      for (const balance of account.balances) {
        if (balance.asset_type === 'native') {
          xlm = parseFloat(balance.balance);
        } else if ('asset_code' in balance && balance.asset_code === 'USDC') {
          usdc = parseFloat(balance.balance);
        } else if ('asset_code' in balance && balance.asset_code === 'AQUA') {
          aqua = parseFloat(balance.balance);
        }
      }

      const baseReserve = (2 + subentries) * STELLAR_CONFIG.baseReservePerEntry;
      const spendable = Math.max(0, xlm - baseReserve - STELLAR_CONFIG.gasSafetyBuffer);

      setGuestState((prev) => ({
        ...prev,
        xlmBalance: xlm,
        spendableXlmBalance: spendable,
        usdcBalance: usdc,
        aquaBalance: aqua,
        error: null,
      }));
    } catch (err: any) {
      console.warn('[Guest Account] Not yet ingested on ledger:', err.message);
    }
  }, []);

  /**
   * Restores guest wallet from session storage if previously initialized.
   */
  useEffect(() => {
    const savedSecret = sessionStorage.getItem(GUEST_SECRET_KEY_STORAGE);
    if (savedSecret) {
      try {
        const keypair = StellarSdk.Keypair.fromSecret(savedSecret);
        setGuestState((prev) => ({
          ...prev,
          isGuestActive: true,
          publicKey: keypair.publicKey(),
          secretKey: savedSecret,
        }));
        fetchGuestBalances(keypair.publicKey());
      } catch (e) {
        sessionStorage.removeItem(GUEST_SECRET_KEY_STORAGE);
      }
    }
  }, [fetchGuestBalances]);

  /**
   * Generates and funds a brand-new cryptographic testnet keypair via Friendbot.
   */
  const createAndFundGuest = useCallback(async () => {
    setGuestState((prev) => ({ ...prev, isFunding: true, error: null }));
    try {
      const keypair = StellarSdk.Keypair.random();
      const pubKey = keypair.publicKey();
      const secret = keypair.secret();

      // Call Friendbot to fund 10,000 testnet XLM
      const friendbotRes = await fetch(`${STELLAR_CONFIG.friendbotUrl}?addr=${pubKey}`);
      if (!friendbotRes.ok) {
        throw new Error('Testnet Friendbot funding request failed. Please retry.');
      }

      sessionStorage.setItem(GUEST_SECRET_KEY_STORAGE, secret);

      setGuestState((prev) => ({
        ...prev,
        isGuestActive: true,
        publicKey: pubKey,
        secretKey: secret,
        isFunding: false,
      }));

      analytics.track('guest_wallet_funded', { address: pubKey });

      // Allow 1.5s for ledger ingestion before querying balances
      setTimeout(() => {
        fetchGuestBalances(pubKey);
      }, 1500);

      return pubKey;
    } catch (err: any) {
      const tracked = errorTracker.log(err);
      setGuestState((prev) => ({
        ...prev,
        isFunding: false,
        error: tracked.message,
      }));
      throw new Error(tracked.message);
    }
  }, [fetchGuestBalances]);

  /**
   * Signs XDR transaction payload locally using the memory keypair.
   */
  const signGuestTx = useCallback(
    async (xdr: string) => {
      if (!guestState.secretKey) throw new Error('No active guest secret key found');
      const keypair = StellarSdk.Keypair.fromSecret(guestState.secretKey);
      const tx = StellarSdk.TransactionBuilder.fromXDR(xdr, STELLAR_CONFIG.networkPassphrase);
      tx.sign(keypair);
      return tx.toXDR();
    },
    [guestState.secretKey]
  );

  /**
   * Purges guest keypair from session.
   */
  const clearGuest = useCallback(() => {
    if (guestState.publicKey) {
      analytics.track('wallet_disconnected', { walletType: 'guest', address: guestState.publicKey });
    }
    sessionStorage.removeItem(GUEST_SECRET_KEY_STORAGE);
    setGuestState({
      isGuestActive: false,
      publicKey: null,
      secretKey: null,
      xlmBalance: 0,
      spendableXlmBalance: 0,
      usdcBalance: 0,
      aquaBalance: 0,
      isFunding: false,
      error: null,
    });
  }, [guestState.publicKey]);

  return {
    guestState,
    createAndFundGuest,
    clearGuest,
    signGuestTx,
    refreshGuestBalances: () => guestState.publicKey && fetchGuestBalances(guestState.publicKey),
  };
}
