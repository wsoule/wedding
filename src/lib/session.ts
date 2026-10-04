// Signed admin session tokens: "<expiry ms>.<hmac>". No database needed.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 60;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set (at least 16 characters).");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createToken(now = Date.now()) {
  const expires = String(now + SESSION_DAYS * 86_400_000);
  return `${expires}.${sign(expires)}`;
}

export function verifyToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expires, mac] = token.split(".");
  if (!expires || !mac || Number(expires) < now) return false;
  const expected = Buffer.from(sign(expires));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function passwordMatches(attempt: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  // Compare HMACs so lengths always match and timing reveals nothing.
  return timingSafeEqual(Buffer.from(sign(`pw:${attempt}`)), Buffer.from(sign(`pw:${real}`)));
}

// Proof that a guest confirmed their last name for this party. Valid for a day,
// long enough to finish (or come back to) an RSVP.
export function createPartyPass(partyId: string, now = Date.now()) {
  const expires = String(now + 86_400_000);
  return `${expires}.${sign(`party:${partyId}:${expires}`)}`;
}

export function verifyPartyPass(partyId: string, pass: string | undefined, now = Date.now()): boolean {
  if (!pass) return false;
  const [expires, mac] = pass.split(".");
  if (!expires || !mac || Number(expires) < now) return false;
  const expected = Buffer.from(sign(`party:${partyId}:${expires}`));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
