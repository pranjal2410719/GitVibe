import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitVibe — Developer Personality Lab",
    short_name: "GitVibe",
    description:
      "Turn public commits into custom personality profiles — aura, chaos, energy, and a roast from your GitHub activity.",
    start_url: "/",
    display: "standalone",
    background_color: "#06070c",
    theme_color: "#06070c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
