import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_AD_UNIT_ID } from '../../utils/admob';

interface AdBannerProps {
    /** Banner size. Defaults to ANCHORED_ADAPTIVE_BANNER (fills width). */
    size?: BannerAdSize;
}

/**
 * AdBanner
 *
 * Drop this anywhere in your screen JSX.
 * It hides itself completely if the ad fails to load.
 *
 * Example:
 *   <AdBanner />
 *   <AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} />
 */
const AdBanner: React.FC<AdBannerProps> = ({
    size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}) => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <View style={styles.wrapper}>
            <BannerAd
                unitId={BANNER_AD_UNIT_ID}
                size={size}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
                onAdLoaded={() => {
                    setVisible(true);
                    console.log('[AdMob] ✅ Banner loaded');
                }}
                onAdFailedToLoad={(error) => {
                    setVisible(false);
                    console.warn('[AdMob] ❌ Banner failed:', error);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default AdBanner;
