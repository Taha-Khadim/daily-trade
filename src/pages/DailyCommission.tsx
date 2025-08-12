import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus,
  TrendingUp,
  Calendar,
  User,
  BarChart3,
  Search
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ReactECharts from 'echarts-for-react';

const DailyCommission: React.FC = () => {
  const { dailyCommissions, clients, addDailyCommission, loading } = useData();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [newCommission, setNewCommission] = useState({
    client_id: '',
    commission_amount: '',
    trade_count: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const filteredCommissions = dailyCommissions.filter(commission => {
    const client = clients.find(c => c.id === commission.client_id);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const commissionDate = new Date(commission.date);
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));
    const matchesMonth = commissionDate >= monthStart && commissionDate <= monthEnd;
    return matchesSearch && matchesMonth;
  });

  const handleAddCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDailyCommission({
        ...newCommission,
        commission_amount: parseFloat(newCommission.commission_amount),
        trade_count: parseInt(newCommission.trade_count),
      });
      setShowAddModal(false);
      setNewCommission({
        client_id: '',
        commission_amount: '',
        trade_count: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    } catch (error) {
      console.error('Error adding daily commission:', error);
    }
  };

  // Chart data
  const chartData = filteredCommissions.reduce((acc, commission) => {
    const date = commission.date;
    if (!acc[date]) {
      acc[date] = { commission: 0, trades: 0 };
    }
    acc[date].commission += commission.commission_amount;
    acc[date].trades += commission.trade_count;
    return acc;
  }, {} as Record<string, { commission: number; trades: number }>);

  const chartOption = {
    title: {
      text: 'Daily Commission & Trades',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['Commission (PKR)', 'Trades'],
      top: 30,
    },
    xAxis: {
      type: 'category',
      data: Object.keys(chartData).sort(),
      axisLabel: {
        formatter: (value: string) => format(new Date(value), 'dd'),
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Commission (PKR)',
        position: 'left',
      },
      {
        type: 'value',
        name: 'Trades',
        position: 'right',
      },
    ],
    series: [
      {
        name: 'Commission (PKR)',
        type: 'bar',
        data: Object.values(chartData).map(d => d.commission),
        itemStyle: { color: '#3b82f6' },
      },
      {
        name: 'Trades',
        type: 'line',
        yAxisIndex: 1,
        data: Object.values(chartData).map(d => d.trades),
        itemStyle: { color: '#10b981' },
      },
    ],
  };

  // Summary stats
  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const totalTrades = filteredCommissions.reduce((sum, c) => sum + c.trade_count, 0);
  const averageDaily = filteredCommissions.length > 0 ? totalCommission / filteredCommissions.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading daily commissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Daily Commission</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Commission
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commission</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                PKR {totalCommission.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trades</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {totalTrades.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Daily</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                PKR {averageDaily.toFixed(0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ReactECharts option={chartOption} style={{ height: '400px' }} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Commission List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommissions.map((commission) => {
                const client = clients.find(c => c.id === commission.client_id);
                return (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {client?.name || 'Unknown Client'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        PKR {commission.commission_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {commission.trade_count}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(commission.date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No commissions found</h3>
            <p className="text-gray-500">Try adjusting your search or date filter.</p>
          </div>
        )}
      </div>

      {/* Add Commission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Daily Commission</h3>
              <form onSubmit={handleAddCommission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    value={newCommission.client_id}
                    onChange={(e) => setNewCommission(prev => ({ ...prev, client_id: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={newCommission.commission_amount}
                    onChange={(e) => setNewCommission(prev => ({ ...prev, commission_amount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter commission amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trade Count
                  </label>
                  <input
                    type="number"
                    value={newCommission.trade_count}
                    onChange={(e) => setNewCommission(prev => ({ ...prev, trade_count: e.target.value }))}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter number of trades"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newCommission.date}
                    onChange={(e) => setNewCommission(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Commission
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCommission;
