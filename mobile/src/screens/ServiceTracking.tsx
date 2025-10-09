import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';

interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalJobs: number;
  vehicleInfo: {
    type: string;
    brand: string;
    model: string;
    licensePlate: string;
    color: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

interface ServiceTracking {
  id: string;
  serviceType: string;
  status: 'accepted' | 'on_way' | 'arrived' | 'in_progress' | 'completed';
  provider: ServiceProvider;
  estimatedArrival: string;
  actualArrival?: string;
  completionTime?: string;
  price: number;
  description: string;
  userLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  statusHistory: Array<{
    status: string;
    timestamp: string;
    message: string;
  }>;
  distance: number;
}

interface ServiceTrackingProps {
  serviceId: string;
  onServiceCompleted: () => void;
}

const ServiceTrackingScreen: React.FC<ServiceTrackingProps> = ({ serviceId, onServiceCompleted }) => {
  const [service, setService] = useState<ServiceTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceData();
    const interval = setInterval(fetchServiceData, 15000); // Atualizar a cada 15 segundos

    return () => clearInterval(interval);
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      // Simular chamada de API
      const mockServiceData: ServiceTracking = {
        id: serviceId,
        serviceType: 'towing',
        status: 'on_way',
        price: 120.00,
        description: 'Carro quebrado na Av. Paulista, precisa ser levado para oficina',
        estimatedArrival: new Date(Date.now() + 12 * 60000).toISOString(),
        distance: 1.8,
        provider: {
          id: 'provider1',
          name: 'Carlos Guincho Rápido',
          phone: '+5511999888777',
          rating: 4.8,
          totalJobs: 150,
          vehicleInfo: {
            type: 'tow_truck',
            brand: 'Ford',
            model: 'Cargo 1719',
            licensePlate: 'ABC-1234',
            color: 'Azul'
          },
          currentLocation: {
            latitude: -23.5505199,
            longitude: -46.6333094
          }
        },
        userLocation: {
          latitude: -23.5489,
          longitude: -46.6388,
          address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'
        },
        statusHistory: [
          {
            status: 'accepted',
            timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
            message: 'Proposta aceita! Carlos está se preparando.'
          },
          {
            status: 'on_way',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            message: 'Carlos saiu para seu atendimento. Chegada prevista em 12 minutos.'
          }
        ]
      };

      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
      setService(mockServiceData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleCallProvider = () => {
    if (service?.provider.phone) {
      const phoneNumber = service.provider.phone.replace(/\D/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleWhatsAppProvider = () => {
    if (service?.provider.phone) {
      const phoneNumber = service.provider.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá! Sou o cliente do serviço #${service.id}. Como está o andamento?`);
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${message}`);
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Chamada de Emergência',
      'Deseja ligar para emergência (190 ou 193)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '190 - Polícia', onPress: () => Linking.openURL('tel:190') },
        { text: '193 - Bombeiros', onPress: () => Linking.openURL('tel:193') }
      ]
    );
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { title: string; icon: string; color: string; description: string } } = {
      'accepted': {
        title: 'Proposta Aceita',
        icon: '✅',
        color: '#28a745',
        description: 'O prestador confirmou e está se preparando'
      },
      'on_way': {
        title: 'A Caminho',
        icon: '🚛',
        color: '#007AFF',
        description: 'O prestador está indo até você'
      },
      'arrived': {
        title: 'Chegou ao Local',
        icon: '📍',
        color: '#fd7e14',
        description: 'O prestador chegou e está te procurando'
      },
      'in_progress': {
        title: 'Serviço em Andamento',
        icon: '🔧',
        color: '#6f42c1',
        description: 'O serviço está sendo executado'
      },
      'completed': {
        title: 'Concluído',
        icon: '🎉',
        color: '#28a745',
        description: 'Serviço finalizado com sucesso'
      }
    };
    
    return statusMap[status] || statusMap['accepted'];
  };

  const getServiceTypeName = (type: string) => {
    const types: { [key: string]: { name: string; icon: string } } = {
      'towing': { name: 'Reboque/Guincho', icon: '🚛' },
      'battery_jump': { name: 'Bateria', icon: '🔋' },
      'tire_change': { name: 'Troca de Pneu', icon: '🛞' },
      'fuel_delivery': { name: 'Combustível', icon: '⛽' },
      'lockout': { name: 'Abertura', icon: '🔑' },
      'mechanical_help': { name: 'Socorro Mecânico', icon: '🔧' }
    };
    return types[type] || { name: type, icon: '🛠️' };
  };

  const getTimeRemaining = (arrivalTime: string) => {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    const diffInMinutes = Math.ceil((arrival.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) return 'Chegou!';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    
    return stars.join('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando informações...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Serviço não encontrado</Text>
      </View>
    );
  }

  const statusInfo = getStatusInfo(service.status);
  const serviceInfo = getServiceTypeName(service.serviceType);

  return (
    <ScrollView style={styles.container}>
      {/* Status Principal */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{statusInfo.title}</Text>
            <Text style={styles.statusDescription}>{statusInfo.description}</Text>
          </View>
        </View>

        {service.status === 'on_way' && (
          <View style={styles.arrivalInfo}>
            <Text style={styles.arrivalLabel}>Chegada Prevista:</Text>
            <Text style={styles.arrivalTime}>
              {getTimeRemaining(service.estimatedArrival)}
            </Text>
          </View>
        )}
      </View>

      {/* Informações do Prestador */}
      <View style={styles.providerCard}>
        <View style={styles.providerHeader}>
          <Text style={styles.sectionTitle}>👤 Seu Prestador</Text>
        </View>

        <View style={styles.providerInfo}>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{service.provider.name}</Text>
            <View style={styles.providerRating}>
              <Text style={styles.stars}>{renderStars(service.provider.rating)}</Text>
              <Text style={styles.ratingText}>
                {service.provider.rating} ({service.provider.totalJobs} serviços)
              </Text>
            </View>
          </View>
        </View>

        {/* Informações do Veículo */}
        <View style={styles.vehicleSection}>
          <Text style={styles.vehicleTitle}>🚛 Veículo</Text>
          <Text style={styles.vehicleInfo}>
            {service.provider.vehicleInfo.brand} {service.provider.vehicleInfo.model}
          </Text>
          <Text style={styles.vehicleDetails}>
            Placa: {service.provider.vehicleInfo.licensePlate} • Cor: {service.provider.vehicleInfo.color}
          </Text>
        </View>

        {/* Botões de Contato */}
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.callButton} onPress={handleCallProvider}>
            <Text style={styles.buttonIcon}>📞</Text>
            <Text style={styles.buttonText}>Ligar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppProvider}>
            <Text style={styles.buttonIcon}>💬</Text>
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informações do Serviço */}
      <View style={styles.serviceCard}>
        <Text style={styles.sectionTitle}>{serviceInfo.icon} Detalhes do Serviço</Text>
        
        <View style={styles.serviceDetail}>
          <Text style={styles.detailLabel}>Tipo:</Text>
          <Text style={styles.detailValue}>{serviceInfo.name}</Text>
        </View>

        <View style={styles.serviceDetail}>
          <Text style={styles.detailLabel}>Valor:</Text>
          <Text style={styles.priceValue}>R$ {service.price.toFixed(2)}</Text>
        </View>

        <View style={styles.serviceDetail}>
          <Text style={styles.detailLabel}>Local:</Text>
          <Text style={styles.detailValue}>{service.userLocation.address}</Text>
        </View>

        <View style={styles.serviceDetail}>
          <Text style={styles.detailLabel}>Descrição:</Text>
          <Text style={styles.detailValue}>{service.description}</Text>
        </View>
      </View>

      {/* Histórico de Status */}
      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>📋 Acompanhamento</Text>
        
        {service.statusHistory.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyDot} />
            <View style={styles.historyContent}>
              <Text style={styles.historyMessage}>{item.message}</Text>
              <Text style={styles.historyTime}>
                {new Date(item.timestamp).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Botão de Emergência */}
      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>🆘 Precisa de Ajuda?</Text>
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Text style={styles.emergencyButtonText}>Chamada de Emergência</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Serviço ID: #{service.id}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6c757d',
  },
  arrivalInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  arrivalLabel: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  arrivalTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  providerCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  providerInfo: {
    marginBottom: 16,
  },
  providerDetails: {
    marginBottom: 12,
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  vehicleSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  vehicleInfo: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25d366',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    flex: 2,
    textAlign: 'right',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    flex: 2,
    textAlign: 'right',
  },
  historyCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyMessage: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  historyTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  emergencySection: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
  },
});

export default ServiceTrackingScreen;