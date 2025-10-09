import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import '../styles/pages.css';
import '../styles/reports.css';

interface ReportData {
  totalUsers: number;
  totalProviders: number;
  totalRides: number;
  totalRevenue: number;
  monthlyRides: { month: string; count: number; revenue: number }[];
  serviceTypeStats: { type: string; count: number; percentage: number }[];
  topProviders: { id: string; name: string; rides: number; revenue: number; rating: number }[];
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Simular dados de relatório
      const mockData: ReportData = {
        totalUsers: 1234,
        totalProviders: 89,
        totalRides: 4567,
        totalRevenue: 234567.89,
        monthlyRides: [
          { month: 'Janeiro', count: 1200, revenue: 72000 },
          { month: 'Fevereiro', count: 1350, revenue: 81000 },
          { month: 'Março', count: 1567, revenue: 94020 },
        ],
        serviceTypeStats: [
          { type: 'Reboque', count: 2234, percentage: 49 },
          { type: 'Bateria', count: 1123, percentage: 25 },
          { type: 'Pneu', count: 890, percentage: 19 },
          { type: 'Combustível', count: 234, percentage: 5 },
          { type: 'Abertura', count: 86, percentage: 2 },
        ],
        topProviders: [
          { id: '1', name: 'Carlos Guincho', rides: 234, revenue: 14040, rating: 4.9 },
          { id: '2', name: 'Ana Reboque', rides: 198, revenue: 11880, rating: 4.8 },
          { id: '3', name: 'João Socorro', rides: 167, revenue: 10020, rating: 4.7 },
        ]
      };

      setTimeout(() => {
        setReportData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading">Carregando relatórios...</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="reports-page">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>Erro ao carregar relatórios</h3>
          <p>Tente novamente em alguns instantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page fade-in">
      <div className="page-header">
        <h1>Relatórios e Analytics</h1>
        <p>Análise detalhada do desempenho da plataforma</p>
      </div>

      {/* Filtros de Data */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="date-filters">
            <div className="form-group">
              <label className="form-label">Data Inicial</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data Final</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <button className="btn btn-primary" onClick={fetchReportData}>
              Atualizar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total de Usuários</span>
            <div className="stat-icon users">👥</div>
          </div>
          <div className="stat-value">{formatNumber(reportData.totalUsers)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Prestadores Ativos</span>
            <div className="stat-icon providers">🚛</div>
          </div>
          <div className="stat-value">{formatNumber(reportData.totalProviders)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total de Viagens</span>
            <div className="stat-icon rides">🚗</div>
          </div>
          <div className="stat-value">{formatNumber(reportData.totalRides)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Receita Total</span>
            <div className="stat-icon revenue">💰</div>
          </div>
          <div className="stat-value">{formatCurrency(reportData.totalRevenue)}</div>
        </div>
      </div>

      <div className="reports-grid">
        {/* Gráfico de Viagens por Mês */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Viagens por Mês</h3>
          </div>
          <div className="card-body">
            <div className="chart-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Viagens</th>
                    <th>Receita</th>
                    <th>Média por Viagem</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyRides.map((month, index) => (
                    <tr key={index}>
                      <td><strong>{month.month}</strong></td>
                      <td>{formatNumber(month.count)}</td>
                      <td>{formatCurrency(month.revenue)}</td>
                      <td>{formatCurrency(month.revenue / month.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tipos de Serviço */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tipos de Serviço</h3>
          </div>
          <div className="card-body">
            <div className="service-stats">
              {reportData.serviceTypeStats.map((service, index) => (
                <div key={index} className="service-stat-item">
                  <div className="service-info">
                    <span className="service-name">{service.type}</span>
                    <span className="service-count">{formatNumber(service.count)} ({service.percentage}%)</span>
                  </div>
                  <div className="service-bar">
                    <div 
                      className="service-bar-fill" 
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Prestadores */}
        <div className="card top-providers-card">
          <div className="card-header">
            <h3 className="card-title">Top Prestadores</h3>
          </div>
          <div className="card-body">
            <div className="top-providers-list">
              {reportData.topProviders.map((provider, index) => (
                <div key={provider.id} className="top-provider-item">
                  <div className="provider-rank">#{index + 1}</div>
                  <div className="provider-info">
                    <div className="provider-name">{provider.name}</div>
                    <div className="provider-stats">
                      <span>{formatNumber(provider.rides)} viagens</span>
                      <span>{formatCurrency(provider.revenue)}</span>
                      <span>⭐ {provider.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas de Performance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Métricas de Performance</h3>
          </div>
          <div className="card-body">
            <div className="performance-metrics">
              <div className="metric-item">
                <div className="metric-label">Viagens por Dia</div>
                <div className="metric-value">{Math.round(reportData.totalRides / 90)}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Receita por Viagem</div>
                <div className="metric-value">{formatCurrency(reportData.totalRevenue / reportData.totalRides)}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Taxa de Conversão</div>
                <div className="metric-value">85%</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Avaliação Média</div>
                <div className="metric-value">4.7 ⭐</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;