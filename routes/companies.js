const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.get("/", async (req, res, next) => {
	try {
		let companies = await db.query(`SELECT code, name, description FROM companies`);
		return res.json({ companies: companies.rows });
	} catch (err) {
		return next(err);
	}
});

router.get("/:code", async (req, res, next) => {
	try {
		let code = req.params.code;
		let company = await db.query(
			`SELECT code, name, description 
      FROM companies
      WHERE code = $1`,
			[ code ]
		);

		if (company.rows.length === 0) {
			throw new ExpressError("This company does not exist.", 400);
		}
		return res.json({ company: company.rows[0] });
	} 
	catch (err) {
		return next(err);
	}
});

router.post("/", async (req, res, next) => {
	try {
		let { code, name, description } = req.body;
		console.log("CODE!!!>>>>", code)
		if(!code || !name){
			throw new ExpressError("You need a code & name", 400)
		} else {
			const result = await db.query(`
			INSERT INTO companies (code, name, description)
			VALUES ($1, $2, $3)
			RETURNING code, name, description
			`, [code, name, description])
			return res.status(201)
			.json(result.rows[0]);
		}
	} 
	catch (err) {
		return next(err);
	}
});

router.put("/:code", async (req, res, next) => {
	try {
		let code = req.params.code;
		let { name, description } = req.body;
		if(!name || !description){
			throw new ExpressError("Please provide update for name and description", 400)
		} else {
			let result = await db.query(`
			UPDATE companies
			SET name = $2, description = $3
			WHERE code = $1
			RETURNING code, name, description
			`, [code, name, description])
			return res.json({company: result.rows[0]})
		}
	} catch (err) {
		return next(err);
	}
});

router.delete("/:code", async (req, res, next) => {
	try {
		let code = req.params.code;
		let result = await db.query(`
			DELETE FROM companies
			WHERE code = $1
		`, [code])
		return res.json({message: "deleted"})
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
