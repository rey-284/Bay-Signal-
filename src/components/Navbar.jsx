import { useLayoutEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, Inbox, MessageSquareText, Moon, Radio, Sun, UserRound } from "lucide-react";

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("baysignal-theme");
      if (saved === "dark" || saved === "light") return saved === "dark";
    } catch {
      // Use the device preference when browser storage is unavailable.
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("baysignal-theme", next ? "dark" : "light");
    } catch {
      // The theme still changes for this visit.
    }
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="BaySignal home">
        <span className="brand-icon"><Radio size={22} /></span>
        <span>BaySignal</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end><Home size={18} /> <span>Home</span></NavLink>
        <NavLink to="/alerts"><Radio size={18} /> <span>Alerts</span></NavLink>
        <NavLink to="/inbox"><Inbox size={18} /> <span>Inbox</span></NavLink>
        <NavLink to="/profile"><UserRound size={18} /> <span>Profile</span></NavLink>
        <NavLink to="/request"><MessageSquareText size={18} /> <span>Request help</span></NavLink>
        <button type="button" className="theme-toggle" aria-label="Dark mode"
          aria-pressed={dark} title={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}>
          {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
        </button>
      </nav>
    </header>
  );
}
