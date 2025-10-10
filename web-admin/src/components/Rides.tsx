import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import '../styles/global.css';
import '../styles/pages.css';

interface Ride {
  id: string;
  userName: string;
  providerName?: string;
  origin: string;
  destination?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price?: number;
  distance?: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
}

const Rides: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRides();
  }, [currentPage, statusFilter]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getRides(currentPage, 20, statusFilter === 'all' ? '' : statusFilter);
      setRides(response.rides);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao buscar corridas:', error);
      setError('Erro ao carregar corridas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pendente</span>;
      case 'accepted':
        return <span className="badge badge-info">Aceito</span>;
      case 'in_progress':
        return <span className="badge badge-primary">Em Andamento</span>;
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

  const formatCurrency = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ride.providerName && ride.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         ride.origin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
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

          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Corridas ({filteredRides.length})</div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Prestador</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Distância</th>
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
                  </td>
                  <td>
                    {ride.providerName ? (
                      <strong>{ride.providerName}</strong>
                    ) : (
                      <span className="text-muted">Não atribuído</span>
                    )}
                  </td>
                  <td>
                    <small>{ride.origin}</small>
                  </td>
                  <td>
                    {ride.destination ? (
                      <small>{ride.destination}</small>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {ride.distance ? (
                      <span>{ride.distance.toFixed(1)} km</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {formatCurrency(ride.price)}
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