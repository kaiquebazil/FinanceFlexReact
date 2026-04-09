import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Importação dinâmica segura para evitar quebra no Expo Go
let mobileAds: any = null;
let BannerAd: any = null;
let BannerAdSize: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  mobileAds = ads.mobileAds;
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
} catch (e) {
  console.warn('Google Mobile Ads não está disponível neste ambiente (provavelmente Expo Go).');
}

// IDs de teste do Google AdMob
const TEST_BANNER_ID = Platform.OS === 'ios' 
  ? 'ca-app-pub-3940256099942544/6300978111'
  : 'ca-app-pub-3940256099942544/6300978111';

const TEST_INTERSTITIAL_ID = Platform.OS === 'ios'
  ? 'ca-app-pub-3940256099942544/4411468910'
  : 'ca-app-pub-3940256099942544/1033173712';

interface AdContextType {
  showBannerAd: boolean;
  showInterstitialAd: (onAdClosed?: () => void) => void;
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
  isAdsAvailable: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [showBannerAd, setShowBannerAd] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState<any>(null);
  const isAdsAvailable = !!mobileAds;

  // Inicializar Google Mobile Ads de forma segura
  useEffect(() => {
    if (!isAdsAvailable) return;

    const initAds = async () => {
      try {
        await mobileAds().initialize();
      } catch (error) {
        console.error('Erro ao inicializar Google Mobile Ads:', error);
      }
    };

    initAds();
  }, [isAdsAvailable]);

  // Carregar anúncio intersticial de forma segura
  useEffect(() => {
    if (isPremium || !isAdsAvailable || !InterstitialAd) return;

    let unsubscribe: any;

    const loadInterstitial = async () => {
      try {
        const ad = InterstitialAd.createForAdRequest(TEST_INTERSTITIAL_ID, {
          requestNonPersonalizedAdsOnly: true,
        });

        unsubscribe = ad.onAdEvent((type: any) => {
          if (type === AdEventType.CLOSED) {
            loadInterstitial(); // Recarregar após fechar
          }
        });

        await ad.load();
        setInterstitialAd(ad);
      } catch (error) {
        console.warn('Erro ao carregar anúncio intersticial:', error);
      }
    };

    loadInterstitial();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isPremium, isAdsAvailable]);

  const showInterstitialAd = async (onAdClosed?: () => void) => {
    if (isPremium || !interstitialAd || !isAdsAvailable) {
      onAdClosed?.();
      return;
    }

    try {
      await interstitialAd.show();
      onAdClosed?.();
    } catch (error) {
      console.warn('Erro ao exibir anúncio intersticial:', error);
      onAdClosed?.();
    }
  };

  const value: AdContextType = {
    showBannerAd: showBannerAd && !isPremium && isAdsAvailable,
    showInterstitialAd,
    isPremium,
    setIsPremium,
    isAdsAvailable
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds() {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds deve ser usado dentro de um AdProvider');
  }
  return context;
}

export { TEST_BANNER_ID, TEST_INTERSTITIAL_ID, BannerAd, BannerAdSize };
