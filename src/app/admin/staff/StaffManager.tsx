'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, ShieldCheck, Plus, CheckCircle2, XCircle, AlertCircle, Mail, Lock, User } from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string | null;
  createdAt: string;
}

export function StaffManager({ initialStaff }: { initialStaff: StaffUser[] }) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');
  const [companyName, setCompanyName] = useState('Brightloop Internal HQ');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Policy Checks (FR-1.1)
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please fulfill all security requirements for the staff password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          password,
          companyName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff member');

      setStaff([...staff, data]);
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Provisioned Staff Members ({staff.length})</h2>
          <p className="text-xs text-slate-500">Internal users with operational and financial ledger access</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Email Address</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Department / Team</th>
                <th className="px-6 py-3.5">Provisioned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {s.name[0]}
                    </div>
                    <span>{s.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{s.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        s.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{s.companyName || 'Internal'}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Provision Internal Staff Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">✕</button>
            </div>

            {error && <div className="text-xs text-rose-600">{error}</div>}

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@brightloop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  >
                    <option value="STAFF">STAFF (Sales / Ops)</option>
                    <option value="ADMIN">ADMIN (Full Control)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50"
                />

                {/* Password Policy Checklist */}
                <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1.5">
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>&gt;8 characters</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span className={hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}>Uppercase letter</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span className={hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}>Lowercase letter</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span className={hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}>Special char (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  Provision Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

