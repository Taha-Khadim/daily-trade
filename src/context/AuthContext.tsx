import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserFromSession(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserFromSession(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const setUserFromSession = async (supabaseUser: SupabaseUser) => {
    const userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      user_metadata: supabaseUser.user_metadata,
    };

    setUser(userData);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('profiles_dtc')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      userData.profile = profileData;
      setUser(userData);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (!isAdmin) return false;
    
    // In a real implementation, you would check admin_permissions table
    // For now, regular admins have most permissions
    const restrictedPermissions = ['manage_users', 'system_settings'];
    return !restrictedPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithGoogle,
      signOut,
      isAdmin,
      isSuperAdmin,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
