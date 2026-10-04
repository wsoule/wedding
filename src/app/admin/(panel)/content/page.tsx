import type { Metadata } from "next";
import { connection } from "next/server";
import { getFaqs, getHotels, getRegistry, getSchedule } from "@/lib/data";
import { deleteContent, moveContent, saveContent } from "../../actions";
import { contentConfig, type ContentKind } from "../../content-config";
import { ConfirmButton } from "../confirm-button";

export const metadata: Metadata = { title: "Content" };

type Item = { id: string } & Record<string, unknown>;

export default async function ContentPage() {
  await connection();
  const [schedule, hotels, registry, faqs] = await Promise.all([getSchedule(), getHotels(), getRegistry(), getFaqs()]);
  const sections: [ContentKind, Item[]][] = [
    ["schedule", schedule],
    ["hotels", hotels],
    ["registry", registry],
    ["faqs", faqs],
  ];

  return (
    <>
      <h1 className="text-[1.75rem]">Site content</h1>
      <p className="mt-1 text-moss-soft">Changes show up on the site right away.</p>
      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Jump to section">
        {sections.map(([kind]) => (
          <a key={kind} href={`#${kind}`} className="rounded-full bg-card px-3.5 py-1.5 text-sm font-medium ring-1 ring-lichen">
            {contentConfig[kind].title}
          </a>
        ))}
      </nav>
      {sections.map(([kind, items]) => (
        <Section key={kind} kind={kind} items={items} />
      ))}
    </>
  );
}

function Section({ kind, items }: { kind: ContentKind; items: Item[] }) {
  const cfg = contentConfig[kind];
  const summary = (item: Item) => String(item[cfg.fields[0].name] ?? "") + (cfg.fields[1] && !cfg.fields[1].long ? ` · ${item[cfg.fields[1].name] ?? ""}` : "");

  return (
    <section id={kind} className="mt-10 scroll-mt-28">
      <h2 className="mb-3 text-xl">{cfg.title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="rounded-2xl bg-card ring-1 ring-lichen">
            <details>
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-3">
                <span className="min-w-0 flex-1 truncate">{summary(item)}</span>
                <span className="text-sm text-moss-soft">Edit</span>
              </summary>
              <form action={saveContent} className="space-y-2 border-t border-lichen px-4 py-4">
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={item.id} />
                <Fields kind={kind} item={item} />
                <button className="btn btn-primary w-full">Save</button>
              </form>
              <div className="flex gap-2 border-t border-lichen px-4 py-3">
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={moveContent}>
                    <input type="hidden" name="kind" value={kind} />
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <button
                      className="btn btn-quiet min-h-10 px-4"
                      disabled={dir === "up" ? i === 0 : i === items.length - 1}
                      aria-label={`Move ${dir}`}
                    >
                      {dir === "up" ? "↑" : "↓"}
                    </button>
                  </form>
                ))}
                <form action={deleteContent} className="ml-auto">
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton message={`Delete this ${cfg.itemLabel}?`} className="btn min-h-10 px-4 text-foxglove-dark">
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <details className="mt-2 rounded-2xl border-[1.5px] border-dashed border-sage">
        <summary className="cursor-pointer px-4 py-3 font-medium text-fern-dark">Add a {cfg.itemLabel}</summary>
        <form action={saveContent} className="space-y-2 px-4 pb-4">
          <input type="hidden" name="kind" value={kind} />
          <Fields kind={kind} />
          <button className="btn btn-primary w-full">Add {cfg.itemLabel}</button>
        </form>
      </details>
    </section>
  );
}

function Fields({ kind, item }: { kind: ContentKind; item?: Item }) {
  return contentConfig[kind].fields.map((f) => {
    const value = (item?.[f.name] as string | null | undefined) ?? "";
    return (
      <label key={f.name} className="block">
        <span className="mb-1 block text-sm text-moss-soft">
          {f.label}
          {f.required && " *"}
        </span>
        {f.long ? (
          <textarea name={f.name} defaultValue={value} required={f.required} className="field min-h-24" />
        ) : (
          <input name={f.name} type={f.type ?? "text"} defaultValue={value} required={f.required} className="field" />
        )}
      </label>
    );
  });
}
