import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles_dtc: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'viewer';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'viewer';
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'viewer';
          is_active?: boolean;
        };
      };
      clients_dtc: {
        Row: {
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
        };
        Insert: {
          name: string;
          email: string;
          phone?: string | null;
          total_equity?: number;
          daily_commission?: number;
          total_commission?: number;
          current_nots?: number;
          status?: 'active' | 'inactive';
          created_by?: string | null;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          total_equity?: number;
          daily_commission?: number;
          total_commission?: number;
          current_nots?: number;
          status?: 'active' | 'inactive';
        };
      };
      transactions_dtc: {
        Row: {
          id: string;
          client_id: string;
          type: 'withdrawal' | 'margin_addition' | 'equity_update' | 'commission' | 'deposit';
          amount: number;
          description: string | null;
          reference_number: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          type: 'withdrawal' | 'margin_addition' | 'equity_update' | 'commission' | 'deposit';
          amount: number;
          description?: string | null;
          reference_number?: string | null;
          created_by?: string | null;
        };
        Update: {
          client_id?: string;
          type?: 'withdrawal' | 'margin_addition' | 'equity_update' | 'commission' | 'deposit';
          amount?: number;
          description?: string | null;
          reference_number?: string | null;
        };
      };
      daily_commission_dtc: {
        Row: {
          id: string;
          client_id: string;
          commission_amount: number;
          trade_count: number;
          date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          client_id: string;
          commission_amount: number;
          trade_count?: number;
          date?: string;
          created_by?: string | null;
        };
        Update: {
          commission_amount?: number;
          trade_count?: number;
          date?: string;
        };
      };
      nots_dtc: {
        Row: {
          id: string;
          client_id: string;
          nots_achieved: number;
          commission_for_nots: number;
          date_achieved: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          client_id: string;
          nots_achieved?: number;
          commission_for_nots: number;
          date_achieved?: string;
          created_by?: string | null;
        };
        Update: {
          nots_achieved?: number;
          commission_for_nots?: number;
          date_achieved?: string;
        };
      };
    };
  };
}
