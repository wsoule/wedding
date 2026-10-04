"use client";

import { useEffect, useRef, useState } from "react";
import { uploadGuestPhoto } from "./actions";

// An in-browser photobooth: four shots with a countdown and flash, printed
// onto a strip with the couple's names, then added to the shared album.

type Phase = "idle" | "live" | "shooting" | "review" | "sending" | "sent";

const SHOTS = 4;
const W = 600; // strip width in px
const PAD = 30;
const FRAME_W = W - PAD * 2;
const FRAME_H = Math.round((FRAME_W * 3) / 4);
const GAP = 16;
const FOOTER = 150;
const H = PAD + SHOTS * FRAME_H + (SHOTS - 1) * GAP + FOOTER;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Booth() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const shots = useRef<HTMLCanvasElement[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [taken, setTaken] = useState(0);
  const [strip, setStrip] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const stripBlob = useRef<Blob | null>(null);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  async function start() {
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setPhase("live");
      requestAnimationFrame(() => {
        if (video.current && stream.current) {
          video.current.srcObject = stream.current;
          void video.current.play();
        }
      });
    } catch {
      setError("We couldn't open your camera. Check that this site is allowed to use it, or upload photos from your camera roll below.");
    }
  }

  function capture(): HTMLCanvasElement {
    const v = video.current!;
    const c = document.createElement("canvas");
    c.width = FRAME_W * 2;
    c.height = FRAME_H * 2;
    const ctx = c.getContext("2d")!;
    // Crop the camera image to 4:3 and mirror it, like the preview.
    const target = 4 / 3;
    const vw = v.videoWidth;
    const vh = v.videoHeight;
    const sw = vw / vh > target ? vh * target : vw;
    const sh = vw / vh > target ? vh : vw / target;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    return c;
  }

  async function shoot() {
    setPhase("shooting");
    shots.current = [];
    setTaken(0);
    for (let i = 0; i < SHOTS; i++) {
      for (const n of [3, 2, 1]) {
        setCount(n);
        await sleep(i === 0 ? 900 : 650);
      }
      setCount(null);
      setFlash(true);
      shots.current.push(capture());
      setTaken(i + 1);
      await sleep(180);
      setFlash(false);
      await sleep(500);
    }
    await compose();
  }

  async function compose() {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fdfdfb";
    ctx.fillRect(0, 0, W, H);
    shots.current.forEach((shot, i) => ctx.drawImage(shot, PAD, PAD + i * (FRAME_H + GAP), FRAME_W, FRAME_H));

    const serif = getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim() || "Georgia";
    const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-jost").trim() || "sans-serif";
    await document.fonts.ready;
    const y = H - FOOTER + 70;
    ctx.textAlign = "center";
    ctx.fillStyle = "#213528";
    ctx.font = `500 46px ${serif}`;
    ctx.fillText("Jaden & Wyat", W / 2, y);
    ctx.fillStyle = "#5a695e";
    ctx.font = `400 17px ${sans}`;
    ctx.letterSpacing = "6px";
    ctx.fillText("05 · 22 · 2027", W / 2, y + 40);

    stripBlob.current = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
    setStrip(c.toDataURL("image/jpeg", 0.9));
    setPhase("review");
  }

  async function send() {
    if (!stripBlob.current) return;
    setPhase("sending");
    const form = new FormData();
    form.set("photo", new File([stripBlob.current], "photobooth.jpg", { type: "image/jpeg" }));
    form.set("name", name);
    form.set("caption", "Photobooth");
    const res = await uploadGuestPhoto(form);
    if (!res.ok) {
      setError(res.error);
      setPhase("review");
      return;
    }
    setPhase("sent");
  }

  function again() {
    setStrip(null);
    setError(null);
    setPhase(stream.current ? "live" : "idle");
  }

  if (phase === "idle") {
    return (
      <div className="text-center">
        <button type="button" onClick={start} className="btn btn-primary w-full">
          Open the photobooth
        </button>
        <p className="mt-2 text-sm text-moss-soft">Uses your front camera. Four shots, about ten seconds.</p>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-foxglove/20 px-4 py-3 text-foxglove-dark">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (phase === "review" || phase === "sending" || phase === "sent") {
    return (
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={strip!} alt="Your photobooth strip" className="print-out mx-auto w-48 shadow-[0_12px_30px_-12px_rgb(33_53_40/0.4)] [rotate:-2deg]" />
        {phase === "sent" ? (
          <>
            <p className="mt-6 font-serif text-[1.8rem] italic text-foxglove-dark">Added to the album</p>
            <button type="button" onClick={again} className="btn btn-quiet mt-4 w-full">
              Take another
            </button>
          </>
        ) : (
          <>
            <input
              className="field mt-6"
              placeholder="Your name (optional)"
              aria-label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && (
              <p role="alert" className="mt-3 text-foxglove-dark">
                {error}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={again} className="btn btn-quiet shrink-0" disabled={phase === "sending"}>
                Retake
              </button>
              <button type="button" onClick={send} className="btn btn-primary flex-1" disabled={phase === "sending"}>
                {phase === "sending" ? "Adding…" : "Add to the album"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="print relative mx-auto max-w-sm [--tilt:-1deg]">
        <div className="relative aspect-[4/3] overflow-hidden bg-moss">
          <video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
          {count !== null && (
            <span key={count} className="rise absolute inset-0 flex items-center justify-center font-serif text-[7rem] text-white drop-shadow-lg">
              {count}
            </span>
          )}
          <span className={`pointer-events-none absolute inset-0 bg-white transition-opacity ${flash ? "opacity-100 duration-0" : "opacity-0 duration-500"}`} />
        </div>
        <div className="flex justify-center gap-2 pt-3" aria-label={`${taken} of ${SHOTS} photos taken`}>
          {Array.from({ length: SHOTS }, (_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i < taken ? "bg-foxglove-dark" : "bg-lichen"}`} />
          ))}
        </div>
      </div>
      <button type="button" onClick={shoot} disabled={phase === "shooting"} className="btn btn-primary mt-5 w-full">
        {phase === "shooting" ? "Smile!" : "Start: 4 shots"}
      </button>
    </div>
  );
}
