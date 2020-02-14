const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const { checkValidInvoice, invoiceCheckComp } = require("../middleware");

router.get("/", async (req, res, next) => {
  let invoices = await db.query(
    `SELECT id, comp_code
			 FROM invoices`);
  return res.json({ invoices: invoices.rows });
});

router.get("/:id", checkValidInvoice, async (req, res, next) => {
  let invoiceId = req.params.id;
  let invoice = await db.query(
    `SELECT * FROM invoices
     JOIN companies
     ON invoices.comp_code = companies.code
     WHERE id = $1`, [invoiceId]);

  let { id, comp_code, amt, paid, add_date, paid_date, code, name, description } = invoice.rows[0];

  return res.json({invoice: { id, comp_code, amt, paid, add_date, paid_date,
                    company: { code, name, description } }});
});

router.post("/", invoiceCheckComp, async (req, res, next) => {
  try {
    let { comp_code, amt } = req.body;
    if (!comp_code || !amt) {
      throw new ExpressError("Please provide company code and invoice amount", 400);
    }
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
			 VALUES ($1, $2)
			 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]);

    return res.status(201).json({invoice: result.rows[0]});
  }
  catch (err) {
    return next(err);
  }
});

router.put("/:id", checkValidInvoice, async (req, res, next) => {
  try {
    let invoiceId = req.params.id;
    let amt = req.body.amt;

    if (!amt) {
      throw new ExpressError("Please provide an updated amount", 400);

    } else {
      let result = await db.query(
        `UPDATE invoices
				 SET amt = $1
				 WHERE id = $2
				 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, invoiceId]);

      return res.json({ invoice: result.rows[0] })
    }
  }
  catch (err) {
    return next(err);
  }
});

router.delete("/:id", checkValidInvoice, async (req, res) => {
  let id = req.params.id;
  await db.query(
    `DELETE FROM invoices
			 WHERE id = $1`,
    [id]);
  return res.json({ message: "deleted" });
});

module.exports = router;
