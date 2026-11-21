import { useMemo, useState } from "react";
import { BellRing } from "lucide-react";
import AlertCard from "../components/AlertCard";
import SearchBar from "../components/SearchBar";
import { sampleAlerts } from "../data/sampleAlerts";

export default function Alerts() {
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sampleAlerts;
    return sampleAlerts.filter((alert) =>
      [alert.title, alert.description, alert.city, alert.zip, alert.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">COMMUNITY ALERTS</span>
          <h1>Emergency alerts</h1>
        </div>
        <span className="demo-badge">Fictional sample alerts</span>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className="results-count">{results.length} alert{results.length === 1 ? "" : "s"} found</div>
      {results.length ? (
        <div className="alerts-list">
          {results.map((alert) => <AlertCard alert={alert} key={alert.id} />)}
        </div>
      ) : (
        <div className="empty-state">
          <BellRing size={34} />
          <h2>No alerts match your search</h2>
          <p>Try another ZIP code, city, or location.</p>
        </div>
      )}
    </div>
  );
}
