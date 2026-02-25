import { useState } from 'react';
import Layout from './components/Layout';
import CompaniesTab from './components/CompaniesTab';
import SavingsTab from './components/SavingsTab';
import EconomyTab from './components/EconomyTab';
import DocumentsTab from './components/DocumentsTab';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('companies');

  const renderTab = () => {
    switch (activeTab) {
      case 'companies': return <CompaniesTab />;
      case 'savings': return <SavingsTab />;
      case 'economy': return <EconomyTab />;
      case 'documents': return <DocumentsTab />;
      default: return <CompaniesTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div key={activeTab} className="animate-[fadeIn_0.2s_ease-in-out]">
        {renderTab()}
      </div>
    </Layout>
  );
}
