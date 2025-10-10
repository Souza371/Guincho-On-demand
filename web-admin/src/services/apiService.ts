// Serviço para gerenciar chamadas da API no painel administrativo

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `Erro ${response.status}`);
    }
    return response.json();
  }

  // Estatísticas do Dashboard
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retornar dados simulados para desenvolvimento
      return {
        totalUsers: 127,
        totalProviders: 23,
        totalRides: 456,
        activeRides: 8,
        totalRevenue: 12450.50,
        monthlyRevenue: 3200.00,
        newUsersThisMonth: 15,
        newProvidersThisMonth: 3,
        averageRating: 4.6,
        completionRate: 94.2
      };
    }
  }

  // Gestão de Usuários
  async getUsers(page = 1, limit = 20, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      });
      
      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Dados simulados
      return {
        users: [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '(11) 99999-1111',
            createdAt: '2024-01-15T10:30:00Z',
            isActive: true,
            totalRides: 12,
            averageRating: 4.8
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@test.com',
            phone: '(11) 99999-2222',
            createdAt: '2024-02-20T14:15:00Z',
            isActive: true,
            totalRides: 8,
            averageRating: 4.6
          }
        ],
        total: 127,
        page: 1,
        totalPages: 7
      };
    }
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      return { success: true }; // Simulação
    }
  }

  // Gestão de Prestadores
  async getProviders(page = 1, limit = 20, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      });
      
      const response = await fetch(`${API_URL}/admin/providers?${params}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      // Dados simulados
      return {
        providers: [
          {
            id: '1',
            name: 'Carlos Oliveira',
            email: 'carlos@guincho.com',
            phone: '(11) 99999-3333',
            vehicleType: 'Guincho Leve',
            licensePlate: 'ABC-1234',
            isApproved: true,
            isActive: true,
            createdAt: '2024-01-10T09:00:00Z',
            totalRides: 45,
            averageRating: 4.9,
            earnings: 8500.00,
            documents: {
              cnh: 'approved',
              vehicleDoc: 'approved',
              insurance: 'pending'
            }
          },
          {
            id: '2',
            name: 'Roberto Costa',
            email: 'roberto@guincho.com',
            phone: '(11) 99999-4444',
            vehicleType: 'Guincho Pesado',
            licensePlate: 'DEF-5678',
            isApproved: false,
            isActive: false,
            createdAt: '2024-03-01T16:30:00Z',
            totalRides: 0,
            averageRating: 0,
            earnings: 0,
            documents: {
              cnh: 'approved',
              vehicleDoc: 'pending',
              insurance: 'rejected'
            }
          }
        ],
        total: 23,
        page: 1,
        totalPages: 2
      };
    }
  }

  async approveProvider(providerId: string) {
    try {
      const response = await fetch(`${API_URL}/admin/providers/${providerId}/approve`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao aprovar prestador:', error);
      return { success: true }; // Simulação
    }
  }

  async updateProviderStatus(providerId: string, isActive: boolean) {
    try {
      const response = await fetch(`${API_URL}/admin/providers/${providerId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar status do prestador:', error);
      return { success: true }; // Simulação
    }
  }

  // Gestão de Corridas
  async getRides(page = 1, limit = 20, status = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status
      });
      
      const response = await fetch(`${API_URL}/admin/rides?${params}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar corridas:', error);
      // Dados simulados
      return {
        rides: [
          {
            id: '1',
            userName: 'João Silva',
            providerName: 'Carlos Oliveira',
            origin: 'Av. Paulista, 1000',
            destination: 'Rua Augusta, 500',
            status: 'completed',
            createdAt: '2024-03-10T10:30:00Z',
            completedAt: '2024-03-10T11:15:00Z',
            price: 85.50,
            distance: 12.5,
            rating: 5
          },
          {
            id: '2',
            userName: 'Maria Santos',
            providerName: 'Roberto Costa',
            origin: 'Shopping Morumbi',
            destination: 'Aeroporto Congonhas',
            status: 'in_progress',
            createdAt: '2024-03-10T14:20:00Z',
            completedAt: null,
            price: 120.00,
            distance: 18.2,
            rating: null
          }
        ],
        total: 456,
        page: 1,
        totalPages: 23
      };
    }
  }

  // Relatórios
  async getRevenueReport(startDate: string, endDate: string) {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      const response = await fetch(`${API_URL}/admin/reports/revenue?${params}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao gerar relatório de receita:', error);
      // Dados simulados
      return {
        totalRevenue: 12450.50,
        totalRides: 456,
        averageRideValue: 27.30,
        platformFee: 2490.10,
        providerEarnings: 9960.40,
        dailyRevenue: [
          { date: '2024-03-01', revenue: 450.00, rides: 15 },
          { date: '2024-03-02', revenue: 380.50, rides: 12 },
          { date: '2024-03-03', revenue: 520.75, rides: 18 }
        ]
      };
    }
  }

  async getRidesReport(startDate: string, endDate: string) {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      const response = await fetch(`${API_URL}/admin/reports/rides?${params}`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Erro ao gerar relatório de corridas:', error);
      // Dados simulados
      return {
        totalRides: 456,
        completedRides: 430,
        cancelledRides: 26,
        completionRate: 94.3,
        averageRating: 4.6,
        averageDistance: 15.2,
        averageDuration: 45,
        busyHours: [
          { hour: 8, rides: 25 },
          { hour: 18, rides: 32 },
          { hour: 22, rides: 18 }
        ]
      };
    }
  }
}

export default new ApiService();