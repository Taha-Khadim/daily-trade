import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import AddClient from './pages/AddClient';
import EditClient from './pages/EditClient';
import Transactions from './pages/Transactions';
import DailyCommission from './pages/DailyCommission';
import NotsTracking from './pages/NotsTracking';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <DataProvider>
      <Layout />
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="clients" element={<Clients />} />
                      <Route path="clients/:id/edit" element={<EditClient />} />
                      <Route path="add-client" element={<AddClient />} />
                      <Route path="transactions" element={<Transactions />} />
                      <Route path="daily-commission" element={<DailyCommission />} />
                      <Route path="nots" element={<NotsTracking />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Routes>
                </DataProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
