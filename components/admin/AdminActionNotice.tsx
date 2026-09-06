"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminActionNotice() {
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const complete = () => setVisible(true);
    window.addEventListener("admin-action-complete", complete);
    return () => window.removeEventListener("admin-action-complete", complete);
  }, []);
  useEffect(() => {
    if (params.get("result") !== "saved") return;
    setVisible(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("result");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [params]);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 6000);
    const dismiss = () => setVisible(false);
    document.addEventListener("submit", dismiss, true);
    return () => { window.clearTimeout(timer); document.removeEventListener("submit", dismiss, true); };
  }, [visible]);
  if (!visible) return null;
  return <div className="admin-action-notice" role="status">Action completed successfully. <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss confirmation">Dismiss</button></div>;
}
