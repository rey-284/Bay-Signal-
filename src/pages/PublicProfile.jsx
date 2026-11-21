import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { sampleUsers } from "../data/sampleUsers";
import { sampleAlerts } from "../data/sampleAlerts";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = sampleUsers.find((item) => item.id === userId);
  const alerts = sampleAlerts.filter((alert) => alert.postedBy === userId);

  if (!user) {
    return <div className="page empty-state"><h1>Profile not found</h1><button className="secondary-button" onClick={() => navigate("/alerts")}>Back to alerts</button></div>;
  }

  const backToAlert = location.state?.fromAlertId;

  return (
    <div className="page detail-page">
      {backToAlert ? (
        <button className="back-button" onClick={() => navigate(`/alerts/${backToAlert}`)}><ArrowLeft size={18} /> Back to alert</button>
      ) : (
        <button className="back-button" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      )}
      <section className="public-profile-card">
        <div className="public-profile-header">
          <div className="avatar large" aria-hidden="true">{user.name.split(" ").map((part) => part[0]).join("")}</div>
          <div><span className="demo-badge">Fictional profile</span><h1>{user.name}</h1><p className="profile-location"><MapPin size={15} /> {user.location}</p></div>
        </div>
        <p className="bio">{user.bio}</p>
        <div className="public-profile-columns">
          <div><h2>Ways they can help</h2><ul className="check-list">{user.help.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h2>Available supplies</h2><div className="tag-row">{user.supplies.map((item) => <span className="tag" key={item}>{item}</span>)}</div></div>
        </div>
        <div className="associated-alerts">
          <h2>Associated community alerts</h2>
          {alerts.length ? alerts.map((alert) => (
            <Link className="mini-alert" key={alert.id} to={`/alerts/${alert.id}`}>
              <div><strong>{alert.title}</strong><span>{alert.city} · ZIP {alert.zip}</span></div>
              <span className="alert-status">{alert.status}</span>
            </Link>
          )) : <p>No associated alerts.</p>}
        </div>
      </section>
    </div>
  );
}
