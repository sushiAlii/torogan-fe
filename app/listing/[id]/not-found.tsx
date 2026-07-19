import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

// Reached via notFound() in page.tsx — renders a real HTTP 404 instead of
// the old client-side "not found" state, which returned 200 (a soft-404
// search engines penalize/deprioritize).
export default function ListingNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-foreground">
          Listing not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          This listing may have been removed or never existed.
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to listings
        </Button>
      </div>
    </div>
  );
}
