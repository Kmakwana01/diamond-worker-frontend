/**
 * AdMob Configuration
 *
 * ⚠️ TEST IDs are used here. Replace with your real AdMob unit IDs before
 * submitting to the Play Store:
 *   https://admob.google.com
 *
 * Real App ID format: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
 */

import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

// ─── Ad Unit IDs ──────────────────────────────────────────────────────────────
// Swap __DEV__ guard with your real IDs before production build.

/** Banner ad unit – appears at bottom of screens */
export const BANNER_AD_UNIT_ID = 'ca-app-pub-6812441129105873/2016733406';

/** Interstitial ad unit – full-screen between actions */
export const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-6812441129105873/5764406724';

/** Rewarded ad unit – for future use */
export const REWARDED_AD_UNIT_ID = 'ca-app-pub-6812441129105873/2369124604';

// ─── Initialization ───────────────────────────────────────────────────────────

let _adMobInitialized = false;

/**
 * Call this ONCE at app startup (in App.tsx useEffect / prepare()).
 * It's safe to await – resolves when the SDK is ready.
 */
export async function initializeAdMob(): Promise<void> {
    if (_adMobInitialized) return;

    try
    {
        await mobileAds().initialize();

        // Optional: set content rating and personalised-ads preference.
        // For maximum fill rate during testing leave these at defaults.
        await mobileAds().setRequestConfiguration({
            // Children's app? set this to 'G'. Leave as is for general apps.
            maxAdContentRating: MaxAdContentRating.PG,
            // Set to true if you have user consent for personalised ads (GDPR etc.)
            tagForChildDirectedTreatment: false,
            tagForUnderAgeOfConsent: false,
        });

        _adMobInitialized = true;
        console.log('[AdMob] ✅ Initialized successfully');
    } catch (error)
    {
        console.warn('[AdMob] ⚠️ Initialization failed:', error);
    }
}
