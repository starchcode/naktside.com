"use client";

import { useSyncExternalStore } from "react";

const DONT_SHOW_AGAIN_KEY = "naktside_privacy_notice_dismissed";
const CLOSED_THIS_SESSION_KEY = "naktside_privacy_notice_closed_session";

// A tiny local pub/sub so writing to storage in this tab immediately
// updates this component too (the native "storage" event only fires in
// *other* tabs, not the one that made the change).
const listeners = new Set<() => void>();
const emitChange = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function isDismissed() {
  try {
    return Boolean(
      localStorage.getItem(DONT_SHOW_AGAIN_KEY) ||
        sessionStorage.getItem(CLOSED_THIS_SESSION_KEY)
    );
  } catch {
    return false;
  }
}

// Treat it as dismissed for the very first (server-rendered) paint, so
// there's no flash of the banner before hydration can check storage.
const getServerSnapshot = () => true;

export default function PrivacyNotice() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, getServerSnapshot);

  const close = () => {
    try {
      sessionStorage.setItem(CLOSED_THIS_SESSION_KEY, "true");
    } catch {}
    emitChange();
  };

  const dontShowAgain = () => {
    try {
      localStorage.setItem(DONT_SHOW_AGAIN_KEY, "true");
    } catch {}
    emitChange();
  };

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center text-sm text-gray-600 sm:flex-row sm:text-left">
        <p className="flex-1">
          We record which platform referred you here (Instagram or YouTube)
          and your approximate country, to see where visits come from. No IP
          addresses, cookies, or personal identifiers are stored, and nothing
          is tracked across visits.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={dontShowAgain}
            className="rounded-full border border-gray-400 px-3 py-1 text-xs transition-opacity hover:opacity-60"
          >
            Don&apos;t show this again
          </button>
          <button
            onClick={close}
            className="rounded-full bg-gray-900 px-3 py-1 text-xs text-white transition-opacity hover:opacity-60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
