const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/top-failures/:customer_id", async (req, res) => {
  if (!customer_id || isNaN(customer_id)) {
  return res.status(400).json({
    error: "Invalid customer_id",
  });
}

  try {
    const query = `
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
      ORDER BY failure_count DESC
      LIMIT 3;
    `;

    const result = await pool.query(query, [customer_id]);

    const formattedData = result.rows.map((row) => ({
      failure_category: row.failure_category,
      failure_count: parseInt(row.failure_count).toString(),
    }));

    console.log(formattedData);

    return res.status(200).json(formattedData);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;