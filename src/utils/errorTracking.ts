/**
 * ==============================================================================
 * Lumex Protocol — Error Tracking & Diagnostic Engine
 * ==============================================================================
 * 
 * Captures and sanitizes RPC exceptions, wallet rejections, Horizon failures,
 * and contract simulation errors into actionable error descriptions.
 */

export interface TrackedError {
  id: string;
  message: string;
  category: 'RPC' | 'Horizon' | 'Wallet' | 'Contract' | 'General';
  timestamp: string;
  raw?: any;
}

class ErrorTracker {
  private errorLog: TrackedError[] = [];

  /**
   * Sanitizes and categorizes raw error objects from Stellar SDK or Freighter.
   */
  public parseError(err: any): { userMessage: string; category: TrackedError['category'] } {
    const rawMsg = err?.message || (typeof err === 'string' ? err : 'Unknown error occurred');

    if (/user rejected|access was denied|declined/i.test(rawMsg)) {
      return {
        userMessage: 'Transaction or connection was canceled by user in wallet.',
        category: 'Wallet',
      };
    }

    if (/freighter extension not found|no wallet/i.test(rawMsg)) {
      return {
        userMessage: 'Freighter extension not detected. Use 1-Click Guest Mode or install Freighter from freighter.app.',
        category: 'Wallet',
      };
    }

    if (/insufficient balance|tx_insufficient_balance/i.test(rawMsg)) {
      return {
        userMessage: 'Insufficient spendable XLM balance. Ensure you retain 1.5 XLM for Stellar base reserve.',
        category: 'Contract',
      };
    }

    if (/horizon|network error|failed to fetch/i.test(rawMsg)) {
      return {
        userMessage: 'Stellar RPC Gateway is synchronizing or experiencing temporary latency. Please retry in a moment.',
        category: 'Horizon',
      };
    }


    if (/Bad union switch|XDR|ScVal/i.test(rawMsg)) {
      return {
        userMessage: 'Stellar transaction formatting is synchronizing. Please retry transaction.',
        category: 'Contract',
      };
    }

    if (/HostError|Simulation/i.test(rawMsg)) {
      return {
        userMessage: `Soroban Contract error: ${rawMsg}`,
        category: 'Contract',
      };
    }


    return {
      userMessage: rawMsg,
      category: 'General',
    };
  }

  /**
   * Records an error into the internal diagnostic log.
   */
  public log(err: any): TrackedError {
    const { userMessage, category } = this.parseError(err);
    const tracked: TrackedError = {
      id: Math.random().toString(36).substring(2, 9),
      message: userMessage,
      category,
      timestamp: new Date().toLocaleTimeString(),
      raw: err,
    };

    this.errorLog.unshift(tracked);
    if (this.errorLog.length > 30) {
      this.errorLog = this.errorLog.slice(0, 30);
    }

    console.warn(`[LUMEX ERROR TRACKER] [${category}]`, userMessage, err);
    return tracked;
  }

  public getErrors(): TrackedError[] {
    return [...this.errorLog];
  }
}

export const errorTracker = new ErrorTracker();
