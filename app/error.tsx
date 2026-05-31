"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-5 bg-background px-8 text-center">
      <h1 className="text-[20px] font-medium tracking-[-0.02em] text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-sm text-[15px] font-normal leading-snug tracking-[-0.01em] text-muted">
        Please try again. If the problem persists, contact us.
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-12 min-w-[160px] cursor-pointer rounded-2xl bg-foreground px-6 text-[15px] font-medium tracking-[-0.01em] text-background transition-opacity active:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
