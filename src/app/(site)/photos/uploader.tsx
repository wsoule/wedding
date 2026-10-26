"use client";

import { useEffect, useRef, useState } from "react";
import { uploadGuestPhoto } from "./actions";

// Photo prompts: a little scavenger hunt for the day. Tapping one opens the
// phone's photo picker (which also offers the camera), and the photo is saved
// with the prompt as its caption.
export const PROMPTS = [
  "The first kiss as newlyweds",
  "Your whole table, squeezed into one shot",
  "The best shoes on the dance floor",
  "Someone dancing like nobody's watching",
  "A selfie with someone you just met",
  "The couple when they don't know you're looking",
  "Golden hour over the lawn",
  "The cake, before anyone cuts it",
  "The oldest and youngest guests together",
  "A detail you think nobody else noticed",
  "The happiest crier",
  "Your view from the dance floor",
];

const NAME_KEY = "wedding-photo-name";

export function Uploader() {
  const nameInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ key: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Remember the guest's name between visits so they only type it once.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved && nameInput.current && !nameInput.current.value) nameInput.current.value = saved;
    } catch {}
  }, []);

  async function upload(files: FileList | null, caption: string, key: string) {
    if (!files?.length) return;
    const name = nameInput.current?.value.trim() ?? "";
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    setBusy(true);
    let done = 0;
    // One at a time, so a weak signal at the barn only loses the photo in flight.
    for (const file of Array.from(files)) {
      setStatus({ key, text: `Adding ${done + 1} of ${files.length}…` });
      const form = new FormData();
      form.set("photo", file);
      form.set("name", name);
      if (caption) form.set("caption", caption);
      const res = await uploadGuestPhoto(form);
      if (!res.ok) {
        setStatus({ key, text: res.error });
        setBusy(false);
        return;
      }
      done++;
    }
    setStatus({ key, text: done === 1 ? "Added. Thank you!" : `Added ${done} photos. Thank you!` });
    setBusy(false);
  }

  const picker = (caption: string, key: string) => (
    <input
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      disabled={busy}
      onChange={(e) => {
        void upload(e.target.files, caption, key);
        e.target.value = "";
      }}
    />
  );

  return (
    <div>
      <input ref={nameInput} className="field" placeholder="Your name (optional)" aria-label="Your name" autoComplete="name" />
      <label className={`btn btn-primary mt-2 w-full cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
        Upload photos
        {picker("", "any")}
      </label>
      {status?.key === "any" && (
        <p className="mt-2 text-center text-sm text-moss-soft" aria-live="polite">
          {status.text}
        </p>
      )}

      <h2 className="mt-14 text-center text-[2rem] text-fern-dark">Photo hunt</h2>
      <p className="mx-auto mt-1 max-w-[30ch] text-center text-moss-soft">Need ideas? Tap one, snap it, and it lands in the album.</p>
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {PROMPTS.map((prompt, i) => (
          <li key={prompt}>
            <label
              className={`print flex h-full min-h-28 cursor-pointer flex-col justify-between p-3 transition active:scale-[0.97] ${busy ? "pointer-events-none opacity-60" : ""}`}
              style={{ rotate: `${[-1.5, 1, 1.5, -1][i % 4]}deg` }}
            >
              <span className="font-serif text-[1.2rem] leading-snug">{prompt}</span>
              <span className="mt-2 text-sm text-fern-dark">{status?.key === prompt ? status.text : "Add a photo"}</span>
              {picker(prompt, prompt)}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
