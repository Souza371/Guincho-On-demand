import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import '../styles/global.css';
import '../styles/pages.css';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licensePlate: string;
  isApproved: boolean;
  isActive: boolean;
  averageRating: number;
  totalRides: number;
  createdAt: string;
  earnings: number;
  documents: {
    cnh: 'approved' | 'pending' | 'rejected';
    vehicleDoc: 'approved' | 'pending' | 'rejected';
    insurance: 'approved' | 'pending' | 'rejected';
  };
}

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProviders();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProviders(currentPage, 20, searchTerm);
      setProviders(response.providers);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      setError('Erro ao carregar prestadores');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    try {
      await apiService.approveProvider(providerId);
      setProviders(providers.map(provider => 
        provider.id === providerId ? { ...provider, isApproved: true, isActive: true } : provider
      ));
    } catch (error) {
      console.error('Erro ao aprovar prestador:', error);
      setError('Erro ao aprovar prestador');
    }
  };

  const handleStatusChange = async (providerId: string, isActive: boolean) => {
    try {
      await apiService.updateProviderStatus(providerId, isActive);
      setProviders(providers.map(provider => 
        provider.id === providerId ? { ...provider, isActive } : provider
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro ao alterar status do prestador');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDocumentStatusBadge = (status: 'approved' | 'pending' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">✓</span>;
      case 'pending':
        return <span className="badge badge-warning">⏳</span>;
      case 'rejected':
        return <span className="badge badge-danger">✗</span>;
      default:
        return <span className="badge badge-secondary">?</span>;
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'approved') {
      matchesStatus = provider.isApproved;
    } else if (statusFilter === 'pending') {
      matchesStatus = !provider.isApproved;
    } else if (statusFilter === 'active') {
      matchesStatus = provider.isActive;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !provider.isActive;
    }
    
    return matchesSearch && matchesStatus;
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
              <option value="approved">Aprovados</option>
              <option value="pending">Pendente aprovação</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
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
                <th>Corridas</th>
                <th>Ganhos</th>
                <th>Documentos</th>
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
                  </td>
                  <td>
                    <div>
                      <strong>{provider.vehicleType}</strong>
                      <br />
                      <small className="text-muted">{provider.licensePlate}</small>
                    </div>
                  </td>
                  <td>
                    {provider.averageRating > 0 ? (
                      <div>
                        <span>⭐ {provider.averageRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted">Sem avaliações</span>
                    )}
                  </td>
                  <td>{provider.totalRides}</td>
                  <td>{formatCurrency(provider.earnings)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <div title="CNH">{getDocumentStatusBadge(provider.documents.cnh)}</div>
                      <div title="Documento do Veículo">{getDocumentStatusBadge(provider.documents.vehicleDoc)}</div>
                      <div title="Seguro">{getDocumentStatusBadge(provider.documents.insurance)}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className={`badge ${provider.isApproved ? 'badge-success' : 'badge-warning'}`}>
                        {provider.isApproved ? 'Aprovado' : 'Pendente'}
                      </span>
                      <br />
                      <span className={`badge ${provider.isActive ? 'badge-success' : 'badge-secondary'}`}>
                        {provider.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2 flex-column">
                      {!provider.isApproved && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApproveProvider(provider.id)}
                        >
                          Aprovar
                        </button>
                      )}
                      {provider.isApproved && (
                        <button
                          className={`btn btn-sm ${provider.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleStatusChange(provider.id, !provider.isActive)}
                        >
                          {provider.isActive ? 'Desativar' : 'Ativar'}
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