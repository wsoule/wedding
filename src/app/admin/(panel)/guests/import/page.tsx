import type { Metadata } from "next";
import Link from "next/link";
import { Importer } from "./importer";

export const metadata: Metadata = { title: "Import guests" };

export default function ImportPage() {
  return (
    <>
      <Link href="/admin/guests" className="text-sm text-moss-soft">
        ← All guests
      </Link>
      <h1 className="mt-3 text-[1.75rem]">Import from a sheet</h1>
      <div className="mt-2 space-y-2 text-[0.95rem] text-moss-soft">
        <p>
          In Google Sheets, select all the cells (including the header row) and copy, then paste below. Or use
          File, Download, CSV and upload the file.
        </p>
        <p>
          Columns it understands: <b>Party</b> (rows with the same party are grouped), <b>First name</b>,{" "}
          <b>Last name</b> (or a single <b>Name</b> column), <b>Nickname</b>, <b>Child</b> (yes/no), <b>Plus one</b>{" "}
          (yes/no) and <b>Address</b>. A row named &quot;+1&quot; also adds a +1 slot.
        </p>
        <p>Parties whose name already exists are skipped, so importing twice won&apos;t duplicate anyone.</p>
      </div>
      <Importer />
    </>
  );
}
