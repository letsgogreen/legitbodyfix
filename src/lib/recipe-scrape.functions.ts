import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ScrapedRecipeSource = {
  url: string;
  siteName: string;
  title: string;
  description: string;
  imageUrl: string | null;
  excerpt: string;
  error: string | null;
};

const blockedHostname = /^(?:localhost|0\.0\.0\.0|127(?:\.\d+){3}|10(?:\.\d+){3}|192\.168(?:\.\d+){2}|169\.254(?:\.\d+){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d+){2}|\[?::1\]?)$/i;

function assertPublicHttps(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || blockedHostname.test(url.hostname) || !url.hostname.includes(".")) {
    throw new Error("Use a public HTTPS URL.");
  }
  return url;
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function clean(value: string, limit = 1200) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, limit);
}

function meta(html: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return clean(match[1], 600);
    }
  }
  return "";
}

async function scrapeOne(rawUrl: string): Promise<ScrapedRecipeSource> {
  const empty = { url: rawUrl, siteName: "", title: "", description: "", imageUrl: null, excerpt: "" };
  try {
    let url = assertPublicHttps(rawUrl);
    let response: Response | null = null;
    for (let redirect = 0; redirect <= 4; redirect += 1) {
      response = await fetch(url, {
        headers: { "User-Agent": "LegitBodyFix source collector/1.0" },
        redirect: "manual",
        signal: AbortSignal.timeout(12_000),
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      if (!location) throw new Error("The source redirected without a destination.");
      url = assertPublicHttps(new URL(location, url).toString());
    }
    if (!response) throw new Error("Could not read this source.");
    if ([301, 302, 303, 307, 308].includes(response.status)) throw new Error("The source redirected too many times.");
    if (!response.ok) return { ...empty, error: `Source returned ${response.status}.` };
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) {
      return { ...empty, error: "The URL is not an HTML page." };
    }
    const html = (await response.text()).slice(0, 1_500_000);
    const title = meta(html, ["og:title", "twitter:title"]) || clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "", 180);
    const description = meta(html, ["description", "og:description", "twitter:description"]);
    const image = meta(html, ["og:image", "twitter:image"]);
    const paragraphs = [...html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)]
      .map((match) => clean(match[1], 500))
      .filter((paragraph) => paragraph.length >= 80);
    const imageUrl = image ? new URL(image, url).toString() : null;
    return {
      url: url.toString(),
      siteName: meta(html, ["og:site_name"]) || url.hostname.replace(/^www\./, ""),
      title: title || url.hostname,
      description,
      imageUrl,
      excerpt: paragraphs.slice(0, 2).join(" ").slice(0, 900),
      error: null,
    };
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : "Could not read this source." };
  }
}

export const scrapeRecipeSources = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ urls: z.array(z.string().url()).min(1).max(20) }).parse(input))
  .handler(async ({ data }) => Promise.all(data.urls.map(scrapeOne)));
