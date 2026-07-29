from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

# ---------------- DATABASE ----------------

conn = sqlite3.connect("cyberhawk.db", check_same_thread=False)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    alert_type TEXT,
    severity TEXT,
    source_ip TEXT,
    target_system TEXT,
    description TEXT,
    status TEXT,
    detected_at TEXT
)
""")
conn.commit()

# ---------------- PAGE ROUTES ----------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------- API: GET ALL ALERTS ----------------

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    cursor.execute("SELECT * FROM alerts ORDER BY detected_at DESC")
    alerts = [dict(row) for row in cursor.fetchall()]
    return jsonify(alerts)


# ---------------- API: SEARCH ALERTS ----------------

@app.route("/api/alerts/search", methods=["GET"])
def search_alerts():
    q = request.args.get("q", "")

    cursor.execute("""
        SELECT * FROM alerts
        WHERE title LIKE ?
        OR source_ip LIKE ?
        OR alert_type LIKE ?
        OR severity LIKE ?
        OR description LIKE ?
        ORDER BY detected_at DESC
    """, (
        f"%{q}%",
        f"%{q}%",
        f"%{q}%",
        f"%{q}%",
        f"%{q}%"
    ))

    alerts = [dict(row) for row in cursor.fetchall()]
    return jsonify(alerts)


# ---------------- API: GET SINGLE ALERT ----------------

@app.route("/api/alerts/<int:alert_id>", methods=["GET"])
def get_alert(alert_id):
    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    alert = cursor.fetchone()

    if alert is None:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify(dict(alert))


# ---------------- API: CREATE ALERT ----------------

@app.route("/api/alerts", methods=["POST"])
def create_alert():
    data = request.get_json()

    title = data.get("title", "")
    alert_type = data.get("alert_type", "")
    severity = data.get("severity", "Low")
    source_ip = data.get("source_ip", "")
    target_system = data.get("target_system", "")
    description = data.get("description", "")
    status = data.get("status", "Open")
    detected_at = data.get(
        "detected_at",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

    cursor.execute("""
        INSERT INTO alerts
        (title, alert_type, severity, source_ip,
         target_system, description, status, detected_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        title,
        alert_type,
        severity,
        source_ip,
        target_system,
        description,
        status,
        detected_at
    ))

    conn.commit()

    new_id = cursor.lastrowid

    cursor.execute("SELECT * FROM alerts WHERE id=?", (new_id,))
    alert = dict(cursor.fetchone())

    return jsonify(alert), 201


# ---------------- API: DELETE ALERT ----------------

@app.route("/api/alerts/<int:alert_id>", methods=["DELETE"])
def delete_alert(alert_id):
    cursor.execute("DELETE FROM alerts WHERE id=?", (alert_id,))
    conn.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({"message": "Alert deleted"})


# ---------------- API: DASHBOARD STATS ----------------

@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():

    def count(query):
        cursor.execute(query)
        return cursor.fetchone()[0]

    stats = {
        "total_alerts": count("SELECT COUNT(*) FROM alerts"),
        "critical": count("SELECT COUNT(*) FROM alerts WHERE severity='Critical'"),
        "high": count("SELECT COUNT(*) FROM alerts WHERE severity='High'"),
        "medium": count("SELECT COUNT(*) FROM alerts WHERE severity='Medium'"),
        "low": count("SELECT COUNT(*) FROM alerts WHERE severity='Low'"),
        "open": count("SELECT COUNT(*) FROM alerts WHERE status='Open'"),
        "resolved": count("SELECT COUNT(*) FROM alerts WHERE status='Resolved'")
    }

    return jsonify(stats)


# ---------------- RUN ----------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)