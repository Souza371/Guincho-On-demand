import React, { createContext, useContext, useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  isLocationLoading: boolean;
  locationError: string | null;
  getCurrentLocation: () => Promise<Location>;
  watchLocation: (callback: (location: Location) => void) => number;
  stopWatchingLocation: (watchId: number) => void;
  requestLocationPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation deve ser usado dentro de um LocationProvider');
  }
  return context;
}

interface LocationProviderProps {
  children: React.ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'O app precisa acessar sua localização para encontrar prestadores próximos.',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permissão de localização concedida');
          return true;
        } else {
          console.log('Permissão de localização negada');
          setLocationError('Permissão de localização negada');
          return false;
        }
      } else {
        // Para iOS, a permissão é solicitada automaticamente quando usamos o Geolocation
        return true;
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão de localização:', err);
      setLocationError('Erro ao solicitar permissão');
      return false;
    }
  };

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      setIsLocationLoading(true);
      setLocationError(null);
      
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          setCurrentLocation(location);
          setIsLocationLoading(false);
          resolve(location);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case 1:
              errorMessage = 'Permissão de localização negada';
              break;
            case 2:
              errorMessage = 'Localização não disponível';
              break;
            case 3:
              errorMessage = 'Timeout na obtenção da localização';
              break;
          }
          
          setLocationError(errorMessage);
          setIsLocationLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  const watchLocation = (callback: (location: Location) => void): number => {
    return Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        setCurrentLocation(location);
        callback(location);
      },
      (error) => {
        console.error('Erro no watch location:', error);
        setLocationError('Erro ao monitorar localização');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Atualizar a cada 10 metros
        interval: 5000, // Atualizar a cada 5 segundos
      }
    );
  };

  const stopWatchingLocation = (watchId: number) => {
    Geolocation.clearWatch(watchId);
  };

  const value: LocationContextType = {
    currentLocation,
    isLocationLoading,
    locationError,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    requestLocationPermission,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}