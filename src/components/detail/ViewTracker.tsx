"use client";

import { useEffect } from "react";
import { PUBLIC_STRAPI_URL } from "@/lib/media";

/** Calls POST /api/news-items/:documentId/view once per browser session. */
export function ViewTracker({ documentId }: { documentId: string }) {
  useEffect(() => {
    const key = `viewed:${documentId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked: still count */
    }
    void fetch(`${PUBLIC_STRAPI_URL}/api/news-items/${documentId}/view`, { method: "POST" })
      .then((r) => r.body?.cancel())
      .catch(() => undefined);
  }, [documentId]);
  return null;
}
