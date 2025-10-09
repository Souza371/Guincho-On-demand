import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { userService, rideService } from '../../services/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation, locationError } = useLocation();
  
  const [activeRide, setActiveRide] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickServices] = useState([
    { id: 'GUINCHO_LEVE', name: 'Guincho Leve', icon: '🚗', description: 'Carros de passeio' },
    { id: 'GUINCHO_PESADO', name: 'Guincho Pesado', icon: '🚛', description: 'Caminhões e veículos grandes' },
    { id: 'TROCA_PNEU', name: 'Troca de Pneu', icon: '⚙️', description: 'Assistência com pneus' },
    { id: 'COMBUSTIVEL', name: 'Combustível', icon: '⛽', description: 'Entrega de combustível' },
    { id: 'BATERIA', name: 'Bateria', icon: '🔋', description: 'Problemas com bateria' },
    { id: 'CHAVEIRO', name: 'Chaveiro', icon: '🔑', description: 'Abertura de veículos' },
  ]);

  useEffect(() => {
    loadActiveRide();
    if (!currentLocation) {
      getCurrentLocation().catch(err => {
        console.error('Erro ao obter localização:', err);
      });
    }
  }, []);

  const loadActiveRide = async () => {
    try {
      const response = await userService.getRides(1, 1, 'PENDING,ACCEPTED,IN_PROGRESS');
      const rides = response.data.data.rides;
      if (rides.length > 0) {
        setActiveRide(rides[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar corrida ativa:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadActiveRide(),
        getCurrentLocation()
      ]);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleServicePress = (serviceType: string) => {
    if (activeRide) {
      Alert.alert(
        'Corrida Ativa',
        'Você já possui uma corrida ativa. Deseja acompanhá-la?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Corrida', onPress: () => goToRideTracking() },
        ]
      );
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        'Localização Necessária',
        'Precisamos da sua localização para encontrar prestadores próximos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tentar Novamente', onPress: () => getCurrentLocation() },
        ]
      );
      return;
    }

    navigation.navigate('RequestRide', { serviceType });
  };

  const goToRideTracking = () => {
    if (activeRide) {
      navigation.navigate('RideTracking', { rideId: activeRide.id });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Olá, {user?.name?.split(' ')[0]}! 👋</Text>
            <Text style={styles.subtitleText}>Como podemos ajudar hoje?</Text>
          </View>
        </View>

        {/* Corrida Ativa */}
        {activeRide && (
          <View style={styles.activeRideContainer}>
            <Text style={styles.activeRideTitle}>Corrida Ativa</Text>
            <View style={styles.activeRideContent}>
              <Text style={styles.activeRideType}>{activeRide.serviceType}</Text>
              <Text style={styles.activeRideStatus}>Status: {activeRide.status}</Text>
              <TouchableOpacity style={styles.viewRideButton} onPress={goToRideTracking}>
                <Text style={styles.viewRideButtonText}>Acompanhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Localização */}
        <View style={styles.locationContainer}>
          {currentLocation ? (
            <Text style={styles.locationText}>
              📍 Localização obtida ({currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)})
            </Text>
          ) : (
            <View>
              <Text style={styles.locationText}>📍 Obtendo localização...</Text>
              {locationError && (
                <Text style={styles.locationError}>{locationError}</Text>
              )}
              <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Serviços Rápidos */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          <View style={styles.servicesGrid}>
            {quickServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServicePress(service.id)}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergência */}
        <View style={styles.emergencyContainer}>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => handleServicePress('EMERGENCIA')}
          >
            <Text style={styles.emergencyIcon}>🚨</Text>
            <Text style={styles.emergencyText}>EMERGÊNCIA</Text>
            <Text style={styles.emergencySubtext}>Socorro imediato</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  activeRideContainer: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  activeRideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  activeRideContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRideType: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
  activeRideStatus: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
  viewRideButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewRideButtonText: {
    color: '#856404',
    fontWeight: 'bold',
  },
  locationContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  locationError: {
    fontSize: 14,
    color: '#DC3545',
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emergencyContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emergencyButton: {
    backgroundColor: '#DC3545',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emergencySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});

export default HomeScreen;