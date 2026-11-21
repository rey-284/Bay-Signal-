import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Pencil } from "lucide-react";

const defaultProfile = {
  name: "Alex Morgan",
  city: "Tampa",
  zip: "33620",
  bio: "Prepared to help neighbors with emergency supplies and transportation.",
  help: ["Transportation", "Supply pickup", "Neighborhood check-ins"],
  supplies: ["First aid kits", "Bottled water", "Flashlights"],
};

const supplyOptions = [
  "First aid kits",
  "Bottled water",
  "Flashlights",
  "Batteries",
  "Nonperishable food",
  "Blankets",
];

export default function Profile() {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("baysignal-profile")) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("baysignal-profile", JSON.stringify(profile));
  }, [profile]);

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function addSupply(supply) {
    if (!profile.supplies.includes(supply)) {
      setProfile((current) => ({ ...current, supplies: [...current.supplies, supply] }));
    }
  }

  function removeSupply(supply) {
    setProfile((current) => ({
      ...current,
      supplies: current.supplies.filter((item) => item !== supply),
    }));
  }

  function saveProfile(event) {
    event.preventDefault();
    localStorage.setItem("baysignal-profile", JSON.stringify(profile));
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="page profile-page">
      <div className="page-heading">
        <div><span className="section-kicker">MY COMMUNITY PROFILE</span><h1>Profile</h1></div>
        {!editing ? (
          <button className="secondary-button" onClick={() => setEditing(true)}><Pencil size={17} /> Edit profile</button>
        ) : (
          <span className="editing-label">Editing profile</span>
        )}
      </div>

      {saved && <div className="saved-message">Profile saved locally</div>}

      <form className="profile-form" onSubmit={saveProfile}>
        <section className="profile-section">
          <h2>Personal information</h2>
          <div className="form-grid">
            <label>Name<input value={profile.name} onChange={(event) => updateField("name", event.target.value)} disabled={!editing} /></label>
            <label>City<input value={profile.city} onChange={(event) => updateField("city", event.target.value)} disabled={!editing} /></label>
            <label>ZIP code<input value={profile.zip} onChange={(event) => updateField("zip", event.target.value)} inputMode="numeric" pattern="[0-9]{5}" disabled={!editing} /></label>
          </div>
          <label className="bio-label">Short bio<textarea value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} disabled={!editing} maxLength={220} /></label>
        </section>

        <section className="profile-section">
          <h2>Ways I can help</h2>
          <label className="help-input">Enter ways you can help separated by commas
            <input
              value={profile.help.join(", ")}
              onChange={(event) => updateField("help", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
              disabled={!editing}
            />
          </label>
        </section>

        <section className="profile-section">
          <h2>Available supplies</h2>
          <div className="supply-list">
            {profile.supplies.map((supply) => (
              <div className="supply-chip" key={supply}>
                <span>{supply}</span>
                {editing && <button type="button" onClick={() => removeSupply(supply)} aria-label={`Remove ${supply}`}><Trash2 size={15} /></button>}
              </div>
            ))}
          </div>
          {editing && (
            <div className="add-supply">
              <label>Available supplies
                <select id="supply-select" defaultValue="">
                  <option value="" disabled>Select a supply</option>
                  {supplyOptions.map((supply) => <option key={supply} value={supply}>{supply}</option>)}
                </select>
              </label>
              <button type="button" className="secondary-button" onClick={() => {
                const select = document.getElementById("supply-select");
                if (select.value) addSupply(select.value);
              }}><Plus size={16} /> Add supply</button>
            </div>
          )}
        </section>

        {editing && (
          <div className="profile-actions">
            <button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="primary-button"><Save size={17} /> Save profile</button>
          </div>
        )}
      </form>
    </div>
  );
}
