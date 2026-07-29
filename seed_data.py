"""
Run this once to populate SQLite with dummy cybersecurity alerts.

Usage:
python seed_data.py
"""

import sqlite3

conn = sqlite3.connect("cyberhawk.db")
cursor = conn.cursor()

# Create table if it doesn't exist
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

# Clear existing data
cursor.execute("DELETE FROM alerts")

alerts = [
    ("Multiple Failed Login Attempts", "Brute Force", "High", "192.168.1.45", "Auth Server",
     "15 failed login attempts detected within 2 minutes for user 'admin'.",
     "Open", "2026-07-25 09:12:00"),

    ("Malware Signature Detected", "Malware", "Critical", "10.0.0.23", "Finance-WS-07",
     "Trojan.GenericKD signature found in downloaded file via email attachment.",
     "Open", "2026-07-25 10:45:00"),

    ("Unusual Outbound Traffic", "Data Exfiltration", "Critical", "10.0.0.88", "DB-Server-02",
     "Large volume of outbound traffic to unknown external IP detected overnight.",
     "Open", "2026-07-26 02:30:00"),

    ("Port Scan Detected", "Reconnaissance", "Medium", "203.0.113.12", "Perimeter Firewall",
     "Sequential port scan detected across ports 20-1024.",
     "Resolved", "2026-07-24 16:20:00"),

    ("Phishing Email Reported", "Phishing", "Medium", "N/A", "Mail Server",
     "Employee reported suspicious email impersonating IT support requesting password reset.",
     "Resolved", "2026-07-23 11:05:00"),

    ("Outdated SSL Certificate", "Misconfiguration", "Low", "10.0.0.5", "Web Server",
     "SSL certificate for internal portal expired 3 days ago.",
     "Open", "2026-07-22 08:00:00"),

    ("Privilege Escalation Attempt", "Insider Threat", "High", "10.0.0.61", "HR-System",
     "Standard user account attempted to access admin-level configuration files.",
     "Open", "2026-07-27 14:10:00"),

    ("Ransomware Behavior Detected", "Ransomware", "Critical", "10.0.0.99", "File-Server-01",
     "Rapid mass file renaming with .locked extension detected on shared drive.",
     "Open", "2026-07-28 03:15:00"),

    ("DDoS Traffic Spike", "DDoS", "High", "Multiple", "Public Web Server",
     "Traffic spiked to 40x normal baseline, consistent with volumetric DDoS attack.",
     "Resolved", "2026-07-20 19:40:00"),

    ("Unauthorized USB Device Connected", "Policy Violation", "Low", "10.0.0.30", "Workstation-14",
     "Unregistered USB storage device connected to workstation in Finance dept.",
     "Open", "2026-07-28 12:00:00"),
]

cursor.executemany("""
INSERT INTO alerts (
    title,
    alert_type,
    severity,
    source_ip,
    target_system,
    description,
    status,
    detected_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", alerts)

conn.commit()

print(f"Seeded {len(alerts)} dummy alerts successfully into SQLite!")

conn.close()