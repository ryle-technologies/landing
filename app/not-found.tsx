import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-5 bg-background px-8 text-center">
      <h1 className="text-[20px] font-medium tracking-[-0.02em] text-foreground">
        Page not found
      </h1>
      <p className="max-w-sm text-[15px] font-normal leading-snug tracking-[-0.01em] text-muted">
        The link may have expired or this route does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-2xl bg-foreground px-6 text-[15px] font-medium tracking-[-0.01em] text-background"
      >
        Back to home
      </Link>
    </div>
  );
}
