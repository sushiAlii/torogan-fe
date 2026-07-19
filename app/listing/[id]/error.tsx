"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

// Distinct from not-found.tsx: this is the backend-down/5xx path (a real
// failure mode now that data fetching happens server-side in the render
// path), not a "listing doesn't exist" 404.
export default function ListingError({
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
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-foreground">
          Something went wrong loading this listing
        </h1>
        <p className="mt-2 text-muted-foreground">
          Please try again in a moment.
        </p>
        <Button className="mt-6" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
