-- DTC Plus Database Schema
-- Run these scripts in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles_dtc (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'viewer')) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  total_equity DECIMAL(15,2) DEFAULT 0,
  daily_commission DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  current_nots INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('withdrawal', 'margin_addition', 'equity_update', 'commission', 'deposit')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_number TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create daily commission tracking table
CREATE TABLE IF NOT EXISTS daily_commission_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  commission_amount DECIMAL(15,2) NOT NULL,
  trade_count INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(client_id, date)
);

-- Create nots tracking table
CREATE TABLE IF NOT EXISTS nots_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients_dtc(id) ON DELETE CASCADE,
  nots_achieved INTEGER DEFAULT 0,
  commission_for_nots DECIMAL(15,2) NOT NULL,
  date_achieved DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create analytics table for dashboard metrics
CREATE TABLE IF NOT EXISTS analytics_dtc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2),
  metric_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(metric_name, metric_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_commission_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE nots_dtc ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dtc ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles_dtc FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles_dtc FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles_dtc FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Clients policies
CREATE POLICY "Authenticated users can view clients" ON clients_dtc FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert clients" ON clients_dtc FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Admins can update clients" ON clients_dtc FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Admins can delete clients" ON clients_dtc FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Transactions policies
CREATE POLICY "Authenticated users can view transactions" ON transactions_dtc FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert transactions" ON transactions_dtc FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Daily commission policies
CREATE POLICY "Authenticated users can view daily commission" ON daily_commission_dtc FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage daily commission" ON daily_commission_dtc FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Nots policies
CREATE POLICY "Authenticated users can view nots" ON nots_dtc FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage nots" ON nots_dtc FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Analytics policies
CREATE POLICY "Authenticated users can view analytics" ON analytics_dtc FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage analytics" ON analytics_dtc FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles_dtc WHERE id = auth.uid() AND role = 'admin'
  )
);

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
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
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
CREATE TRIGGER update_profiles_dtc_updated_at BEFORE UPDATE ON profiles_dtc FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clients_dtc_updated_at BEFORE UPDATE ON clients_dtc FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_dtc_updated_at BEFORE UPDATE ON transactions_dtc FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default admin user (update this with your Google email)
-- INSERT INTO profiles_dtc (id, email, full_name, role) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'your-admin@email.com', 'Admin User', 'admin');

-- Create views for analytics
CREATE OR REPLACE VIEW client_analytics_view AS
SELECT 
  c.id,
  c.name,
  c.total_equity,
  c.total_commission,
  c.current_nots,
  c.status,
  COALESCE(SUM(dc.commission_amount), 0) as daily_commission_sum,
  COALESCE(SUM(dc.trade_count), 0) as total_trades,
  COUNT(t.id) as transaction_count
FROM clients_dtc c
LEFT JOIN daily_commission_dtc dc ON c.id = dc.client_id
LEFT JOIN transactions_dtc t ON c.id = t.client_id
GROUP BY c.id, c.name, c.total_equity, c.total_commission, c.current_nots, c.status;

-- Create function to calculate target nots
CREATE OR REPLACE FUNCTION calculate_target_nots()
RETURNS INTEGER AS $$
DECLARE
  total_equity DECIMAL(15,2);
  target_nots INTEGER;
BEGIN
  SELECT COALESCE(SUM(total_equity), 0) INTO total_equity FROM clients_dtc WHERE status = 'active';
  target_nots := FLOOR((total_equity * 0.18) / 6000);
  RETURN target_nots;
END;
$$ LANGUAGE plpgsql;
