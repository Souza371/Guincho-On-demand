import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalRides: number;
  activeRides: number;
  pendingApprovals: number;
  monthlyRevenue: number;
}

interface ChartData {
  date: string;
  rides: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalRides: 0,
    activeRides: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulando dados por enquanto - depois integrar com API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 142,
        totalProviders: 28,
        totalRides: 356,
        activeRides: 12,
        pendingApprovals: 5,
        monthlyRevenue: 28450.50,
      });

      // Dados do gráfico dos últimos 7 dias
      const mockChartData = [
        { date: '03/10', rides: 15 },
        { date: '04/10', rides: 23 },
        { date: '05/10', rides: 18 },
        { date: '06/10', rides: 31 },
        { date: '07/10', rides: 27 },
        { date: '08/10', rides: 19 },
        { date: '09/10', rides: 12 },
      ];
      
      setChartData(mockChartData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Geral</h2>
        <p>Visão geral do sistema Guincho On-demand</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Usuários</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <small>Total cadastrados</small>
          </div>
        </div>

        <div className="stat-card providers">
          <div className="stat-icon">🚛</div>
          <div className="stat-content">
            <h3>Prestadores</h3>
            <p className="stat-number">{stats.totalProviders}</p>
            <small>Ativos no sistema</small>
          </div>
        </div>

        <div className="stat-card rides">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>Corridas</h3>
            <p className="stat-number">{stats.totalRides}</p>
            <small>Total realizadas</small>
          </div>
        </div>

        <div className="stat-card active-rides">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Ativas Agora</h3>
            <p className="stat-number">{stats.activeRides}</p>
            <small>Em andamento</small>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Aprovações</h3>
            <p className="stat-number">{stats.pendingApprovals}</p>
            <small>Pendentes</small>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Receita Mensal</h3>
            <p className="stat-number">{formatCurrency(stats.monthlyRevenue)}</p>
            <small>Outubro 2025</small>
          </div>
        </div>
      </div>

      {/* Gráfico de Corridas */}
      <div className="chart-section">
        <div className="chart-container">
          <h3>Corridas por Dia (Últimos 7 dias)</h3>
          <div className="chart">
            <div className="chart-bars">
              {chartData.map((data, index) => {
                const maxValue = Math.max(...chartData.map(d => d.rides));
                const height = (data.rides / maxValue) * 100;
                
                return (
                  <div key={index} className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${height}%` }}
                      title={`${data.rides} corridas`}
                    >
                      <span className="bar-value">{data.rides}</span>
                    </div>
                    <span className="bar-label">{data.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <button className="action-button">
            <span className="action-icon">✅</span>
            <span>Aprovar Prestadores</span>
          </button>
          <button className="action-button">
            <span className="action-icon">📊</span>
            <span>Ver Relatórios</span>
          </button>
          <button className="action-button">
            <span className="action-icon">🚨</span>
            <span>Emergências Ativas</span>
          </button>
          <button className="action-button">
            <span className="action-icon">💬</span>
            <span>Suporte ao Cliente</span>
          </button>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="system-status">
        <h3>Status do Sistema</h3>
        <div className="status-items">
          <div className="status-item online">
            <span className="status-dot"></span>
            <span>API Backend</span>
            <span className="status-text">Online</span>
          </div>
          <div className="status-item online">
            <span className="status-dot"></span>
            <span>Banco de Dados</span>
            <span className="status-text">Conectado</span>
          </div>
          <div className="status-item online">
            <span className="status-dot"></span>
            <span>Notificações</span>
            <span className="status-text">Funcionando</span>
          </div>
          <div className="status-item online">
            <span className="status-dot"></span>
            <span>Pagamentos</span>
            <span className="status-text">Operacional</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;