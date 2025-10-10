import React from 'react';
import NotificationCenter from './NotificationCenter';
import '../styles/Header.css';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'admin';
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🚛</span>
          <span className="logo-text">Guincho Admin</span>
        </div>
      </div>

      <div className="header-center">
        <h1 className="page-title">Painel Administrativo</h1>
      </div>

      <div className="header-right">
        <NotificationCenter />
        <div className="user-info">
          <span className="user-name">👤 {user?.name}</span>
          <button className="logout-button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;