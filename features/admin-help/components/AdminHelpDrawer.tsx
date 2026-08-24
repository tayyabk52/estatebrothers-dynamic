"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminHelpPanel } from "./AdminHelpPanel";

export function AdminHelpDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="admin-help-fab"
        aria-label="Open admin help"
        aria-expanded={open}
        aria-controls="admin-help-drawer"
        onClick={() => setOpen((value) => !value)}
      >
        ?
      </button>
      <aside id="admin-help-drawer" className={`admin-help-drawer${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="admin-help-drawer-head">
          <div>
            <span className="admin-pill">Admin guide</span>
            <h2>How do I use this?</h2>
          </div>
          <button type="button" className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <AdminHelpPanel compact />
        <Link href="/admin/help" className="admin-help-full-link" onClick={() => setOpen(false)}>
          Open full help center →
        </Link>
      </aside>
      {open && <button type="button" className="admin-help-backdrop" aria-label="Close admin help" onClick={() => setOpen(false)} />}
    </>
  );
}
