import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  Plus,
  DollarSign,
  Calendar,
  User,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

const Transactions: React.FC = () => {
  const { transactions, clients, addTransaction, loading } = useData();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    client_id: '',
    type: 'commission' as 'withdrawal' | 'margin_addition' | 'equity_update' | 'commission' | 'deposit',
    amount: '',
    description: '',
    reference_number: '',
  });

  const filteredTransactions = transactions.filter(transaction => {
    const client = clients.find(c => c.id === transaction.client_id);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      });
      setShowAddModal(false);
      setNewTransaction({
        client_id: '',
        type: 'commission',
        amount: '',
        description: '',
        reference_number: '',
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
      case 'margin_addition':
      case 'deposit':
        return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
      case 'commission':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'equity_update':
        return <RefreshCw className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'margin_addition':
      case 'deposit':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'commission':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'equity_update':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Transactions</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="commission">Commission</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="margin_addition">Margin Addition</option>
              <option value="deposit">Deposit</option>
              <option value="equity_update">Equity Update</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const client = clients.find(c => c.id === transaction.client_id);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getTransactionColor(transaction.type)}`}>
                          {transaction.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
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
                        PKR {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="text-sm text-gray-500 line-clamp-2">
                        {transaction.description || 'No description'}
                      </span>
                      {transaction.reference_number && (
                        <div className="text-xs text-gray-400 mt-1">
                          Ref: {transaction.reference_number}
                        </div>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    value={newTransaction.client_id}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, client_id: e.target.value }))}
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
                    Type
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="commission">Commission</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="margin_addition">Margin Addition</option>
                    <option value="deposit">Deposit</option>
                    <option value="equity_update">Equity Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={newTransaction.reference_number}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, reference_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reference number"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Transaction
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

export default Transactions;
