export default {
  expo: {
    name: 'SAVOUR',
    slug: 'savour',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash-icon.png',
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
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      output: 'server',
      favicon: './assets/images/favicon.png'
    },
    extra: {
      apiUrl:'https://savour-backend.onrender.com', // https://savour-backend.onrender.com or http://localhost:2024
      "eas": {
        "projectId": "bcc5e80c-d94d-4fea-8931-9ef0d35a3065"
      }
    }
  }
};