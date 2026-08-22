import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Estate Brothers",
    short_name: "Estate Brothers",
    description:
      "Real estate buying, selling, and investment advisory from Estate Brothers in Lahore.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EC",
    theme_color: "#2E4A3A",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
