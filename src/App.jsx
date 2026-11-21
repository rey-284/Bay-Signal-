import { Navigate, Route, Routes } from "react-router-dom";
import Inbox from "./pages/Inbox";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { CommunityAlerts, CommunityDetails, RequestHelp } from "./pages/Community";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<CommunityAlerts />} />
          <Route path="/request" element={<RequestHelp />} />
          {import.meta.env.DEV && <Route path="/relay-demo" element={<Alerts />} />}
          <Route path="/alerts/:alertId" element={<CommunityDetails />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profiles/:userId" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
