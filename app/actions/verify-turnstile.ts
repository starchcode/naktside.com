"use server";

const expectedHostnames = new Set(
  (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean)
);

// Verifies a Turnstile token server-side and, only if it's genuinely valid,
// returns the contact email. The email never reaches the client otherwise.
export async function verifyTurnstileAndGetEmail(
  token: unknown
): Promise<{ email: string } | { error: string }> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { error: "Invalid token." };
  }

  if (expectedHostnames.size === 0) {
    return { error: "Server misconfigured." };
  }

  let result;
  try {
    const r = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY as string,
          response: token,
        }),
      }
    );
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch {
    return { error: "Verification request failed." };
  }

  if (!result.success || !expectedHostnames.has(result.hostname)) {
    return { error: "Verification failed." };
  }

  const email = process.env.CONTACT_EMAIL;
  if (!email) {
    return { error: "Server misconfigured." };
  }

  return { email };
}
