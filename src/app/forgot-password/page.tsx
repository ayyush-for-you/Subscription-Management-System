'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl mb-3">
          <Zap className="w-6 h-6 text-white fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          We will send a secure time-sensitive reset token link (FR-1.3)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white text-sm">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-300">
                A secure password reset link with a 15-minute token has been sent to{' '}
                <strong className="text-white">{email}</strong>.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Account Email
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
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg transition-all"
              >
                Send Password Reset Token
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

