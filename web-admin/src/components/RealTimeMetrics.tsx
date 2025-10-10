import React, { useState, useEffect } from 'react';
import '../styles/components.css';

interface RealTimeMetric {
  id: string;
  title: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  icon: string;
  color: string;
}

interface RealTimeMetricsProps {
  updateInterval?: number;
}

const mockInitialMetrics: RealTimeMetric[] = [
  {
    id: 'active-rides',
    title: 'Corridas Ativas',
    value: 12,
    trend: 'up',
    changePercentage: 8.5,
    icon: '🚛',
    color: '#ef4444'
  },
  {
    id: 'available-providers',
    title: 'Prestadores Disponíveis',
    value: 25,
    trend: 'stable',
    changePercentage: 0,
    icon: '👨‍🔧',
    color: '#10b981'
  },
  {
    id: 'pending-requests',
    title: 'Solicitações Pendentes',
    value: 3,
    trend: 'down',
    changePercentage: -15.2,
    icon: '⏳',
    color: '#f59e0b'
  },
  {
    id: 'avg-response-time',
    title: 'Tempo Médio Resposta',
    value: 4.2,
    unit: 'min',
    trend: 'down',
    changePercentage: -12.8,
    icon: '⚡',
    color: '#3b82f6'
  },
  {
    id: 'revenue-today',
    title: 'Receita de Hoje',
    value: 2847.50,
    unit: 'R$',
    trend: 'up',
    changePercentage: 23.4,
    icon: '💰',
    color: '#8b5cf6'
  },
  {
    id: 'system-health',
    title: 'Saúde do Sistema',
    value: 98.7,
    unit: '%',
    trend: 'stable',
    changePercentage: 0.3,
    icon: '🔧',
    color: '#06b6d4'
  }
];

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ 
  updateInterval = 5000 
}) => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>(mockInitialMetrics);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          // Simular mudanças aleatórias nos valores
          const changeRange = metric.value * 0.1; // Máximo 10% de mudança
          const randomChange = (Math.random() - 0.5) * changeRange;
          let newValue = Math.max(0, metric.value + randomChange);
          
          // Arredondar baseado no tipo de métrica
          if (metric.unit === 'min') {
            newValue = Math.round(newValue * 10) / 10;
          } else if (metric.unit === 'R$') {
            newValue = Math.round(newValue * 100) / 100;
          } else if (metric.unit === '%') {
            newValue = Math.min(100, Math.round(newValue * 10) / 10);
          } else {
            newValue = Math.round(newValue);
          }

          // Calcular tendência
          const percentChange = ((newValue - metric.value) / metric.value) * 100;
          let trend: 'up' | 'down' | 'stable' = 'stable';
          
          if (percentChange > 1) trend = 'up';
          else if (percentChange < -1) trend = 'down';

          return {
            ...metric,
            value: newValue,
            trend,
            changePercentage: Math.round(percentChange * 10) / 10
          };
        })
      );
      setLastUpdate(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'R$') {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    } else if (unit === '%') {
      return `${value}%`;
    } else if (unit === 'min') {
      return `${value} min`;
    }
    return value.toString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      case 'stable': return '#6b7280';
    }
  };

  return (
    <div className="real-time-metrics">
      <div className="metrics-header">
        <h3>Métricas em Tempo Real</h3>
        <div className="last-update">
          <span className="update-dot"></span>
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map(metric => (
          <div key={metric.id} className="metric-card real-time-metric">
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <div className="metric-trend" style={{ color: getTrendColor(metric.trend) }}>
                {getTrendIcon(metric.trend)}
                {Math.abs(metric.changePercentage)}%
              </div>
            </div>
            
            <div className="metric-content">
              <div className="metric-value" style={{ color: metric.color }}>
                {formatValue(metric.value, metric.unit)}
              </div>
              <div className="metric-title">{metric.title}</div>
            </div>

            <div className="metric-chart">
              {/* Mini gráfico simulado */}
              <svg className="mini-chart" viewBox="0 0 60 20">
                <polyline
                  points="0,15 10,12 20,14 30,10 40,13 50,8 60,11"
                  stroke={metric.color}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo Geral */}
      <div className="metrics-summary">
        <div className="summary-item">
          <span className="summary-label">Total de Atividades</span>
          <span className="summary-value">
            {metrics.reduce((sum, m) => sum + (typeof m.value === 'number' && !m.unit?.includes('%') ? m.value : 0), 0)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Tendência Geral</span>
          <span className="summary-value">
            {metrics.filter(m => m.trend === 'up').length > metrics.length / 2 ? '📈 Positiva' : 
             metrics.filter(m => m.trend === 'down').length > metrics.length / 2 ? '📉 Negativa' : 
             '➡️ Estável'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Próxima Atualização</span>
          <span className="summary-value">{updateInterval / 1000}s</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;