# BlinkGrid Analytics Dashboard

A customer support analytics widget built using React, TypeScript, Express, and PostgreSQL.

This project was developed as part of the BlinkGrid engineering assessment task.

---

# Overview

The dashboard helps account managers identify recurring unresolved customer issues by displaying the top failure categories for a given customer.

The system includes:

- Optimized PostgreSQL aggregation query
- Express API endpoint
- React + TypeScript frontend widget
- Loading, empty, and populated UI states
- Responsive modern dashboard design

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
- REST API endpoint
- Loading skeleton state
- Empty state handling
- Responsive SaaS-style UI

---

# SQL Query

```sql
SELECT
    t.failure_category,
    COUNT(*) AS failure_count
FROM tickets t
JOIN customers c
    ON t.customer_id = c.customer_id
WHERE
    t.customer_id = $1
    AND t.resolved = FALSE
    AND t.failure_category IS NOT NULL
GROUP BY t.failure_category
ORDER BY failure_count DESC
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

# Project Structure

```bash
BlinkGrid_Task/
├── backend/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.tsx
```

---

# UI States

## Loading State
Displays animated skeleton loaders while fetching analytics data.

## Empty State
Displays:
> "No failure patterns detected — this customer is in great shape"

when no unresolved failure categories exist.

## Populated State
Displays top failure categories with visual progress bars.

---

# Running The Project

## Backend

```bash
cd backend
npm install
node server.js
```

Runs on:
```bash
http://localhost:5000
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:
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

---

# Author

Ishita Sahu