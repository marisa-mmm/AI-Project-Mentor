import React, { useState } from 'react';
import axios from 'axios';
import { GraduationCap, ArrowRight, Mail, Lock, User, BookOpen } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '' // Starts completely blank
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure role is chosen before registration
    if (!isLogin && !formData.role) {
      setError('Please select whether you are a Student or Faculty.');
      return;
    }

    setLoading(true);

    const emailClean = formData.email.trim();
    const payload = isLogin
      ? { email: emailClean, password: formData.password }
      : {
          username: formData.username.trim(),
          email: emailClean,
          password: formData.password,
          role: formData.role
        };

    try {
      let res;
      if (isLogin) {
        try {
          res = await axios.post(`${API_BASE}/api/auth/login`, payload, { timeout: 8000 });
        } catch (err) {
          if (err.response?.status === 404) {
            res = await axios.post(`${API_BASE}/login`, payload, { timeout: 8000 });
          } else {
            throw err;
          }
        }
      } else {
        try {
          res = await axios.post(`${API_BASE}/api/auth/register`, payload, { timeout: 8000 });
        } catch (err) {
          if (err.response?.status === 404) {
            res = await axios.post(`${API_BASE}/register`, payload, { timeout: 8000 });
          } else {
            throw err;
          }
        }
      }

      const user = res.data?.user || (res.data?.email ? res.data : null);

      if (user) {
        onAuthSuccess(user);
      } else if (!isLogin && (res.data?.success || res.status === 200)) {
        onAuthSuccess({
          username: formData.username.trim(),
          email: emailClean,
          role: formData.role
        });
      } else {
        setError('Unexpected response format received.');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Connection timed out. Check that your FastAPI server is running on port 8000.');
      } else if (err.message === 'Network Error') {
        setError('Network Error: Unable to reach backend server at 127.0.0.1:8000.');
      } else {
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : (err.message || 'Authentication failed.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
      {/* Background Soft Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-400/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Form Card */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl shadow-blue-900/5 p-8 sm:p-10 transition-all">
        
        {/* Top Logo Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
            <GraduationCap className="w-9 h-9 stroke-[2.2]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-base font-semibold text-slate-500 mt-2">
            AI Project Mentor
          </p>
        </div>

        {/* Error Box */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Interactive Role Selection Cards */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide mb-2.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Student Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'Student' });
                    setError('');
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    formData.role === 'Student'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm shadow-blue-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                      formData.role === 'Student' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`text-sm font-bold ${formData.role === 'Student' ? 'text-blue-900' : 'text-slate-800'}`}>
                    Student
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Project Developer
                  </span>
                </button>

                {/* Faculty Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'Faculty' });
                    setError('');
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    formData.role === 'Faculty'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm shadow-blue-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                      formData.role === 'Faculty' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <BookOpen className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`text-sm font-bold ${formData.role === 'Faculty' ? 'text-blue-900' : 'text-slate-800'}`}>
                    Faculty
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Teacher / Mentor
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center pt-5 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  role: ''
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors ml-1 cursor-pointer"
            >
              {isLogin ? 'Create one here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}