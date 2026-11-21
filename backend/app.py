import sqlite3
from contextlib import closing
from pathlib import Path

from flask import Flask, request

app = Flask(__name__)
DB_PATH = Path(__file__).with_name("baysignal.db")

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

    with closing(sqlite3.connect(DB_PATH)) as db:
        result = db.execute(
            "INSERT INTO alerts (zip_code, street_address, message) VALUES (?, ?, ?)",
            (data["zip_code"].strip(), data["street_address"].strip(), data["message"].strip()),
        )
        db.commit()
        return {"alert_id": result.lastrowid, "status": "waiting"}, 201