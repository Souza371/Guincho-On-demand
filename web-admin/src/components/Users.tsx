import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import '../styles/global.css';
import '../styles/pages.css';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  totalRides: number;
  averageRating: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUsers(currentPage, 20, searchTerm);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await apiService.updateUserStatus(userId, isActive);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro ao alterar status do usuário');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="users-page fade-in">
      <div className="page-header">
        <h1>Gerenciamento de Usuários</h1>
        <p>Gerencie todos os usuários da plataforma</p>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="filters-row">
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Usuários ({filteredUsers.length})</div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Total de Viagens</th>
                <th>Data de Cadastro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.totalRides}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleStatusChange(user.id, !user.isActive)}
                    >
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <span className="ml-2 badge badge-info">
                      ⭐ {user.averageRating.toFixed(1)}
                    </span>
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

export default Users;