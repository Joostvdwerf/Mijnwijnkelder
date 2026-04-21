// netlify/functions/wines.js

const { getStore } = require("@netlify/blobs");

const STORE_NAME = "wijnkelder";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function ok(body, statusCode = 200) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(body),
  };
}

function err(msg, statusCode = 400) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify({ error: msg }),
  };
}

module.exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: HEADERS,
      body: "",
    };
  }

  const store = getStore(STORE_NAME);

  // URL parsing
  const path = event.path.replace(/^\/.netlify\/functions\/wines\/?/, "");
  const parts = path.split("/").filter(Boolean);
  const wijnId = parts[0] || null;

  // GET — alle wijnen
  if (event.httpMethod === "GET" && !wijnId) {
    try {
      const { blobs } = await store.list();
      const wines = await Promise.all(
        blobs.map(async ({ key }) => {
          const raw = await store.get(key);
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })
      );

      const valid = wines.filter(Boolean).sort((a, b) => a.id - b.id);
      return ok(valid);
    } catch (e) {
      return err("Laden mislukt: " + e.message, 500);
    }
  }

  // POST — nieuwe wijn
  if (event.httpMethod === "POST" && !wijnId) {
    try {
      const data = JSON.parse(event.body || "{}");
      const id = Date.now();
      const wijn = { id, ...data };

      await store.set(String(id), JSON.stringify(wijn));
      return ok({ id }, 201);
    } catch (e) {
      return err("Opslaan mislukt: " + e.message, 500);
    }
  }

  // PUT — update wijn
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

  // DELETE — verwijder wijn
  if (event.httpMethod === "DELETE" && wijnId) {
    try {
      await store.delete(wijnId);
      return ok({ deleted: true });
    } catch (e) {
      return err("Verwijderen mislukt: " + e.message, 500);
    }
  }

  return err("Niet gevonden", 404);
};  }

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
