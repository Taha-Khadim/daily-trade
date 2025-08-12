import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  Activity,
  Percent
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

const Dashboard: React.FC = () => {
  const { dashboardStats, clients } = useData();

  const statCards = [
    {
      title: 'Total Clients',
      value: dashboardStats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
      format: (val: number) => val.toString(),
    },
    {
      title: 'Active Clients',
      value: dashboardStats.activeClients,
      icon: Activity,
      color: 'bg-green-500',
      format: (val: number) => val.toString(),
    },
    {
      title: 'Total Equity',
      value: dashboardStats.totalEquity,
      icon: DollarSign,
      color: 'bg-purple-500',
      format: (val: number) => `PKR ${val.toLocaleString()}`,
    },
    {
      title: 'Total Commission',
      value: dashboardStats.totalCommission,
      icon: TrendingUp,
      color: 'bg-orange-500',
      format: (val: number) => `PKR ${val.toLocaleString()}`,
    },
    {
      title: 'Current Nots',
      value: dashboardStats.totalNots,
      icon: Target,
      color: 'bg-red-500',
      format: (val: number) => val.toString(),
    },
    {
      title: 'Target Nots',
      value: dashboardStats.targetNots,
      icon: Target,
      color: 'bg-indigo-500',
      format: (val: number) => val.toString(),
    },
    {
      title: 'Retention Rate',
      value: dashboardStats.retentionRate,
      icon: Percent,
      color: 'bg-pink-500',
      format: (val: number) => `${val.toFixed(1)}%`,
    },
    {
      title: 'Avg Equity/Client',
      value: dashboardStats.averageEquityPerClient,
      icon: DollarSign,
      color: 'bg-teal-500',
      format: (val: number) => `PKR ${val.toLocaleString()}`,
    },
  ];

  const equityDistributionOption = {
    title: {
      text: 'Client Equity Distribution',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: PKR {c} ({d}%)',
    },
    series: [
      {
        name: 'Equity',
        type: 'pie',
        radius: '50%',
        data: clients.slice(0, 10).map(client => ({
          value: client.totalEquity,
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

  const commissionTrendOption = {
    title: {
      text: 'Commission vs Target Nots',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['Current', 'Target'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Nots',
        type: 'bar',
        data: [dashboardStats.totalNots, dashboardStats.targetNots],
        itemStyle: {
          color: function(params: any) {
            return params.dataIndex === 0 ? '#3b82f6' : '#10b981';
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stat.format(stat.value)}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={equityDistributionOption} style={{ height: '400px' }} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ReactECharts option={commissionTrendOption} style={{ height: '400px' }} />
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {((dashboardStats.totalNots / dashboardStats.targetNots) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Nots Achievement</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {dashboardStats.retentionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Client Retention</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              PKR {(dashboardStats.totalCommission / dashboardStats.activeClients).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Avg Commission/Client</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
