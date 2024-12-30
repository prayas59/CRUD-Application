// Import required libraries
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ADODB = require("node-adodb");
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to the Access database
const dbPath = path.join(__dirname, "database", "database.accdb");
const connection = ADODB.open(
  `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${dbPath};Persist Security Info=False;`
);

// Form validation function
function validateForm(data) {
  const errors = [];

  if (!data.EmployeeID || data.EmployeeID.trim() === "") {
    errors.push("Employee ID is required.");
  }
  if (!data.EmployeeName || data.EmployeeName.trim() === "") {
    errors.push("Employee Name is required.");
  }
  if (!data.Salary || isNaN(data.Salary) || data.Salary <= 0) {
    errors.push("Salary must be a positive number.");
  }
  if (!data.Address || data.Address.trim() === "") {
    errors.push("Address is required.");
  }

  return errors;
}

// Routes

// Home route to list employees
app.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM Employees";
    const employees = await connection.query(query);
    res.render("index", { employees });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Show add employee form
app.get("/add", (req, res) => {
  res.render("add", { errors: [] });
});

// Add new employee
app.post("/add", async (req, res) => {
  const { EmployeeID, EmployeeName, Salary, Address } = req.body;
  const errors = validateForm(req.body);

  if (errors.length > 0) {
    return res.render("add", { errors });
  }

  try {
    const query = `INSERT INTO Employees (EmployeeID, EmployeeName, Salary, Address) VALUES ('${EmployeeID}', '${EmployeeName}', '${Salary}', '${Address}')`;
    await connection.execute(query);
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Show edit employee form
app.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM Employees WHERE EmployeeID='${id}'`;
    const employee = await connection.query(query);
    res.render("edit", { employee: employee[0], errors: [] });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update employee
app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { EmployeeName, Salary, Address } = req.body;
  const errors = validateForm({
    EmployeeID: id,
    EmployeeName,
    Salary,
    Address,
  });

  if (errors.length > 0) {
    const query = `SELECT * FROM Employees WHERE EmployeeID='${id}'`;
    const employee = await connection.query(query);
    return res.render("edit", { employee: employee[0], errors });
  }

  try {
    const query = `UPDATE Employees SET EmployeeName='${EmployeeName}', Salary='${Salary}', Address='${Address}' WHERE EmployeeID='${id}'`;
    await connection.execute(query);
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete employee
app.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM Employees WHERE EmployeeID='${id}'`;
    await connection.execute(query);
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
