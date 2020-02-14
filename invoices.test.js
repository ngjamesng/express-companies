process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
let db = require("./db")

let company;
let invoice;

beforeEach(async function(){
  await db.query("DELETE FROM companies")
  await db.query("DELETE FROM invoices")

 let compInsertion = await db.query(`
  INSERT INTO companies ( code, name, description)
  VALUES ( 'testcode', 'testcompanyname', 'test description')
  RETURNING code, name, description
 `);
//  console.log("compInsertion>>>>>>", compInsertion)
  company = compInsertion.rows[0];

  let invoicesInsertion = await db.query(`
  INSERT INTO invoices ( comp_code, amt )
  VALUES ( 'testcode', '24000' )
  RETURNING id, comp_code
 `);
  invoice = invoicesInsertion.rows[0];

})

describe("get to /invoices", ()=>{
  test("Gets a list of 1 invoice", async function(){
    const response = await request(app).get("/invoices");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoices: [invoice]
    });
  });
});

describe("get to /invoices/:id", ()=>{
  test("gets info on an existing invoice", async function(){
    const response = await request(app).get(`/invoices/${invoice.id}`)
    expect(response.statusCode).toEqual(200);
    expect(response.body.invoice.id).toEqual(invoice.id)
    expect(response.body.invoice.company.code).toEqual(invoice.comp_code)
  })
  test("returns 404 for invalid id", async function(){
    const response = await request(app).get(`/invoices/0`)
    expect(response.statusCode).toEqual(404);
    expect(response.body.error.message).toEqual("No such invoice")

  })
})

afterEach(async function(){
  await db.query("DELETE FROM companies")
  await db.query("DELETE FROM invoices")
})

afterAll(async function(){
  await db.end();
})