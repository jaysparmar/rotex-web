import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * GETs a public /api/v1 endpoint and returns its `data`, or null on failure.
 * The public site goes through the versioned API (not prisma directly).
 */
async function fetchSiteApi<T>(path: string): Promise<T | null> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/${path}`, { cache: "no-store" });

    if (!res.ok) {
      console.error(`[site-api] GET /api/v1/${path} → ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.success) {
      console.error(`[site-api] GET /api/v1/${path} → ${json.error?.code}: ${json.error?.message}`);
      return null;
    }

    return json.data;
  } catch (err) {
    // headers() throws an internal error at build time to mark the route as
    // dynamic. Let Next.js handle it instead of logging it as a failure.
    unstable_rethrow(err);
    console.error(`[site-api] GET /api/v1/${path} failed:`, err);
    return null;
  }
}

export function fetchHomeSection<T extends object>(key: string) {
  return fetchSiteApi<{ enabled: boolean; order: number } & T>(`home/${key}`);
}

export function fetchAboutSection<T extends object>(key: string) {
  return fetchSiteApi<{ enabled: boolean } & T>(`about/${key}`);
}

export function fetchContactSection<T extends object>(key: string) {
  return fetchSiteApi<{ enabled: boolean } & T>(`contact/${key}`);
}

export function fetchCareerSection<T extends object>(key: string) {
  return fetchSiteApi<{ enabled: boolean } & T>(`career/${key}`);
}

export function fetchSupplierSection<T extends object>(key: string) {
  return fetchSiteApi<{ enabled: boolean } & T>(`supplier/${key}`);
}

export function fetchChannelPartnerSection<T extends object>(key: string) {
  return fetchSiteApi<{ enabled: boolean } & T>(`channel-partner/${key}`);
}

export function fetchIndustries<T extends object>() {
  return fetchSiteApi<T>("industries");
}
