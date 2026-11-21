import { weather } from "./weather.mjs";
import assets from "./assets.js";

const json = (value, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

async function readFields(request, limits) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return null;
  const fields = Object.fromEntries(Object.keys(limits).map((key) => [
    key, typeof data[key] === "string" ? data[key].trim() : "",
  ]));
  return Object.entries(fields).every(([key, value]) => value && value.length <= limits[key])
    ? fields : null;
}

async function community(request, db, pathname) {
  const { method } = request;
  if (pathname === "/api/community") {
    if (method === "GET") {
      const { results } = await db.prepare(
        "SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 100",
      ).all();
      return json(results);
    }
    if (method === "POST") {
      const fields = await readFields(request, { kind: 16, title: 80, zip: 5, message: 500 });
      if (!fields || !/^\d{5}$/.test(fields.zip) ||
          !["Request", "Update", "Offer"].includes(fields.kind)) {
        return json({ error: "Enter a type, title, five-digit ZIP code and message." }, 400);
      }
      const post = { ...fields, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      await db.prepare(
        "INSERT INTO community_posts (id, kind, title, zip, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      ).bind(post.id, post.kind, post.title, post.zip, post.message, post.created_at).run();
      return json(post, 201);
    }
  }

  const match = pathname.match(/^\/api\/community\/([a-f0-9-]{36})(\/replies)?$/);
  if (!match) return json({ error: "Route unavailable." }, 404);
  const [, id, replyRoute] = match;
  const post = await db.prepare("SELECT * FROM community_posts WHERE id = ?").bind(id).first();
  if (!post) return json({ error: "Alert not found." }, 404);
  if (method === "GET" && !replyRoute) {
    const { results } = await db.prepare(
      "SELECT * FROM community_replies WHERE post_id = ? ORDER BY created_at DESC LIMIT 100",
    ).bind(id).all();
    return json({ ...post, replies: results });
  }
  if (method === "POST" && replyRoute) {
    const fields = await readFields(request, { message: 500 });
    if (!fields) return json({ error: "Enter a reply of up to 500 characters." }, 400);
    const reply = { ...fields, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    await db.prepare(
      "INSERT INTO community_replies (id, post_id, message, created_at) VALUES (?, ?, ?, ?)",
    ).bind(reply.id, id, reply.message, reply.created_at).run();
    return json(reply, 201);
  }
  return json({ error: "Method unavailable." }, 405);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/")) {
      try {
        if (pathname === "/api/weather" && request.method === "GET") return json(await weather(env.DB));
        return await community(request, env.DB, pathname);
      } catch {
        return json({ error: "The community feed is temporarily unavailable." }, 503);
      }
    }
    const path = pathname === "/mobile/" ? "/mobile/index.html" : pathname;
    const asset = Object.hasOwn(assets, path) ? assets[path] :
      (/^\/(?:alerts(?:\/[^/]+)?|request|inbox|profile|profiles\/[^/]+)?$/.test(path) ? assets["/index.html"] : null);
    if (!asset) return new Response("Page not found", { status: 404 });
    return new Response(asset[1], { headers: { "Content-Type": asset[0] } });
  },
};
