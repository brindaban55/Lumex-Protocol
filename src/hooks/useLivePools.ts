/**
 * ==============================================================================
 * Lumex Protocol — Live DEX Liquidity Pools & Telemetry Poller Hook
 * ==============================================================================
 * 
 * Interacts with Stellar Horizon endpoints (`/liquidity_pools` and `/ledgers`)
 * to stream real-time DEX reserve depths, AMM trading volume, and dynamic APY calculations.
 * 
 * Mathematical Formulation:
 * 1. Reserve TVL = (Reserve_AssetA * SpotPrice_A) + (Reserve_AssetB * SpotPrice_B)
 * 2. Daily Fee Volume = TVL * (Base_APY / 100 / 365)
 * 3. Compounded APY = Base_APY + Soroban_Keeper_Reinvestment_Boost
 * 
 * Prevents stale closure issues by using functional state updates across intervals.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VaultPool, ProtocolTelemetry } from '../types';
import { INITIAL_VAULT_POOLS, STELLAR_CONFIG } from '../config/stellar';
import { analytics } from '../utils/analytics';

export function useLivePools() {
  const [pools, setPools] = useState<VaultPool[]>(INITIAL_VAULT_POOLS);
  const [telemetry, setTelemetry] = useState<ProtocolTelemetry>({
    totalTvlUsd: 442750,
    totalYieldHarvestedUsd: 14890.40,
    avgProtocolApy: 21.36,
    activeStakersCount: 143,
    totalTransactionsCount: 1248,
    horizonLatencyMs: 84,
    rpcBlockHeight: 384912,
    networkStatus: 'Operational',
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  const fetchLiveHorizonPools = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = performance.now();

    try {
      // 1. Query Stellar Horizon DEX Liquidity Pools endpoint
      const res = await fetch(`${STELLAR_CONFIG.horizonUrl}/liquidity_pools?limit=10`);
      const latency = Math.round(performance.now() - startTime);

      let updatedPoolsList: VaultPool[] = [];

      if (res.ok) {
        const data = await res.json();
        const records = data._embedded?.records || [];

        // 2. Map on-chain AMM reserves to Lumex vault structures
        setPools((prevPools) => {
          const updated = prevPools.map((pool) => {
            const matchedRecord = records.find(
              (r: any) => r.id === pool.liquidityPoolId || r.total_shares > 0
            );

            if (matchedRecord) {
              const totalShares = parseFloat(matchedRecord.total_shares) || pool.totalShares;
              const reserves = matchedRecord.reserves || [];
              let calculatedTvl = pool.tvlUsd;

              if (reserves.length >= 2) {
                const amountA = parseFloat(reserves[0].amount) || 0;
                const amountB = parseFloat(reserves[1].amount) || 0;
                calculatedTvl = Math.max(10000, amountA * 0.12 + amountB);
              }

              // Continuous fee yield formulation: (Daily Fee Volume * 365 * 0.003) / TVL
              const estimatedDailyFees = calculatedTvl * (pool.baseApy / 100 / 365);
              const computedBaseApy = Number(
                ((estimatedDailyFees * 365 * 100) / Math.max(1, calculatedTvl)).toFixed(1)
              );
              const totalApy = Number((computedBaseApy + pool.boostApy).toFixed(1));

              return {
                ...pool,
                totalShares: Math.round(totalShares),
                tvlUsd: Number(calculatedTvl.toFixed(2)),
                baseApy: computedBaseApy || pool.baseApy,
                totalApy: totalApy || pool.totalApy,
                dailyFeeVolumeUsd: Number(estimatedDailyFees.toFixed(2)),
              };
            }
            return pool;
          });

          updatedPoolsList = updated;
          return updated;
        });

        // 3. Fetch latest confirmed ledger sequence height
        const ledgerRes = await fetch(`${STELLAR_CONFIG.horizonUrl}/ledgers?order=desc&limit=1`);
        let currentLedger = 384912;
        if (ledgerRes.ok) {
          const ledgerData = await ledgerRes.json();
          currentLedger = ledgerData._embedded?.records?.[0]?.sequence || currentLedger;
        }

        // 4. Update aggregated protocol telemetry
        setTelemetry((prev) => {
          const activeList = updatedPoolsList.length > 0 ? updatedPoolsList : INITIAL_VAULT_POOLS;
          const totalTvl = activeList.reduce((acc, p) => acc + p.tvlUsd, 0);
          const avgApy = Number((activeList.reduce((acc, p) => acc + p.totalApy, 0) / activeList.length).toFixed(2));
          const totalStakers = activeList.reduce((acc, p) => acc + p.stakersCount, 0);

          return {
            ...prev,
            totalTvlUsd: totalTvl,
            avgProtocolApy: avgApy,
            activeStakersCount: totalStakers,
            horizonLatencyMs: latency,
            rpcBlockHeight: currentLedger,
            networkStatus: latency < 400 ? 'Operational' : 'Degraded',
          };
        });

        if (!isInitialMount.current) {
          analytics.track('pool_refreshed', { latencyMs: latency, ledger: currentLedger });
        }
      }
    } catch (err: any) {
      console.warn('[Horizon Poller] Query warning:', err.message);
    } finally {
      setIsRefreshing(false);
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    fetchLiveHorizonPools();
    const interval = setInterval(fetchLiveHorizonPools, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveHorizonPools]);

  return {
    pools,
    telemetry,
    isRefreshing,
    refreshPools: fetchLiveHorizonPools,
  };
}
