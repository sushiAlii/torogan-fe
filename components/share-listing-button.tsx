"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Two explicit, always-visible actions rather than navigator.share():
// identical behavior on every browser (no feature-detection branching),
// directly matches "share on Facebook", and is actually verifiable (native
// share needs a real user gesture + OS share sheet).
export function ShareListingButton({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400",
    );
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={shareOnFacebook}
        aria-label={`Share "${title}" on Facebook`}
      >
        <Share2 className="size-4" aria-hidden="true" />
        Share on Facebook
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copyLink}
        aria-label="Copy listing link"
      >
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}
