import React, { useState, useEffect } from 'react';
import '../styles/components.css';

export interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  autoClose?: boolean;
  duration?: number;
}

interface AlertSystemProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
  maxAlerts?: number;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Sistema de Pagamentos',
    message: 'Processamento de pagamentos com latência elevada',
    timestamp: new Date(Date.now() - 2 * 60000),
    dismissed: false,
    autoClose: false
  },
  {
    id: '2',
    type: 'info',
    title: 'Manutenção Programada',
    message: 'Manutenção do servidor programada para amanhã às 02:00',
    timestamp: new Date(Date.now() - 15 * 60000),
    dismissed: false,
    autoClose: false
  },
  {
    id: '3',
    type: 'success',
    title: 'Backup Concluído',
    message: 'Backup automático realizado com sucesso',
    timestamp: new Date(Date.now() - 30 * 60000),
    dismissed: false,
    autoClose: true,
    duration: 5000
  }
];

export const AlertSystem: React.FC<AlertSystemProps> = ({ 
  alerts: initialAlerts = mockAlerts,
  onDismiss,
  maxAlerts = 5 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  // Auto-close alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.autoClose && !alert.dismissed && alert.duration) {
        const timer = setTimeout(() => {
          handleDismiss(alert.id);
        }, alert.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [alerts]);

  // Simular novos alertas ocasionalmente
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as any,
          title: 'Novo Alerta',
          message: 'Algo interessante aconteceu no sistema',
          timestamp: new Date(),
          dismissed: false,
          autoClose: true,
          duration: 8000
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, maxAlerts - 1)]);
      }
    }, 20000); // Check a cada 20 segundos

    return () => clearInterval(interval);
  }, [maxAlerts]);

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
    onDismiss?.(id);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    
    return timestamp.toLocaleString();
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const alertCounts = {
    error: activeAlerts.filter(a => a.type === 'error').length,
    warning: activeAlerts.filter(a => a.type === 'warning').length,
    info: activeAlerts.filter(a => a.type === 'info').length,
    success: activeAlerts.filter(a => a.type === 'success').length,
  };

  return (
    <div className="alert-system">
      <div className="alert-header">
        <h3>Sistema de Alertas</h3>
        <div className="alert-counts">
          {alertCounts.error > 0 && (
            <span className="alert-count error">🔴 {alertCounts.error}</span>
          )}
          {alertCounts.warning > 0 && (
            <span className="alert-count warning">🟡 {alertCounts.warning}</span>
          )}
          {alertCounts.info > 0 && (
            <span className="alert-count info">🔵 {alertCounts.info}</span>
          )}
          {alertCounts.success > 0 && (
            <span className="alert-count success">🟢 {alertCounts.success}</span>
          )}
        </div>
      </div>

      <div className="alerts-container">
        {activeAlerts.length === 0 ? (
          <div className="no-alerts">
            <span className="no-alerts-icon">🎉</span>
            <p>Nenhum alerta ativo</p>
            <small>Tudo funcionando perfeitamente!</small>
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`alert-item alert-${alert.type}`}
              style={{ borderColor: getAlertColor(alert.type) }}
            >
              <div className="alert-content">
                <div className="alert-main">
                  <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                  <div className="alert-text">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                </div>
                <div className="alert-meta">
                  <span className="alert-timestamp">{formatTimestamp(alert.timestamp)}</span>
                  <button 
                    className="alert-dismiss"
                    onClick={() => handleDismiss(alert.id)}
                    title="Dispensar alerta"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {alert.autoClose && alert.duration && (
                <div 
                  className="alert-progress"
                  style={{ 
                    backgroundColor: getAlertColor(alert.type),
                    animationDuration: `${alert.duration}ms`
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {activeAlerts.length > 0 && (
        <div className="alerts-footer">
          <button 
            className="clear-all-alerts"
            onClick={() => activeAlerts.forEach(alert => handleDismiss(alert.id))}
          >
            Dispensar Todos
          </button>
          <span className="alerts-summary">
            {activeAlerts.length} alerta{activeAlerts.length > 1 ? 's' : ''} ativo{activeAlerts.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;