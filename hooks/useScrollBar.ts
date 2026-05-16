import { useEffect } from "react";

export function useScrollBar() {
  useEffect(() => {
    const bar = document.getElementById("scrollBar");
    if (!bar) return undefined;

    const onScroll = () => {
      const html = document.documentElement;
      const progress = html.scrollTop / Math.max(1, html.scrollHeight - html.clientHeight);
      bar.style.width = `${progress * 100}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
