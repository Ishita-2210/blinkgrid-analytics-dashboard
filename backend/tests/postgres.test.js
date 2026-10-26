const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const { Pool } = require("pg");
const { createAnalyticsRouter } = require("../routes/analytics");
const defaultPool = require("../db");

test("HTTP aggregation executes against isolated PostgreSQL tables", {
  skip: !process.env.TEST_DATABASE_URL && "Set TEST_DATABASE_URL to run PostgreSQL integration",
}, async (t) => {
  const connectionString = process.env.TEST_DATABASE_URL;
  const schema = `blinkgrid_test_${randomBytes(8).toString("hex")}`;
  const admin = new Pool({ connectionString });
  let database;
  let server;
  let schemaCreated = false;
  t.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (database) await database.end();
    // Only this test's newly created, random schema is removed.
    if (schemaCreated) await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
    await defaultPool.end();
  });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  schemaCreated = true;
  database = new Pool({ connectionString, options: `-c search_path=${schema}` });
  await database.query(await readFile(path.join(__dirname, "../schema.sql"), "utf8"));
  await database.query("INSERT INTO customers (customer_id, customer_name) VALUES (1, 'Fixture One'), (2, 'Fixture Two')");
  await database.query(`
    INSERT INTO tickets (customer_id, failure_category, resolved) VALUES
      (1, 'billing_confusion', FALSE), (1, 'billing_confusion', FALSE),
      (1, 'integration_error', FALSE), (1, 'integration_error', FALSE),
      (1, 'feature_misunderstanding', FALSE), (1, 'zeta', FALSE),
      (1, NULL, FALSE), (1, NULL, FALSE), (1, NULL, FALSE),
      (1, 'resolved_only', TRUE), (1, 'resolved_only', TRUE), (1, 'resolved_only', TRUE),
      (2, 'other_customer', FALSE);
  `);
  const app = express();
  app.use("/api/analytics", createAnalyticsRouter(database));
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/analytics/top-failures/`;

  await t.test("filters resolved and NULL categories, aggregates counts and breaks ties", async () => {
    const response = await fetch(url + "1");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      { failure_category: "billing_confusion", failure_count: 2 },
      { failure_category: "integration_error", failure_count: 2 },
      { failure_category: "feature_misunderstanding", failure_count: 1 },
    ]);
  });
  await t.test("keeps customer results isolated and returns an empty result for absent IDs", async () => {
    assert.deepEqual(await (await fetch(url + "2")).json(), [
      { failure_category: "other_customer", failure_count: 1 },
    ]);
    assert.deepEqual(await (await fetch(url + "999")).json(), []);
  });
  await t.test("rejects invalid IDs at the same HTTP boundary", async () => {
    assert.equal((await fetch(url + "1e2")).status, 400);
    assert.equal((await fetch(url + "-1")).status, 400);
  });
  await t.test("schema installs the documented partial index", async () => {
    const result = await database.query(
      "SELECT indexdef FROM pg_indexes WHERE schemaname = $1 AND indexname = $2",
      [schema, "tickets_unresolved_customer"],
    );
    assert.equal(result.rowCount, 1);
    assert.match(result.rows[0].indexdef, /WHERE.*resolved.*false/i);
  });
});
