const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const { checkValidInvoice } = require("../middleware");

router.get("/", async (req, res, next) => {
  let invoices = await db.query(
    `SELECT id, comp_code
			 FROM invoices`);
  return res.json({ invoices: invoices.rows });
});

router.get("/:id", checkValidInvoice, async (req, res, next) => {
  let id = req.params.id;
  let invoice = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date
     FROM invoices
     WHERE id = $1`,
    [id]
  );
  let comp_code = invoice.rows[0].comp_code
  let company = await db.query(
    `SELECT code, name, description
     FROM companies
     WHERE code = $1`,
    [comp_code]
  );
  return res.json({ ...invoice.rows[0], company: company.rows[0] });
});

router.post("/", async (req, res, next) => {
  try {
    let { comp_code, amt } = req.body;
    if (!comp_code || !amt) {
      throw new ExpressError("You need a code & name", 400);
    }
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
			 VALUES ($1, $2, $3)
			 RETURNING code, name, description`,
      [code, name, description]);

    return res.status(201).json(result.rows[0]);
  }
  catch (err) {
    return next(err);
  }
});

router.put("/:code", checkValidInvoice, async (req, res, next) => {
  try {
    let code = req.params.code;
    let { name, description } = req.body;

    if (!name || !description) {
      throw new ExpressError("Please provide update for name and description", 400);

    } else {
      let result = await db.query(
        `UPDATE companies
				 SET name = $2, description = $3
				 WHERE code = $1
				 RETURNING code, name, description`,
        [code, name, description]);

      return res.json({ company: result.rows[0] })
    }
  }
  catch (err) {
    return next(err);
  }
});

router.delete("/:code", checkValidInvoice, async (req, res) => {
  let code = req.params.code;
  await db.query(
    `DELETE FROM companies
			 WHERE code = $1`,
    [code]);
  return res.json({ message: "deleted" });
});

module.exports = router;
