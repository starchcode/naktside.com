"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { verifyTurnstileAndGetEmail } from "@/app/actions/verify-turnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Status = "idle" | "loading" | "verifying" | "revealed" | "error";

export default function ContactReveal() {
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const startChallenge = () => {
    setStatus("loading");
  };

  useEffect(() => {
    if (
      status !== "loading" ||
      !scriptReady ||
      !containerRef.current ||
      !window.turnstile
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string,
      action: "reveal-contact-email",
      callback: async (token: string) => {
        setStatus("verifying");
        const result = await verifyTurnstileAndGetEmail(token);
        if ("email" in result) {
          setEmail(result.email);
          setStatus("revealed");
        } else {
          setStatus("error");
        }
      },
      "error-callback": () => setStatus("error"),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [status, scriptReady]);

  const copyEmail = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 text-center">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      {status === "idle" && (
        <button
          onClick={startChallenge}
          className="text-gray-500 underline underline-offset-4 transition-opacity hover:opacity-60 text-left"
        >
          contact me via email by clicking here

        </button>
      )}

      {(status === "loading" || status === "verifying") && (
        <div ref={containerRef} />
      )}

      {status === "error" && (
        <p className="text-red-600">
          Something went wrong. Please refresh and try again.
        </p>
      )}

      {status === "revealed" && email && (
        <div className="flex flex-col items-center gap-2">
          <a href={`mailto:${email}`} className="underline">
            {email}
          </a>
          <button
            onClick={copyEmail}
            className="rounded-full border border-gray-400 px-3 py-1 text-sm transition-opacity hover:opacity-60"
          >
            {copied ? "Copied!" : "Copy email"}
          </button>
        </div>
      )}
    </div>
  );
}
