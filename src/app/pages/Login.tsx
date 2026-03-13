import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { authAPI } from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [loginMethod, setLoginMethod] = useState<'password' | 'email'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: '',
  });
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);

      // Save token to localStorage
      localStorage.setItem('auth_token', response.token);

      // Update app context
      login(formData.email);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setError('');
    setLoading(true);

    try {
      await authAPI.sendVerificationCode(formData.email);
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyCode(formData.email, formData.verificationCode);

      // Save token to localStorage
      localStorage.setItem('auth_token', response.token);

      // Update app context
      login(formData.email);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">Life Moments</h1>
          <p className="text-gray-500">Welcome back</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                loginMethod === 'password'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email Code
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Password Login */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Email Verification Login */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="you@example.com"
                  disabled={loading || codeSent}
                />
              </div>

              {!codeSent ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || !formData.email}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.verificationCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          verificationCode: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Enter code"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </>
              )}
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-500 hover:text-blue-600"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
