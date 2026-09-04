"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { getLinkClickCount, recordLinkClick } from "@/app/actions/link-clicks";

type Link = { id: string; name: string; url: string };

// A click inside the iframe happens in YouTube's own document — the
// browser's same-origin policy means we can never see it directly, no
// matter which element in our page holds the click handler. YouTube's
// official IFrame Player API solves this properly: it posts a message
// back to us when the video actually starts playing, which is what lets
// one click both play the video and get counted.
declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        options: { events?: { onStateChange?: (event: { data: number }) => void } }
      ) => { destroy: () => void };
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const readyCallbacks: (() => void)[] = [];

function onceYoutubeApiReady(callback: () => void) {
  if (window.YT?.Player) {
    callback();
    return;
  }
  readyCallbacks.push(callback);
  if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = () => {
      readyCallbacks.splice(0).forEach((cb) => cb());
    };
  }
}

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasCountedRef = useRef(false);
  const [clickCount, setClickCount] = useState<number | null>(null);

  useEffect(() => {
    getLinkClickCount(link.id).then(setClickCount);
  }, [link.id]);

  useEffect(() => {
    if (!videoId) return;

    let player: { destroy: () => void } | undefined;

    onceYoutubeApiReady(() => {
      if (!iframeRef.current || !window.YT) return;
      player = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT!.PlayerState.PLAYING && !hasCountedRef.current) {
              hasCountedRef.current = true;
              setClickCount((count) => (count ?? 0) + 1);
              recordLinkClick(link.id); // fire-and-forget, doesn't block playback
            }
          },
        },
      });
    });

    return () => player?.destroy();
  }, [videoId, link.id]);

  if (!videoId) return null;

  // In dev, always show the count so it's easy to check while testing.
  // In production, only once it's a meaningful number.
  const showCount =
    clickCount !== null && (process.env.NODE_ENV !== "production" || clickCount > 10);

  return (
    <div className="mt-10 w-full">
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />

      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          ref={iframeRef}
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          title={link.name}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <p className="mt-2 text-center text-sm text-gray-500">{link.name}</p>
      {showCount && (
        <p className="text-center text-xs text-gray-400">{clickCount} clicks</p>
      )}
    </div>
  );
}
