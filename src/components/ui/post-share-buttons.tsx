"use client";
import { useEffect, useState } from "react";
import { FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

function openShareWindow(url: string, size: { width: number; height: number }) {
  window.open(url, "_blank", `noopener,noreferrer,width=${size.width},height=${size.height}`);
}

export function PostShareButtons({ title }: { title: string }) {
  // window.location is only available client-side — this component renders
  // inside a server-rendered detail page, so the URL is picked up on mount.
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  function share(network: "linkedin" | "twitter" | "facebook") {
    if (!pageUrl) return;
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(title);

    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    // Facebook's sharer dialog is sensitive to popup aspect ratio — a narrow/tall
    // window (we used 600x600 for every network) can trip its internal viewport
    // detection into serving a stripped-down mobile-style share sheet with no post
    // compose box, instead of the full desktop composer. 626x436 is Facebook's own
    // documented recommended size and reliably renders the real dialog.
    const size = network === "facebook" ? { width: 626, height: 436 } : { width: 600, height: 600 };
    openShareWindow(shareUrls[network], size);
  }

  return (
    <div className="flex items-center gap-3.5">
      <button type="button" aria-label="Share on LinkedIn" onClick={() => share("linkedin")} className="hover:opacity-70 transition-opacity">
        <FaLinkedinIn className="size-4 text-zinc-800" />
      </button>
      <button type="button" aria-label="Share on X" onClick={() => share("twitter")} className="hover:opacity-70 transition-opacity">
        <FaXTwitter className="size-4 text-zinc-800" />
      </button>
      <button type="button" aria-label="Share on Facebook" onClick={() => share("facebook")} className="hover:opacity-70 transition-opacity">
        <FaFacebookF className="size-4 text-zinc-800" />
      </button>
    </div>
  );
}
