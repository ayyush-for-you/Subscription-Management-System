'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw, Clock, DollarSign } from 'lucide-react';

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  actor?: {
    name: string;
    role: string;
  } | null;
}

interface ActivityChatterProps {
  subscriptionId?: string;
  invoiceId?: string;
  initialLogs: AuditLogItem[];
  currentUser?: { name: string; role: string } | null;
}

export function ActivityChatter({
  subscriptionId,
  invoiceId,
  initialLogs,
  currentUser,
}: ActivityChatterProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          invoiceId,
          action: 'NOTE_ADDED',
          details: note.trim(),
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        setLogs([newLog, ...logs]);
        setNote('');
      }
    } catch (err) {
      console.error('Failed to post note', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'DUNNING_TRIGGERED':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'INVOICE_GENERATED':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'STATE_CHANGE':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-sm">ERP Audit Trail & Activity Chatter</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">{logs.length} recorded events</span>
      </div>

      <div className="p-6 space-y-6">
        {/* Post Note Form */}
        <form onSubmit={handlePostNote} className="space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Log an internal operational note or call memo..."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Posting as <strong className="text-slate-600">{currentUser?.name || 'Staff User'}</strong>
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Log Activity'}</span>
            </button>
          </div>
        </form>

        {/* Timeline */}
        <div className="flow-root pt-2">
          <ul role="list" className="-mb-8">
            {logs.map((log, index) => {
              const isLast = index === logs.length - 1;
              return (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {!isLast && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                          {getActionIcon(log.action)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-xs text-slate-800 font-medium">
                            {log.details}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Action: <span className="font-semibold text-slate-600">{log.action}</span>
                            {log.actor ? ` • By ${log.actor.name} (${log.actor.role})` : ' • By Automated System Engine'}
                          </p>
                        </div>
                        <div className="text-right text-[11px] whitespace-nowrap text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400 inline" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

