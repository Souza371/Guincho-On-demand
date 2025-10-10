import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração base da API
const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'https://your-production-api.com';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserRegistration {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface ProviderRegistration extends UserRegistration {
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  licensePlate: string;
  vehicleColor: string;
  serviceRadius: number;
  serviceTypes: string[];
  documents: {
    cnh: string;
    vehicleDocument: string;
    insurance: string;
  };
}

interface ServiceRequest {
  serviceType: string;
  description: string;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface Proposal {
  rideId: string;
  price: number;
  estimatedTime: number;
  notes?: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('Erro na API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Autenticação
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async registerUser(userData: UserRegistration): Promise<ApiResponse<any>> {
    return this.request('/api/auth/register/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerProvider(providerData: ProviderRegistration): Promise<ApiResponse<any>> {
    return this.request('/api/auth/register/provider', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      await AsyncStorage.multiRemove(['authToken', 'user']);
    }
  }

  // Serviços/Corridas
  async createServiceRequest(serviceData: ServiceRequest): Promise<ApiResponse<{ rideId: string }>> {
    return this.request('/api/rides', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async getAvailableRequests(): Promise<ApiResponse<any[]>> {
    return this.request('/api/rides/available');
  }

  async createProposal(proposal: Proposal): Promise<ApiResponse<any>> {
    return this.request(`/api/rides/${proposal.rideId}/proposals`, {
      method: 'POST',
      body: JSON.stringify({
        price: proposal.price,
        estimatedTime: proposal.estimatedTime,
        notes: proposal.notes,
      }),
    });
  }

  async getRideWithProposals(rideId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/rides/${rideId}`);
  }

  async acceptProposal(rideId: string, proposalId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/rides/${rideId}/proposals/${proposalId}`, {
      method: 'PUT',
    });
  }

  async updateRideStatus(rideId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/api/rides/${rideId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async rateService(rideId: string, rating: number, review?: string): Promise<ApiResponse<any>> {
    return this.request(`/api/rides/${rideId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  async getUserRideHistory(): Promise<ApiResponse<any[]>> {
    return this.request('/api/rides/history');
  }

  // Localização
  async updateLocation(latitude: number, longitude: number): Promise<ApiResponse<any>> {
    return this.request('/api/providers/location', {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async getNearbyProviders(
    latitude: number,
    longitude: number,
    serviceType: string,
    radius: number = 10
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      serviceType,
      radius: radius.toString(),
    });

    return this.request(`/api/providers/nearby?${params}`);
  }

  // Utilitários
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request('/api/auth/test');
      return response.success;
    } catch {
      return false;
    }
  }

  // Geocoding (reverter coordenadas para endereço)
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      // Usando a API do Google Maps (você precisa configurar uma chave de API)
      const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
      );
      
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
      
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Erro no geocoding:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Calcular distância entre dois pontos
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const apiService = new ApiService();
export type {
  ApiResponse,
  LoginCredentials,
  UserRegistration,
  ProviderRegistration,
  ServiceRequest,
  Proposal,
};