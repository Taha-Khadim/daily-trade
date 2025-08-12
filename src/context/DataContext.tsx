import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Client, Transaction, DashboardStats, DailyCommission, NotsRecord } from '../types';

interface DataContextType {
  clients: Client[];
  transactions: Transaction[];
  dailyCommissions: DailyCommission[];
  nots: NotsRecord[];
  dashboardStats: DashboardStats;
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'current_nots' | 'total_commission' | 'date_added' | 'last_activity' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addDailyCommission: (commission: Omit<DailyCommission, 'id' | 'created_by' | 'created_at'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyCommissions, setDailyCommissions] = useState<DailyCommission[]>([]);
  const [nots, setNots] = useState<NotsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalEquity: 0,
    totalCommission: 0,
    totalNots: 0,
    targetNots: 0,
    retentionRate: 0,
    averageEquityPerClient: 0,
    dailyCommissionSum: 0,
    totalTrades: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  useEffect(() => {
    calculateDashboardStats();
  }, [clients, transactions, dailyCommissions, nots]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClients(),
        fetchTransactions(),
        fetchDailyCommissions(),
        fetchNots(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients_dtc')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    setClients(data || []);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions_dtc')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions(data || []);
  };

  const fetchDailyCommissions = async () => {
    const { data, error } = await supabase
      .from('daily_commission_dtc')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching daily commissions:', error);
      return;
    }

    setDailyCommissions(data || []);
  };

  const fetchNots = async () => {
    const { data, error } = await supabase
      .from('nots_dtc')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nots:', error);
      return;
    }

    setNots(data || []);
  };

  const calculateDashboardStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const totalEquity = clients.reduce((sum, client) => sum + client.total_equity, 0);
    const totalCommission = clients.reduce((sum, client) => sum + client.total_commission, 0);
    const totalNots = clients.reduce((sum, client) => sum + client.current_nots, 0);
    const targetNots = Math.floor((totalEquity * 0.18) / 6000);
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
    const averageEquityPerClient = totalClients > 0 ? totalEquity / totalClients : 0;
    const dailyCommissionSum = dailyCommissions.reduce((sum, dc) => sum + dc.commission_amount, 0);
    const totalTrades = dailyCommissions.reduce((sum, dc) => sum + dc.trade_count, 0);

    setDashboardStats({
      totalClients,
      activeClients,
      totalEquity,
      totalCommission,
      totalNots,
      targetNots,
      retentionRate,
      averageEquityPerClient,
      dailyCommissionSum,
      totalTrades,
    });
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'current_nots' | 'total_commission' | 'date_added' | 'last_activity' | 'created_by' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('clients_dtc')
      .insert([{
        ...clientData,
        current_nots: Math.floor(clientData.daily_commission / 6000),
        total_commission: clientData.daily_commission,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setClients(prev => [data, ...prev]);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients_dtc')
      .update({
        ...updates,
        last_activity: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setClients(prev => prev.map(client => client.id === id ? data : client));
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('transactions_dtc')
      .insert([{
        ...transactionData,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setTransactions(prev => [data, ...prev]);

      // Update client based on transaction type
      const client = clients.find(c => c.id === transactionData.client_id);
      if (client) {
        let updates: Partial<Client> = {};

        switch (transactionData.type) {
          case 'withdrawal':
            updates.total_equity = client.total_equity - transactionData.amount;
            break;
          case 'margin_addition':
          case 'deposit':
            updates.total_equity = client.total_equity + transactionData.amount;
            break;
          case 'commission':
            updates.total_commission = client.total_commission + transactionData.amount;
            updates.current_nots = Math.floor((client.total_commission + transactionData.amount) / 6000);
            break;
        }

        if (Object.keys(updates).length > 0) {
          await updateClient(client.id, updates);
        }
      }
    }
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients_dtc')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    setClients(prev => prev.filter(client => client.id !== id));
    setTransactions(prev => prev.filter(transaction => transaction.client_id !== id));
    setDailyCommissions(prev => prev.filter(dc => dc.client_id !== id));
    setNots(prev => prev.filter(n => n.client_id !== id));
  };

  const addDailyCommission = async (commissionData: Omit<DailyCommission, 'id' | 'created_by' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('daily_commission_dtc')
      .insert([{
        ...commissionData,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setDailyCommissions(prev => [data, ...prev]);
    }
  };

  const refreshData = async () => {
    await fetchAllData();
  };

  return (
    <DataContext.Provider value={{
      clients,
      transactions,
      dailyCommissions,
      nots,
      dashboardStats,
      loading,
      addClient,
      updateClient,
      addTransaction,
      deleteClient,
      addDailyCommission,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
