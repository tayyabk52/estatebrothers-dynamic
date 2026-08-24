import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    // This hook lives in the shared marketing layout while route content can
    // still be streaming and hydrating. Starting the observer immediately can
    // add `.in` to server HTML before React hydrates that route segment.
    // Wait for the document load boundary so React receives the exact server
    // markup it expects, then begin the purely visual reveal behavior.
    let started = false;
    let cleanup: (() => void) | undefined;

    const start = () => {
      if (started) return;
      started = true;

      const observed = new WeakSet();
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("in");
          });
        },
        { threshold: 0.08 },
      );

      const observeRevealElements = (root: Document | Element = document) => {
        const elements =
          root instanceof Element && root.matches(".reveal")
            ? [root, ...root.querySelectorAll(".reveal")]
            : root.querySelectorAll(".reveal");

        elements.forEach((el) => {
          if (observed.has(el)) return;
          observed.add(el);
          io.observe(el);
        });
      };

      observeRevealElements();

      const mo = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) observeRevealElements(node);
          });
        });
      });

      mo.observe(document.body, { childList: true, subtree: true });

      cleanup = () => {
        mo.disconnect();
        io.disconnect();
      };
    };

    if (document.readyState === "complete") {
      const timeoutId = window.setTimeout(start, 0);
      return () => {
        window.clearTimeout(timeoutId);
        cleanup?.();
      };
    }

    window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      cleanup?.();
    };
  }, []);
}
