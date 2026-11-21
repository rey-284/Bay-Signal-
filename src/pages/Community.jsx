import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { rememberInboxItem } from "../services/inbox";
import AlertMap from "../components/AlertMap";
import AlertCard from "../components/AlertCard";
import SearchBar from "../components/SearchBar";

async function request(path, body, signal) {
  const response = await fetch(path, body ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } : { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Please try again.");
  return data;
}

const endpoint = "/api/community";

function useFeed(path) {
  const [result, setResult] = useState({ data: null, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const data = await request(path, null, controller.signal);
        if (!controller.signal.aborted) setResult({ data, error: "" });
      } catch {
        if (!controller.signal.aborted) {
          setResult((previous) => ({ ...previous, error: "Could not refresh community updates." }));
        }
      }
    }
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [path]);
  return result;
}

function Feedback({ error, loading }) {
  return <>{error && <p role="alert">{error}</p>}{loading && !error && <p role="status">Loading…</p>}</>;
}

export function CommunityAlerts() {
  const [search, setSearch] = useState("");
  const [zip, setZip] = useState("");
  const { data, error } = useFeed(endpoint);
  const query = search.trim().toLowerCase();
  const results = (data || []).filter((post) =>
    (!zip || post.zip === zip) &&
    [post.title, post.message, post.zip, post.kind].join(" ").toLowerCase().includes(query));
  return (
    <div className="page">
      <div className="page-heading">
        <h1>Community alerts</h1>
        <Link className="primary-button" to="/request">Post to the community</Link>
      </div>
      <AlertMap posts={data || []} zip={zip} onSelect={setZip} />
      <SearchBar value={search} onChange={setSearch} />
      <Feedback error={error} loading={!data} />
      {data && results.length === 0 && <p>{query || zip ? "No matching posts." : "No community posts yet."}</p>}
      <div className="alerts-list">
        {results.map((post) => {
          const date = new Date(post.created_at);
          return <AlertCard key={post.id} alert={{
            ...post, status: post.kind, description: post.message.length > 140
              ? post.message.slice(0, 140) + "…" : post.message,
            city: "Hillsborough County", date: date.toLocaleDateString(), time: date.toLocaleTimeString(),
          }} />;
        })}
      </div>
    </div>
  );
}

function MessageForm({ reply, onSubmit }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await onSubmit(Object.fromEntries(new FormData(form)));
      form.reset();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="community-form" onSubmit={submit}>
      {!reply && <>
        <label>Post type<select name="kind"><option>Request</option><option>Update</option><option>Offer</option></select></label>
        <label>Title<input name="title" maxLength={80} required /></label>
        <label>ZIP code<input name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} required /></label>
      </>}
      <label>{reply ? "Your reply" : "Message"}<textarea name="message" rows={4} maxLength={500} required /></label>
      <p className="data-note">Posts are visible to the community. Keep phone numbers and street addresses out of your message.</p>
      <button className="primary-button" disabled={busy}>{busy ? "Sending…" : reply ? "Send reply" : "Publish post"}</button>
      <Feedback error={error} />
    </form>
  );
}

export function RequestHelp() {
  const navigate = useNavigate();
  return <div className="page detail-page"><section className="detail-card">
    <h1>Post to the community</h1>
    <MessageForm onSubmit={async (fields) => {
      const post = await request(endpoint, fields);
      rememberInboxItem("posts", post.id);
      navigate(`/alerts/${post.id}`);
    }} />
    <p><a href="/mobile/index.html">Open the offline SMS form</a></p>
  </section></div>;
}

export function CommunityDetails() {
  const { alertId } = useParams();
  return <PostDetails key={alertId} alertId={alertId} />;
}

function PostDetails({ alertId }) {
  const path = `${endpoint}/${encodeURIComponent(alertId)}`;
  const { data, error } = useFeed(path);
  const { hash } = useLocation();
  const loaded = Boolean(data);
  useEffect(() => {
    if (loaded && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "center" });
  }, [loaded, hash]);
  const [sent, setSent] = useState([]);
  const replies = new Map([...(data?.replies || []), ...sent].map((reply) => [reply.id, reply]));
  return <div className="page detail-page">
    <Link className="back-button" to="/alerts">Back to alerts</Link>
    <Feedback error={error} loading={!data} />
    {data && <article className="detail-card">
      <span className="alert-status">{data.kind}</span>
      <h1>{data.title}</h1>
      <p>ZIP {data.zip} · {new Date(data.created_at).toLocaleString()}</p>
      <p className="detail-message community-message">{data.message}</p>
      <h2>Replies</h2>
      {replies.size === 0 && <p>No replies yet.</p>}
      {[...replies.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((reply) =>
        <section key={reply.id} id={`reply-${reply.id}`} className="community-reply">
          <small>{new Date(reply.created_at).toLocaleString()}</small>
          <p className="community-message">{reply.message}</p>
        </section>)}
      <MessageForm reply onSubmit={async (fields) => {
        const reply = await request(path + "/replies", fields);
        rememberInboxItem("sent", reply.id);
        setSent((previous) => [...previous, reply].slice(-100));
      }} />
    </article>}
  </div>;
}
