'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-xl font-semibold text-red-900">Unable to load this dashboard page</h1>
      <p className="mt-2 text-sm text-red-700">
        {error.message || 'An unexpected error occurred while loading data.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}
