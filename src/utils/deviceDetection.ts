/**
 * ==============================================================================
 * Device & Environment Detection Engine
 * ==============================================================================
 * 
 * Accurately determines if the user is browsing on a mobile/touch device versus desktop.
 * In Web3 applications, this is critical for selecting the optimal wallet route:
 * - Desktop: Prioritizes browser extension wallets (Freighter, xBull) and 1-Click Guest Mode.
 * - Mobile: Offers direct mobile wallet deep-linking (LOBSTR, Freighter Mobile via WalletConnect)
 *   or instant Guest keypair access without requiring browser extensions.
 * 
 * Note: Avoids legacy `navigator.userAgent` parsing which is brittle and discouraged by MDN.
 * Uses modern CSS media queries (`pointer: coarse`), viewport checks, and touch points.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  isSmallScreen: boolean;
  platformName: string;
}

/**
 * Detects whether the current device is a mobile phone or small tablet.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isSmallWidth = window.innerWidth < 768;
  const hasTouchPoints = typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || ('ontouchstart' in window));
  return (hasCoarsePointer || hasTouchPoints) && isSmallWidth;
}

/**
 * Detects if the device has touch capabilities (e.g. touchscreen laptops or tablets).
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
}

/**
 * Returns comprehensive device metadata for UI optimization.
 */
export function getDeviceInfo(): DeviceInfo {
  const isMobile = isMobileDevice();
  const isTouch = isTouchDevice();
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  
  let platformName = 'Desktop Browser';
  if (typeof navigator !== 'undefined') {
    if (/android/i.test(navigator.userAgent)) platformName = 'Android';
    else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) platformName = 'iOS';
  }

  return {
    isMobile,
    isTouch,
    isSmallScreen,
    platformName,
  };
}

/**
 * Generates mobile deep link URIs for prominent Stellar mobile wallets.
 */
export function getWalletDeepLink(walletName: 'lobstr' | 'freighter', dappUrl?: string): string {
  const urlToOpen = encodeURIComponent(dappUrl || (typeof window !== 'undefined' ? window.location.href : 'https://lumex-protocol.vercel.app'));
  switch (walletName) {
    case 'lobstr':
      // LOBSTR in-app dApp browser deep link scheme
      return `lobstr://browser?url=${urlToOpen}`;
    case 'freighter':
      // Freighter mobile deep link scheme
      return `freighter://dapp?url=${urlToOpen}`;
    default:
      return 'https://lobstr.co';
  }
}
