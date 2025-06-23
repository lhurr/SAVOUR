export default {
  expo: {
    name: 'SAVOUR',
    slug: 'savour',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      output: 'server',
      favicon: './assets/favicon.png'
    },
    extra: {
      apiUrl:'https://savour-backend.onrender.com',
      "eas": {
        "projectId": "bcc5e80c-d94d-4fea-8931-9ef0d35a3065"
      }
    }
  }
};