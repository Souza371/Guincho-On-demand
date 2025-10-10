import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { apiService } from './apiService';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface LocationError {
  code: number;
  message: string;
}

interface WatchPositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: LocationCoordinates | null = null;
  private locationUpdateCallbacks: ((location: LocationCoordinates) => void)[] = [];

  constructor() {
    // Configuração básica
    console.log('LocationService inicializado');
  }

  /**
   * Solicitar permissões de localização
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'O Guincho On-demand precisa acessar sua localização para encontrar prestadores próximos.',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permissão de localização concedida');
          return true;
        } else {
          console.log('Permissão de localização negada');
          Alert.alert(
            'Permissão Necessária',
            'Para usar o app, é necessário permitir o acesso à localização.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }

      // Para iOS, a permissão é solicitada automaticamente
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }

  /**
   * Obter localização atual (simulada para desenvolvimento)
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      // Simulação da localização para desenvolvimento
      // Em produção, use a API de geolocalização real
      const mockLocation: LocationCoordinates = {
        latitude: -23.5505199, // São Paulo - Av. Paulista
        longitude: -46.6333094,
        accuracy: 5,
        timestamp: Date.now(),
      };

      setTimeout(() => {
        this.lastKnownLocation = mockLocation;
        console.log('Localização obtida (simulada):', mockLocation);
        resolve(mockLocation);
      }, 1000);

      // Implementação real (descomentada quando integrar com biblioteca de localização):
      /*
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const location: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          this.lastKnownLocation = location;
          console.log('Localização obtida:', location);
          resolve(location);
        },
        (error: any) => {
          console.error('Erro ao obter localização:', error);
          this.handleLocationError(error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
      */
    });
  }

  /**
   * Obter endereço da localização atual
   */
  async getCurrentLocationWithAddress(): Promise<{ coordinates: LocationCoordinates; address: string }> {
    try {
      const coordinates = await this.getCurrentLocation();
      const address = await apiService.reverseGeocode(coordinates.latitude, coordinates.longitude);
      
      return { coordinates, address };
    } catch (error) {
      throw new Error('Não foi possível obter a localização atual');
    }
  }

  /**
   * Iniciar monitoramento da localização (simulado para desenvolvimento)
   */
  startWatchingLocation(callback: (location: LocationCoordinates) => void, options?: WatchPositionOptions): void {
    if (this.watchId !== null) {
      this.stopWatchingLocation();
    }

    this.locationUpdateCallbacks.push(callback);

    // Simulação de atualizações de localização para desenvolvimento
    this.watchId = setInterval(() => {
      if (this.lastKnownLocation) {
        // Simular pequenas variações na localização
        const location: LocationCoordinates = {
          latitude: this.lastKnownLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: this.lastKnownLocation.longitude + (Math.random() - 0.5) * 0.001,
          accuracy: 5 + Math.random() * 10,
          timestamp: Date.now(),
        };

        this.lastKnownLocation = location;
        
        // Notificar todos os callbacks registrados
        this.locationUpdateCallbacks.forEach(cb => cb(location));
        
        console.log('Localização atualizada (simulada):', location);
      }
    }, 30000) as any; // Atualizar a cada 30 segundos

    // Implementação real (descomentada quando integrar com biblioteca de localização):
    /*
    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 30000,
      distanceFilter: 10,
      ...options,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const location: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.lastKnownLocation = location;
        this.locationUpdateCallbacks.forEach(cb => cb(location));
        console.log('Localização atualizada:', location);
      },
      (error: any) => {
        console.error('Erro no monitoramento de localização:', error);
        this.handleLocationError(error);
      },
      watchOptions
    );
    */
  }

  /**
   * Parar monitoramento da localização
   */
  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      clearInterval(this.watchId);
      this.watchId = null;
      this.locationUpdateCallbacks = [];
      console.log('Monitoramento de localização parado');
    }
  }

  /**
   * Atualizar localização no servidor (para prestadores)
   */
  async updateLocationOnServer(): Promise<void> {
    try {
      if (!this.lastKnownLocation) {
        await this.getCurrentLocation();
      }

      if (this.lastKnownLocation) {
        await apiService.updateLocation(
          this.lastKnownLocation.latitude,
          this.lastKnownLocation.longitude
        );
        console.log('Localização atualizada no servidor');
      }
    } catch (error) {
      console.error('Erro ao atualizar localização no servidor:', error);
    }
  }

  /**
   * Buscar prestadores próximos
   */
  async findNearbyProviders(
    serviceType: string,
    radius: number = 10
  ): Promise<any[]> {
    try {
      let location = this.lastKnownLocation;
      
      if (!location) {
        location = await this.getCurrentLocation();
      }

      const response = await apiService.getNearbyProviders(
        location.latitude,
        location.longitude,
        serviceType,
        radius
      );

      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Erro ao buscar prestadores próximos:', error);
      return [];
    }
  }

  /**
   * Calcular distância até um local
   */
  calculateDistanceToLocation(targetLat: number, targetLon: number): number | null {
    if (!this.lastKnownLocation) {
      return null;
    }

    return apiService.calculateDistance(
      this.lastKnownLocation.latitude,
      this.lastKnownLocation.longitude,
      targetLat,
      targetLon
    );
  }

  /**
   * Obter última localização conhecida
   */
  getLastKnownLocation(): LocationCoordinates | null {
    return this.lastKnownLocation;
  }

  /**
   * Verificar se os serviços de localização estão disponíveis
   */
  async isLocationServicesEnabled(): Promise<boolean> {
    // Para desenvolvimento, sempre retorna true
    // Em produção, implementar verificação real
    return Promise.resolve(true);
    
    // Implementação real (descomentada quando integrar com biblioteca de localização):
    /*
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (error: any) => {
          if (error.code === 1) { // PERMISSION_DENIED
            resolve(false);
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            resolve(false);
          } else if (error.code === 3) { // TIMEOUT
            resolve(true); // Serviço está disponível, apenas demorou
          } else {
            resolve(false);
          }
        },
        { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false }
      );
    });
    */
  }

  /**
   * Tratar erros de localização
   */
  private handleLocationError(error: LocationError): void {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        Alert.alert(
          'Permissão Negada',
          'O acesso à localização foi negado. Por favor, habilite nas configurações.',
          [{ text: 'OK' }]
        );
        break;
      case 2: // POSITION_UNAVAILABLE
        Alert.alert(
          'Localização Indisponível',
          'Não foi possível obter sua localização. Verifique se o GPS está ativado.',
          [{ text: 'OK' }]
        );
        break;
      case 3: // TIMEOUT
        Alert.alert(
          'Tempo Esgotado',
          'A localização demorou muito para ser obtida. Tente novamente.',
          [{ text: 'OK' }]
        );
        break;
      default:
        Alert.alert(
          'Erro de Localização',
          'Ocorreu um erro ao obter sua localização.',
          [{ text: 'OK' }]
        );
    }
  }

  /**
   * Abrir navegação para um destino
   */
  openNavigation(destinationLat: number, destinationLon: number, label?: string): void {
    const url = Platform.select({
      ios: `maps://app?daddr=${destinationLat},${destinationLon}`,
      android: `google.navigation:q=${destinationLat},${destinationLon}&mode=d`,
    });

    if (url) {
      // Implementar abertura de URL nativa
      console.log('Abrindo navegação para:', { destinationLat, destinationLon, label });
    }
  }

  /**
   * Limpar dados de localização
   */
  cleanup(): void {
    this.stopWatchingLocation();
    this.lastKnownLocation = null;
    this.locationUpdateCallbacks = [];
  }
}

export const locationService = new LocationService();
export type { LocationCoordinates, LocationError, WatchPositionOptions };