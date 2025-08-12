export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  total_equity: number;
  daily_commission: number;
  total_commission: number;
  current_nots: number;
  status: 'active' | 'inactive';
  date_added: string;
  last_activity: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  client_id: string;
  type: 'withdrawal' | 'margin_addition' | 'equity_update' | 'commission' | 'deposit';
  amount: number;
  description: string | null;
  reference_number: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyCommission {
  id: string;
  client_id: string;
  commission_amount: number;
  trade_count: number;
  date: string;
  created_by: string | null;
  created_at: string;
}

export interface NotsRecord {
  id: string;
  client_id: string;
  nots_achieved: number;
  commission_for_nots: number;
  date_achieved: string;
  created_by: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string | undefined;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  profile?: Profile;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalEquity: number;
  totalCommission: number;
  totalNots: number;
  targetNots: number;
  retentionRate: number;
  averageEquityPerClient: number;
  dailyCommissionSum: number;
  totalTrades: number;
}
