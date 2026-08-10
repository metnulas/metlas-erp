import { logger } from "@/server/logger/logger";

type NominatimResult = { lat: string; lon: string; display_name?: string; type?: string };
type ArcgisResult = { address?: string; score?: number; location?: { x?: number; y?: number } };

export interface Coordinates { latitude: number; longitude: number; }

export async function geocodeAddress(address?: string | null, district?: string | null, city?: string | null, location?: string | null): Promise<Coordinates | null> {
  const coordinateMatch = location?.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coordinateMatch) {
    const latitude = Number(coordinateMatch[1]);
    const longitude = Number(coordinateMatch[2]);
    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) return { latitude, longitude };
  }
  const queries = [...new Set([
    ...(address ? [[address, district, city, "Türkiye"], [address, city, "Türkiye"]] : []),
    ...(location ? [[location, district, city, "Türkiye"]] : []),
  ].map((parts) => parts.filter(Boolean).join(", ").trim()).filter(Boolean))];
  for (const query of queries) {
    const result = await requestNominatim(query, district, city, address) ?? await requestArcgis(query, district, city);
    if (result) return result;
    if (query !== queries[queries.length - 1]) await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}

async function requestArcgis(query: string, district?: string | null, city?: string | null): Promise<Coordinates | null> {
  try {
    const url = new URL("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates");
    url.searchParams.set("SingleLine", query);
    url.searchParams.set("maxLocations", "5");
    url.searchParams.set("f", "json");
    const response = await fetch(url, { signal: AbortSignal.timeout(7000), next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const payload = await response.json() as { candidates?: ArcgisResult[] };
    const normalized = (value: string) => value.toLocaleLowerCase("tr-TR").replace(/[ıİ]/g, "i");
    const result = payload.candidates?.find((candidate) => {
      const candidateAddress = normalized(candidate.address ?? "");
      return (candidate.score ?? 0) >= 90 && [district, city].filter((value) => value && value.length > 2).every((value) => candidateAddress.includes(normalized(value as string)));
    });
    const latitude = Number(result?.location?.y);
    const longitude = Number(result?.location?.x);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  } catch (error) {
    logger.warn("ArcGIS adres sorgusu başarısız", { query, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

async function requestNominatim(query: string, district?: string | null, city?: string | null, address?: string | null): Promise<Coordinates | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "3");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("countrycodes", "tr");
    url.searchParams.set("accept-language", "tr");
    url.searchParams.set("q", query);
    const contactEmail = process.env.NOMINATIM_CONTACT_EMAIL;
    if (contactEmail) url.searchParams.set("email", contactEmail);
    const response = await fetch(url, { headers: { "User-Agent": `METLAS-ERP/1.0${contactEmail ? ` (${contactEmail})` : ""}`, "Accept-Language": "tr-TR,tr;q=0.9" }, signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const results = await response.json() as NominatimResult[];
    const normalizedDisplay = (value: string) => value.toLocaleLowerCase("tr-TR").replace(/[ıİ]/g, "i");
    const displayMatchesArea = (result: NominatimResult) => { const display = normalizedDisplay(result.display_name ?? ""); return [district, city].filter((value) => value && value.length > 2).every((value) => display.includes(normalizedDisplay(value as string))); };
    const preciseTypes = new Set(["house", "building", "residential", "road", "street", "apartments", "yes"]);
    const requestedNumber = address?.match(/\b\d+\b/)?.[0];
    const result = results.find((candidate) => displayMatchesArea(candidate)
      && (!address || !/\d/.test(address) || (candidate.type && preciseTypes.has(candidate.type)))
      && (!requestedNumber || (candidate.display_name ?? "").includes(requestedNumber)));
    const latitude = Number(result?.lat);
    const longitude = Number(result?.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  } catch (error) {
    logger.warn("Adres sorgusu başarısız", { query, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}
