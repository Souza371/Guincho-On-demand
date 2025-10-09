import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  
  const [userType, setUserType] = useState<'user' | 'provider'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    birthDate: '',
    // Campos específicos do prestador
    vehicleType: '',
    vehiclePlate: '',
    serviceTypes: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validação básica
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (userType === 'provider' && (!formData.vehicleType || !formData.vehiclePlate)) {
      Alert.alert('Erro', 'Prestadores devem preencher os dados do veículo');
      return;
    }

    try {
      setIsLoading(true);
      
      const registrationData = {
        ...formData,
        type: userType,
        serviceTypes: userType === 'provider' ? ['GUINCHO_LEVE'] : undefined,
      };

      await register(registrationData as any);
      // Navegação será feita automaticamente pelo AuthProvider
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🚛</Text>
          </View>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Cadastre-se para começar</Text>
        </View>

        {/* User Type Selector */}
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'user' && styles.userTypeButtonActive]}
            onPress={() => setUserType('user')}
          >
            <Text style={[styles.userTypeText, userType === 'user' && styles.userTypeTextActive]}>
              Cliente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'provider' && styles.userTypeButtonActive]}
            onPress={() => setUserType('provider')}
          >
            <Text style={[styles.userTypeText, userType === 'provider' && styles.userTypeTextActive]}>
              Prestador
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#999"
              value={formData.cpf}
              onChangeText={(value) => updateFormData('cpf', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Campos específicos do prestador */}
          {userType === 'provider' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de veículo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Guincho, Reboque"
                  placeholderTextColor="#999"
                  value={formData.vehicleType}
                  onChangeText={(value) => updateFormData('vehicleType', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Placa do veículo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ABC-1234"
                  placeholderTextColor="#999"
                  value={formData.vehiclePlate}
                  onChangeText={(value) => updateFormData('vehiclePlate', value)}
                  autoCapitalize="characters"
                />
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Cadastrando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.loginText}>Faça login aqui</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userTypeTextActive: {
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },
  loginText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RegisterScreen;