// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Garante que o Metro resolve firebase/auth e @firebase/auth para o bundle
// React Native correto (dist/rn/index.js), que inclui getReactNativePersistence
// e chama registerAuth('ReactNative') — necessário para que initializeAuth funcione.
//
// Sem este resolver:
// - firebase/auth (wrapper) não tem o campo 'react-native', então o Metro usa
//   o campo 'main' (dist/index.cjs.js) que reexporta @firebase/auth
// - @firebase/auth sem interceptação pode usar o bundle browser que NÃO registra
//   o componente 'auth' como ReactNative, causando o erro:
//   "Component auth has not been registered yet"
const RN_FIREBASE_AUTH_PATH = path.resolve(
  __dirname,
  "node_modules/@firebase/auth/dist/rn/index.js"
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "android" || platform === "ios") {
    // Intercepta tanto 'firebase/auth' (wrapper) quanto '@firebase/auth' (real)
    // para garantir que o bundle React Native correto seja sempre usado
    if (moduleName === "@firebase/auth" || moduleName === "firebase/auth") {
      return {
        filePath: RN_FIREBASE_AUTH_PATH,
        type: "sourceFile",
      };
    }
  }
  // Para todos os outros módulos, usa a resolução padrão
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
