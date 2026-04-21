// netlify/functions/wines.js
// Netlify Blobs als database — één blob per wijn (key = wijn-ID)
// Endpoints:
//   GET    /api/wines          → alle wijnen ophalen
//   POST   /api/wines          → nieuwe wijn opslaan (body = wijnobject)
//   PUT    /api/wines/:id      → wijn bijwerken    (body = gewijzigde velden)
//   DELETE /api/wines/:id      → wijn verwijderen

import { getStore } from "@netlify/blobs";

const STORE_NAME = "wijnkelder";

// Helper: CORS headers zodat de frontend (zelfde domein) altijd mag praten
const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function ok(body, status = 200) {
  return { statusCode: status, headers: HEADERS, body: JSON.stringify(body) };
}

function err(msg, status = 400) {
  return { statusCode: status, headers: HEADERS, body: JSON.stringify({ error: msg }) };
}

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: HEADERS, body: "" };
  }

  const store = getStore(STORE_NAME);

  // Haal het wijn-ID op uit het pad: /api/wines/1234567890  →  "1234567890"
  const pathParts = (event.path || "").replace(/^\/api\/wines\/?/, "").split("/").filter(Boolean);
  const wijnId = pathParts[0] || null;

  // ── GET /api/wines  →  alle wijnen ────────────────────────────────────
  if (event.httpMethod === "GET" && !wijnId) {
    try {
      const { blobs } = await store.list();
      const wines = await Promise.all(
        blobs.map(async ({ key }) => {
          const raw = await store.get(key);
          try { return JSON.parse(raw); } catch { return null; }
        })
      );
      // Sorteer op ID (= timestamp) zodat volgorde consistent is
      const valid = wines.filter(Boolean).sort((a, b) => a.id - b.id);
      return ok(valid);
    } catch (e) {
      return err("Laden mislukt: " + e.message, 500);
    }
  }

  // ── POST /api/wines  →  nieuwe wijn opslaan ───────────────────────────
  if (event.httpMethod === "POST" && !wijnId) {
    try {
      const data = JSON.parse(event.body || "{}");
      const id = Date.now(); // unieke ID = milliseconden
      const wijn = { id, ...data };
      await store.set(String(id), JSON.stringify(wijn));
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
