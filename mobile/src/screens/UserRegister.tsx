import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { UserRegistration } from '../services/apiService';

interface UserRegisterProps {
  onRegister: (userData: any) => void;
  onBackToLogin: () => void;
}

const UserRegister: React.FC<UserRegisterProps> = ({ onRegister, onBackToLogin }) => {
  const { registerUser, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Erro', 'Email válido é obrigatório');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Erro', 'Telefone é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      Alert.alert('Erro', 'CPF é obrigatório');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData: UserRegistration = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          number: formData.address.number,
          complement: '',
          neighborhood: formData.address.neighborhood,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
        },
      };

      const success = await registerUser(userData);
      
      if (success) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
          { text: 'OK', onPress: () => onRegister(userData) }
        ]);
      } else {
        Alert.alert('Erro', error || 'Erro ao realizar cadastro. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro de Usuário</Text>
          <Text style={styles.subtitle}>Solicite guincho com segurança</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Telefone (11) 99999-9999"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="CPF"
              value={formData.cpf}
              onChangeText={(value) => handleInputChange('cpf', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 3, marginRight: 10 }]}
                placeholder="Rua"
                value={formData.address.street}
                onChangeText={(value) => handleInputChange('address.street', value)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nº"
                value={formData.address.number}
                onChangeText={(value) => handleInputChange('address.number', value)}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Bairro"
              value={formData.address.neighborhood}
              onChangeText={(value) => handleInputChange('address.neighborhood', value)}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                placeholder="Cidade"
                value={formData.address.city}
                onChangeText={(value) => handleInputChange('address.city', value)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="UF"
                value={formData.address.state}
                onChangeText={(value) => handleInputChange('address.state', value)}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="CEP"
              value={formData.address.zipCode}
              onChangeText={(value) => handleInputChange('address.zipCode', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Senha</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={onBackToLogin}>
            <Text style={styles.linkText}>Já tem conta? Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default UserRegister;