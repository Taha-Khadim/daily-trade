import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Chrome, Lock, AlertCircle, Loader } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-white">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DTC Plus</h1>
          <p className="text-gray-600 mt-2">Daily Trade Commission Management</p>
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Chrome className="w-5 h-5" />
          )}
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Access Requirements:</p>
          <div className="text-xs space-y-1">
            <p>• Admin access must be granted by system administrator</p>
            <p>• Contact support for role assignments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
