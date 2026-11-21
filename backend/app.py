import sqlite3
from contextlib import closing
from pathlib import Path

from flask import Flask, request

app = Flask(__name__)
DB_PATH = Path(__file__).with_name("baysignal.db")

DEMO_SUBSCRIBERS = {
    "33620": ["neighbor-1", "neighbor-2"],
}

with closing(sqlite3.connect(DB_PATH)) as db:
    db.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id INTEGER PRIMARY KEY,
            zip_code TEXT NOT NULL,
            street_address TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'waiting'
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS alert_matches (
            alert_id INTEGER NOT NULL,
            subscriber_id TEXT NOT NULL,
            PRIMARY KEY (alert_id, subscriber_id)
        )
    """)
    db.commit()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/alerts")
def list_alerts():
    with closing(sqlite3.connect(DB_PATH)) as db:
        db.row_factory = sqlite3.Row
        rows = db.execute("""
            SELECT alert_id, zip_code, message, status
            FROM alerts
            ORDER BY alert_id DESC
        """).fetchall()

    return [dict(row) for row in rows]


@app.post("/api/alerts")
def create_alert():
    data = request.get_json(silent=True)
    fields = ("zip_code", "street_address", "message")

    if not isinstance(data, dict) or any(
        not isinstance(data.get(field), str) or not data[field].strip()
        for field in fields
    ):
        return {"error": "Enter a ZIP code, street address, and message."}, 400

    zip_code = data["zip_code"].strip()
    street_address = data["street_address"].strip()
    message = data["message"].strip()
    requester_id = data.get("requester_id")

    matched_ids = [
        subscriber_id
        for subscriber_id in DEMO_SUBSCRIBERS.get(zip_code, [])
        if subscriber_id != requester_id
    ]

    with closing(sqlite3.connect(DB_PATH)) as db:
        result = db.execute(
            "INSERT INTO alerts (zip_code, street_address, message) VALUES (?, ?, ?)",
            (zip_code, street_address, message),
        )
        alert_id = result.lastrowid
        db.executemany(
            "INSERT INTO alert_matches (alert_id, subscriber_id) VALUES (?, ?)",
            [(alert_id, subscriber_id) for subscriber_id in matched_ids],
        )
        db.commit()

    return {
        "alert_id": alert_id,
        "status": "waiting",
        "matched_subscriber_ids": matched_ids,
    }, 201


@app.post("/api/alerts/<int:alert_id>/reply")
def reply_to_alert(alert_id):
    data = request.get_json(silent=True)
    subscriber_id = data.get("subscriber_id") if isinstance(data, dict) else None

    if not isinstance(subscriber_id, str) or not subscriber_id.strip():
        return {"error": "Enter a subscriber ID."}, 400

    with closing(sqlite3.connect(DB_PATH)) as db:
        alert = db.execute(
            "SELECT 1 FROM alerts WHERE alert_id = ?",
            (alert_id,),
        ).fetchone()

        if alert is None:
            return {"error": "Alert not found."}, 404

        updated = db.execute("""
            UPDATE alerts
            SET status = 'responded'
            WHERE alert_id = ?
              AND EXISTS (
                  SELECT 1
                  FROM alert_matches
                  WHERE alert_matches.alert_id = alerts.alert_id
                    AND subscriber_id = ?
              )
        """, (alert_id, subscriber_id.strip()))

        if updated.rowcount == 0:
            return {"error": "This subscriber was not matched to the alert."}, 403

        db.commit()

    return {"alert_id": alert_id, "status": "responded"}