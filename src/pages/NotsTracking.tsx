import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Target,
  TrendingUp,
  User,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import ReactECharts from 'echarts-for-react';

const NotsTracking: React.FC = () => {
  const { clients, nots, dashboardStats, loading } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading nots data...</div>
      </div>
    );
  }

  // Calculate nots achievement rate
  const achievementRate = dashboardStats.targetNots > 0 
    ? (dashboardStats.totalNots / dashboardStats.targetNots) * 100 
    : 0;

  // Client nots performance
  const clientNotsData = clients.map(client => ({
    name: client.name,
    current_nots: client.current_nots,
    commission: client.total_commission,
    progress: (client.current_nots / Math.max(1, Math.floor((client.total_equity * 0.18) / 6000))) * 100,
  })).sort((a, b) => b.current_nots - a.current_nots);

  // Chart for nots distribution
  const notsDistributionOption = {
    title: {
      text: 'Client Nots Distribution',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} nots ({d}%)',
    },
    series: [
      {
        name: 'Nots',
        type: 'pie',
        radius: '50%',
        data: clientNotsData.slice(0, 10).map(client => ({
          value: client.current_nots,
          name: client.name,
        })),
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

  // Progress chart
  const progressOption = {
    title: {
      text: 'Top Performers - Nots Achievement',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'value',
      max: Math.max(...clientNotsData.slice(0, 10).map(c => c.current_nots)) + 5,
    },
    yAxis: {
      type: 'category',
      data: clientNotsData.slice(0, 10).map(c => c.name),
      axisLabel: {
        width: 100,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: 'Current Nots',
        type: 'bar',
        data: clientNotsData.slice(0, 10).map(c => c.current_nots),
        itemStyle: {
          color: '#3b82f6',
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Nots Tracking</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Nots</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {dashboardStats.totalNots}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Target Nots</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {dashboardStats.targetNots}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Achievement Rate</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {achievementRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Nots/Client</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {clients.length > 0 ? (dashboardStats.totalNots / clients.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Current Progress</span>
            <span>{achievementRate.toFixed(1)}% of target</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, achievementRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 nots</span>
            <span>{dashboardStats.totalNots} / {dashboardStats.targetNots} nots</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={notsDistributionOption} style={{ height: '400px' }} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={progressOption} style={{ height: '400px' }} />
        </div>
      </div>

      {/* Client Performance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Client Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Nots
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Commission
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission per Not
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientNotsData.map((client, index) => {
                const commissionPerNot = client.current_nots > 0 ? client.commission / client.current_nots : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {client.current_nots}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        PKR {client.commission.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        PKR {commissionPerNot > 0 ? commissionPerNot.toFixed(0) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        client.current_nots >= 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.current_nots >= 1 ? 'Achieved' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {clientNotsData.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No nots data available</h3>
            <p className="text-gray-500">Start tracking client commissions to see nots progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotsTracking;
