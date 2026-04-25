import { useEffect, useRef, useCallback } from 'react';
import {
    InterstitialAd,
    AdEventType,
} from 'react-native-google-mobile-ads';
import { INTERSTITIAL_AD_UNIT_ID } from '../utils/admob';

/**
 * useInterstitialAd
 *
 * Loads an interstitial ad on mount and auto‑reloads after each dismissal.
 *
 * Usage:
 *   const { showAd, isLoaded } = useInterstitialAd();
 *   // call showAd() at any point — e.g. after saving data, on navigation, etc.
 */
export function useInterstitialAd() {
    // Keep a mutable ref so we can recreate the ad object without re-rendering.
    const adRef = useRef<InterstitialAd | null>(null);
    const isLoadedRef = useRef(false);

    const loadNewAd = useCallback(() => {
        const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
            requestNonPersonalizedAdsOnly: false,
        });

        const onLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            isLoadedRef.current = true;
            console.log('[AdMob] ✅ Interstitial loaded');
        });

        const onError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
            isLoadedRef.current = false;
            console.warn('[AdMob] ❌ Interstitial error:', error);
        });

        const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            isLoadedRef.current = false;
            console.log('[AdMob] 🔄 Interstitial dismissed — reloading');
            // Cleanup old listeners and load a fresh ad
            onLoaded();
            onError();
            onClosed();
            loadNewAd();
        });

        adRef.current = ad;
        ad.load();
    }, []);

    useEffect(() => {
        loadNewAd();

        return () => {
            // Nothing to explicitly destroy in current API; GC handles it.
            adRef.current = null;
        };
    }, [loadNewAd]);

    /**
     * showAd() — call this when you want to display the interstitial.
     * It silently skips if the ad isn't ready yet.
     */
    const showAd = useCallback(async () => {
        if (adRef.current && isLoadedRef.current)
        {
            try
            {
                await adRef.current.show();
            } catch (error)
            {
                console.warn('[AdMob] ❌ Failed to show interstitial:', error);
            }
        } else
        {
            console.warn('[AdMob] ⚠️ Interstitial not ready yet');
        }
    }, []);

    return { showAd };
}
