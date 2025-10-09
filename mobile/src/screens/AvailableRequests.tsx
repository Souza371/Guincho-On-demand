import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';

interface ServiceRequest {
  id: string;
  serviceType: string;
  description: string;
  urgency: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destinationAddress?: string;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  distance?: number;
}

interface AvailableRequestsProps {
  providerId: string;
  providerLocation: {
    latitude: number;
    longitude: number;
  };
}

const AvailableRequests: React.FC<AvailableRequestsProps> = ({ providerId, providerLocation }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalEstimatedTime, setProposalEstimatedTime] = useState('');
  const [proposalNotes, setProposalNotes] = useState('');

  useEffect(() => {
    fetchAvailableRequests();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAvailableRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableRequests = async () => {
    setLoading(true);
    try {
      // Simular chamada de API com dados mockados
      const mockRequests: ServiceRequest[] = [
        {
          id: '1',
          serviceType: 'towing',
          description: 'Carro quebrado na Av. Paulista, precisa ser levado para oficina',
          urgency: 'normal',
          pickupLocation: {
            latitude: -23.5617,
            longitude: -46.6563,
            address: 'Av. Paulista, 1000 - Bela Vista, São Paulo'
          },
          destinationAddress: 'Oficina do João - Rua das Flores, 123',
          status: 'pending',
          createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min atrás
          userId: 'user1',
          userName: 'Maria Silva',
          distance: 2.5
        },
        {
          id: '2',
          serviceType: 'battery_jump',
          description: 'Bateria descarregada no estacionamento do shopping',
          urgency: 'urgent',
          pickupLocation: {
            latitude: -23.5953,
            longitude: -46.6530,
            address: 'Shopping Ibirapuera - Av. Ibirapuera, 3103'
          },
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min atrás
          userId: 'user2',
          userName: 'João Santos',
          distance: 4.2
        },
        {
          id: '3',
          serviceType: 'tire_change',
          description: 'Pneu furado na marginal, trânsito pesado',
          urgency: 'emergency',
          pickupLocation: {
            latitude: -23.5629,
            longitude: -46.6873,
            address: 'Marginal Pinheiros, próximo à Ponte Eusébio Matoso'
          },
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min atrás
          userId: 'user3',
          userName: 'Carlos Oliveira',
          distance: 1.8
        }
      ];

      // Simular delay de rede
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      setRequests(mockRequests);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeName = (type: string) => {
    const types: { [key: string]: { name: string; icon: string } } = {
      'towing': { name: 'Reboque/Guincho', icon: '🚛' },
      'battery_jump': { name: 'Bateria', icon: '🔋' },
      'tire_change': { name: 'Troca de Pneu', icon: '🛞' },
      'fuel_delivery': { name: 'Combustível', icon: '⛽' },
      'lockout': { name: 'Abertura', icon: '🔑' },
      'mechanical_help': { name: 'Socorro Mecânico', icon: '🔧' }
    };
    return types[type] || { name: type, icon: '🛠️' };
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return '#dc3545';
      case 'urgent': return '#ffc107';
      default: return '#28a745';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'EMERGÊNCIA';
      case 'urgent': return 'URGENTE';
      default: return 'NORMAL';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h atrás`;
  };

  const handleMakeProposal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setProposalPrice('');
    setProposalEstimatedTime('');
    setProposalNotes('');
    setShowProposalModal(true);
  };

  const submitProposal = async () => {
    if (!proposalPrice || !proposalEstimatedTime) {
      Alert.alert('Erro', 'Preencha preço e tempo estimado');
      return;
    }

    try {
      const proposal = {
        id: Date.now().toString(),
        requestId: selectedRequest?.id,
        providerId,
        price: parseFloat(proposalPrice),
        estimatedTime: parseInt(proposalEstimatedTime),
        notes: proposalNotes,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Simular envio da proposta
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      Alert.alert('Sucesso', 'Proposta enviada com sucesso!');
      setShowProposalModal(false);
      
      // Remover a solicitação da lista (foi respondida)
      setRequests(prev => prev.filter(r => r.id !== selectedRequest?.id));
      
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar proposta');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitações Disponíveis</Text>
        <TouchableOpacity onPress={fetchAvailableRequests} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando solicitações...</Text>
        </View>
      )}

      <ScrollView style={styles.requestsList}>
        {requests.map(request => {
          const serviceInfo = getServiceTypeName(request.serviceType);
          const urgencyColor = getUrgencyColor(request.urgency);
          
          return (
            <View key={request.id} style={styles.requestCard}>
              {/* Header do Card */}
              <View style={styles.requestHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceIcon}>{serviceInfo.icon}</Text>
                  <View>
                    <Text style={styles.serviceName}>{serviceInfo.name}</Text>
                    <Text style={styles.requestTime}>{getTimeAgo(request.createdAt)}</Text>
                  </View>
                </View>
                
                <View style={styles.urgencyBadge}>
                  <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
                  <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                    {getUrgencyText(request.urgency)}
                  </Text>
                </View>
              </View>

              {/* Informações do Cliente */}
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>👤 {request.userName}</Text>
                <Text style={styles.distance}>📍 {request.distance} km de distância</Text>
              </View>

              {/* Descrição */}
              <Text style={styles.description}>{request.description}</Text>

              {/* Localização */}
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>📍 Local de origem:</Text>
                <Text style={styles.locationAddress}>{request.pickupLocation.address}</Text>
                
                {request.destinationAddress && (
                  <>
                    <Text style={styles.locationLabel}>🎯 Destino:</Text>
                    <Text style={styles.locationAddress}>{request.destinationAddress}</Text>
                  </>
                )}
              </View>

              {/* Botões de Ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.viewLocationButton}
                  onPress={() => Alert.alert('Mapa', 'Abrir localização no mapa (implementar)')}
                >
                  <Text style={styles.viewLocationText}>Ver no Mapa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.proposalButton}
                  onPress={() => handleMakeProposal(request)}
                >
                  <Text style={styles.proposalButtonText}>Fazer Proposta</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {!loading && requests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Nenhuma solicitação disponível</Text>
            <Text style={styles.emptySubtitle}>
              As solicitações aparecerão aqui quando houver demanda na sua região
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Proposta */}
      <Modal
        visible={showProposalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Fazer Proposta</Text>
            <TouchableOpacity onPress={() => setShowProposalModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedRequest && (
              <>
                <View style={styles.requestSummary}>
                  <Text style={styles.summaryTitle}>Resumo da Solicitação:</Text>
                  <Text style={styles.summaryText}>
                    {getServiceTypeName(selectedRequest.serviceType).name} - {selectedRequest.userName}
                  </Text>
                  <Text style={styles.summaryDescription}>{selectedRequest.description}</Text>
                </View>

                <View style={styles.proposalForm}>
                  <Text style={styles.fieldLabel}>💰 Preço do Serviço (R$)</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Ex: 150.00"
                    value={proposalPrice}
                    onChangeText={setProposalPrice}
                    keyboardType="numeric"
                  />

                  <Text style={styles.fieldLabel}>⏰ Tempo até o Local (minutos)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 15"
                    value={proposalEstimatedTime}
                    onChangeText={setProposalEstimatedTime}
                    keyboardType="numeric"
                  />

                  <Text style={styles.fieldLabel}>📝 Observações (opcional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Ex: Tenho equipamento especializado, experiência com este tipo de problema..."
                    value={proposalNotes}
                    onChangeText={setProposalNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.submitProposalButton} onPress={submitProposal}>
                  <Text style={styles.submitProposalText}>Enviar Proposta</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  requestsList: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  requestTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 14,
    color: '#495057',
  },
  distance: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewLocationButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  viewLocationText: {
    color: '#495057',
    fontWeight: '500',
  },
  proposalButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  proposalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    fontSize: 24,
    color: '#6c757d',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  requestSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#212529',
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  proposalForm: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  priceInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    minHeight: 80,
  },
  submitProposalButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  submitProposalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AvailableRequests;