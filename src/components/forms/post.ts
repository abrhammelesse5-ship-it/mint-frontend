import { PUBLIC_STRAPI_URL } from "@/lib/media";

export interface PostResult {
  ok: boolean;
  status: number;
  errors?: Record<string, string>;
}

/** POST { data } to a public Strapi endpoint from the browser (the API rate-limits per visitor IP). */
export async function postForm(path: string, data: Record<string, unknown>): Promise<PostResult> {
  try {
    const res = await fetch(`${PUBLIC_STRAPI_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ data }),
    });
    let errors: Record<string, string> | undefined;
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { details?: { errors?: Record<string, string> } } } | null;
      errors = body?.error?.details?.errors;
    }
    return { ok: res.ok, status: res.status, errors };
  } catch {
    return { ok: false, status: 0 };
  }
}
