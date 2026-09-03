"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// A GitHub-style "go to" shortcut: press a sequence of plain keys (no
// modifiers) within a short window to navigate. Deliberately no
// Ctrl/Cmd/Alt involved — those are exactly what collides with the browser
// or OS, and Cmd-vs-Ctrl differs by platform anyway. A bare key sequence
// avoids both problems and behaves identically on Mac, Windows, and Linux.
const SEQUENCE_TIMEOUT_MS = 1000;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export default function GoToShortcut({
  keys,
  href,
}: {
  keys: string[];
  href: string;
}) {
  const router = useRouter();
  const stepRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const reset = () => {
      stepRef.current = 0;
      clearTimeout(timeoutRef.current);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === keys[stepRef.current]) {
        stepRef.current += 1;
        clearTimeout(timeoutRef.current);

        if (stepRef.current === keys.length) {
          reset();
          router.push(href);
          return;
        }

        timeoutRef.current = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
      } else {
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [router, href, keys]);

  return null;
}
