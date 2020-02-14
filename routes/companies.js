const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const { checkValidCompany } = require("../middleware");

router.get("/", async (req, res, next) => {
	let companies = await db.query(
		`SELECT code, name, description
			 FROM companies`);
	return res.json({ companies: companies.rows });
});

router.get("/:code", checkValidCompany, async (req, res, next) => {
	let companyCode = req.params.code;
	let results = await db.query(
		`SELECT * FROM companies
	JOIN invoices
	ON companies.code = invoices.comp_code
	WHERE code = $1`, [companyCode])

	let { code, name, description } = results.rows[0];

	let invoices = results.rows.map(r => {
		return { id, comp_code, amt, paid, add_date, paid_date } = r;
	});

	return res.json({ code, name, description, invoices });
});

router.post("/", async (req, res, next) => {
	try {
		let { code, name, description } = req.body;
		if (!code || !name) {
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

router.put("/:code", checkValidCompany, async (req, res, next) => {
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

router.delete("/:code", checkValidCompany, async (req, res) => {
	let code = req.params.code;
	await db.query(
		`DELETE FROM companies
			 WHERE code = $1`,
		[code]);
	return res.json({ message: "deleted" });
});

module.exports = router;
