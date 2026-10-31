'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-red-700">
          {error.message || 'The page could not be loaded.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
