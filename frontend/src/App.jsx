import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CompaniesTab from './components/CompaniesTab';
import SavingsTab from './components/SavingsTab';
import EconomyTab from './components/EconomyTab';
import DocumentsTab from './components/DocumentsTab';
import Login from './components/Login';
import './index.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('companies');

  useEffect(() => {
    const auth = localStorage.getItem('personal_dashboard_auth');
    if (auth === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('personal_dashboard_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('personal_dashboard_auth');
    setIsAuthenticated(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'companies': return <CompaniesTab />;
      case 'savings': return <SavingsTab />;
      case 'economy': return <EconomyTab />;
      case 'documents': return <DocumentsTab />;
      default: return <CompaniesTab />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      <div key={activeTab} className="animate-[fadeIn_0.2s_ease-in-out]">
        {renderTab()}
      </div>
    </Layout>
  );
}
