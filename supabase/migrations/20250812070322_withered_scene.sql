/*
  # Enhanced DTC Plus Database Schema

  1. New Tables
    - Enhanced `profiles_dtc` with better role management
    - `admin_permissions` for granular admin access control
    - `viewer_permissions` for viewer-specific permissions
    - `client_targets` for individual client targets
    - `performance_metrics` for tracking performance data
    - `audit_logs` for tracking all system changes
    - `system_settings` for application configuration

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies for admin/viewer access
    - Add audit logging triggers

  3. Performance
    - Add indexes for frequently queried columns
    - Create views for complex queries
*/

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS client_targets CASCADE;
DROP TABLE IF EXISTS viewer_permissions CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;

-- Enhanced profiles table with better role management
CREATE TABLE IF NOT EXISTS profiles_dtc (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'viewer')) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  department TEXT,
  phone TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Admin permissions table for granular access control
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles_dtc(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'manage_clients', 'manage_transactions', 'manage_commissions', 
    'manage_nots', 'view_analytics', 'manage_users', 'system_settings',
    'export_data', 'delete_records'
  )),
  granted_by UUID REFERENCES profiles_dtc(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, permission_type)
);

-- Viewer permissions table
CREATE TABLE IF NOT EXISTS viewer_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles_dtc(id) ON DELETE CASCADE,
  can_view_clients BOOLEAN DEFAULT true,
  can_view_transactions BOOLEAN DEFAULT true,
  can_view_commissions BOOLEAN DEFAULT true,
  can_view_analytics BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  client_access_filter TEXT[], -- Array of client IDs they can access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhanced clients table
CREATE TABLE IF NOT EXISTS clients_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  total_equity DECIMAL(15,2) DEFAULT 0,
  daily_commission DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  current_nots INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  account_type TEXT CHECK (account_type IN ('individual', 'corporate')) DEFAULT 'individual',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Client targets table for individual target management
CREATE TABLE IF NOT EXISTS client_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  target_type TEXT CHECK (target_type IN ('monthly_commission', 'quarterly_nots', 'annual_equity')) NOT NULL,
  target_value DECIMAL(15,2) NOT NULL,
  current_value DECIMAL(15,2) DEFAULT 0,
  target_period_start DATE NOT NULL,
  target_period_end DATE NOT NULL,
  achievement_percentage DECIMAL(5,2) DEFAULT 0,
  is_achieved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhanced transactions table
CREATE TABLE IF NOT EXISTS transactions_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('withdrawal', 'margin_addition', 'equity_update', 'commission', 'deposit', 'fee', 'bonus')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_number TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
  processed_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhanced daily commission table
CREATE TABLE IF NOT EXISTS daily_commission_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  commission_amount DECIMAL(15,2) NOT NULL,
  trade_count INTEGER DEFAULT 0,
  volume_traded DECIMAL(15,2) DEFAULT 0,
  commission_rate DECIMAL(5,4) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(client_id, date)
);

-- Enhanced nots table
CREATE TABLE IF NOT EXISTS nots_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  nots_achieved INTEGER DEFAULT 0,
  commission_for_nots DECIMAL(15,2) NOT NULL,
  bonus_amount DECIMAL(15,2) DEFAULT 0,
  achievement_date DATE DEFAULT CURRENT_DATE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2),
  metric_type TEXT CHECK (metric_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) NOT NULL,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(metric_name, metric_type, client_id, metric_date)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewer_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_commission_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE nots_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles_dtc FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles_dtc FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admins can view all profiles" ON profiles_dtc FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Super admins can manage all profiles" ON profiles_dtc FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'super_admin')
);

-- Admin permissions policies
CREATE POLICY "Users can view own permissions" ON admin_permissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Super admins can manage permissions" ON admin_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'super_admin')
);

-- Viewer permissions policies
CREATE POLICY "Users can view own viewer permissions" ON viewer_permissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage viewer permissions" ON viewer_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Clients policies
CREATE POLICY "Authenticated users can view clients" ON clients_dtc FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
    EXISTS (SELECT 1 FROM viewer_permissions WHERE user_id = auth.uid() AND can_view_clients = true)
  )
);
CREATE POLICY "Admins can manage clients" ON clients_dtc FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
  EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND permission_type = 'manage_clients' AND is_active = true)
);

-- Client targets policies
CREATE POLICY "Users can view client targets" ON client_targets FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
    EXISTS (SELECT 1 FROM viewer_permissions WHERE user_id = auth.uid() AND can_view_clients = true)
  )
);
CREATE POLICY "Admins can manage client targets" ON client_targets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Transactions policies
CREATE POLICY "Users can view transactions" ON transactions_dtc FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
    EXISTS (SELECT 1 FROM viewer_permissions WHERE user_id = auth.uid() AND can_view_transactions = true)
  )
);
CREATE POLICY "Admins can manage transactions" ON transactions_dtc FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
  EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND permission_type = 'manage_transactions' AND is_active = true)
);

-- Daily commission policies
CREATE POLICY "Users can view daily commission" ON daily_commission_dtc FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
    EXISTS (SELECT 1 FROM viewer_permissions WHERE user_id = auth.uid() AND can_view_commissions = true)
  )
);
CREATE POLICY "Admins can manage daily commission" ON daily_commission_dtc FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
  EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND permission_type = 'manage_commissions' AND is_active = true)
);

-- Nots policies
CREATE POLICY "Users can view nots" ON nots_dtc FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
    EXISTS (SELECT 1 FROM viewer_permissions WHERE user_id = auth.uid() AND can_view_clients = true)
  )
);
CREATE POLICY "Admins can manage nots" ON nots_dtc FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
  EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND permission_type = 'manage_nots' AND is_active = true)
);

-- Performance metrics policies
CREATE POLICY "Users can view performance metrics" ON performance_metrics FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin')) OR
    EXISTS (SELECT 1 FROM viewer_permissions WHERE user_id = auth.uid() AND can_view_analytics = true)
  )
);
CREATE POLICY "Admins can manage performance metrics" ON performance_metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Audit logs policies
CREATE POLICY "Super admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'super_admin')
);

-- System settings policies
CREATE POLICY "Users can view public settings" ON system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Super admins can manage all settings" ON system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'super_admin')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients_dtc(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients_dtc(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions_dtc(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions_dtc(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions_dtc(transaction_date);
CREATE INDEX IF NOT EXISTS idx_daily_commission_client_date ON daily_commission_dtc(client_id, date);
CREATE INDEX IF NOT EXISTS idx_nots_client_date ON nots_dtc(client_id, achievement_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_client_date ON performance_metrics(client_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles_dtc (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default viewer permissions
  INSERT INTO public.viewer_permissions (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_dtc_updated_at ON profiles_dtc;
CREATE TRIGGER update_profiles_dtc_updated_at BEFORE UPDATE ON profiles_dtc FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_dtc_updated_at ON clients_dtc;
CREATE TRIGGER update_clients_dtc_updated_at BEFORE UPDATE ON clients_dtc FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_dtc_updated_at ON transactions_dtc;
CREATE TRIGGER update_transactions_dtc_updated_at BEFORE UPDATE ON transactions_dtc FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_targets_updated_at ON client_targets;
CREATE TRIGGER update_client_targets_updated_at BEFORE UPDATE ON client_targets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_viewer_permissions_updated_at ON viewer_permissions;
CREATE TRIGGER update_viewer_permissions_updated_at BEFORE UPDATE ON viewer_permissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create audit logging function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_clients_dtc ON clients_dtc;
CREATE TRIGGER audit_clients_dtc
  AFTER INSERT OR UPDATE OR DELETE ON clients_dtc
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_transactions_dtc ON transactions_dtc;
CREATE TRIGGER audit_transactions_dtc
  AFTER INSERT OR UPDATE OR DELETE ON transactions_dtc
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to calculate nots automatically
CREATE OR REPLACE FUNCTION calculate_client_nots(client_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_commission DECIMAL(15,2);
  calculated_nots INTEGER;
BEGIN
  SELECT COALESCE(SUM(commission_amount), 0) INTO total_commission 
  FROM daily_commission_dtc 
  WHERE client_id = client_uuid;
  
  calculated_nots := FLOOR(total_commission / 6000);
  
  -- Update client record
  UPDATE clients_dtc 
  SET current_nots = calculated_nots,
      total_commission = total_commission,
      updated_at = NOW()
  WHERE id = client_uuid;
  
  RETURN calculated_nots;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate target nots for all clients
CREATE OR REPLACE FUNCTION calculate_target_nots()
RETURNS INTEGER AS $$
DECLARE
  total_equity DECIMAL(15,2);
  target_nots INTEGER;
BEGIN
  SELECT COALESCE(SUM(total_equity), 0) INTO total_equity 
  FROM clients_dtc 
  WHERE status = 'active';
  
  target_nots := FLOOR((total_equity * 0.18) / 6000);
  RETURN target_nots;
END;
$$ LANGUAGE plpgsql;

-- Create views for complex queries
CREATE OR REPLACE VIEW client_performance_view AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.total_equity,
  c.total_commission,
  c.current_nots,
  c.status,
  c.risk_level,
  COALESCE(SUM(dc.commission_amount), 0) as monthly_commission,
  COALESCE(SUM(dc.trade_count), 0) as monthly_trades,
  COUNT(t.id) as transaction_count,
  COALESCE(AVG(dc.commission_amount), 0) as avg_daily_commission,
  (c.current_nots::DECIMAL / NULLIF(FLOOR((c.total_equity * 0.18) / 6000), 0)) * 100 as nots_achievement_percentage
FROM clients_dtc c
LEFT JOIN daily_commission_dtc dc ON c.id = dc.client_id 
  AND dc.date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN transactions_dtc t ON c.id = t.client_id
GROUP BY c.id, c.name, c.email, c.total_equity, c.total_commission, c.current_nots, c.status, c.risk_level;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('commission_rate', '0.0018', 'number', 'Default commission rate (0.18%)', true),
('nots_threshold', '6000', 'number', 'Commission amount required for 1 not', true),
('target_equity_percentage', '0.18', 'number', 'Target percentage of equity for nots calculation', false),
('max_daily_trades', '100', 'number', 'Maximum trades per day per client', false),
('currency', 'PKR', 'string', 'Default currency', true),
('timezone', 'Asia/Karachi', 'string', 'Default timezone', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample admin user (update with your actual admin email)
-- INSERT INTO profiles_dtc (id, email, full_name, role) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@dtcplus.com', 'System Administrator', 'super_admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'super_admin';