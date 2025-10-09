import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Para emulador Android
// const API_BASE_URL = 'http://localhost:3000/api'; // Para iOS Simulator

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - trata erros globalmente
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        
        // Se erro 401, tentar renovar token
        if (error.response?.status === 401) {
          try {
            await this.refreshToken();
            // Retry da requisição original
            return this.api.request(error.config);
          } catch (refreshError) {
            // Se falhar ao renovar, redirecionar para login
            await this.clearTokens();
            // TODO: Redirecionar para tela de login
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Configurar token de autenticação
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remover token de autenticação
  removeAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Renovar token
  private async refreshToken() {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    
    // Salvar novos tokens
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', newRefreshToken);
    
    // Atualizar token na instância da API
    this.setAuthToken(accessToken);
    
    return accessToken;
  }

  // Limpar tokens do storage
  private async clearTokens() {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_data');
    this.removeAuthToken();
  }

  // Métodos HTTP
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  // Upload de arquivos
  async uploadFile(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void) {
    return this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }
}

// Singleton instance
export const apiService = new ApiService();

// Serviços específicos
export const authService = {
  login: (email: string, password: string) =>
    apiService.post('/auth/login', { email, password }),

  registerUser: (userData: any) =>
    apiService.post('/auth/register/user', userData),

  registerProvider: (providerData: any) =>
    apiService.post('/auth/register/provider', providerData),

  refreshToken: (refreshToken: string) =>
    apiService.post('/auth/refresh', { refreshToken }),

  logout: () =>
    apiService.post('/auth/logout'),
};

export const userService = {
  getProfile: () =>
    apiService.get('/users/profile'),

  updateProfile: (userData: any) =>
    apiService.put('/users/profile', userData),

  getRides: (page = 1, limit = 10, status?: string) =>
    apiService.get(`/users/rides?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),

  getAddresses: () =>
    apiService.get('/users/addresses'),

  createAddress: (addressData: any) =>
    apiService.post('/users/addresses', addressData),

  updateAddress: (addressId: string, addressData: any) =>
    apiService.put(`/users/addresses/${addressId}`, addressData),

  deleteAddress: (addressId: string) =>
    apiService.delete(`/users/addresses/${addressId}`),
};

export const providerService = {
  getProfile: () =>
    apiService.get('/providers/profile'),

  updateProfile: (providerData: any) =>
    apiService.put('/providers/profile', providerData),

  updateAvailability: (isAvailable: boolean, latitude?: number, longitude?: number) =>
    apiService.put('/providers/availability', { isAvailable, currentLatitude: latitude, currentLongitude: longitude }),

  getRides: (page = 1, limit = 10, status?: string) =>
    apiService.get(`/providers/rides?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),

  getAvailableRides: (latitude?: number, longitude?: number, radius = 10) =>
    apiService.get(`/providers/available-rides?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),

  getEarnings: (period = 'month', startDate?: string, endDate?: string) =>
    apiService.get(`/providers/earnings?period=${period}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`),
};

export const rideService = {
  createRide: (rideData: any) =>
    apiService.post('/rides', rideData),

  getRide: (rideId: string) =>
    apiService.get(`/rides/${rideId}`),

  updateRideStatus: (rideId: string, status: string) =>
    apiService.put(`/rides/${rideId}/status`, { status }),

  createProposal: (rideId: string, proposalData: any) =>
    apiService.post(`/rides/${rideId}/proposals`, proposalData),

  acceptProposal: (rideId: string, proposalId: string) =>
    apiService.put(`/rides/${rideId}/proposals/${proposalId}`),

  rateRide: (rideId: string, rating: number, comment?: string) =>
    apiService.post(`/rides/${rideId}/rating`, { rating, comment }),
};