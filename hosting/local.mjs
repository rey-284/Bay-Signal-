import { createServer } from "node:http";
import { readFileSync, mkdirSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import worker from "../dist/server/index.js";

mkdirSync(".local", { recursive: true });
const sqlite = new DatabaseSync(".local/community.sqlite");
sqlite.exec("PRAGMA foreign_keys = ON");
sqlite.exec("CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)");
if (sqlite.prepare("SELECT 1 FROM sqlite_master WHERE name = 'community_posts'").get()) {
  sqlite.prepare("INSERT OR IGNORE INTO local_migrations VALUES (?)").run("0001_community.sql");
}
const migrations = new URL("../drizzle/", import.meta.url);
for (const name of readdirSync(migrations).filter((file) => file.endsWith(".sql")).sort()) {
  if (sqlite.prepare("SELECT 1 FROM local_migrations WHERE name = ?").get(name)) continue;
  sqlite.exec("BEGIN");
  sqlite.exec(readFileSync(new URL(name, migrations), "utf8"));
  sqlite.prepare("INSERT INTO local_migrations VALUES (?)").run(name);
  sqlite.exec("COMMIT");
}

const DB = {
  prepare(query) {
    const statement = sqlite.prepare(query);
    const methods = (...params) => ({
      all: () => ({ results: statement.all(...params) }),
      first: () => statement.get(...params),
      run: () => statement.run(...params),
    });
    return { ...methods(), bind: methods };
  },
};

const port = Number(process.env.PORT || 4173);
createServer(async (incoming, outgoing) => {
  try {
    const request = new Request(new URL(incoming.url, `http://localhost:${port}`), {
      method: incoming.method,
      headers: incoming.headers,
      ...(["GET", "HEAD"].includes(incoming.method) ? {} : { body: incoming, duplex: "half" }),
    });
    const response = await worker.fetch(request, { DB });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500).end("BaySignal could not complete the request.");
  }
}).listen(port, "127.0.0.1", () => console.log(`BaySignal is running at http://localhost:${port}`));
