import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const observed = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.08 },
    );

    const observeRevealElements = (root = document) => {
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

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
