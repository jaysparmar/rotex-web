"use client";
import { useEffect, useState } from "react";
import { FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
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

    openShareWindow(shareUrls[network]);
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
