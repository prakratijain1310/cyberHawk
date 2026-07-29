# CyberWatch - Cybersecurity Monitoring Web App

A simple cybersecurity monitoring web application built with Flask and MongoDB. Displays dummy cybersecurity alerts with dashboard stats, alert management, and search.

## Tech Stack
- **Backend:** Flask, Python, MongoDB (PyMongo)
- **Frontend:** HTML, CSS, Vanilla JS (single-page app style)

## Features
- Dashboard with alert stats (by severity & status)
- Alert List (view all alerts)
- Alert Details (view full alert info)
- Search Alerts (by title, type, severity, IP)
- Add Alert
- Delete Alert

## Project Structure
```
cybersec-monitor/
├── app.py
├── seed_data.py
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/app.js
```

## Setup

1. Make sure MongoDB is running locally on `mongodb://localhost:27017`.

2. Create a virtual environment and install dependencies:
```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

3. Seed dummy alert data:
```bash
python seed_data.py
```

4. Run the app:
```bash
python app.py
```

5. Open in browser:
```
http://localhost:5000
```

## API Endpoints
- `GET /api/alerts` — list all alerts
- `GET /api/alerts/search?q=` — search alerts
- `GET /api/alerts/<id>` — get alert details
- `POST /api/alerts` — create new alert
- `DELETE /api/alerts/<id>` — delete alert
- `GET /api/dashboard/stats` — dashboard stats

No authentication, Docker, testing, or deployment setup included — kept intentionally minimal.
