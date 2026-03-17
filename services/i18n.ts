import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import pt from '../translations/pt.json';
import en from '../translations/en.json';
import es from '../translations/es.json';

const translations = {
  pt,
  en,
  es,
};

const i18n = new I18n(translations);

// Define o idioma padrão com base no sistema
const deviceLanguage = getLocales()[0].languageCode ?? 'pt';
i18n.locale = deviceLanguage;

// Se o idioma não for suportado, volta para o português
if (!['pt', 'en', 'es'].includes(i18n.locale)) {
  i18n.locale = 'pt';
}

i18n.enableFallback = true;
i18n.defaultLocale = 'pt';

export default i18n;
