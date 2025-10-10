import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Picker } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ProviderRegistration } from '../services/apiService';

interface ProviderRegisterProps {
  onRegister: (providerData: any) => void;
  onBackToLogin: () => void;
}

const ProviderRegister: React.FC<ProviderRegisterProps> = ({ onRegister, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    cnpj: '',
    companyName: '',
    vehicleInfo: {
      type: 'tow_truck', // tow_truck, motorcycle
      brand: '',
      model: '',
      year: '',
      licensePlate: '',
      capacity: ''
    },
    documents: {
      driverLicense: '',
      vehicleRegistration: '',
      insurance: ''
    },
    bankInfo: {
      bank: '',
      agency: '',
      account: '',
      accountType: 'checking' // checking, savings
    },
    serviceArea: {
      city: '',
      state: '',
      radius: '10' // km
    }
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev] as any,
          [field]: value
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
    if (!formData.vehicleInfo.licensePlate.trim()) {
      Alert.alert('Erro', 'Placa do veículo é obrigatória');
      return false;
    }
    if (!formData.documents.driverLicense.trim()) {
      Alert.alert('Erro', 'CNH é obrigatória');
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
      // Simular chamada de API
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      const providerData = {
        ...formData,
        type: 'provider',
        id: Date.now().toString(),
        status: 'pending', // pending, approved, rejected
        rating: 0,
        totalJobs: 0
      };
      
      onRegister(providerData);
      Alert.alert('Sucesso', 'Cadastro enviado para análise! Você receberá um email quando for aprovado.');
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
          <Text style={styles.title}>Cadastro de Prestador</Text>
          <Text style={styles.subtitle}>Ofereça serviços de guincho</Text>
        </View>

        <View style={styles.form}>
          {/* Dados Pessoais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Dados Pessoais</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={formData.name}
              onChangeText={(value) => handleInputChange('', 'name', value)}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('', 'email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Telefone (11) 99999-9999"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('', 'phone', value)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="CPF"
              value={formData.cpf}
              onChangeText={(value) => handleInputChange('', 'cpf', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Dados da Empresa */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏢 Dados da Empresa (Opcional)</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome da empresa"
              value={formData.companyName}
              onChangeText={(value) => handleInputChange('', 'companyName', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="CNPJ (opcional)"
              value={formData.cnpj}
              onChangeText={(value) => handleInputChange('', 'cnpj', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Informações do Veículo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚛 Informações do Veículo</Text>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo de Veículo:</Text>
              <Picker
                selectedValue={formData.vehicleInfo.type}
                style={styles.picker}
                onValueChange={(value: string) => handleInputChange('vehicleInfo', 'type', value)}
              >
                <Picker.Item label="Guincho / Reboque" value="tow_truck" />
                <Picker.Item label="Moto para Emergências" value="motorcycle" />
              </Picker>
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Marca"
                value={formData.vehicleInfo.brand}
                onChangeText={(value) => handleInputChange('vehicleInfo', 'brand', value)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Modelo"
                value={formData.vehicleInfo.model}
                onChangeText={(value) => handleInputChange('vehicleInfo', 'model', value)}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Ano"
                value={formData.vehicleInfo.year}
                onChangeText={(value) => handleInputChange('vehicleInfo', 'year', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Placa (ABC-1234)"
                value={formData.vehicleInfo.licensePlate}
                onChangeText={(value) => handleInputChange('vehicleInfo', 'licensePlate', value.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            {formData.vehicleInfo.type === 'tow_truck' && (
              <TextInput
                style={styles.input}
                placeholder="Capacidade de carga (toneladas)"
                value={formData.vehicleInfo.capacity}
                onChangeText={(value) => handleInputChange('vehicleInfo', 'capacity', value)}
                keyboardType="numeric"
              />
            )}
          </View>

          {/* Documentos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📄 Documentos</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Número da CNH"
              value={formData.documents.driverLicense}
              onChangeText={(value) => handleInputChange('documents', 'driverLicense', value)}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="CRLV (Registro do veículo)"
              value={formData.documents.vehicleRegistration}
              onChangeText={(value) => handleInputChange('documents', 'vehicleRegistration', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Seguro do veículo"
              value={formData.documents.insurance}
              onChangeText={(value) => handleInputChange('documents', 'insurance', value)}
            />
          </View>

          {/* Área de Atendimento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Área de Atendimento</Text>
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                placeholder="Cidade"
                value={formData.serviceArea.city}
                onChangeText={(value) => handleInputChange('serviceArea', 'city', value)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="UF"
                value={formData.serviceArea.state}
                onChangeText={(value) => handleInputChange('serviceArea', 'state', value)}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Raio de Atendimento:</Text>
              <Picker
                selectedValue={formData.serviceArea.radius}
                style={styles.picker}
                onValueChange={(value: string) => handleInputChange('serviceArea', 'radius', value)}
              >
                <Picker.Item label="5 km" value="5" />
                <Picker.Item label="10 km" value="10" />
                <Picker.Item label="20 km" value="20" />
                <Picker.Item label="30 km" value="30" />
                <Picker.Item label="50 km" value="50" />
              </Picker>
            </View>
          </View>

          {/* Senha */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Senha</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={formData.password}
              onChangeText={(value) => handleInputChange('', 'password', value)}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('', 'confirmPassword', value)}
              secureTextEntry
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Seu cadastro será analisado pela nossa equipe. Você receberá um email quando for aprovado.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Enviando...' : 'Enviar Cadastro'}
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
    color: '#28a745',
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745',
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
    color: '#28a745',
    fontSize: 16,
  },
});

export default ProviderRegister;