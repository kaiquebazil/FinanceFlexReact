// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Garante que o Metro resolve @firebase/auth para o bundle React Native correto
// (dist/rn/index.js), que inclui getReactNativePersistence.
//
// O firebase/auth (wrapper) não tem o campo 'react-native' nos seus exports,
// então sem este resolver o Metro poderia usar o bundle browser que não inclui
// getReactNativePersistence. Este resolver força o caminho correto para android/ios.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "@firebase/auth" &&
    (platform === "android" || platform === "ios")
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/@firebase/auth/dist/rn/index.js"
      ),
      type: "sourceFile",
    };
  }
  // Para todos os outros módulos, usa a resolução padrão
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
