/**
 * ==============================================================================
 * Lumex Protocol — Device & Operating System Intelligence
 * ==============================================================================
 * 
 * Provides runtime client environment detection (OS, touch screen, pointer precision,
 * and mobile browser capabilities) to route wallet connection flows accurately.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  os: 'iOS' | 'Android' | 'macOS' | 'Windows' | 'Linux' | 'Unknown';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Brave' | 'Opera' | 'Unknown';
  recommendedWallets: {
    name: string;
    type: 'extension' | 'mobile_app' | 'web';
    deepLinkUrl?: string;
    storeUrl?: string;
    description: string;
  }[];
}

/**
 * Detect client operating system
 */
export function detectOS(): 'iOS' | 'Android' | 'macOS' | 'Windows' | 'Linux' | 'Unknown' {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '';

  if (/iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }
  if (/Android/i.test(ua)) {
    return 'Android';
  }
  if (/Mac|Macintosh/i.test(ua) || /Mac/i.test(platform)) {
    return 'macOS';
  }
  if (/Win|Windows/i.test(ua) || /Win/i.test(platform)) {
    return 'Windows';
  }
  if (/Linux/i.test(ua) || /Linux/i.test(platform)) {
    return 'Linux';
  }
  return 'Unknown';
}

/**
 * Detect browser brand
 */
export function detectBrowser(): 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Brave' | 'Opera' | 'Unknown' {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;

  if (/Edg/i.test(ua)) return 'Edge';
  if (/OPR|Opera/i.test(ua)) return 'Opera';
  if ((navigator as unknown as { brave?: { isBrave?: () => Promise<boolean> } }).brave) return 'Brave';
  if (/Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) return 'Safari';
  if (/Firefox|FxiOS/i.test(ua)) return 'Firefox';
  return 'Unknown';
}

/**
 * Get comprehensive device profile
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      os: 'Unknown',
      browser: 'Unknown',
      recommendedWallets: [],
    };
  }

  const os = detectOS();
  const browser = detectBrowser();
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = os === 'iOS' || os === 'Android' || (hasTouch && window.innerWidth < 768);
  const isTablet = hasTouch && window.innerWidth >= 768 && window.innerWidth <= 1024;
  const isDesktop = !isMobile && !isTablet;

  const currentUrl = encodeURIComponent(window.location.href);

  const recommendedWallets: DeviceInfo['recommendedWallets'] = [];

  if (isMobile) {
    recommendedWallets.push(
      {
        name: 'LOBSTR Wallet',
        type: 'mobile_app',
        deepLinkUrl: `lobstr://browser?url=${currentUrl}`,
        storeUrl: os === 'iOS' 
          ? 'https://apps.apple.com/app/lobstr-stellar-wallet/id1404357892'
          : 'https://play.google.com/store/apps/details?id=com.lobstr.client',
        description: 'Native mobile Stellar & Soroban dApp browser',
      },
      {
        name: 'Freighter Mobile',
        type: 'mobile_app',
        deepLinkUrl: `freighter://dapp?url=${currentUrl}`,
        storeUrl: 'https://www.freighter.app/',
        description: 'Official SDF self-custody wallet for mobile',
      }
    );
  } else {
    recommendedWallets.push(
      {
        name: 'Freighter Extension',
        type: 'extension',
        storeUrl: 'https://www.freighter.app/',
        description: 'Recommended for Chrome, Firefox, Brave, and Edge',
      },
      {
        name: '1-Click Sandbox Keypair',
        type: 'web',
        description: 'Instant zero-installation cryptographic sandbox account',
      }

    );
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    os,
    browser,
    recommendedWallets,
  };
}
