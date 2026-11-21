import { Link } from "react-router-dom";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { sampleUsers } from "../data/sampleUsers";

export default function AlertCard({ alert }) {
  const author = sampleUsers.find((user) => user.id === alert.postedBy);

  return (
    <article className="alert-card">
      <Link className="alert-card-main" to={`/alerts/${alert.id}`}>
        <div className="alert-card-header">
          <span className="alert-status">{alert.status}</span>
          <span className="alert-date"><CalendarDays size={14} /> {alert.date} · {alert.time}</span>
        </div>
        <h3>{alert.title}</h3>
        <p>{alert.description}</p>
        <div className="alert-location"><MapPin size={16} /> {alert.city} · ZIP {alert.zip}</div>
        <span className="posted-by">Posted by {author?.name}</span>
      </Link>
      {author && (
        <Link className="view-alert" to={`/alerts/${alert.id}`} aria-label={`View ${alert.title}`}>
          <ArrowRight size={19} />
        </Link>
      )}
    </article>
  );
}
