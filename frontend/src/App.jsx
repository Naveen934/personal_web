import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CompaniesTab from './components/CompaniesTab';
import SavingsTab from './components/SavingsTab';
import EconomyTab from './components/EconomyTab';
import ExpensesTab from './components/ExpensesTab';
import DocumentsTab from './components/DocumentsTab';
import Login from './components/Login';
import './index.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('companies');
  const [mountedTabs, setMountedTabs] = useState(['companies']);

  useEffect(() => {
    const auth = localStorage.getItem('personal_dashboard_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!mountedTabs.includes(activeTab)) {
      setMountedTabs((prev) => [...prev, activeTab]);
    }
  }, [activeTab, mountedTabs]);

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
          {mountedTabs.includes('companies') && <CompaniesTab />}
        </div>
        <div className={activeTab === 'savings' ? 'block' : 'hidden'}>
          {mountedTabs.includes('savings') && <SavingsTab />}
        </div>
        <div className={activeTab === 'economy' ? 'block' : 'hidden'}>
          {mountedTabs.includes('economy') && <EconomyTab />}
        </div>
        <div className={activeTab === 'expenses' ? 'block' : 'hidden'}>
          {mountedTabs.includes('expenses') && <ExpensesTab />}
        </div>
        <div className={activeTab === 'documents' ? 'block' : 'hidden'}>
          {mountedTabs.includes('documents') && <DocumentsTab />}
        </div>
      </div>
    </Layout>
  );
}
