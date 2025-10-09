import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

interface UserTypeSelectionProps {
  onSelectUserType: (type: 'user' | 'provider') => void;
  onBackToLogin: () => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelectUserType, onBackToLogin }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Criar Nova Conta</Text>
          <Text style={styles.subtitle}>Escolha o tipo de conta que deseja criar</Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity 
            style={[styles.option, styles.userOption]} 
            onPress={() => onSelectUserType('user')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.iconText}>🚗</Text>
            </View>
            <Text style={styles.optionTitle}>Sou Cliente</Text>
            <Text style={styles.optionDescription}>
              Preciso de serviços de guincho, socorro mecânico ou reboque
            </Text>
            <View style={styles.optionFeatures}>
              <Text style={styles.featureText}>• Solicitar guincho</Text>
              <Text style={styles.featureText}>• Comparar preços</Text>
              <Text style={styles.featureText}>• Acompanhar em tempo real</Text>
              <Text style={styles.featureText}>• Avaliar prestadores</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.option, styles.providerOption]} 
            onPress={() => onSelectUserType('provider')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.iconText}>🚛</Text>
            </View>
            <Text style={styles.optionTitle}>Sou Prestador</Text>
            <Text style={styles.optionDescription}>
              Ofereço serviços de guincho, socorro mecânico ou reboque
            </Text>
            <View style={styles.optionFeatures}>
              <Text style={styles.featureText}>• Receber solicitações</Text>
              <Text style={styles.featureText}>• Definir preços</Text>
              <Text style={styles.featureText}>• Gerenciar agenda</Text>
              <Text style={styles.featureText}>• Aumentar renda</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <Text style={styles.backButtonText}>← Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  options: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userOption: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  providerOption: {
    borderWidth: 2,
    borderColor: '#28a745',
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 40,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionFeatures: {
    alignSelf: 'stretch',
  },
  featureText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default UserTypeSelection;