import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProviderHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Prestador</Text>
      <Text style={styles.subtitle}>Tela em desenvolvimento</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProviderHomeScreen;