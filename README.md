# BlinkGrid Analytics Dashboard

A customer support analytics widget built using React, TypeScript, Express.js, and PostgreSQL.

This project was developed as part of the BlinkGrid engineering assessment task and focuses on identifying recurring unresolved customer issues through analytics-driven insights.

---

# Overview

The dashboard helps account managers proactively identify recurring customer pain points by displaying the top unresolved failure categories for a selected customer.

The application includes:

- Optimized PostgreSQL aggregation query
- Express.js REST API endpoint
- React + TypeScript analytics widget
- Loading, empty, populated, and error UI states
- Responsive modern dashboard interface

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
- PostgreSQL

---

# Features

- Displays top 3 unresolved failure categories
- Optimized SQL query using:
  - JOIN
  - GROUP BY
  - COUNT
  - ORDER BY
  - LIMIT
- Proper NULL filtering
- REST API endpoint integration
- Customer ID validation
- Environment variable configuration
- Loading skeleton UI state
- Empty state handling
- Error state handling
- Responsive SaaS-style analytics widget
- Clean component-based frontend structure

---

# SQL Query

```sql
SELECT
    t.failure_category,
    CAST(COUNT(*) AS INTEGER) AS failure_count
FROM tickets t
JOIN customers c
    ON t.customer_id = c.customer_id
WHERE
    t.customer_id = $1
    AND t.resolved = FALSE
    AND t.failure_category IS NOT NULL
GROUP BY t.failure_category
ORDER BY failure_count DESC, t.failure_category ASC
LIMIT 3;
```

---

# API Endpoint

```http
GET /api/analytics/top-failures/:customer_id
```

Example:

```http
GET /api/analytics/top-failures/1
```

---

# API Response Example

```json
[
  {
    "failure_category": "billing_confusion",
    "failure_count": 2
  },
  {
    "failure_category": "integration_error",
    "failure_count": 2
  },
  {
    "failure_category": "feature_misunderstanding",
    "failure_count": 1
  }
]
```

---

# Project Structure

```bash
BlinkGrid_Task/
├── backend/
│   ├── routes/
│   │   └── analytics.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TopFailuresWidget.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│
├── screenshots/
│   ├── Populated_State.png
│   ├── Loading_State.png
│   └── Empty_State.png
│
├── README.md
└── .gitignore
```

---

# UI States

## Loading State
Displays animated skeleton loaders while analytics data is being fetched from the backend API.

## Empty State
Displays:

> "No failure patterns detected — this customer is in great shape."

when no unresolved failure categories exist for the selected customer.

## Error State
Displays a user-friendly error message if the API request fails.

## Populated State
Displays the top failure categories along with ticket counts and visual progress indicators.

---

# Screenshots

## Populated State

![Populated State](./screenshots/Populated_State.png)

---

## Loading State

![Loading State](./screenshots/Loading_State.png)

---

## Empty State

![Empty State](./screenshots/Empty_State.png)

---

# Running The Project

## 1. Clone Repository

```bash
git clone https://github.com/Ishita-2210/blinkgrid-analytics-dashboard.git
```

---

## 2. Backend Setup

Navigate to backend:

```bash
cd blinkgrid-analytics-dashboard/backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=analytics_db
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

Start backend server:

```bash
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 3. Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend development server:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE analytics_db;
```

Create tables:

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name TEXT
);

CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    failure_category TEXT,
    resolved BOOLEAN
);
```

Insert sample data:

```sql
INSERT INTO customers (customer_name)
VALUES ('Acme Corp');

INSERT INTO tickets (customer_id, failure_category, resolved)
VALUES
(1, 'billing_confusion', FALSE),
(1, 'billing_confusion', FALSE),
(1, 'integration_error', FALSE),
(1, 'feature_misunderstanding', FALSE),
(1, 'integration_error', FALSE),
(1, NULL, FALSE),
(1, 'feature_misunderstanding', TRUE);
```

---

# Environment Variables

## Backend `.env`

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=analytics_db
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

---

## Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

# Backend Notes

The backend implementation includes:

- PostgreSQL connection pooling
- Parameterized SQL queries
- Customer ID validation
- CORS middleware support
- Environment-based configuration
- Proper NULL filtering
- Aggregation directly within the database layer for optimized analytics performance

---

# Author

**Ishita Sahu**

## Verification and implementation boundaries

Use Node.js 24 and a running PostgreSQL instance. From `backend`, run `npm ci`, configure local credentials using `.env.example`, and start with `npm start`. On a fresh database, `psql -d analytics_db -f schema.sql` creates the tables and a partial index without dropping existing data. In a second terminal, run `npm ci` and `npm run dev` from `frontend`; copy `.env.example` to `.env` there if needed.

Run `npm test` in `backend` for real HTTP route tests with a stubbed database boundary, and `npm run lint` plus `npm run build` in `frontend`. Tests verify ID rejection, parameter binding, numeric counts, empty results and error responses. The optional PostgreSQL integration suite executes the production analytics route against a real database in an isolated random schema. GitHub Actions supplies PostgreSQL 16; local runs skip that suite unless `TEST_DATABASE_URL` is set.

The API now validates positive PostgreSQL integer IDs, returns numeric counts and uses category names to break count ties. The widget cancels stale requests, clears previous errors when the customer changes and scales bars relative to the largest count. Customer 1 is the fixed demo selection; authentication and a customer picker are not implemented.

The historical backend `node_modules` files remain preserved; `.gitignore` prevents adding more generated dependency files. Run `npm ci` before starting the backend, even if that directory already exists: the lockfile contains security fixes newer than the historical vendor tree. The updated lockfiles are checked with `npm audit --omit=dev` and fresh-install tests. A previously tracked `.env` is now a public template with an empty password. Configure your own local value before connecting; do not commit credentials.


## Real database integration

This is the **BlinkGrid Analytics Dashboard** listed in the resumes. Its implementation demonstrates customer-specific aggregation and responsive UI states; no query-speed benchmark or business-impact figure is claimed.

The GitHub Actions backend job starts a disposable PostgreSQL 16 service and runs both HTTP unit tests and real SQL integration. The integration checks category counts, resolved/NULL filtering, deterministic ties, top-three limits, customer isolation, invalid IDs and the schema's partial index. It creates and removes only a newly generated test schema.

For a local PostgreSQL instance, set `TEST_DATABASE_URL` to a test database connection URL before running `npm test` from `backend`. A user with schema-creation permission is required. Without that variable the three dependency-light HTTP tests run and the database integration is explicitly skipped. Do not interpret a skipped integration as database verification.
