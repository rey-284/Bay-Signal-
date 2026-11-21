import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, UserRound } from "lucide-react";
import { sampleAlerts } from "../data/sampleAlerts";
import { sampleUsers } from "../data/sampleUsers";

export default function AlertDetails() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const alert = sampleAlerts.find((item) => item.id === alertId);
  const author = sampleUsers.find((user) => user.id === alert?.postedBy);

  if (!alert) {
    return (
      <div className="page empty-state">
        <h1>Alert not found</h1>
        <button className="secondary-button" onClick={() => navigate("/alerts")}>Back to alerts</button>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      <button className="back-button" onClick={() => navigate("/alerts")}><ArrowLeft size={18} /> Back to alerts</button>
      <article className="detail-card">
        <div className="detail-status-row">
          <span className="alert-status">{alert.status}</span>
          <span className="demo-badge">Fictional sample</span>
        </div>
        <h1>{alert.title}</h1>
        <p className="detail-message">{alert.message}</p>
        <div className="detail-facts">
          <div><MapPin size={18} /><span><small>Location</small><strong>{alert.city} · ZIP {alert.zip}</strong></span></div>
          <div><CalendarDays size={18} /><span><small>Date and time</small><strong>{alert.date} at {alert.time}</strong></span></div>
        </div>
        {author && (
          <Link className="author-card" to={`/profiles/${author.id}`} state={{ fromAlertId: alert.id }}>
            <div className="avatar" aria-hidden="true">{author.name.split(" ").map((part) => part[0]).join("")}</div>
            <div><span>Posted by</span><strong>{author.name}</strong></div>
            <UserRound size={20} />
          </Link>
        )}
      </article>
    </div>
  );
}
