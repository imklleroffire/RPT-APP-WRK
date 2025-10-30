import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IndexScreen() {
  // Navigation is handled by _layout.tsx
  // This component should not be rendered due to immediate navigation
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RPT App</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 