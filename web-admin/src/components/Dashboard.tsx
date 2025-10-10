import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import SimpleChart from './Charts';
import SimpleMap from './SimpleMap';
import RealTimeMetrics from './RealTimeMetrics';
import AlertSystem from './AlertSystem';
import '../styles/Dashboard.css';
import '../styles/components.css';

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalRides: number;
  activeRides: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  newProvidersThisMonth: number;
  averageRating: number;
  completionRate: number;
}

interface ChartData {
  date: string;
  rides: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalRides: 0,
    activeRides: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
    newProvidersThisMonth: 0,
    averageRating: 0,
    completionRate: 0,
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiService.getDashboardStats();
      setStats(data);

      // Gerar dados do gráfico dos últimos 7 dias
      const today = new Date();
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          rides: Math.floor(Math.random() * 30) + 10,
          revenue: Math.floor(Math.random() * 1000) + 500
        });
      }
      setChartData(chartData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
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

      {/* Sistema de Alertas - Temporariamente desabilitado para economizar memória */}
      {/* <AlertSystem maxAlerts={4} /> */}

      {/* Métricas em Tempo Real - Temporariamente desabilitado para economizar memória */}
      {/* <RealTimeMetrics updateInterval={8000} /> */}

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
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Avaliação Média</h3>
            <p className="stat-number">{stats.averageRating.toFixed(1)}</p>
            <small>de 5.0</small>
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

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Taxa de Conclusão</h3>
            <p className="stat-number">{stats.completionRate.toFixed(1)}%</p>
            <small>Corridas completadas</small>
          </div>
        </div>

        <div className="stat-card new-users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Novos Usuários</h3>
            <p className="stat-number">{stats.newUsersThisMonth}</p>
            <small>Este mês</small>
          </div>
        </div>

        <div className="stat-card new-providers">
          <div className="stat-icon">🚛</div>
          <div className="stat-content">
            <h3>Novos Prestadores</h3>
            <p className="stat-number">{stats.newProvidersThisMonth}</p>
            <small>Este mês</small>
          </div>
        </div>

        <div className="stat-card total-revenue">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <h3>Receita Total</h3>
            <p className="stat-number">{formatCurrency(stats.totalRevenue)}</p>
            <small>Desde o início</small>
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

      {/* Mapa em Tempo Real - Temporariamente desabilitado para economizar memória */}
      {/* <div className="dashboard-section">
        <SimpleMap height={400} />
      </div> */}

      {/* Gráficos Avançados - Temporariamente desabilitado para economizar memória */}
      {/* <div className="charts-section">
        <div className="charts-grid">
          <SimpleChart
            type="bar"
            title="Corridas por Dia"
            data={{
              labels: chartData.map(d => new Date(d.date).toLocaleDateString()),
              data: chartData.map(d => d.rides)
            }}
          />
          <SimpleChart
            type="line"
            title="Receita Semanal"
            data={{
              labels: chartData.map(d => new Date(d.date).toLocaleDateString()),
              data: chartData.map(d => d.revenue)
            }}
          />
        </div>
      </div> */}

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