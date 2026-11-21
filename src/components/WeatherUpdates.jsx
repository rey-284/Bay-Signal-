import { useEffect, useState } from "react";

const links = [
  ["Spectrum Bay News 9 · Tampa Bay", "https://baynews9.com/fl/tampa"],
  ["Spectrum News · all regions", "https://spectrumnews1.com/splash#fl"],
  ["Radio Garden · Tampa stations", "https://radio.garden/visit/tampa-fl/MuvZwuK6"],
  ["BBC News", "https://www.bbc.com/news"],
  ["World Threat Watch · global dashboard", "https://www.worldthreatwatch.com/wtw-v2-20261009/"],
  ["Bloomberg", "https://www.bloomberg.com/"],
];

function Feed({ title, feed, url, empty }) {
  return <section>
    <h3>{title}</h3>
    {feed?.checkedAt && <p className="data-note">Last checked {new Date(feed.checkedAt).toLocaleString()}</p>}
    {feed?.stale && <p role="status">{feed.checkedAt
      ? "Update unavailable. Showing the last saved snapshot."
      : "This feed is temporarily unavailable."}</p>}
    {feed && !feed.stale && !feed.items.length && <p>{empty}</p>}
    <div className="resource-grid">
      {feed?.items.map((item) => <article key={item.id}>
        <h4>{item.title}</h4>
        {item.headline && <p>{item.headline}</p>}
        {item.area && <p>{item.area}</p>}
        {item.expires && <small>Ends {new Date(item.expires).toLocaleString()}</small>}
      </article>)}
    </div>
    <p><a href={url}>Check the official source</a></p>
  </section>;
}

export default function WeatherUpdates() {
  const [feeds, setFeeds] = useState(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/weather", { signal: controller.signal });
        if (!response.ok) throw new Error();
        setFeeds(await response.json());
        setStatus("");
      } catch {
        if (!controller.signal.aborted) setStatus("Weather updates could not be refreshed. Check the official sources below.");
      }
    }
    refresh();
    const timer = setInterval(refresh, 300_000);
    return () => { clearInterval(timer); controller.abort(); };
  }, []);
  return <section className="section-panel">
    <h2>Storms and weather alerts</h2>
    <p>Official updates from NOAA’s National Hurricane Center and National Weather Service.</p>
    {!feeds && !status && <p role="status">Loading weather updates…</p>}
    {status && <p role="status">{status}</p>}
    <Feed title="Atlantic tropical storms" feed={feeds?.tropics} url="https://www.nhc.noaa.gov/"
      empty="The National Hurricane Center feed lists no active Atlantic tropical cyclones." />
    <Feed title="Active Florida weather alerts" feed={feeds?.florida} url="https://www.weather.gov/tbw/"
      empty="The National Weather Service feed returned no active Florida alerts." />
    <h3>News and live radio</h3>
    <ul>{links.map(([label, url]) => <li key={url}><a href={url}>{label}</a></li>)}</ul>
  </section>;
}
