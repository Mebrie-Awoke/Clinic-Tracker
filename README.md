## Clinic Tracker

A lightweight clinic operations dashboard for recording daily activity and finances, monitoring medicine stock, and viewing summaries. The frontend is plain HTML, CSS, and JavaScript; the API is built with FastAPI and stores data in a local SQLite database.

## Features    
  
- Record one daily log per date, including patient count, revenue, expenses, notes, and disease case counts.
- Review and delete daily logs, with profit calculated as revenue minus expenses.
- Maintain medicine inventory, adjust stock, and remove items. Inventory status is `Critical` at zero stock, `Low` at or below the reorder level, and `Good` above it.
- View current-month and all-time totals, disease counts from the last 30 days, low-stock alerts, and monthly revenue trends for up to the last year.
- Switch between light and dark themes.

## Requirements

- Python 3.9 or later
- `pip`

The backend uses FastAPI, Uvicorn, SQLAlchemy, Pydantic, and pandas. Install them in a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastapi uvicorn sqlalchemy pydantic pandas
```

## Run Locally

Start the API from the `backend` directory so its SQLite database is created there as `clinic_data.db`:

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal, from the repository root, serve the static frontend on the port allowed by the API's CORS configuration:

```bash
python3 -m http.server 5173 --directory frontend
```

Open <http://localhost:5173>. The API is available at <http://localhost:8000>, and its interactive Swagger documentation is at <http://localhost:8000/docs>.

The frontend currently uses `http://localhost:8000/api` as its API base URL. If you change the backend host or port, update `API_BASE` in `frontend/app.js` and adjust the backend CORS origins in `backend/main.py` accordingly.

## API Overview

All API routes are prefixed with `/api`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/daily-logs` | Create a daily log and its disease breakdown |
| `GET` | `/daily-logs` | List logs, optionally filtered with `start_date` and `end_date` query parameters |
| `GET` | `/daily-logs/{log_id}` | Get one daily log |
| `DELETE` | `/daily-logs/{log_id}` | Delete a daily log |
| `POST` | `/inventory` | Add an inventory item |
| `GET` | `/inventory` | List inventory and stock status |
| `PUT` | `/inventory/{item_id}?quantity_delta={n}` | Adjust stock by a positive or negative quantity |
| `DELETE` | `/inventory/{item_id}` | Delete an inventory item |
| `GET` | `/dashboard/summary` | Get dashboard totals, top diseases, and stock alerts |
| `GET` | `/dashboard/monthly-trends` | Get monthly totals for the previous year |

## Data and Limitations  

The SQLite database is created automatically when the backend starts. Keep `backend/clinic_data.db` to retain records; back it up separately if the data matters. The application does not currently include authentication, user accounts, or a production deployment configuration, so it should be treated as a local/demo system rather than exposed to an untrusted network.
