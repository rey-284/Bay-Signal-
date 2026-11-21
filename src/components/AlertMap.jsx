import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const areas = [
  ["33602", "Downtown Tampa", 27.953, -82.459],
  ["33603", "Seminole Heights", 27.986, -82.456],
  ["33605", "Ybor City", 27.962, -82.433],
  ["33606", "Hyde Park", 27.935, -82.463],
  ["33607", "West Tampa", 27.970, -82.493],
  ["33611", "South Tampa", 27.891, -82.505],
  ["33612", "North Tampa", 28.051, -82.449],
  ["33617", "Temple Terrace", 28.036, -82.390],
  ["33620", "USF Tampa", 28.064, -82.413],
  ["33626", "Westchase", 28.067, -82.612],
  ["33511", "Brandon", 27.909, -82.291],
  ["33701", "Downtown St. Petersburg", 27.771, -82.638],
  ["33755", "Clearwater", 27.983, -82.773],
];

export default function AlertMap({ posts, zip, onSelect }) {
  const element = useRef(null);
  const layers = useRef(null);

  useEffect(() => {
    const map = L.map(element.current, { scrollWheelZoom: false }).setView([27.947, -82.555], 10);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    layers.current = L.layerGroup().addTo(map);
    return () => { map.remove(); layers.current = null; };
  }, []);

  useEffect(() => {
    const counts = new Map();
    for (const post of posts) counts.set(post.zip, (counts.get(post.zip) || 0) + 1);
    layers.current.clearLayers();
    for (const [code, name, lat, lng] of areas) {
      const count = counts.get(code) || 0;
      L.circleMarker([lat, lng], {
        radius: count ? 12 : 7,
        color: code === zip ? "#a34c00" : "#234e77",
        fillColor: count ? "#2871ae" : "#fff",
        fillOpacity: 0.85,
        weight: 3,
      }).bindTooltip(`${name} · ${code} · ${count} ${count === 1 ? "post" : "posts"}`)
        .on("click", () => onSelect(code))
        .addTo(layers.current);
    }
  }, [posts, zip, onSelect]);

  return <section className="section-panel alert-map-panel" aria-labelledby="area-map-heading">
    <h2 id="area-map-heading">Tampa Bay alert map</h2>
    <p>Tap a marker or enter a ZIP code to see posts for that area.</p>
    <div ref={element} className="alert-map" aria-label="Interactive map of Tampa Bay ZIP codes" />
    <div className="area-controls">
      <label>Filter by ZIP code
        <input value={zip} onChange={(event) => onSelect(event.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric" placeholder="33620" />
      </label>
      {zip && <button type="button" className="secondary-button" onClick={() => onSelect("")}>Show all areas</button>}
    </div>
    <p className="data-note">Markers show approximate locations for selected ZIP codes. You can enter any ZIP code to filter the feed.</p>
  </section>;
}
