/**
 * ==============================================================================
 * Lumex Protocol — Telegram Keeper Bot Broadcast Engine
 * ==============================================================================
 * 
 * Sends optional real-time on-chain event notifications to a designated
 * Telegram channel or chat whenever an auto-compounding harvest or large
 * deposit/emergency exit occurs on Stellar.
 */

export interface KeeperAlertPayload {
  poolId: string;
  action: 'Auto-Compound' | 'Deposit' | 'Withdraw' | 'Emergency-Exit';
  amount?: string;
  txHash?: string;
  bounty?: string;
}

class TelegramAlertService {
  private botToken: string = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  private chatId: string = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

  public isConfigured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  /**
   * Broadcasts a DeFi yield event directly to Telegram.
   */
  public async sendAlert(payload: KeeperAlertPayload): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const emoji = payload.action === 'Auto-Compound' ? '⚡' : payload.action === 'Deposit' ? '💰' : '🛡️';
    const message = [
      `<b>${emoji} LUMEX PROTOCOL KEEPER ALERT</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `<b>Action:</b> <code>${payload.action}</code>`,
      `<b>Strategy Vault:</b> <code>${payload.poolId}</code>`,
      payload.amount ? `<b>Volume:</b> <code>${payload.amount}</code>` : null,
      payload.bounty ? `<b>1% Keeper Bounty:</b> <code>${payload.bounty}</code>` : null,
      payload.txHash ? `<b>Tx Hash:</b> <a href="https://stellar.expert/explorer/testnet/tx/${payload.txHash}">${payload.txHash.slice(0, 10)}...</a>` : null,
      `<b>Network:</b> Stellar Consensus Protocol`,
      `━━━━━━━━━━━━━━━━━━━━`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('[Telegram Alert Engine] Failed to dispatch broadcast:', err);
      return false;
    }
  }
}

export const telegramAlerts = new TelegramAlertService();
