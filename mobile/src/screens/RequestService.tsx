import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';

interface RequestServiceProps {
  userLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onRequestSubmitted: (requestData: any) => void;
}

const RequestService: React.FC<RequestServiceProps> = ({ userLocation, onRequestSubmitted }) => {
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    {
      id: 'towing',
      name: 'Reboque/Guincho',
      icon: '🚛',
      description: 'Reboque do veículo para oficina ou destino',
      urgencyLevels: ['normal', 'urgent']
    },
    {
      id: 'battery_jump',
      name: 'Bateria Descarregada',
      icon: '🔋',
      description: 'Chupeta para dar partida no veículo',
      urgencyLevels: ['normal', 'urgent']
    },
    {
      id: 'tire_change',
      name: 'Troca de Pneu',
      icon: '🛞',
      description: 'Troca de pneu furado ou danificado',
      urgencyLevels: ['normal', 'urgent']
    },
    {
      id: 'fuel_delivery',
      name: 'Combustível',
      icon: '⛽',
      description: 'Entrega de combustível no local',
      urgencyLevels: ['normal']
    },
    {
      id: 'lockout',
      name: 'Abertura de Veículo',
      icon: '🔑',
      description: 'Abertura de veículo com chave trancada',
      urgencyLevels: ['normal', 'urgent']
    },
    {
      id: 'mechanical_help',
      name: 'Socorro Mecânico',
      icon: '🔧',
      description: 'Assistência mecânica no local',
      urgencyLevels: ['normal', 'urgent']
    }
  ];

  const urgencyOptions = [
    { id: 'normal', name: 'Normal', description: 'Até 60 minutos', color: '#28a745' },
    { id: 'urgent', name: 'Urgente', description: 'Até 30 minutos', color: '#ffc107' },
    { id: 'emergency', name: 'Emergência', description: 'Até 15 minutos', color: '#dc3545' }
  ];

  const handleServiceSelect = (service: any) => {
    setServiceType(service.id);
    setShowServiceModal(false);
  };

  const validateForm = () => {
    if (!serviceType) {
      Alert.alert('Erro', 'Selecione o tipo de serviço');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Erro', 'Descreva o problema');
      return false;
    }
    if (serviceType === 'towing' && !destinationAddress.trim()) {
      Alert.alert('Erro', 'Informe o endereço de destino para reboque');
      return false;
    }
    return true;
  };

  const handleSubmitRequest = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = {
        id: Date.now().toString(),
        serviceType,
        description,
        urgency,
        pickupLocation: userLocation,
        destinationAddress: serviceType === 'towing' ? destinationAddress : null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: 'current_user_id' // Seria obtido do contexto de auth
      };

      // Simular envio da solicitação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onRequestSubmitted(requestData);
      Alert.alert('Sucesso', 'Solicitação enviada! Aguarde as propostas dos prestadores.');
      
      // Reset form
      setServiceType('');
      setDescription('');
      setUrgency('normal');
      setDestinationAddress('');
      
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = serviceTypes.find(s => s.id === serviceType);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitar Serviço</Text>
        <Text style={styles.subtitle}>Descreva seu problema e receba propostas</Text>
      </View>

      {/* Localização Atual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Sua Localização</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationText}>{userLocation.address}</Text>
          <Text style={styles.coordinatesText}>
            {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </Text>
        </View>
      </View>

      {/* Tipo de Serviço */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠️ Tipo de Serviço</Text>
        <TouchableOpacity 
          style={styles.serviceSelector} 
          onPress={() => setShowServiceModal(true)}
        >
          {selectedService ? (
            <View style={styles.selectedService}>
              <Text style={styles.serviceIcon}>{selectedService.icon}</Text>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{selectedService.name}</Text>
                <Text style={styles.serviceDescription}>{selectedService.description}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.servicePlaceholder}>Selecionar tipo de serviço</Text>
          )}
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Urgência */}
      {serviceType && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Nível de Urgência</Text>
          <View style={styles.urgencyOptions}>
            {urgencyOptions.map(option => {
              const serviceSupportsUrgency = selectedService?.urgencyLevels.includes(option.id) || option.id === 'emergency';
              if (!serviceSupportsUrgency) return null;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.urgencyOption,
                    urgency === option.id && styles.urgencyOptionSelected,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setUrgency(option.id)}
                >
                  <Text style={[styles.urgencyName, urgency === option.id && { color: option.color }]}>
                    {option.name}
                  </Text>
                  <Text style={styles.urgencyDescription}>{option.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Descrição do Problema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Descreva o Problema</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Ex: Carro não liga, pneu furado na frente direita, bateria descarregada..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </View>

      {/* Endereço de Destino (se for reboque) */}
      {serviceType === 'towing' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Endereço de Destino</Text>
          <TextInput
            style={styles.input}
            placeholder="Para onde deseja levar o veículo?"
            value={destinationAddress}
            onChangeText={setDestinationAddress}
            multiline
          />
        </View>
      )}

      {/* Botão de Envio */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmitRequest}
        disabled={loading || !serviceType}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Enviando...' : 'Solicitar Serviço'}
        </Text>
      </TouchableOpacity>

      {/* Modal de Seleção de Serviço */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Serviço</Text>
            <TouchableOpacity onPress={() => setShowServiceModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.servicesList}>
            {serviceTypes.map(service => (
              <TouchableOpacity 
                key={service.id}
                style={styles.serviceOption}
                onPress={() => handleServiceSelect(service)}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  locationText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  serviceSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedService: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  servicePlaceholder: {
    fontSize: 16,
    color: '#adb5bd',
  },
  selectorArrow: {
    fontSize: 16,
    color: '#6c757d',
  },
  urgencyOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  urgencyOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  urgencyOptionSelected: {
    backgroundColor: '#f8f9fa',
  },
  urgencyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
    minHeight: 100,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    fontSize: 24,
    color: '#6c757d',
  },
  servicesList: {
    flex: 1,
    padding: 20,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceDetails: {
    flex: 1,
  },
});

export default RequestService;