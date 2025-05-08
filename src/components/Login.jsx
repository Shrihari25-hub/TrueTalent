import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      return setError('Please select your role');
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result);

      if (!result) {
        throw new Error('No response from server');
      }

      if (result.success) {
        // Check if user object exists and has role
        if (!result.user?.role) {
          throw new Error('User role not found in response');
        }

        // Verify the selected role matches the user's actual role
        if (selectedRole !== result.user.role) {
          throw new Error(`You are registered as a ${result.user.role}, not ${selectedRole}`);
        }

        // Redirect based on role
        const redirectPath = result.user.role === 'client'
          ? '/dashboard'
          : '/dashboard';

        navigate(redirectPath);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-blue-200 to-cyan-100 px-4">
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-white border-opacity-30">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm animate-fadeIn">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="you@example.com"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="••••••••"
              required
              minLength="6"
              autoComplete="current-password"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium text-gray-800 mb-3">Choose Your Role</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('client')}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  selectedRole === 'client'
                    ? 'bg-blue-700 text-white shadow-lg scale-[1.02]'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                👤 Hire Independence
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('freelancer')}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  selectedRole === 'freelancer'
                    ? 'bg-green-700 text-white shadow-lg scale-[1.02]'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                💼 Get Hired
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedRole}
            className={`w-full py-2.5 rounded-lg text-white font-bold transition transform duration-300 ${
              loading || !selectedRole
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] shadow-md'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm space-y-2">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
          <p className="text-gray-700">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-700 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export { Login };