import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import '../styles/pages.css';

interface Ride {
  id: string;
  userId: string;
  userName: string;
  providerId?: string;
  providerName?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  serviceType: 'towing' | 'battery_jump' | 'tire_change' | 'fuel_delivery' | 'lockout';
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoffLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  price?: number;
  estimatedArrival?: string;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  description: string;
}

const Rides: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'towing' | 'battery_jump' | 'tire_change' | 'fuel_delivery' | 'lockout'>('all');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      // Simular API call
      const mockRides: Ride[] = [
        {
          id: '1',
          userId: '1',
          userName: 'João Silva',
          providerId: '1',
          providerName: 'Carlos Guincho',
          status: 'completed',
          serviceType: 'towing',
          pickupLocation: {
            address: 'Av. Paulista, 1000 - São Paulo, SP',
            lat: -23.5617,
            lng: -46.6563
          },
          dropoffLocation: {
            address: 'Rua Augusta, 500 - São Paulo, SP',
            lat: -23.5505,
            lng: -46.6333
          },
          price: 120.00,
          createdAt: '2024-03-15T10:30:00Z',
          completedAt: '2024-03-15T11:45:00Z',
          rating: 5,
          description: 'Carro quebrado na Paulista'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Maria Santos',
          status: 'pending',
          serviceType: 'battery_jump',
          pickupLocation: {
            address: 'Shopping Ibirapuera - São Paulo, SP',
            lat: -23.5953,
            lng: -46.6530
          },
          createdAt: '2024-03-16T14:20:00Z',
          description: 'Bateria descarregada no estacionamento'
        },
        {
          id: '3',
          userId: '1',
          userName: 'João Silva',
          providerId: '2',
          providerName: 'Ana Reboque',
          status: 'in_progress',
          serviceType: 'tire_change',
          pickupLocation: {
            address: 'Marginal Pinheiros - São Paulo, SP',
            lat: -23.5629,
            lng: -46.6873
          },
          estimatedArrival: '2024-03-16T15:30:00Z',
          price: 80.00,
          createdAt: '2024-03-16T14:45:00Z',
          description: 'Pneu furado na marginal'
        }
      ];
      
      setTimeout(() => {
        setRides(mockRides);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
      setLoading(false);
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'towing': return 'Reboque';
      case 'battery_jump': return 'Bateria';
      case 'tire_change': return 'Pneu';
      case 'fuel_delivery': return 'Combustível';
      case 'lockout': return 'Abertura';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pendente</span>;
      case 'accepted':
        return <span className="badge badge-info">Aceito</span>;
      case 'in_progress':
        return <span className="badge badge-info">Em Andamento</span>;
      case 'completed':
        return <span className="badge badge-success">Concluído</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelado</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.pickupLocation.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    const matchesService = serviceFilter === 'all' || ride.serviceType === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  if (loading) {
    return (
      <div className="rides-page">
        <div className="loading">Carregando viagens...</div>
      </div>
    );
  }

  return (
    <div className="rides-page fade-in">
      <div className="page-header">
        <h1>Gerenciamento de Viagens</h1>
        <p>Monitore todas as solicitações de serviço da plataforma</p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total de Viagens</span>
            <div className="stat-icon rides">📊</div>
          </div>
          <div className="stat-value">{rides.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pendentes</span>
            <div className="stat-icon rides">⏳</div>
          </div>
          <div className="stat-value">{rides.filter(r => r.status === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Em Andamento</span>
            <div className="stat-icon rides">🚛</div>
          </div>
          <div className="stat-value">{rides.filter(r => r.status === 'in_progress').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Concluídas</span>
            <div className="stat-icon rides">✅</div>
          </div>
          <div className="stat-value">{rides.filter(r => r.status === 'completed').length}</div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="filters-row">
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por usuário, prestador ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="accepted">Aceitos</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <select
              className="form-control form-select"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as any)}
            >
              <option value="all">Todos os serviços</option>
              <option value="towing">Reboque</option>
              <option value="battery_jump">Bateria</option>
              <option value="tire_change">Pneu</option>
              <option value="fuel_delivery">Combustível</option>
              <option value="lockout">Abertura</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Viagens ({filteredRides.length})</div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Prestador</th>
                <th>Serviço</th>
                <th>Local de Origem</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Data/Hora</th>
                <th>Avaliação</th>
              </tr>
            </thead>
            <tbody>
              {filteredRides.map((ride) => (
                <tr key={ride.id}>
                  <td>
                    <strong>#{ride.id}</strong>
                  </td>
                  <td>
                    <strong>{ride.userName}</strong>
                    <br />
                    <small className="text-muted">{ride.description}</small>
                  </td>
                  <td>
                    {ride.providerName ? (
                      <strong>{ride.providerName}</strong>
                    ) : (
                      <span className="text-muted">Não atribuído</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {getServiceTypeName(ride.serviceType)}
                    </span>
                  </td>
                  <td>
                    <small>{ride.pickupLocation.address}</small>
                    {ride.dropoffLocation && (
                      <>
                        <br />
                        <small className="text-muted">→ {ride.dropoffLocation.address}</small>
                      </>
                    )}
                  </td>
                  <td>
                    {ride.price ? formatPrice(ride.price) : '-'}
                  </td>
                  <td>
                    {getStatusBadge(ride.status)}
                  </td>
                  <td>
                    <small>
                      <strong>Criado:</strong> {formatDateTime(ride.createdAt)}
                      {ride.completedAt && (
                        <>
                          <br />
                          <strong>Concluído:</strong> {formatDateTime(ride.completedAt)}
                        </>
                      )}
                      {ride.estimatedArrival && ride.status === 'in_progress' && (
                        <>
                          <br />
                          <strong>Previsão:</strong> {formatDateTime(ride.estimatedArrival)}
                        </>
                      )}
                    </small>
                  </td>
                  <td>
                    {ride.rating ? (
                      <span>⭐ {ride.rating}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rides;