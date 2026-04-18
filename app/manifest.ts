import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brandle",
    short_name: "Brandle",
    description: "Wordle for brand names. A new brand every day.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    screenshots: [
      {
        src: "/screenshot.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    icons: [
      {
        src: "/favicon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
