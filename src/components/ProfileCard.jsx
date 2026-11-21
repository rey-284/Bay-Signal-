import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function ProfileCard({ user, compact = false }) {
  return (
    <Link to={`/profiles/${user.id}`} className={`profile-card ${compact ? "compact" : ""}`}>
      <div className="avatar" aria-hidden="true">{user.name.split(" ").map((part) => part[0]).join("")}</div>
      <div>
        <h3>{user.name}</h3>
        <span className="profile-location"><MapPin size={14} /> {user.location}</span>
        {!compact && <p>{user.bio}</p>}
        <div className="tag-row">
          {user.supplies.slice(0, 3).map((supply) => <span className="tag" key={supply}>{supply}</span>)}
        </div>
      </div>
    </Link>
  );
}
