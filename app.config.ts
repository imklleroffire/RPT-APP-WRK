export default {
  expo: {
    name: 'RPT App',
    slug: 'rpt-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'rptapp',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.amtkumar.rptapp',
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
    extra: {
      eas: {
        projectId: 'e29930f6-e432-4e09-beb1-4859ca3d3019',
      },
    },
    plugins: ['expo-router'],
  },
}; 