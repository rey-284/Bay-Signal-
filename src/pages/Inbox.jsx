import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { readInbox, rememberInboxItem } from "../services/inbox";

export default function Inbox() {
  const [inbox, setInbox] = useState(readInbox);
  const [result, setResult] = useState({ items: [], loading: true, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function refresh() {
      const threads = await Promise.allSettled(inbox.posts.map(async (id) => {
        const response = await fetch(`/api/community/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (response.status === 404) return [];
        if (!response.ok) throw new Error("Could not load conversation.");
        const thread = await response.json();
        return thread.replies
          .filter((reply) => !inbox.sent.includes(reply.id))
          .map((reply) => ({ ...reply, postId: id, title: thread.title }));
      }));
      if (controller.signal.aborted) return;
      const items = threads.flatMap((thread) => thread.status === "fulfilled" ? thread.value : []);
      items.sort((a, b) => b.created_at.localeCompare(a.created_at));
      const error = threads.some((thread) => thread.status === "rejected")
        ? "Some replies could not be loaded. BaySignal will retry." : "";
      setResult({ items, loading: false, error });
      if (inbox.posts.length) timer = setTimeout(refresh, 5000);
    }
    refresh();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [inbox.posts, inbox.sent]);

  const unread = result.items.filter((reply) => !inbox.read.includes(reply.id)).length;

  return <div className="page detail-page">
    <div className="page-heading">
      <h1>Inbox</h1>
      {unread > 0 && <span className="alert-status">{unread} unread</span>}
    </div>
    <p>Replies to posts you publish from this browser appear here.</p>
    {result.loading && <p role="status">Loading replies…</p>}
    {result.error && <p role="alert">{result.error}</p>}
    {!result.loading && !result.error && result.items.length === 0 && (
      <section className="section-panel">
        <h2>{inbox.posts.length ? "No replies yet" : "No posts from this browser yet"}</h2>
        <p>{inbox.posts.length ? "Check here when someone replies to your post." : "New posts you publish here will be tracked in your inbox."}</p>
        <Link className="secondary-button" to="/request">Post to the community</Link>
      </section>
    )}
    <div className="alerts-list">
      {result.items.map((reply) => (
        <article className="alert-card" key={reply.id}>
          <Link className="alert-card-main" to={`/alerts/${reply.postId}#reply-${reply.id}`} onClick={() => {
            rememberInboxItem("read", reply.id);
            setInbox((previous) => ({ ...previous, read: [...previous.read, reply.id] }));
          }}>
            <div className="alert-card-header">
              {!inbox.read.includes(reply.id) && <span className="alert-status">New reply</span>}
              <time className="alert-date" dateTime={reply.created_at}>{new Date(reply.created_at).toLocaleString()}</time>
            </div>
            <h3>{reply.title}</h3>
            <p className="community-message">{reply.message}</p>
          </Link>
        </article>
      ))}
    </div>
  </div>;
}
