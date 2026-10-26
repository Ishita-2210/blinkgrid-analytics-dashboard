-- Run against a new local analytics_db. Does not drop existing tables.
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name TEXT
);
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    failure_category TEXT,
    resolved BOOLEAN
);
CREATE INDEX IF NOT EXISTS tickets_unresolved_customer
    ON tickets (customer_id, failure_category)
    WHERE resolved = FALSE AND failure_category IS NOT NULL;
