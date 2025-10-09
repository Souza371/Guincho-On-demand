import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Importar telas
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/user/HomeScreen';
import RequestRideScreen from './src/screens/user/RequestRideScreen';
import RideTrackingScreen from './src/screens/user/RideTrackingScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import HistoryScreen from './src/screens/user/HistoryScreen';

// Telas do prestador
import ProviderHomeScreen from './src/screens/provider/ProviderHomeScreen';
import ProviderRidesScreen from './src/screens/provider/ProviderRidesScreen';
import ProviderEarningsScreen from './src/screens/provider/ProviderEarningsScreen';
import ProviderProfileScreen from './src/screens/provider/ProviderProfileScreen';

// Contextos
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';

// Tipos de navegação
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  UserApp: undefined;
  ProviderApp: undefined;
  Login: undefined;
  Register: undefined;
  RequestRide: undefined;
  RideTracking: { rideId: string };
};

export type UserTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

export type ProviderTabParamList = {
  Home: undefined;
  Rides: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const UserTab = createBottomTabNavigator<UserTabParamList>();
const ProviderTab = createBottomTabNavigator<ProviderTabParamList>();

// Navegação para usuários
function UserTabNavigator() {
  return (
    <UserTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <UserTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <UserTab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ tabBarLabel: 'Histórico' }}
      />
      <UserTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </UserTab.Navigator>
  );
}

// Navegação para prestadores
function ProviderTabNavigator() {
  return (
    <ProviderTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          if (route.name === 'Home') {
            iconName = 'work';
          } else if (route.name === 'Rides') {
            iconName = 'directions-car';
          } else if (route.name === 'Earnings') {
            iconName = 'attach-money';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28A745',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <ProviderTab.Screen 
        name="Home" 
        component={ProviderHomeScreen}
        options={{ tabBarLabel: 'Trabalho' }}
      />
      <ProviderTab.Screen 
        name="Rides" 
        component={ProviderRidesScreen}
        options={{ tabBarLabel: 'Corridas' }}
      />
      <ProviderTab.Screen 
        name="Earnings" 
        component={ProviderEarningsScreen}
        options={{ tabBarLabel: 'Ganhos' }}
      />
      <ProviderTab.Screen 
        name="Profile" 
        component={ProviderProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </ProviderTab.Navigator>
  );
}

// Navegação principal
function MainNavigator() {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Telas de autenticação
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Telas autenticadas baseadas no tipo de usuário
        <>
          {userType === 'user' ? (
            <>
              <Stack.Screen name="UserApp" component={UserTabNavigator} />
              <Stack.Screen name="RequestRide" component={RequestRideScreen} />
              <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
            </>
          ) : (
            <Stack.Screen name="ProviderApp" component={ProviderTabNavigator} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </LocationProvider>
    </AuthProvider>
  );
}
