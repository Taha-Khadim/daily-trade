export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  total_equity: number;
  daily_commission: number;
  total_commission: number;
  current_nots: number;
  status: 'active' | 'inactive' | 'suspended';
  risk_level: 'low' | 'medium' | 'high';
  account_type: 'individual' | 'corporate';
  date_added: string;
  last_activity: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientTarget {
  id: string;
  client_id: string;
  target_type: 'monthly_commission' | 'quarterly_nots' | 'annual_equity';
  target_value: number;
  current_value: number;
  target_period_start: string;
  target_period_end: string;
  achievement_percentage: number;
  is_achieved: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  client_id: string;
  type: 'withdrawal' | 'margin_addition' | 'equity_update' | 'commission' | 'deposit' | 'fee' | 'bonus';
  amount: number;
  description: string | null;
  reference_number: string | null;
  transaction_date: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  processed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyCommission {
  id: string;
  client_id: string;
  commission_amount: number;
  trade_count: number;
  volume_traded: number;
  commission_rate: number;
  date: string;
  created_by: string | null;
  created_at: string;
}

export interface NotsRecord {
  id: string;
  client_id: string;
  nots_achieved: number;
  commission_for_nots: number;
  bonus_amount: number;
  achievement_date: string;
  period_start: string;
  period_end: string;
  is_verified: boolean;
  verified_by: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  client_id: string | null;
  metric_date: string;
  additional_data: any;
  created_at: string;
}

export interface AdminPermission {
  id: string;
  user_id: string;
  permission_type: 'manage_clients' | 'manage_transactions' | 'manage_commissions' | 
    'manage_nots' | 'view_analytics' | 'manage_users' | 'system_settings' |
    'export_data' | 'delete_records';
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface ViewerPermission {
  id: string;
  user_id: string;
  can_view_clients: boolean;
  can_view_transactions: boolean;
  can_view_commissions: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;
  client_access_filter: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'super_admin' | 'admin' | 'viewer';
  is_active: boolean;
  department: string | null;
  phone: string | null;
  last_login: string | null;
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
  targetAchievementRate: number;
  averageRiskLevel: string;
  monthlyGrowthRate: number;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: any;
  new_values: any;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string | null;
  is_public: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}