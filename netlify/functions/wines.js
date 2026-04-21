// netlify/functions/wines.js  — Netlify Functions v2 + Netlify Blobs
// v2 syntax: exporteer Config + default handler als async (Request) => Response

import { getStore } from "@netlify/blobs";
import { Config } from "@netlify/functions";

const STORE_NAME = "wijnkelder";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function ok(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HEADERS });
}

export default async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  const store = getStore(STORE_NAME);

  // Haal het wijn-ID op uit het pad: /api/wines/1234567890
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/.netlify\/functions\/wines\/?/, "").split("/").filter(Boolean);
  const wijnId = parts[0] || null;

  // GET /api/wines — alle wijnen
  if (req.method === "GET" && !wijnId) {
    try {
      const { blobs } = await store.list();
      const wines = await Promise.all(
        blobs.map(async ({ key }) => {
          const raw = await store.get(key);
          try { return JSON.parse(raw); } catch { return null; }
        })
      );
      const valid = wines.filter(Boolean).sort((a, b) => a.id - b.id);
      return ok(valid);
    } catch (e) {
      return err("Laden mislukt: " + e.message, 500);
    }
  }

  // POST /api/wines — nieuwe wijn
  if (req.method === "POST" && !wijnId) {
    try {
      const data = await req.json();
      const id = Date.now();
      const wijn = { id, ...data };
      await store.set(String(id), JSON.stringify(wijn));
      return ok({ id }, 201);
    } catch (e) {
      return err("Opslaan mislukt: " + e.message, 500);
    }
  }

  // PUT /api/wines/:id — wijn bijwerken
  if (req.method === "PUT" && wijnId) {
    try {
      const raw = await store.get(wijnId);
      if (!raw) return err("Wijn niet gevonden", 404);
      const existing = JSON.parse(raw);
      const changes = await req.json();
      const updated = { ...existing, ...changes, id: existing.id };
      await store.set(wijnId, JSON.stringify(updated));
      return ok(updated);
    } catch (e) {
      return err("Bijwerken mislukt: " + e.message, 500);
    }
  }

  // DELETE /api/wines/:id — wijn verwijderen
  if (req.method === "DELETE" && wijnId) {
    try {
      await store.delete(wijnId);
      return ok({ deleted: true });
    } catch (e) {
      return err("Verwijderen mislukt: " + e.message, 500);
    }
  }

  return err("Niet gevonden", 404);
};

// v2: geef aan welk URL-pad deze function afhandelt
export const config = {
  path: ["/api/wines", "/api/wines/*"],
};      await store.set(String(id), JSON.stringify(wijn));
      return ok({ id }, 201);
    } catch (e) {
      return err("Opslaan mislukt: " + e.message, 500);
    }
  }

  // ── PUT /api/wines/:id  →  wijn bijwerken ─────────────────────────────
  if (event.httpMethod === "PUT" && wijnId) {
    try {
      const raw = await store.get(wijnId);
      if (!raw) return err("Wijn niet gevonden", 404);
      const existing = JSON.parse(raw);
      const changes = JSON.parse(event.body || "{}");
      const updated = { ...existing, ...changes, id: existing.id };
      await store.set(wijnId, JSON.stringify(updated));
      return ok(updated);
    } catch (e) {
      return err("Bijwerken mislukt: " + e.message, 500);
    }
  }

  // ── DELETE /api/wines/:id  →  wijn verwijderen ────────────────────────
  if (event.httpMethod === "DELETE" && wijnId) {
    try {
      await store.delete(wijnId);
      return ok({ deleted: true });
    } catch (e) {
      return err("Verwijderen mislukt: " + e.message, 500);
    }
  }

  return err("Niet gevonden", 404);
};
