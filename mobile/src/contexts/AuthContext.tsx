import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  type: 'user' | 'provider';
  rating?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userType: 'user' | 'provider' | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterUserData | RegisterProviderData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  birthDate: string;
  type: 'user';
}

interface RegisterProviderData {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  birthDate: string;
  type: 'provider';
  vehicleType: string;
  vehiclePlate: string;
  serviceTypes: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Verificar se há token salvo ao iniciar o app
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Configurar o token no serviço da API
        apiService.setAuthToken(token);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post('/auth/login', {
        email,
        password
      });

      const { user: userData, accessToken, refreshToken } = response.data;
      
      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      // Atualizar estado
      setUser(userData);
      setIsAuthenticated(true);
      
      // Configurar token no serviço da API
      apiService.setAuthToken(accessToken);
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterUserData | RegisterProviderData) => {
    try {
      setIsLoading(true);
      
      const endpoint = userData.type === 'user' 
        ? '/auth/register/user'
        : '/auth/register/provider';
        
      const response = await apiService.post(endpoint, userData);
      
      const { user: newUser, accessToken, refreshToken } = response.data;
      
      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
      
      // Atualizar estado
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Configurar token no serviço da API
      apiService.setAuthToken(accessToken);
      
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw new Error(error.response?.data?.error || 'Erro ao fazer registro');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chamar endpoint de logout no backend
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpar dados locais independente do resultado
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Remover token do serviço da API
      apiService.removeAuthToken();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Salvar no AsyncStorage
      AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    userType: user?.type || null,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}