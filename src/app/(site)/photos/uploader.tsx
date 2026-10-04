"use client";

import { useState } from "react";
import { uploadGuestPhoto } from "./actions";

// Upload photos from the camera roll, one at a time so a weak signal at the
// barn only loses the photo in flight, not the whole batch.
export function Uploader() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    let done = 0;
    for (const file of Array.from(files)) {
      setStatus(`Adding ${done + 1} of ${files.length}…`);
      const form = new FormData();
      form.set("photo", file);
      form.set("name", name);
      const res = await uploadGuestPhoto(form);
      if (!res.ok) {
        setStatus(res.error);
        setBusy(false);
        return;
      }
      done++;
    }
    setStatus(`Added ${done} ${done === 1 ? "photo" : "photos"}. Thank you!`);
    setBusy(false);
  }

  return (
    <div>
      <input className="field" placeholder="Your name (optional)" aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <label className={`btn btn-quiet mt-2 w-full cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
        Upload from your camera roll
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={busy} />
      </label>
      {status && (
        <p className="mt-2 text-center text-sm text-moss-soft" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
