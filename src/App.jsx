import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import AlertDetails from "./pages/AlertDetails";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:alertId" element={<AlertDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profiles/:userId" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
