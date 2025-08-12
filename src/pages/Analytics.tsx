import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import ReactECharts from 'echarts-for-react';

const Analytics: React.FC = () => {
  const { clients, transactions, dailyCommissions, dashboardStats, loading } = useData();
  const [dateRange, setDateRange] = useState('30days');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  // Date filtering
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case '3months':
        return { start: subMonths(now, 3), end: now };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start, end } = getDateRange();

  // Filter data by date range
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.created_at);
    return date >= start && date <= end;
  });

  const filteredCommissions = dailyCommissions.filter(c => {
    const date = new Date(c.date);
    return date >= start && date <= end;
  });

  // Revenue trend chart
  const revenueTrendData = filteredTransactions
    .filter(t => t.type === 'commission')
    .reduce((acc, transaction) => {
      const date = format(new Date(transaction.created_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const revenueTrendOption = {
    title: {
      text: 'Commission Trend',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: Object.keys(revenueTrendData).sort(),
      axisLabel: {
        formatter: (value: string) => format(new Date(value), 'MMM dd'),
      },
    },
    yAxis: {
      type: 'value',
      name: 'Commission (PKR)',
    },
    series: [
      {
        name: 'Commission',
        type: 'line',
        data: Object.values(revenueTrendData),
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        areaStyle: { opacity: 0.3 },
      },
    ],
  };

  // Client distribution by status
  const clientStatusData = [
    { name: 'Active', value: clients.filter(c => c.status === 'active').length },
    { name: 'Inactive', value: clients.filter(c => c.status === 'inactive').length },
  ];

  const clientStatusOption = {
    title: {
      text: 'Client Status Distribution',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    series: [
      {
        name: 'Client Status',
        type: 'pie',
        radius: '50%',
        data: clientStatusData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // Transaction type distribution
  const transactionTypeData = filteredTransactions.reduce((acc, transaction) => {
    acc[transaction.type] = (acc[transaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const transactionTypeOption = {
    title: {
      text: 'Transaction Types',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: Object.keys(transactionTypeData),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Count',
    },
    series: [
      {
        name: 'Transactions',
        type: 'bar',
        data: Object.values(transactionTypeData),
        itemStyle: {
          color: '#10b981',
        },
      },
    ],
  };

  // Top performing clients
  const topClients = clients
    .sort((a, b) => b.total_commission - a.total_commission)
    .slice(0, 5);

  // Key metrics
  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'commission')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = filteredTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const avgCommissionPerClient = dashboardStats.activeClients > 0 
    ? dashboardStats.totalCommission / dashboardStats.activeClients 
    : 0;

  const growthRate = clients.length > 0 
    ? ((dashboardStats.activeClients - (clients.length - dashboardStats.activeClients)) / clients.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Period Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                PKR {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                PKR {totalWithdrawals.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Commission</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                PKR {avgCommissionPerClient.toFixed(0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {growthRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={revenueTrendOption} style={{ height: '400px' }} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={clientStatusOption} style={{ height: '400px' }} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={transactionTypeOption} style={{ height: '400px' }} />
        </div>
        
        {/* Top Performing Clients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Clients</h3>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.current_nots} nots</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    PKR {client.total_commission.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Commission:</span>
              <span className="font-semibold">PKR {dashboardStats.totalCommission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Average:</span>
              <span className="font-semibold">PKR {(dashboardStats.dailyCommissionSum / 30).toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target Achievement:</span>
              <span className="font-semibold">{((dashboardStats.totalNots / dashboardStats.targetNots) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Clients:</span>
              <span className="font-semibold">{dashboardStats.activeClients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Rate:</span>
              <span className="font-semibold">{dashboardStats.retentionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Equity:</span>
              <span className="font-semibold">PKR {dashboardStats.averageEquityPerClient.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-semibold">{filteredTransactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trade Count:</span>
              <span className="font-semibold">{filteredCommissions.reduce((sum, c) => sum + c.trade_count, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Flow:</span>
              <span className="font-semibold">PKR {(totalRevenue - totalWithdrawals).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
