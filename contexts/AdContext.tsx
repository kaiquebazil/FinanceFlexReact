import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { mobileAds, BannerAd, BannerAdSize, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

// IDs de teste do Google AdMob
const TEST_BANNER_ID = Platform.OS === 'ios' 
  ? 'ca-app-pub-3940256099942544/6300978111'
  : 'ca-app-pub-3940256099942544/6300978111';

const TEST_INTERSTITIAL_ID = Platform.OS === 'ios'
  ? 'ca-app-pub-3940256099942544/4411468910'
  : 'ca-app-pub-3940256099942544/1033173712';

// IDs de produção (você substituirá esses pelos seus reais)
const PROD_BANNER_ID = Platform.OS === 'ios'
  ? 'ca-app-pub-7467123827432414/BANNER_ID_IOS'
  : 'ca-app-pub-7467123827432414/BANNER_ID_ANDROID';

const PROD_INTERSTITIAL_ID = Platform.OS === 'ios'
  ? 'ca-app-pub-7467123827432414/INTERSTITIAL_ID_IOS'
  : 'ca-app-pub-7467123827432414/INTERSTITIAL_ID_ANDROID';

interface AdContextType {
  showBannerAd: boolean;
  showInterstitialAd: (onAdClosed?: () => void) => void;
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [showBannerAd, setShowBannerAd] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(null);

  // Inicializar Google Mobile Ads
  useEffect(() => {
    const initAds = async () => {
      try {
        await mobileAds().initialize();
      } catch (error) {
        console.error('Erro ao inicializar Google Mobile Ads:', error);
      }
    };

    initAds();
  }, []);

  // Carregar anúncio intersticial
  useEffect(() => {
    if (isPremium) return; // Não carregar anúncios se for premium

    const loadInterstitial = async () => {
      try {
        const ad = InterstitialAd.createForAdRequest(TEST_INTERSTITIAL_ID, {
          requestNonPersonalizedAdsOnly: true,
        });

        const unsubscribe = ad.onAdEvent((type) => {
          if (type === AdEventType.CLOSED) {
            loadInterstitial(); // Recarregar após fechar
          }
        });

        await ad.load();
        setInterstitialAd(ad);

        return unsubscribe;
      } catch (error) {
        console.error('Erro ao carregar anúncio intersticial:', error);
      }
    };

    const unsubscribe = loadInterstitial();
    return () => {
      unsubscribe?.then((unsub) => unsub?.());
    };
  }, [isPremium]);

  const showInterstitialAd = async (onAdClosed?: () => void) => {
    if (isPremium || !interstitialAd) {
      onAdClosed?.();
      return;
    }

    try {
      await interstitialAd.show();
      onAdClosed?.();
    } catch (error) {
      console.error('Erro ao exibir anúncio intersticial:', error);
      onAdClosed?.();
    }
  };

  const value: AdContextType = {
    showBannerAd: showBannerAd && !isPremium,
    showInterstitialAd,
    isPremium,
    setIsPremium,
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

export { TEST_BANNER_ID, TEST_INTERSTITIAL_ID, PROD_BANNER_ID, PROD_INTERSTITIAL_ID };
