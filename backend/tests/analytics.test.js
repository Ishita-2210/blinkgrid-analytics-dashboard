const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");
const pool = require("../db");
let server, url;
const originalQuery = pool.query;
before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  url = `http://127.0.0.1:${server.address().port}/api/analytics/top-failures/`;
});
after(async () => {
  pool.query = originalQuery;
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test("invalid IDs are rejected before querying", async () => {
  pool.query = () => { throw new Error("database must not be called"); };
  for (const id of ["0", "-1", "1.5", "abc", "1e2", "2147483648", "1%20OR%201=1"]) {
    const response = await fetch(url + id);
    assert.equal(response.status, 400, id);
  }
});
test("query is parameterized and returns numeric counts", async () => {
  pool.query = async (sql, params) => {
    assert.deepEqual(params, [12]);
    assert.match(sql, /customer_id = \$1/);
    assert.match(sql, /failure_count DESC, t.failure_category ASC/);
    return { rows: [{ failure_category: "billing", failure_count: "7" }] };
  };
  const response = await fetch(url + "12");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{failure_category:"billing",failure_count:7}]);
});
test("empty results and database failures have explicit responses", async () => {
  pool.query = async () => ({ rows: [] });
  assert.deepEqual(await (await fetch(url+"1")).json(), []);
  pool.query = async () => { throw new Error("private database details"); };
  const response = await fetch(url+"1");
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {error:"Internal Server Error"});
});
