import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Loader } from 'lucide-react';

const EditClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient } = useData();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    total_equity: '',
    daily_commission: '',
    status: 'active' as 'active' | 'inactive',
  });

  const client = clients.find(c => c.id === id);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (!client) {
      navigate('/clients');
      return;
    }

    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      total_equity: client.total_equity.toString(),
      daily_commission: client.daily_commission.toString(),
      status: client.status,
    });
  }, [client, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsLoading(true);

    try {
      await updateClient(client.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        total_equity: parseFloat(formData.total_equity),
        daily_commission: parseFloat(formData.daily_commission),
        status: formData.status,
      });
      navigate('/clients');
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isAdmin || !client) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Client</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label htmlFor="total_equity" className="block text-sm font-medium text-gray-700 mb-2">
                Total Equity (PKR) *
              </label>
              <input
                type="number"
                id="total_equity"
                name="total_equity"
                value={formData.total_equity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter total equity"
              />
            </div>

            <div>
              <label htmlFor="daily_commission" className="block text-sm font-medium text-gray-700 mb-2">
                Daily Commission (PKR) *
              </label>
              <input
                type="number"
                id="daily_commission"
                name="daily_commission"
                value={formData.daily_commission}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter daily commission"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isLoading ? 'Updating...' : 'Update Client'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClient;
