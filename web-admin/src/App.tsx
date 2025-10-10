import React, { useState, useEffect } from 'react';
import './styles/global.css';
import './App.css';

// Componentes
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Users from './components/Users';
import Providers from './components/Providers';
import Rides from './components/Rides';
import Reports from './components/Reports';

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
      // Fazer login real com a API
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Verificar se é admin
        if (data.user.type === 'admin') {
          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            type: 'admin'
          };
          
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(user));
          setCurrentUser(user);
          setIsAuthenticated(true);
          return true;
        } else {
          throw new Error('Acesso não autorizado. Apenas administradores podem acessar.');
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // Fallback para login de desenvolvimento
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
        return true;
      } else {
        throw new Error('Email ou senha inválidos');
      }
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
        return <Users />;
      case 'providers':
        return <Providers />;
      case 'rides':
        return <Rides />;
      case 'reports':
        return <Reports />;
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
