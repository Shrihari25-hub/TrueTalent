import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({ role: 'freelancer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    setError('');
    setLoading(true);

    const result = await signup(name, email, password, formData.role);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-orange-100 px-4">
      <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl p-10 border border-white border-opacity-30 transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-center text-purple-800 mb-8">Sign Up</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm animate-fadeIn">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm animate-fadeIn">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
              minLength="6"
            />
          </div>

          {/* I want to section with centered alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2 text-center">I want to:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, role: 'freelancer' })}
                className={`w-full text-center px-4 py-3 rounded-md font-medium cursor-pointer transition-colors duration-200
                  ${formData.role === 'freelancer'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
              >
                Get Hired <br /><span className="text-xs font-normal">(Freelancer)</span>
              </div>

              <div
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`w-full text-center px-4 py-3 rounded-md font-medium cursor-pointer transition-colors duration-200
                  ${formData.role === 'client'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
              >
                Hire Independence <br /><span className="text-xs font-normal">(Client)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold transition transform duration-300 ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-md'}`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-700 font-medium hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export { Signup };
