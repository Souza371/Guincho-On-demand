import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';

interface ServiceHistoryItem {
  id: string;
  serviceType: string;
  provider: {
    name: string;
    rating: number;
  };
  status: 'completed' | 'cancelled' | 'pending';
  price: number;
  date: string;
  location: string;
  description: string;
  rating?: number;
  review?: string;
}

interface ServiceHistoryProps {
  onViewDetails: (serviceId: string) => void;
  onRateService: (serviceId: string) => void;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({ onViewDetails, onRateService }) => {
  const [services, setServices] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchServiceHistory();
  }, []);

  const fetchServiceHistory = async () => {
    try {
      // Simular chamada de API
      const mockData: ServiceHistoryItem[] = [
        {
          id: '1',
          serviceType: 'towing',
          provider: {
            name: 'Carlos Guincho Rápido',
            rating: 4.8
          },
          status: 'completed',
          price: 120.00,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Av. Paulista, 1000 - São Paulo',
          description: 'Carro quebrado, reboque até oficina',
          rating: 5,
          review: 'Excelente atendimento! Muito profissional e rápido.'
        },
        {
          id: '2',
          serviceType: 'battery_jump',
          provider: {
            name: 'Ana Socorro 24h',
            rating: 4.9
          },
          status: 'completed',
          price: 45.00,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Shopping Eldorado - Pinheiros',
          description: 'Bateria descarregada no estacionamento'
        },
        {
          id: '3',
          serviceType: 'tire_change',
          provider: {
            name: 'João Pneus Express',
            rating: 4.5
          },
          status: 'cancelled',
          price: 80.00,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Marginal Tietê - Vila Olímpia',
          description: 'Pneu furado na marginal'
        },
        {
          id: '4',
          serviceType: 'fuel_delivery',
          provider: {
            name: 'Pedro Combustível Rápido',
            rating: 4.7
          },
          status: 'completed',
          price: 65.00,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Av. Rebouças - Jardins',
          description: 'Combustível acabou, entrega de 10L gasolina',
          rating: 4,
          review: 'Bom atendimento, chegou rápido.'
        },
        {
          id: '5',
          serviceType: 'lockout',
          provider: {
            name: 'Maria Chaveiro Express',
            rating: 4.6
          },
          status: 'completed',
          price: 35.00,
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Rua Augusta - Consolação',
          description: 'Chave trancada dentro do carro',
          rating: 5,
          review: 'Muito eficiente! Resolveu rapidamente sem danificar o carro.'
        }
      ];

      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      setServices(mockData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar histórico de serviços');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServiceHistory();
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

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; backgroundColor: string } } = {
      'completed': { label: 'Concluído', color: '#28a745', backgroundColor: '#d4edda' },
      'cancelled': { label: 'Cancelado', color: '#dc3545', backgroundColor: '#f8d7da' },
      'pending': { label: 'Pendente', color: '#ffc107', backgroundColor: '#fff3cd' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '⭐' : '☆');
    }
    return stars.join('');
  };

  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    return service.status === filter;
  });

  const renderServiceItem = ({ item }: { item: ServiceHistoryItem }) => {
    const serviceInfo = getServiceTypeName(item.serviceType);
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity 
        style={styles.serviceCard}
        onPress={() => onViewDetails(item.id)}
      >
        {/* Header */}
        <View style={styles.serviceHeader}>
          <View style={styles.serviceTitle}>
            <Text style={styles.serviceIcon}>{serviceInfo.icon}</Text>
            <View style={styles.serviceTitleText}>
              <Text style={styles.serviceName}>{serviceInfo.name}</Text>
              <Text style={styles.serviceDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.provider.name}</Text>
          <Text style={styles.providerRating}>
            {renderStars(item.provider.rating)} {item.provider.rating}
          </Text>
        </View>

        {/* Service Details */}
        <Text style={styles.serviceLocation}>📍 {item.location}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>

        {/* Price and Rating */}
        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>R$ {item.price.toFixed(2)}</Text>
          
          {item.status === 'completed' && (
            <View style={styles.ratingSection}>
              {item.rating ? (
                <Text style={styles.myRating}>
                  Sua avaliação: {renderStars(item.rating)}
                </Text>
              ) : (
                <TouchableOpacity 
                  style={styles.rateButton}
                  onPress={() => onRateService(item.id)}
                >
                  <Text style={styles.rateButtonText}>Avaliar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Review */}
        {item.review && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewText}>💬 "{item.review}"</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Histórico de Serviços</Text>
        <Text style={styles.headerSubtitle}>
          {services.length} serviço{services.length !== 1 ? 's' : ''} realizados
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Todos ({services.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Concluídos ({services.filter(s => s.status === 'completed').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'cancelled' && styles.activeFilter]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.activeFilterText]}>
            Cancelados ({services.filter(s => s.status === 'cancelled').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service List */}
      {filteredServices.length > 0 ? (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          style={styles.servicesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' 
              ? 'Você ainda não solicitou nenhum serviço.'
              : `Nenhum serviço ${filter === 'completed' ? 'concluído' : 'cancelado'} encontrado.`
            }
          </Text>
        </View>
      )}
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  serviceTitleText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  serviceDate: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  providerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  providerRating: {
    fontSize: 12,
    color: '#6c757d',
  },
  serviceLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  ratingSection: {
    alignItems: 'flex-end',
  },
  myRating: {
    fontSize: 12,
    color: '#6c757d',
  },
  rateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  reviewText: {
    fontSize: 13,
    color: '#495057',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ServiceHistory;