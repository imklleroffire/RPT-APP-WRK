export default {
  expo: {
    name: 'RPT App',
    slug: 'rpt-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.amtkumar.rptapp',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    extra: {
      eas: {
        projectId: 'e29930f6-e432-4e09-beb1-4859ca3d3019',
      },
    },
    plugins: ['expo-router'],
  },
};

