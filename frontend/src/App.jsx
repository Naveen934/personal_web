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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      <div className="animate-[fadeIn_0.2s_ease-in-out]">
        <div className={activeTab === 'companies' ? 'block' : 'hidden'}>
          <CompaniesTab />
        </div>
        <div className={activeTab === 'savings' ? 'block' : 'hidden'}>
          <SavingsTab />
        </div>
        <div className={activeTab === 'economy' ? 'block' : 'hidden'}>
          <EconomyTab />
        </div>
        <div className={activeTab === 'documents' ? 'block' : 'hidden'}>
          <DocumentsTab />
        </div>
      </div>
    </Layout>
  );
}
