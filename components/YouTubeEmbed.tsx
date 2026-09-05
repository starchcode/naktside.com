"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { getLinkClickCount, recordLinkClick } from "@/app/actions/link-clicks";
import { registerPlayer, unregisterPlayer, notifyPlaying } from "@/components/media-player-registry";
import EmbedCaption from "@/components/EmbedCaption";

type Link = { id: string; name: string; url: string };

const ARTIST_URL = "https://www.youtube.com/@naktside";

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
        options: {
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => { destroy: () => void; pauseVideo: () => void };
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

    let player: { destroy: () => void; pauseVideo: () => void } | undefined;

    onceYoutubeApiReady(() => {
      if (!iframeRef.current || !window.YT) return;

      // YouTube's postMessage *commands* (like the pauseVideo() we send to
      // every other embed below) are unreliable without an origin param
      // matching the parent page — unlike the onStateChange *events* we
      // receive, which don't need it. Set imperatively here (not in the
      // JSX src) since window.location isn't available during SSR.
      iframeRef.current.src += `&origin=${window.location.origin}`;

      player = new window.YT.Player(iframeRef.current, {
        events: {
          // pauseVideo() etc. aren't attached to the player object until
          // onReady fires — registering any earlier than that is what
          // caused "pauseVideo is not a function".
          onReady: () => registerPlayer(link.id, () => player?.pauseVideo()),
          onStateChange: (event) => {
            if (event.data === window.YT!.PlayerState.PLAYING) {
              notifyPlaying(link.id); // pause every other embedded player

              if (!hasCountedRef.current) {
                hasCountedRef.current = true;
                setClickCount((count) => (count ?? 0) + 1);
                recordLinkClick(link.id); // fire-and-forget, doesn't block playback
              }
            }
          },
        },
      });
    });

    return () => {
      unregisterPlayer(link.id);
      player?.destroy();
    };
  }, [videoId, link.id]);

  if (!videoId) return null;

  return (
    <div className="mt-10 w-full">
      <Script
        id="youtube-iframe-api"
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
      />

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

      <EmbedCaption
        platform="YouTube"
        artistUrl={ARTIST_URL}
        trackUrl={link.url}
        trackTitle={link.name}
        clickCount={clickCount}
      />
    </div>
  );
}
