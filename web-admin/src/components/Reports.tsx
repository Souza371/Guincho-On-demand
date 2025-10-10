import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import '../styles/global.css';
import '../styles/pages.css';

interface RevenueReport {
  totalRevenue: number;
  totalRides: number;
  averageRideValue: number;
  platformFee: number;
  providerEarnings: number;
  dailyRevenue: { date: string; revenue: number; rides: number }[];
}

interface RidesReport {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  completionRate: number;
  averageRating: number;
  averageDistance: number;
  averageDuration: number;
  busyHours: { hour: number; rides: number }[];
}

const Reports: React.FC = () => {
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [ridesReport, setRidesReport] = useState<RidesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'revenue' | 'rides'>('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [revenueData, ridesData] = await Promise.all([
        apiService.getRevenueReport(dateRange.startDate, dateRange.endDate),
        apiService.getRidesReport(dateRange.startDate, dateRange.endDate)
      ]);
      
      setRevenueReport(revenueData);
      setRidesReport(ridesData);
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      setError('Erro ao carregar relatórios');
    } finally {
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading">Carregando relatórios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>Erro ao carregar relatórios</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchReportData}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page fade-in">
      <div className="page-header">
        <h1>Relatórios e Analytics</h1>
        <p>Acompanhe métricas e estatísticas detalhadas da plataforma</p>
      </div>

      {/* Filtros de Data */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="date-range-selector">
            <div className="form-group">
              <label>Data Inicial:</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Data Final:</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" onClick={fetchReportData}>
              Atualizar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Abas dos Relatórios */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="nav nav-tabs">
            <button 
              className={`nav-link ${activeTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenue')}
            >
              💰 Receita
            </button>
            <button 
              className={`nav-link ${activeTab === 'rides' ? 'active' : ''}`}
              onClick={() => setActiveTab('rides')}
            >
              🚗 Corridas
            </button>
          </div>
        </div>
        <div className="card-body">
          {activeTab === 'revenue' && revenueReport && (
            <div className="revenue-report">
              <div className="stats-grid mb-4">
                <div className="stat-card revenue">
                  <div className="stat-icon">�</div>
                  <div className="stat-content">
                    <h3>Receita Total</h3>
                    <div className="stat-value">{formatCurrency(revenueReport.totalRevenue)}</div>
                  </div>
                </div>
                <div className="stat-card rides">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-content">
                    <h3>Total de Corridas</h3>
                    <div className="stat-value">{formatNumber(revenueReport.totalRides)}</div>
                  </div>
                </div>
                <div className="stat-card average">
                  <div className="stat-icon">�</div>
                  <div className="stat-content">
                    <h3>Valor Médio</h3>
                    <div className="stat-value">{formatCurrency(revenueReport.averageRideValue)}</div>
                  </div>
                </div>
                <div className="stat-card fee">
                  <div className="stat-icon">🏦</div>
                  <div className="stat-content">
                    <h3>Taxa da Plataforma</h3>
                    <div className="stat-value">{formatCurrency(revenueReport.platformFee)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rides' && ridesReport && (
            <div className="rides-report">
              <div className="stats-grid mb-4">
                <div className="stat-card total">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-content">
                    <h3>Total de Corridas</h3>
                    <div className="stat-value">{formatNumber(ridesReport.totalRides)}</div>
                  </div>
                </div>
                <div className="stat-card completed">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3>Concluídas</h3>
                    <div className="stat-value">{formatNumber(ridesReport.completedRides)}</div>
                  </div>
                </div>
                <div className="stat-card rate">
                  <div className="stat-icon">�</div>
                  <div className="stat-content">
                    <h3>Taxa de Conclusão</h3>
                    <div className="stat-value">{formatPercentage(ridesReport.completionRate)}</div>
                  </div>
                </div>
                <div className="stat-card rating">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <h3>Avaliação Média</h3>
                    <div className="stat-value">{ridesReport.averageRating.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Reports;