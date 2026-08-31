/**
 * ==============================================================================
 * Lumex Protocol — Freighter Wallet Integration Hook
 * ==============================================================================
 * 
 * Provides production integration with Freighter Browser Extension.
 * Adheres strictly to Zero-Mock principles:
 * - On connection: Queries live native and SAC token balances from Horizon.
 * - Enforces Stellar base reserve calculation: (2 + subentries) * 0.5 XLM + 0.1 XLM safety buffer.
 * - On disconnect: Purges all addresses and balances (no phantom balances).
 * 
 * @see https://developers.stellar.org/docs/tools/developer-tools/wallets/freighter
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
  requestAccess as freighterRequestAccess,
  signTransaction as freighterSignTransaction,
  getNetwork as freighterGetNetwork,
} from '@stellar/freighter-api';
import { STELLAR_CONFIG, horizonServer } from '../config/stellar';
import { analytics } from '../utils/analytics';
import { errorTracker } from '../utils/errorTracking';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  xlmBalance: number;
  spendableXlmBalance: number;
  usdcBalance: number;
  aquaBalance: number;
  subentryCount: number;
  isFreighterInstalled: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFreighter() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: null,
    xlmBalance: 0,
    spendableXlmBalance: 0,
    usdcBalance: 0,
    aquaBalance: 0,
    subentryCount: 0,
    isFreighterInstalled: false,
    isLoading: true,
    error: null,
  });

  /**
   * Queries real-time on-chain balances from Horizon testnet server.
   */
  const fetchLiveBalances = useCallback(async (pubKey: string) => {
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

      // Base Reserve calculation: (2 + subentries) * 0.5 XLM
      const baseReserve = (2 + subentries) * STELLAR_CONFIG.baseReservePerEntry;
      const spendable = Math.max(0, xlm - baseReserve - STELLAR_CONFIG.gasSafetyBuffer);

      setWallet((prev) => ({
        ...prev,
        xlmBalance: xlm,
        spendableXlmBalance: spendable,
        usdcBalance: usdc,
        aquaBalance: aqua,
        subentryCount: subentries,
        error: null,
      }));
    } catch (err: any) {
      console.warn('[Freighter] Account not yet funded or not found on testnet:', err.message);
      setWallet((prev) => ({
        ...prev,
        xlmBalance: 0,
        spendableXlmBalance: 0,
        usdcBalance: 0,
        aquaBalance: 0,
        subentryCount: 0,
      }));
    }
  }, []);

  /**
   * Checks initial extension presence without triggering unwanted user popups.
   */
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const connectedRes = await freighterIsConnected();
        const installed = !connectedRes.error && connectedRes.isConnected;

        if (!isMounted) return;

        if (installed) {
          const addrRes = await freighterGetAddress();
          if (!addrRes.error && addrRes.address && addrRes.address.length === 56) {
            const netRes = await freighterGetNetwork();
            setWallet((prev) => ({
              ...prev,
              isConnected: true,
              address: addrRes.address,
              network: netRes.network || 'TESTNET',
              isFreighterInstalled: true,
              isLoading: false,
            }));
            fetchLiveBalances(addrRes.address);
            return;
          }
        }

        setWallet((prev) => ({
          ...prev,
          isFreighterInstalled: installed,
          isLoading: false,
        }));
      } catch (err: any) {
        if (isMounted) {
          setWallet((prev) => ({ ...prev, isLoading: false, isFreighterInstalled: false }));
        }
      }
    }

    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [fetchLiveBalances]);

  /**
   * Explicit user connect action with permission request.
   */
  const connectWallet = useCallback(async () => {
    setWallet((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const connectedRes = await freighterIsConnected();
      if (connectedRes.error || !connectedRes.isConnected) {
        throw new Error('Freighter extension not found. Please install Freighter from freighter.app or use 1-Click Guest Testnet Mode.');
      }

      const accessRes = await freighterRequestAccess();
      if (accessRes.error || !accessRes.address) {
        throw new Error(accessRes.error?.message || 'Wallet connection access was denied by user.');
      }

      const netRes = await freighterGetNetwork();

      setWallet((prev) => ({
        ...prev,
        isConnected: true,
        address: accessRes.address,
        network: netRes.network || 'TESTNET',
        isLoading: false,
      }));

      analytics.track('wallet_connected', { walletType: 'freighter', address: accessRes.address });
      await fetchLiveBalances(accessRes.address);
      return accessRes.address;
    } catch (err: any) {
      const tracked = errorTracker.log(err);
      setWallet((prev) => ({
        ...prev,
        isLoading: false,
        error: tracked.message,
      }));
      throw err;
    }
  }, [fetchLiveBalances]);

  /**
   * Disconnects Freighter wallet and purges all holdings.
   */
  const disconnectWallet = useCallback(() => {
    analytics.track('wallet_disconnected', { walletType: 'freighter', address: wallet.address });
    setWallet({
      isConnected: false,
      address: null,
      network: null,
      xlmBalance: 0,
      spendableXlmBalance: 0,
      usdcBalance: 0,
      aquaBalance: 0,
      subentryCount: 0,
      isFreighterInstalled: wallet.isFreighterInstalled,
      isLoading: false,
      error: null,
    });
  }, [wallet.isFreighterInstalled, wallet.address]);

  /**
   * Signs XDR transaction payload via Freighter.
   */
  const signTx = useCallback(
    async (xdr: string) => {
      if (!wallet.isConnected) throw new Error('Wallet not connected');
      const { signedTxXdr, error } = await freighterSignTransaction(xdr, {
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      });
      if (error) {
        const tracked = errorTracker.log(error);
        throw new Error(tracked.message || 'User rejected transaction signature');
      }
      return signedTxXdr;
    },
    [wallet.isConnected]
  );

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    signTx,
    refreshBalances: () => wallet.address && fetchLiveBalances(wallet.address),
  };
}
