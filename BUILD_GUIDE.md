# 📱 Guia de Build - Finance Flex

Este guia explica como gerar o APK e AAB para publicar seu app no Google Play Store.

---

## 🔧 Pré-requisitos

1. **Expo CLI instalado:**
   ```bash
   npm install -g eas-cli
   ```

2. **Conta Expo criada:** https://expo.dev/signup

3. **Estar logado no Expo:**
   ```bash
   eas login
   ```

---

## 📦 Opção 1: Build via EAS (Recomendado)

### 1.1 Configurar o projeto
```bash
cd /caminho/para/FinanceFlexReact
eas build:configure
```

### 1.2 Gerar APK (para teste em dispositivo)
```bash
eas build --platform android --local
```

Ou para build na nuvem (mais rápido):
```bash
eas build --platform android
```

### 1.3 Gerar AAB (para Google Play Store)
```bash
eas build --platform android --local
```

O arquivo AAB será gerado automaticamente.

---

## 📱 Opção 2: Build Local com Android Studio

### 2.1 Instalar Android SDK
```bash
# No macOS com Homebrew:
brew install android-sdk

# No Linux:
sudo apt-get install android-sdk

# No Windows:
# Baixar de: https://developer.android.com/studio
```

### 2.2 Gerar APK
```bash
cd FinanceFlexReact
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

### 2.3 Gerar AAB
```bash
cd android
./gradlew bundleRelease
```

O AAB estará em: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔑 Assinatura (Necessário para Google Play)

### 3.1 Gerar chave de assinatura
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias
```

### 3.2 Configurar no app.json
```json
{
  "expo": {
    "android": {
      "package": "com.kaiquebazil.financeflex",
      "versionCode": 1,
      "signingConfig": "release"
    }
  }
}
```

---

## 🚀 Publicar no Google Play Store

### 4.1 Criar conta de desenvolvedor
- Acesse: https://play.google.com/console
- Pague a taxa de registro ($25 USD)

### 4.2 Enviar AAB
1. Crie um novo app no Google Play Console
2. Vá para **Release** → **Production**
3. Faça upload do arquivo `app-release.aab`
4. Preencha os dados obrigatórios (descrição, screenshots, etc.)
5. Envie para revisão

---

## 📊 Informações do Projeto

| Campo | Valor |
|-------|-------|
| **Nome** | Finance Flex |
| **Package** | com.kaiquebazil.financeflex |
| **Versão** | 1.0.0 |
| **Versão Code** | 1 |
| **Min SDK** | 21 |
| **Target SDK** | 34 |

---

## ⚠️ Dicas Importantes

1. **Sempre teste antes de publicar:**
   ```bash
   npx expo start --android
   ```

2. **Aumente a versão antes de cada build:**
   - Edite `app.json`: `"version": "1.0.1"`
   - Aumente `versionCode`: `"versionCode": 2`

3. **Guarde a chave de assinatura com segurança:**
   - Não compartilhe `my-release-key.keystore`
   - Faça backup em local seguro

4. **Verifique o tamanho do APK:**
   - Ideal: < 100 MB
   - Máximo: 100 MB (limite do Google Play)

---

## 🐛 Troubleshooting

### Erro: "Java not found"
```bash
# Instale Java
brew install openjdk@11
export JAVA_HOME=/usr/libexec/java_home -v 11
```

### Erro: "Android SDK not found"
```bash
# Configure o caminho do SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Build falha na nuvem
```bash
# Tente build local
eas build --platform android --local
```

---

## 📞 Suporte

- Documentação Expo: https://docs.expo.dev/build/setup/
- Documentação Android: https://developer.android.com/studio
- Comunidade Expo: https://forums.expo.dev/

---

**Última atualização:** 16/03/2026
