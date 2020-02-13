const ExpressError = require("./expressError");
const db = require("./db");


async function checkValidCompany(req, res, next) {
  try {
    const checkRes = await db.query(
        `SELECT code FROM companies WHERE code = $1`,
        [req.params.code]);

    if (checkRes.rows.length === 0) {
      throw new ExpressError("No such company", 404);
    }
  return next();
  }
  catch (err) {
    return next(err);
  }
}

async function checkValidInvoice(req, res, next) {
  try {
    const checkRes = await db.query(
      `SELECT id FROM invoices WHERE id = $1`,
      [req.params.id]);

    if (checkRes.rows.length === 0) {
      throw new ExpressError("No such invoice", 404);
    }
  return next();
  }
  catch (err) {
    return next(err);
  }
}

module.exports = { checkValidCompany, checkValidInvoice };