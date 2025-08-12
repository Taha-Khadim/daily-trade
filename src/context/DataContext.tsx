import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { 
  Client, 
  Transaction, 
  DashboardStats, 
  DailyCommission, 
  NotsRecord, 
  ClientTarget,
  PerformanceMetric,
  AdminPermission,
  ViewerPermission 
} from '../types';

interface DataContextType {
  clients: Client[];
  transactions: Transaction[];
  dailyCommissions: DailyCommission[];
  nots: NotsRecord[];
  clientTargets: ClientTarget[];
  performanceMetrics: PerformanceMetric[];
  adminPermissions: AdminPermission[];
  viewerPermissions: ViewerPermission[];
  dashboardStats: DashboardStats;
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'current_nots' | 'total_commission' | 'date_added' | 'last_activity' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'transaction_date' | 'status' | 'processed_by' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<Transaction>;
  deleteClient: (id: string) => Promise<void>;
  addDailyCommission: (commission: Omit<DailyCommission, 'id' | 'created_by' | 'created_at'>) => Promise<DailyCommission>;
  addClientTarget: (target: Omit<ClientTarget, 'id' | 'current_value' | 'achievement_percentage' | 'is_achieved' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<ClientTarget>;
  updateClientTarget: (id: string, updates: Partial<ClientTarget>) => Promise<void>;
  calculateNotsForClient: (clientId: string) => Promise<number>;
  addNotsRecord: (nots: Omit<NotsRecord, 'id' | 'created_by' | 'created_at'>) => Promise<NotsRecord>;
  updateNotsRecord: (id: string, updates: Partial<NotsRecord>) => Promise<void>;
  getClientPerformance: (clientId: string, period?: string) => Promise<any>;
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
  const [clientTargets, setClientTargets] = useState<ClientTarget[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermission[]>([]);
  const [viewerPermissions, setViewerPermissions] = useState<ViewerPermission[]>([]);
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
    targetAchievementRate: 0,
    averageRiskLevel: 'medium',
    monthlyGrowthRate: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  useEffect(() => {
    calculateDashboardStats();
  }, [clients, transactions, dailyCommissions, nots, clientTargets]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClients(),
        fetchTransactions(),
        fetchDailyCommissions(),
        fetchNots(),
        fetchClientTargets(),
        fetchPerformanceMetrics(),
        fetchPermissions(),
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

  const fetchClientTargets = async () => {
    const { data, error } = await supabase
      .from('client_targets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client targets:', error);
      return;
    }

    setClientTargets(data || []);
  };

  const fetchPerformanceMetrics = async () => {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('metric_date', { ascending: false });

    if (error) {
      console.error('Error fetching performance metrics:', error);
      return;
    }

    setPerformanceMetrics(data || []);
  };

  const fetchPermissions = async () => {
    // Fetch admin and viewer permissions if user has access
    // This would be implemented based on user role
    try {
      // Implementation would go here
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
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
    const targetAchievementRate = targetNots > 0 ? (totalNots / targetNots) * 100 : 0;
    
    // Calculate average risk level
    const riskLevels = clients.map(c => c.risk_level);
    const averageRiskLevel = riskLevels.length > 0 ? 'medium' : 'medium'; // Simplified
    const monthlyGrowthRate = 0; // Would calculate based on historical data

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
      targetAchievementRate,
      averageRiskLevel,
      monthlyGrowthRate,
    });
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'current_nots' | 'total_commission' | 'date_added' | 'last_activity' | 'created_by' | 'created_at' | 'updated_at'>): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients_dtc')
      .insert([{
        ...clientData,
        current_nots: 0, // Will be calculated based on actual commissions
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
      return data;
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

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'transaction_date' | 'status' | 'processed_by' | 'created_by' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    const { data, error } = await supabase
      .from('transactions_dtc')
      .insert([{
        ...transactionData,
        status: 'completed',
        processed_by: user?.id,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setTransactions(prev => [data, ...prev]);
      return data;

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
            // Nots will be recalculated separately
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

  const addDailyCommission = async (commissionData: Omit<DailyCommission, 'id' | 'created_by' | 'created_at'>): Promise<DailyCommission> => {
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
      
      // Recalculate nots for the client
      await calculateNotsForClient(commissionData.client_id);
      
      return data;
    }
  };

  const addClientTarget = async (targetData: Omit<ClientTarget, 'id' | 'current_value' | 'achievement_percentage' | 'is_achieved' | 'created_by' | 'created_at' | 'updated_at'>): Promise<ClientTarget> => {
    const { data, error } = await supabase
      .from('client_targets')
      .insert([{
        ...targetData,
        current_value: 0,
        achievement_percentage: 0,
        is_achieved: false,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setClientTargets(prev => [data, ...prev]);
      return data;
    }
  };

  const updateClientTarget = async (id: string, updates: Partial<ClientTarget>) => {
    const { data, error } = await supabase
      .from('client_targets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setClientTargets(prev => prev.map(target => target.id === id ? data : target));
    }
  };

  const calculateNotsForClient = async (clientId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_client_nots', {
        client_uuid: clientId
      });

      if (error) {
        throw error;
      }

      // Refresh client data
      await fetchClients();
      
      return data || 0;
    } catch (error) {
      console.error('Error calculating nots:', error);
      return 0;
    }
  };

  const addNotsRecord = async (notsData: Omit<NotsRecord, 'id' | 'created_by' | 'created_at'>): Promise<NotsRecord> => {
    const { data, error } = await supabase
      .from('nots_dtc')
      .insert([{
        ...notsData,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setNots(prev => [data, ...prev]);
      return data;
    }
  };

  const updateNotsRecord = async (id: string, updates: Partial<NotsRecord>) => {
    const { data, error } = await supabase
      .from('nots_dtc')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      setNots(prev => prev.map(nots => nots.id === id ? data : nots));
    }
  };

  const getClientPerformance = async (clientId: string, period = 'monthly') => {
    try {
      const { data, error } = await supabase
        .from('client_performance_view')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching client performance:', error);
      return null;
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
      clientTargets,
      performanceMetrics,
      adminPermissions,
      viewerPermissions,
      dashboardStats,
      loading,
      addClient,
      updateClient,
      addTransaction,
      deleteClient,
      addDailyCommission,
      addClientTarget,
      updateClientTarget,
      calculateNotsForClient,
      addNotsRecord,
      updateNotsRecord,
      getClientPerformance,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
