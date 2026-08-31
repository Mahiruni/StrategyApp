import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meridian Trading Plan & Journal",
    short_name: "Meridian",
    description: "Build the plan. Trade the plan. Review the evidence.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090D",
    theme_color: "#08090D",
    categories: ["finance", "productivity"],
  };
}
