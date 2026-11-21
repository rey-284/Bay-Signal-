import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import SearchBar from "../components/SearchBar";

export default function Alerts() {
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sms, setSms] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [importing, setImporting] = useState(false);
  const [replyingId, setReplyingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlerts() {
      try {
        const response = await fetch("/api/alerts", {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Could not load alerts.");
        setAlerts(await response.json());
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not load alerts. Check that Flask is running, then refresh.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAlerts();
    return () => controller.abort();
  }, []);

  async function loadTestAlert(event) {
    event.preventDefault();

    const match = sms.trim().match(
      /^BAYSIGNAL\r?\nZIP:[ \t]*(\d{5})\r?\nADDRESS:[ \t]*([^\r\n]+)\r?\nMESSAGE:[ \t]*([\s\S]+)$/,
    );

    if (!match || !match[2].trim() || !match[3].trim()) {
      setImportStatus("Paste the full four-line text, starting with BAYSIGNAL.");
      return;
    }

    const [, zipCode, address, message] = match;
    const alertMessage = message.trim();
    setImporting(true);
    setImportStatus("Loading alert…");

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zip_code: zipCode,
          street_address: address.trim(),
          message: alertMessage,
        }),
      });

      if (!response.ok) throw new Error("Could not create alert.");
      const created = await response.json();

      setAlerts((previous) => [
        {
          alert_id: created.alert_id,
          zip_code: zipCode,
          message: alertMessage,
          status: created.status,
          matched_subscriber_ids: created.matched_subscriber_ids,
        },
        ...previous,
      ]);
      setSearch("");
      setSms("");
      setImportStatus(
        `Alert #${created.alert_id} loaded. Demo neighbors matched: ${created.matched_subscriber_ids.length}.`,
      );
    } catch {
      setImportStatus("Could not load the test alert. Check that Flask is running.");
    } finally {
      setImporting(false);
    }
  }

  async function simulateReply(alert) {
    const subscriberId = alert.matched_subscriber_ids[0];
    setReplyingId(alert.alert_id);
    setImportStatus(`Simulating a reply for alert #${alert.alert_id}…`);

    try {
      const response = await fetch(`/api/alerts/${alert.alert_id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriber_id: subscriberId }),
      });

      if (!response.ok) throw new Error("Could not simulate a reply.");
      const updated = await response.json();

      setAlerts((previous) =>
        previous.map((item) =>
          item.alert_id === updated.alert_id
            ? { ...item, status: updated.status }
            : item,
        ),
      );
      setImportStatus(`Simulated reply received for alert #${updated.alert_id}.`);
    } catch {
      setImportStatus("Could not simulate the reply. Please try again.");
    } finally {
      setReplyingId(null);
    }
  }

  const query = search.trim().toLowerCase();
  const results = alerts.filter((alert) =>
    [alert.zip_code, alert.message, alert.status]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">COMMUNITY ALERTS</span>
          <h1>Emergency alerts</h1>
        </div>
        <span className="demo-badge">BaySignal demo</span>
      </div>

      <form onSubmit={loadTestAlert}>
        <label htmlFor="demo-sms">Paste BaySignal SMS</label>
        <textarea
          id="demo-sms"
          rows={5}
          value={sms}
          onChange={(event) => setSms(event.target.value)}
          style={{ display: "block", width: "100%", margin: "0.5rem 0" }}
        />
        <button
          type="submit"
          disabled={!sms.trim() || importing || loading || Boolean(error) || replyingId !== null}
        >
          Load test alert
        </button>
        <p role="status">{importStatus}</p>
      </form>

      <SearchBar value={search} onChange={setSearch} />

      {loading && <p role="status">Loading alerts…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="results-count">
            {results.length} alert{results.length === 1 ? "" : "s"} found
          </div>

          {results.length > 0 ? (
            <div className="alerts-list">
              {results.map((alert) => (
                <article className="alert-card" key={alert.alert_id}>
                  <div style={{ padding: "1rem" }}>
                    <p>
                      <strong>
                        {alert.status === "responded"
                          ? "Neighbor responded"
                          : "Waiting for a reply"}
                      </strong>
                    </p>
                    <h2>{alert.message}</h2>
                    <p>ZIP {alert.zip_code} · Alert #{alert.alert_id}</p>

                    {alert.status === "waiting" &&
                      alert.matched_subscriber_ids?.length > 0 && (
                        <button
                          type="button"
                          disabled={importing || replyingId !== null}
                          onClick={() => simulateReply(alert)}
                        >
                          {replyingId === alert.alert_id
                            ? "Simulating reply…"
                            : "Simulate reply"}
                        </button>
                      )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BellRing size={34} />
              <h2>{query ? "No alerts match your search" : "No alerts yet"}</h2>
            </div>
          )}
        </>
      )}
    </div>
  );
}