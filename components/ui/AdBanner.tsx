import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useAds } from '../../contexts/AdContext';
import { TEST_BANNER_ID, BannerAd, BannerAdSize } from '../../contexts/AdContext';

interface AdBannerProps {
  style?: any;
}

export function AdBanner({ style }: AdBannerProps) {
  const { showBannerAd, isAdsAvailable } = useAds();

  // Não renderizar se o anúncio não estiver disponível, o usuário for premium ou for web
  if (!isAdsAvailable || !showBannerAd || !BannerAd || Platform.OS === 'web') {
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
        onAdFailedToLoad={(error: any) => {
          console.warn('Erro ao carregar banner:', error);
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
