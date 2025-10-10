import React, { useState, useEffect } from 'react';
import '../styles/components.css';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Nova solicitação de guincho',
    message: 'João Silva solicitou um guincho na Av. Paulista',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 min ago
    read: false,
    actionUrl: '/rides'
  },
  {
    id: '2',
    type: 'success',
    title: 'Prestador aprovado',
    message: 'Maria Santos foi aprovada como prestadora de serviço',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 min ago
    read: false,
    actionUrl: '/providers'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Documento pendente',
    message: 'Carlos Oliveira precisa atualizar seus documentos',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 min ago
    read: true,
    actionUrl: '/providers'
  },
  {
    id: '4',
    type: 'error',
    title: 'Falha no pagamento',
    message: 'Erro no processamento do pagamento #12345',
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    read: true,
    actionUrl: '/rides'
  }
];

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  onMarkAsRead, 
  onClearAll 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // Simular notificações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular nova notificação ocasionalmente
      if (Math.random() < 0.1) { // 10% de chance a cada intervalo
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'Nova atividade',
          message: 'Algo importante aconteceu no sistema',
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Manter apenas 10
      }
    }, 30000); // Check a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    onMarkAsRead?.(id);
  };

  const handleClearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onClearAll?.();
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return timestamp.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  return (
    <div className="notification-center">
      <button 
        className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notificações</h3>
              {unreadCount > 0 && (
                <button onClick={handleClearAll} className="clear-all-btn">
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <span>📭</span>
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatTime(notification.timestamp)}</div>
                    </div>
                    {!notification.read && <div className="unread-indicator" />}
                  </div>
                ))
              )}
            </div>

            <div className="notification-footer">
              <button className="view-all-btn">Ver todas</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;