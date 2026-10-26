const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/top-failures/:customer_id", async (req, res) => {
  const rawId = req.params.customer_id;
  const customerId = Number(rawId);
  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(customerId) || customerId > 2147483647) {
    return res.status(400).json({ error: "customer_id must be a positive PostgreSQL integer" });
  }
  try {
    const query = `
      SELECT t.failure_category, CAST(COUNT(*) AS INTEGER) AS failure_count
      FROM tickets t
      JOIN customers c ON t.customer_id = c.customer_id
      WHERE t.customer_id = $1 AND t.resolved = FALSE
        AND t.failure_category IS NOT NULL
      GROUP BY t.failure_category
      ORDER BY failure_count DESC, t.failure_category ASC
      LIMIT 3;
    `;
    const result = await pool.query(query, [customerId]);
    return res.status(200).json(result.rows.map((row) => ({
      failure_category: row.failure_category,
      failure_count: Number(row.failure_count),
    })));
  } catch {
    console.error("Analytics database query failed");
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
