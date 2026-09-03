import crypto from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;

export function generateTotpSecret(byteLength = 20) {
  return base32Encode(crypto.randomBytes(byteLength));
}

export function totpAuthUrl(secret, { issuer, account }) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({ secret, issuer, digits: "6", period: String(STEP_SECONDS) });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// 30-second steps, ±1 step tolerance for clock drift — standard RFC 6238
// TOTP (SHA-1, 6 digits), compatible with Google Authenticator, Authy, etc.
export function verifyTotp(secretBase32, token, window = 1) {
  if (!secretBase32 || !/^\d{6}$/.test(token ?? "")) return false;

  const secretBuffer = base32Decode(secretBase32);
  const currentStep = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (let offset = -window; offset <= window; offset++) {
    if (hotp(secretBuffer, currentStep + offset) === token) return true;
  }
  return false;
}

function hotp(secretBuffer, counter) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secretBuffer).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, "0");
}

function base32Encode(buffer) {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");

  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  const remainder = bits.length % 5;
  if (remainder) {
    output += BASE32_ALPHABET[parseInt(bits.slice(-remainder).padEnd(5, "0"), 2)];
  }
  return output;
}

function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}
