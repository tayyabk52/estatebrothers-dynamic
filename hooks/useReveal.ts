import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    // Route content can still be streaming after this shared layout hydrates.
    // Animate through the Web Animations API instead of changing class/style
    // attributes owned by React, so late segments keep identical hydration
    // markup while retaining the reveal effect.
    let started = false;
    let cleanup: (() => void) | undefined;

    const start = () => {
      if (started) return;
      started = true;

      const observed = new WeakSet();
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.animate(
              [
                { opacity: 0, transform: "translateY(14px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 900,
                easing: "ease",
                fill: "forwards",
              },
            );
            io.unobserve(entry.target);
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
