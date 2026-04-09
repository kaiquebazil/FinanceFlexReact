import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../../contexts/AdContext';
import { TEST_BANNER_ID } from '../../contexts/AdContext';

interface AdBannerProps {
  style?: any;
}

export function AdBanner({ style }: AdBannerProps) {
  const { showBannerAd } = useAds();

  if (!showBannerAd) {
    return null;
  }

  if (Platform.OS === 'web') {
    // Placeholder para web - Google Mobile Ads não suporta web nativamente
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={TEST_BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.log('Erro ao carregar banner:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
