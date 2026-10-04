import "server-only";

// Sends through Resend's HTTP API. Without RESEND_API_KEY it logs and skips,
// so local dev and a not-yet-configured deploy still accept RSVPs.
export async function sendEmail({ to, subject, text }: { to: string[]; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || to.length === 0) {
    console.info(`[email skipped] ${subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) console.error(`[email failed] ${res.status} ${await res.text()}`);
}
