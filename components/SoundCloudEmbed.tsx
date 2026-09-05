"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { getLinkClickCount, recordLinkClick } from "@/app/actions/link-clicks";
import { registerPlayer, unregisterPlayer, notifyPlaying } from "@/components/media-player-registry";
import EmbedCaption from "@/components/EmbedCaption";

type Link = { id: string; name: string; url: string };

const ARTIST_URL = "https://soundcloud.com/naktside";

// SoundCloud's own Widget API — same idea as the YouTube IFrame Player API:
// it lets us listen for play/ready and command pause() on a cross-origin
// iframe we otherwise couldn't touch.
type SCWidgetInstance = {
  bind: (eventName: string, callback: () => void) => void;
  pause: () => void;
};
type SCWidgetConstructor = {
  (el: HTMLElement): SCWidgetInstance;
  Events: { READY: string; PLAY: string };
};

declare global {
  interface Window {
    SC?: { Widget: SCWidgetConstructor };
  }
}

const readyCallbacks: (() => void)[] = [];

function onceSoundCloudApiReady(callback: () => void) {
  if (window.SC?.Widget) {
    callback();
    return;
  }
  readyCallbacks.push(callback);
}

function flushSoundCloudReadyCallbacks() {
  readyCallbacks.splice(0).forEach((cb) => cb());
}

export default function SoundCloudEmbed({ link }: { link: Link }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasCountedRef = useRef(false);
  const [clickCount, setClickCount] = useState<number | null>(null);

  useEffect(() => {
    getLinkClickCount(link.id).then(setClickCount);
  }, [link.id]);

  useEffect(() => {
    let widget: SCWidgetInstance | undefined;

    onceSoundCloudApiReady(() => {
      if (!iframeRef.current || !window.SC) return;

      widget = window.SC.Widget(iframeRef.current);
      widget.bind(window.SC.Widget.Events.READY, () => {
        registerPlayer(link.id, () => widget?.pause());
      });
      widget.bind(window.SC.Widget.Events.PLAY, () => {
        notifyPlaying(link.id); // pause every other embedded player

        if (!hasCountedRef.current) {
          hasCountedRef.current = true;
          setClickCount((count) => (count ?? 0) + 1);
          recordLinkClick(link.id); // fire-and-forget, doesn't block playback
        }
      });
    });

    return () => unregisterPlayer(link.id);
  }, [link.id]);

  const embedUrl =
    "https://w.soundcloud.com/player/?url=" +
    encodeURIComponent(link.url) +
    "&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true" +
    "&show_user=true&show_reposts=false&show_teaser=true&visual=true";

  return (
    <div className="mt-10 w-full">
      <Script
        id="soundcloud-widget-api"
        src="https://w.soundcloud.com/player/api.js"
        strategy="afterInteractive"
        onLoad={flushSoundCloudReadyCallbacks}
      />

      <iframe
        ref={iframeRef}
        width="100%"
        height={300}
        scrolling="no"
        frameBorder="no"
        allow="autoplay; encrypted-media"
        src={embedUrl}
        title={link.name}
        loading="lazy"
      />

      <EmbedCaption
        platform="SoundCloud"
        artistUrl={ARTIST_URL}
        trackUrl={link.url}
        trackTitle={link.name}
        clickCount={clickCount}
      />
    </div>
  );
}
