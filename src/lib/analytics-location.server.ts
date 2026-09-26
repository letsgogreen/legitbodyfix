import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AddressDetails = Record<string, unknown>;

const ADMINISTRATIVE_SUFFIX = /(?:시|군|구|읍|면)$/u;
const TOP_LEVEL_SUFFIX = /(?:특별시|광역시|특별자치시|특별자치도|도)$/u;

function coordinate(request: Request, header: string, min: number, max: number) {
  const value = Number(request.headers.get(header));
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function administrativeArea(address: AddressDetails) {
  const candidates = [
    address.city,
    address.county,
    address.city_district,
    address.borough,
    address.town,
    address.municipality,
    address.village,
  ];
  const parts = candidates
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => ADMINISTRATIVE_SUFFIX.test(value) && !TOP_LEVEL_SUFFIX.test(value));
  return [...new Set(parts)].join(" · ").slice(0, 120) || null;
}

export async function resolveAdministrativeArea(
  request: Request,
  countryCode: string | null,
  supabaseAdmin: SupabaseClient<Database>,
) {
  if (countryCode !== "KR") return null;
  const latitude = coordinate(request, "x-vercel-ip-latitude", -90, 90);
  const longitude = coordinate(request, "x-vercel-ip-longitude", -180, 180);
  const salt = process.env.ANALYTICS_HASH_SALT;
  if (latitude === null || longitude === null || !salt) return null;

  const { createHmac } = await import("node:crypto");
  const roundedCoordinate = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const coordinateHash = createHmac("sha256", salt)
    .update(roundedCoordinate)
    .digest("hex")
    .slice(0, 32);

  const cached = await supabaseAdmin
    .from("analytics_location_cache")
    .select("administrative_area")
    .eq("coordinate_hash", coordinateHash)
    .maybeSingle();
  if (cached.data?.administrative_area) return cached.data.administrative_area as string;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.search = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "12",
      addressdetails: "1",
      "accept-language": "ko",
      layer: "address",
    }).toString();
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "LegitBodyFix/1.0 (+https://www.legitbodyfix.com; contact: thriveinside@protonmail.com)",
      },
      signal: AbortSignal.timeout(1800),
    });
    if (!response.ok) return null;
    const result = (await response.json()) as { address?: AddressDetails };
    const area = result.address ? administrativeArea(result.address) : null;
    if (!area) return null;
    await supabaseAdmin.from("analytics_location_cache").upsert({
      coordinate_hash: coordinateHash,
      administrative_area: area,
      updated_at: new Date().toISOString(),
    });
    return area;
  } catch (error) {
    console.warn("Administrative-area lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}
