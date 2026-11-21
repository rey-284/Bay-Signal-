const sources = {
  florida: {
    url: "https://api.weather.gov/alerts/active?area=FL",
    normalize(data) {
      return data.features.map(({ id, properties }) => ({
        id, title: properties.event, headline: properties.headline,
        area: properties.areaDesc, expires: properties.ends || properties.expires,
        sent: properties.sent,
      }));
    },
  },
  tropics: {
    url: "https://www.nhc.noaa.gov/CurrentStorms.json",
    normalize(data) {
      return data.activeStorms.filter((storm) => storm.binNumber?.startsWith("AT") ||
        storm.id?.toLowerCase().startsWith("al")).map((storm) => ({
        id: storm.id, title: storm.name, headline: storm.classification,
        sent: storm.lastUpdate, link: storm.publicAdvisory?.url,
      }));
    },
  },
};

async function snapshot(db, key, source) {
  const previous = await db.prepare(
    "SELECT checked_at, payload FROM weather_snapshots WHERE source = ?",
  ).bind(key).first();
  if (previous && Date.now() - Date.parse(previous.checked_at) < 5 * 60_000) {
    return { checkedAt: previous.checked_at, items: JSON.parse(previous.payload), stale: false };
  }

  try {
    const response = await fetch(source.url, {
      headers: { Accept: "application/json", "User-Agent": "BaySignal community weather dashboard" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Weather source unavailable");
    const items = source.normalize(await response.json());
    const checkedAt = new Date().toISOString();
    await db.prepare(
      "INSERT INTO weather_snapshots VALUES (?, ?, ?) ON CONFLICT(source) DO UPDATE SET checked_at = excluded.checked_at, payload = excluded.payload",
    ).bind(key, checkedAt, JSON.stringify(items)).run();
    return { checkedAt, items, stale: false };
  } catch {
    return previous
      ? { checkedAt: previous.checked_at, items: JSON.parse(previous.payload), stale: true }
      : { checkedAt: null, items: [], stale: true };
  }
}

export async function weather(db) {
  return Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([key, source]) =>
    [key, await snapshot(db, key, source)])));
}
