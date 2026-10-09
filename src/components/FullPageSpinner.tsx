export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
