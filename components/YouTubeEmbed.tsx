"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getLinkClickCount, recordLinkClick } from "@/app/actions/link-clicks";

type Link = { id: string; name: string; url: string };

function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1) || null;
    const v = parsed.searchParams.get("v");
    if (v) return v;
    const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/);
    return embedMatch ? embedMatch[1] : null;
  } catch {
    return null;
  }
}

export default function YouTubeEmbed({ link }: { link: Link }) {
  const videoId = extractYoutubeId(link.url);
  const [playing, setPlaying] = useState(false);
  const [clickCount, setClickCount] = useState<number | null>(null);

  useEffect(() => {
    getLinkClickCount(link.id).then(setClickCount);
  }, [link.id]);

  if (!videoId) return null;

  const handlePlay = () => {
    setPlaying(true);
    setClickCount((count) => (count ?? 0) + 1);
    recordLinkClick(link.id); // fire-and-forget, doesn't block playback
  };

  // In dev, always show the count so it's easy to check while testing.
  // In production, only once it's a meaningful number.
  const showCount =
    clickCount !== null && (process.env.NODE_ENV !== "production" || clickCount > 10);

  return (
    <div className="mt-10 w-2/3 min-w-72">
      {playing ? (
        <iframe
          className="aspect-video w-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={link.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          onClick={handlePlay}
          className="group relative block aspect-video w-full overflow-hidden rounded-lg"
        >
          <Image
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={link.name}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white">
              ▶
            </span>
          </span>
        </button>
      )}

      <p className="mt-2 text-center text-sm text-gray-500">{link.name}</p>
      {showCount && (
        <p className="text-center text-xs text-gray-400">{clickCount} clicks</p>
      )}
    </div>
  );
}
