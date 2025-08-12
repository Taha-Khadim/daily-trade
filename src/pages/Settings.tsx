import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Database,
  Palette,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      transactionNotifications: true,
      dailyReports: false,
      weeklyReports: true,
    },
    preferences: {
      theme: 'light',
      currency: 'PKR',
      dateFormat: 'dd/MM/yyyy',
      timeZone: 'Asia/Karachi',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      apiAccess: false,
    },
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">Only administrators can access settings.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'database', name: 'Database', icon: Database },
  ];

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <SettingsIcon className="w-8 h-8 text-gray-900" />
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile?.role || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={profile?.avatar_url || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter avatar URL"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {key === 'emailAlerts' && 'Receive email notifications for important updates'}
                        {key === 'transactionNotifications' && 'Get notified when transactions occur'}
                        {key === 'dailyReports' && 'Receive daily summary reports'}
                        {key === 'weeklyReports' && 'Receive weekly performance reports'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Preferences</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.preferences.theme}
                    onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PKR">Pakistani Rupee (PKR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select
                    value={settings.preferences.timeZone}
                    onChange={(e) => handleSettingChange('preferences', 'timeZone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key (for integrations)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value="sk_test_4eC39HqLyjWDarjtT1zdp7dc"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Database Management</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Database Operations
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>These operations affect your entire database. Please proceed with caution.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-500 mt-1">Download all your data as CSV or JSON</p>
                  </button>
                  
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <h4 className="font-medium text-gray-900">Backup Database</h4>
                    <p className="text-sm text-gray-500 mt-1">Create a complete backup of your database</p>
                  </button>
                  
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <h4 className="font-medium text-gray-900">Import Data</h4>
                    <p className="text-sm text-gray-500 mt-1">Upload data from CSV or JSON files</p>
                  </button>
                  
                  <button className="p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
                    <h4 className="font-medium text-red-900">Reset Database</h4>
                    <p className="text-sm text-red-600 mt-1">Clear all data (irreversible)</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
