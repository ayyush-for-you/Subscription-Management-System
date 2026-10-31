'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role === 'CUSTOMER') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/25 mb-4">
          <Zap className="w-8 h-8 text-white fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Brightloop BSMS
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enterprise Subscription Lifecycle & Financial Operations Backbone
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to BSMS'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Role Profiles (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@brightloop.com', 'Admin@123!')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">Admin HQ</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sales@brightloop.com', 'Staff@123!')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">Sales / Ops</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('finance@brightloop.com', 'Finance@123!')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Finance Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@acmecorp.com', 'Customer@123!')}
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">Customer Portal</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Sign up as Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

