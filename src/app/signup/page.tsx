'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, Building, User, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Live Password Policy Evaluation (FR-1.1)
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please satisfy all password policy security rules below.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, companyName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      router.push('/portal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-xl mb-3">
          <Zap className="w-6 h-6 text-white fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create Customer Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Access your self-service subscriptions, invoices, and online billing
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acmecorp.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* FR-1.1 Password Policy Validator Checklist */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1.5 text-[11px]">
                <p className="font-semibold text-slate-400 mb-1">Security Requirements (FR-1.1):</p>
                <div className="flex items-center space-x-2">
                  {hasMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={hasMinLength ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                    Greater than 8 characters ({password.length}/9+)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasUppercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={hasUppercase ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                    At least one uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasLowercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={hasLowercase ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                    At least one lowercase letter (a-z)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={hasSpecial ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                    At least one special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register & Enter Customer Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

