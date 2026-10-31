'use client';

import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunBilling = async () => {
    if (!confirm('Run recurring billing now? This will generate invoices for all due subscriptions.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/billing/run', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to run billing' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recurring Billing</h1>
        <p className="text-gray-600 mt-1">Manage automated subscription billing</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Manual Billing Execution</h2>
        <p className="text-gray-600 mb-6">
          Click the button below to manually run the recurring billing process. This will:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
          <li>Generate invoices for all active subscriptions due today</li>
          <li>Calculate next billing dates based on billing frequency</li>
          <li>Automatically close expired subscriptions (if auto-close is enabled)</li>
          <li>Prevent duplicate invoicing for the same billing period</li>
        </ul>

        <button
          onClick={handleRunBilling}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          {loading ? 'Running Billing...' : 'Run Billing Now'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            {result.error ? (
              <p className="text-red-800">{result.error}</p>
            ) : (
              <div>
                <p className="font-semibold text-green-800 mb-2">{result.message}</p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Invoices Generated: {result.processed}</p>
                  <p>Failed: {result.failed}</p>
                  {result.invoices && result.invoices.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium">Generated Invoices:</p>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {result.invoices.slice(0, 10).map((inv: any) => (
                          <li key={inv.id}>
                            {inv.number} - ₹{inv.total.toLocaleString('en-IN')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Automated Billing</h3>
        <p className="text-blue-800 text-sm">
          In production, you can set up a cron job to hit the billing endpoint automatically:
        </p>
        <code className="block mt-2 p-3 bg-blue-100 rounded text-sm text-blue-900">
          POST /api/billing/run
        </code>
        <p className="text-blue-800 text-sm mt-2">
          Schedule this to run daily at a specific time to automate invoice generation.
        </p>
      </div>
    </div>
  );
}
