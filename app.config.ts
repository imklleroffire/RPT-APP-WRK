import 'dotenv/config';

export default {
  expo: {
    name: 'RPT App',
    slug: 'rpt-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.amtkumar.rptapp',
      buildNumber: '1',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: 'This app needs access to the camera to upload exercise images.',
        NSPhotoLibraryUsageDescription: 'This app needs access to your photo library to select exercise images.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.amtkumar.rptapp',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    updates: {
      url: 'https://u.expo.dev/e29930f6-e432-4e09-beb1-4859ca3d3019',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      eas: {
        projectId: 'e29930f6-e432-4e09-beb1-4859ca3d3019',
      },
    },
    plugins: ['expo-router'],
  },
}; 