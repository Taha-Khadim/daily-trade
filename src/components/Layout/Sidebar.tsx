import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut,
  Settings,
  UserPlus,
  TrendingUp,
  Target,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { signOut, isAdmin, user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: false },
    { name: 'Clients', href: '/clients', icon: Users, adminOnly: false },
    { name: 'Add Client', href: '/add-client', icon: UserPlus, adminOnly: true },
    { name: 'Transactions', href: '/transactions', icon: CreditCard, adminOnly: false },
    { name: 'Daily Commission', href: '/daily-commission', icon: TrendingUp, adminOnly: false },
    { name: 'Nots Tracking', href: '/nots', icon: Target, adminOnly: false },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, adminOnly: false },
    { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-16 bg-gray-800 px-4">
        <h1 className="text-xl font-bold text-white">DTC Plus</h1>
      </div>
      
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || user?.email}
            </p>
            <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-gray-900 text-white min-h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 z-40 w-64 bg-gray-900 text-white min-h-screen transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
