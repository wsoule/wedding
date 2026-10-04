"use client";

import { useState } from "react";

export function CopyCode({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard?.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-paper px-4 py-2.5 text-left ring-1 ring-lichen"
    >
      <span>
        <span className="block text-sm text-moss-soft">{label}</span>
        <span className="font-mono text-[1.05rem] tracking-wide">{code}</span>
      </span>
      <span className="text-sm font-semibold text-fern-dark" aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
