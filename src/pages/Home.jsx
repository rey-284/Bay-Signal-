import { useState } from "react";
import { CloudLightning, PackageOpen, UsersRound, ArrowRight, Phone } from "lucide-react";
import WeatherUpdates from "../components/WeatherUpdates";
import ProfileCard from "../components/ProfileCard";
import { sampleUsers } from "../data/sampleUsers";

export default function Home() {
  const [activeSection, setActiveSection] = useState("hurricanes");

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <h1>BaySignal — Stay Connected. Stay Prepared.</h1>
          <p>Stay informed, share emergency resources, and assist neighbors during hurricanes and severe weather.</p>
          <button className="primary-button" onClick={() => setActiveSection("resources")}>
            Explore resources <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-status">
          <span className="status-icon"><CloudLightning size={30} /></span>
          <div>
            <span>COMMUNITY STATUS</span>
            <strong>Be ready for changing conditions</strong>
          </div>
        </div>
      </section>

      <section className="category-grid" aria-label="BaySignal categories">
        <button className={activeSection === "hurricanes" ? "category-card active" : "category-card"} onClick={() => setActiveSection("hurricanes")}>
          <span className="category-icon blue"><CloudLightning size={24} /></span>
          <span><strong>Hurricane Updates</strong><small>Storm status and timing</small></span>
        </button>
        <button className={activeSection === "resources" ? "category-card active" : "category-card"} onClick={() => setActiveSection("resources")}>
          <span className="category-icon orange"><PackageOpen size={24} /></span>
          <span><strong>Resources</strong><small>Shelters and supplies</small></span>
        </button>
        <button className={activeSection === "assistance" ? "category-card active" : "category-card"} onClick={() => setActiveSection("assistance")}>
          <span className="category-icon green"><UsersRound size={24} /></span>
          <span><strong>Assistance</strong><small>Find community help</small></span>
        </button>
      </section>

      {activeSection === "hurricanes" && <WeatherUpdates />}

      {activeSection === "resources" && (
        <section className="section-panel">
          <div className="section-heading"><div><span className="section-kicker">COMMUNITY RESOURCES</span><h2>Emergency essentials</h2></div></div>
          <div className="resource-grid">
            <article><span>01</span><h3>Emergency shelters</h3><p>Find your nearest Hillsborough County designated shelter.</p></article>
            <article><span>02</span><h3>Evacuation information</h3><p>Review routes, zones, and official evacuation instructions.</p></article>
            <article><span>03</span><h3>First aid supplies</h3><p>Keep bandages, antiseptic, medications, and emergency contacts ready.</p></article>
            <article><span>04</span><h3>Emergency contacts</h3><p>Call 911 for danger. Use local emergency management for general guidance.</p></article>
          </div>
          <div className="tip-box"><Phone size={20} /><div><strong>Preparedness tip</strong><p>Charge devices, pack documents, and keep batteries, water, blankets, and nonperishable food ready.</p></div></div>
        </section>
      )}

      {activeSection === "assistance" && (
        <section className="section-panel">
          <div className="section-heading"><div><span className="section-kicker">COMMUNITY ASSISTANCE</span><h2>Neighbors offering help</h2></div></div>
          <div className="profile-grid">
            {sampleUsers.map((user) => <ProfileCard key={user.id} user={user} />)}
          </div>
        </section>
      )}
    </div>
  );
}
