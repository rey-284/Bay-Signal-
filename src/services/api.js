import { sampleAlerts } from "../data/sampleAlerts";

// This frontend currently uses local sample data.
// Replace these functions with Flask API calls when the backend is ready.
export async function getAlerts() {
  return sampleAlerts;
}

export async function getAlertById(alertId) {
  return sampleAlerts.find((alert) => alert.id === alertId) || null;
}
