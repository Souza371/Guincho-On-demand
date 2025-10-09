import React, { useState, useEffect } from 'react';
import './App.css';

// Componentes
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  type: 'admin';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      // Simulação de login por enquanto
      if (email === 'admin@guincho.com' && password === '123456') {
        const user: User = {
          id: '1',
          name: 'Administrador',
          email: 'admin@guincho.com',
          type: 'admin'
        };
        
        localStorage.setItem('admin_token', 'fake-jwt-token');
        localStorage.setItem('admin_user', JSON.stringify(user));
        
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Email ou senha inválidos');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <div className="page-placeholder">👥 Gestão de Usuários (Em desenvolvimento)</div>;
      case 'providers':
        return <div className="page-placeholder">🚛 Gestão de Prestadores (Em desenvolvimento)</div>;
      case 'rides':
        return <div className="page-placeholder">🚗 Gestão de Corridas (Em desenvolvimento)</div>;
      case 'reports':
        return <div className="page-placeholder">📊 Relatórios (Em desenvolvimento)</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-app">
      <Header user={currentUser} onLogout={handleLogout} />
      <div className="admin-body">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="admin-main">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
