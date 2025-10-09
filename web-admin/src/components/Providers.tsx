import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import '../styles/pages.css';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'tow_truck' | 'motorcycle';
  licensePlate: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  totalJobs: number;
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'tow_truck' | 'motorcycle'>('all');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      // Simular API call
      const mockProviders: Provider[] = [
        {
          id: '1',
          name: 'Carlos Guincho',
          email: 'carlos@guincho.com',
          phone: '(11) 99999-1111',
          vehicleType: 'tow_truck',
          licensePlate: 'ABC-1234',
          status: 'active',
          rating: 4.8,
          totalJobs: 150,
          createdAt: '2024-01-10',
          location: {
            lat: -23.5505,
            lng: -46.6333,
            address: 'São Paulo, SP'
          }
        },
        {
          id: '2',
          name: 'Ana Reboque',
          email: 'ana@reboque.com',
          phone: '(11) 88888-2222',
          vehicleType: 'tow_truck',
          licensePlate: 'XYZ-5678',
          status: 'active',
          rating: 4.9,
          totalJobs: 89,
          createdAt: '2024-01-15',
          location: {
            lat: -23.5505,
            lng: -46.6333,
            address: 'São Paulo, SP'
          }
        },
        {
          id: '3',
          name: 'José Moto',
          email: 'jose@moto.com',
          phone: '(11) 77777-3333',
          vehicleType: 'motorcycle',
          licensePlate: 'MOT-9999',
          status: 'pending',
          rating: 0,
          totalJobs: 0,
          createdAt: '2024-03-01'
        }
      ];
      
      setTimeout(() => {
        setProviders(mockProviders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (providerId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      setProviders(providers.map(provider => 
        provider.id === providerId ? { ...provider, status: newStatus } : provider
      ));
      // Aqui seria feita a chamada para a API
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const getVehicleTypeName = (type: string) => {
    switch (type) {
      case 'tow_truck': return 'Guincho';
      case 'motorcycle': return 'Moto';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Ativo</span>;
      case 'inactive':
        return <span className="badge badge-secondary">Inativo</span>;
      case 'pending':
        return <span className="badge badge-warning">Pendente</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || provider.vehicleType === vehicleFilter;
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  if (loading) {
    return (
      <div className="providers-page">
        <div className="loading">Carregando prestadores...</div>
      </div>
    );
  }

  return (
    <div className="providers-page fade-in">
      <div className="page-header">
        <h1>Gerenciamento de Prestadores</h1>
        <p>Gerencie todos os prestadores de serviço da plataforma</p>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="filters-row">
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nome, email ou placa..."
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
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="pending">Pendentes</option>
            </select>
            <select
              className="form-control form-select"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value as any)}
            >
              <option value="all">Todos os veículos</option>
              <option value="tow_truck">Guincho</option>
              <option value="motorcycle">Moto</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Prestadores ({filteredProviders.length})</div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Veículo</th>
                <th>Avaliação</th>
                <th>Jobs Concluídos</th>
                <th>Data de Cadastro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => (
                <tr key={provider.id}>
                  <td>
                    <strong>{provider.name}</strong>
                    <br />
                    <small className="text-muted">{provider.email}</small>
                  </td>
                  <td>
                    {provider.phone}
                    {provider.location && (
                      <>
                        <br />
                        <small className="text-muted">{provider.location.address}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <div>
                      <strong>{getVehicleTypeName(provider.vehicleType)}</strong>
                      <br />
                      <small className="text-muted">{provider.licensePlate}</small>
                    </div>
                  </td>
                  <td>
                    {provider.rating > 0 ? (
                      <div>
                        <span>⭐ {provider.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted">Sem avaliações</span>
                    )}
                  </td>
                  <td>{provider.totalJobs}</td>
                  <td>{new Date(provider.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{getStatusBadge(provider.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {provider.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(provider.id, 'active')}
                          >
                            Aprovar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusChange(provider.id, 'inactive')}
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      {provider.status === 'active' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusChange(provider.id, 'inactive')}
                        >
                          Desativar
                        </button>
                      )}
                      {provider.status === 'inactive' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusChange(provider.id, 'active')}
                        >
                          Ativar
                        </button>
                      )}
                    </div>
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

export default Providers;