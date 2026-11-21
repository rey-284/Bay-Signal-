import { Link, NavLink } from "react-router-dom";
import { Home, MessageSquareText, Radio, UserRound } from "lucide-react";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="BaySignal home">
        <span className="brand-icon"><Radio size={22} /></span>
        <span>BaySignal</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end><Home size={18} /> <span>Home</span></NavLink>
        <NavLink to="/alerts"><Radio size={18} /> <span>Alerts</span></NavLink>
        <NavLink to="/profile"><UserRound size={18} /> <span>Profile</span></NavLink>
        {/* Plain link: the offline form is a static page outside the React router. */}
        <a href="/mobile/index.html"><MessageSquareText size={18} /> <span>Request help</span></a>
      </nav>
    </header>
  );
}
