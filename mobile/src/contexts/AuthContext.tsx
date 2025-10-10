import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, LoginCredentials, UserRegistration, ProviderRegistration } from '../services/apiService';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'user' | 'provider';
  avatar?: string;
  isVerified?: boolean;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  // Campos específicos para prestadores
  vehicleInfo?: {
    type: string;
    brand: string;
    model: string;
    year: string;
    licensePlate: string;
    color: string;
  };
  serviceTypes?: string[];
  serviceRadius?: number;
  rating?: number;
  totalJobs?: number;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'RESTORE_AUTH'; payload: { user: User; token: string } };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  registerUser: (userData: UserRegistration) => Promise<boolean>;
  registerProvider: (providerData: ProviderRegistration) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  restoreAuth: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'RESTORE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar autenticação ao inicializar o app
  useEffect(() => {
    restoreAuth();
  }, []);

  const restoreAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'RESTORE_AUTH', payload: { user, token } });
      }
    } catch (error) {
      console.error('Erro ao restaurar autenticação:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao fazer login' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const registerUser = async (userData: UserRegistration): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiService.registerUser(userData);

      if (response.success) {
        // Após registro bem-sucedido, fazer login automaticamente
        const loginSuccess = await login({
          email: userData.email,
          password: userData.password,
        });
        return loginSuccess;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao registrar usuário' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no registro';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const registerProvider = async (providerData: ProviderRegistration): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiService.registerProvider(providerData);

      if (response.success) {
        // Após registro bem-sucedido, fazer login automaticamente
        const loginSuccess = await login({
          email: providerData.email,
          password: providerData.password,
        });
        return loginSuccess;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao registrar prestador' });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no registro';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Aqui você implementaria uma chamada para a API de atualização de perfil
      // const response = await apiService.updateProfile(userData);

      // Por enquanto, apenas simular sucesso
      dispatch({ type: 'UPDATE_USER', payload: userData });
      
      // Atualizar dados salvos localmente
      if (state.user) {
        const updatedUser = { ...state.user, ...userData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    registerUser,
    registerProvider,
    logout,
    updateProfile,
    clearError,
    restoreAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export type { User, AuthState, AuthContextType };