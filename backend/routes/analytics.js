const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/top-failures/:customer_id", async (req, res) => {
  const { customer_id } = req.params;

  try {
    const query = `
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
    `;

    const result = await pool.query(query, [customer_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;