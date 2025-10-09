import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';

interface Proposal {
  id: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerTotalJobs: number;
  providerDistance: number;
  price: number;
  estimatedTime: number;
  notes?: string;
  createdAt: string;
  vehicleInfo: {
    type: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

interface ServiceRequestWithProposals {
  id: string;
  serviceType: string;
  description: string;
  urgency: string;
  status: string;
  proposals: Proposal[];
  createdAt: string;
}

interface ProposalSelectionProps {
  requestId: string;
  onProposalAccepted: (proposalId: string) => void;
}

const ProposalSelection: React.FC<ProposalSelectionProps> = ({ requestId, onProposalAccepted }) => {
  const [requestData, setRequestData] = useState<ServiceRequestWithProposals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequestData();
  }, [requestId]);

  const fetchRequestData = async () => {
    try {
      // Simular chamada de API
      const mockRequestData: ServiceRequestWithProposals = {
        id: requestId,
        serviceType: 'towing',
        description: 'Carro quebrado na Av. Paulista, precisa ser levado para oficina',
        urgency: 'normal',
        status: 'pending',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        proposals: [
          {
            id: '1',
            providerId: 'provider1',
            providerName: 'Carlos Guincho Rápido',
            providerRating: 4.8,
            providerTotalJobs: 150,
            providerDistance: 2.1,
            price: 120.00,
            estimatedTime: 15,
            notes: 'Tenho guincho hidráulico, experiência com carros sedan. Chegaria em 15 min.',
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            vehicleInfo: {
              type: 'tow_truck',
              brand: 'Ford',
              model: 'Cargo 1719',
              licensePlate: 'ABC-1234'
            }
          },
          {
            id: '2',
            providerId: 'provider2',
            providerName: 'Ana Reboque 24h',
            providerRating: 4.9,
            providerTotalJobs: 89,
            providerDistance: 3.5,
            price: 100.00,
            estimatedTime: 25,
            notes: 'Preço promocional! Atendimento 24h, equipamento moderno.',
            createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
            vehicleInfo: {
              type: 'tow_truck',
              brand: 'Mercedes',
              model: 'Accelo 815',
              licensePlate: 'XYZ-5678'
            }
          },
          {
            id: '3',
            providerId: 'provider3',
            providerName: 'José Socorro Express',
            providerRating: 4.6,
            providerTotalJobs: 234,
            providerDistance: 1.8,
            price: 150.00,
            estimatedTime: 10,
            notes: 'Mais próximo! Guincho de alta capacidade, atendimento premium.',
            createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
            vehicleInfo: {
              type: 'tow_truck',
              brand: 'Iveco',
              model: 'Daily 70C16',
              licensePlate: 'PRE-9876'
            }
          }
        ]
      };

      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      setRequestData(mockRequestData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar propostas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequestData();
  };

  const handleAcceptProposal = (proposal: Proposal) => {
    Alert.alert(
      'Confirmar Proposta',
      `Deseja aceitar a proposta de ${proposal.providerName} por R$ ${proposal.price.toFixed(2)}?\n\nTempo estimado: ${proposal.estimatedTime} minutos`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: () => {
            onProposalAccepted(proposal.id);
            Alert.alert(
              'Proposta Aceita!',
              `${proposal.providerName} foi notificado e está a caminho!\n\nTempo estimado: ${proposal.estimatedTime} min\nPreço: R$ ${proposal.price.toFixed(2)}`
            );
          }
        }
      ]
    );
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h atrás`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return stars.join('');
  };

  const sortedProposals = requestData?.proposals.sort((a, b) => {
    // Ordenar por: menor tempo + melhor avaliação + menor preço
    const scoreA = (a.estimatedTime * 0.4) + ((5 - a.providerRating) * 10) + (a.price * 0.01);
    const scoreB = (b.estimatedTime * 0.4) + ((5 - b.providerRating) * 10) + (b.price * 0.01);
    return scoreA - scoreB;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando propostas...</Text>
      </View>
    );
  }

  if (!requestData || !requestData.proposals.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⏳</Text>
        <Text style={styles.emptyTitle}>Aguardando Propostas</Text>
        <Text style={styles.emptySubtitle}>
          Os prestadores estão analisando sua solicitação.{'\n'}
          As propostas aparecerão aqui em alguns minutos.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const serviceInfo = getServiceTypeName(requestData.serviceType);

  return (
    <View style={styles.container}>
      {/* Header da Solicitação */}
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.serviceIcon}>{serviceInfo.icon}</Text>
          <View>
            <Text style={styles.serviceName}>{serviceInfo.name}</Text>
            <Text style={styles.requestTime}>
              Solicitado {getTimeAgo(requestData.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.proposalCount}>
          {requestData.proposals.length} proposta{requestData.proposals.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView 
        style={styles.proposalsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>💰 Compare as Propostas:</Text>
        
        {sortedProposals?.map((proposal, index) => (
          <View key={proposal.id} style={[
            styles.proposalCard,
            index === 0 && styles.bestProposal
          ]}>
            {index === 0 && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>🏆 MELHOR OFERTA</Text>
              </View>
            )}

            {/* Header do Prestador */}
            <View style={styles.providerHeader}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{proposal.providerName}</Text>
                <View style={styles.providerRating}>
                  <Text style={styles.stars}>{renderStars(proposal.providerRating)}</Text>
                  <Text style={styles.ratingText}>
                    {proposal.providerRating} ({proposal.providerTotalJobs} serviços)
                  </Text>
                </View>
              </View>
              <Text style={styles.proposalTime}>
                {getTimeAgo(proposal.createdAt)}
              </Text>
            </View>

            {/* Informações do Veículo */}
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleText}>
                🚛 {proposal.vehicleInfo.brand} {proposal.vehicleInfo.model} - {proposal.vehicleInfo.licensePlate}
              </Text>
            </View>

            {/* Métricas Principais */}
            <View style={styles.proposalMetrics}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>💰 Preço</Text>
                <Text style={styles.priceValue}>R$ {proposal.price.toFixed(2)}</Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>⏰ Chegada</Text>
                <Text style={styles.timeValue}>{proposal.estimatedTime} min</Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>📍 Distância</Text>
                <Text style={styles.distanceValue}>{proposal.providerDistance.toFixed(1)} km</Text>
              </View>
            </View>

            {/* Observações */}
            {proposal.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>💬 Observações:</Text>
                <Text style={styles.notesText}>{proposal.notes}</Text>
              </View>
            )}

            {/* Botão de Aceitar */}
            <TouchableOpacity 
              style={[styles.acceptButton, index === 0 && styles.bestAcceptButton]}
              onPress={() => handleAcceptProposal(proposal)}
            >
              <Text style={styles.acceptButtonText}>
                {index === 0 ? '🏆 Aceitar Melhor Oferta' : 'Aceitar Proposta'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Dica: Compare preço, tempo e avaliação antes de escolher
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  requestTime: {
    fontSize: 14,
    color: '#6c757d',
  },
  proposalCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  proposalsList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
  },
  proposalCard: {
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
  bestProposal: {
    borderColor: '#28a745',
    borderWidth: 2,
    backgroundColor: '#f8fff9',
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 1,
  },
  bestBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  proposalTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  vehicleInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 14,
    color: '#495057',
  },
  proposalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  notesSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bestAcceptButton: {
    backgroundColor: '#28a745',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default ProposalSelection;