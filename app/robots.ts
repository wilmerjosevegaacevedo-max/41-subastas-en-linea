import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/mis-pujas", "/vender"],
    },
    sitemap: "https://41-subastas-en-linea.vercel.app/sitemap.xml",
  };
}
