/**
 * ==============================================================================
 * Lumex Protocol — Production Telemetry & Event Analytics Engine
 * ==============================================================================
 * 
 * Provides unified client-side telemetry tracking for DeFi protocol milestones:
 * - Wallet connection / disconnection flows
 * - Yield vault deposits & withdrawals
 * - Auto-compounding keeper executions
 * - Emergency exits
 * - User feedback and ratings
 * 
 * Emits events to console telemetry, local session storage for auditing, and
 * integrates cleanly with Plausible Analytics if configured.
 */

export type AnalyticsEventType =
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'guest_wallet_funded'
  | 'deposit_initiated'
  | 'deposit_success'
  | 'withdraw_initiated'
  | 'withdraw_success'
  | 'compound_initiated'
  | 'compound_success'
  | 'emergency_exit_initiated'
  | 'emergency_exit_success'
  | 'feedback_submitted'
  | 'tab_switched'
  | 'pool_refreshed';

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventType;
  timestamp: string;
  properties?: Record<string, any>;
}

const ANALYTICS_STORAGE_KEY = 'lumex_telemetry_events';
const MAX_STORED_EVENTS = 50;

class AnalyticsEngine {
  private events: AnalyticsEventPayload[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(ANALYTICS_STORAGE_KEY);
        if (saved) {
          this.events = JSON.parse(saved);
        }
      } catch (e) {
        this.events = [];
      }
    }
  }

  /**
   * Track a domain-specific DeFi event.
   */
  public track(eventName: AnalyticsEventType, properties: Record<string, any> = {}) {
    const payload: AnalyticsEventPayload = {
      eventName,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
      },
    };

    this.events.unshift(payload);
    if (this.events.length > MAX_STORED_EVENTS) {
      this.events = this.events.slice(0, MAX_STORED_EVENTS);
    }

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(this.events));
      } catch (e) {
        // Storage quota or privacy restriction fallback
      }

      // If Plausible custom event function exists on window, dispatch
      const plausible = (window as any).plausible;
      if (typeof plausible === 'function') {
        plausible(eventName, { props: properties });
      }
    }

    // Structured development log
    console.info(
      `%c[LUMEX ANALYTICS]%c ${eventName}`,
      'color: #00E599; font-weight: bold; background: #0F141F; padding: 2px 6px; border-radius: 4px;',
      'color: #94A3B8; font-weight: normal;',
      properties
    );
  }

  /**
   * Returns recent event logs for in-app diagnostics.
   */
  public getRecentEvents(): AnalyticsEventPayload[] {
    return [...this.events];
  }
}

export const analytics = new AnalyticsEngine();
