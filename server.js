// server.js
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const usersFile = "./users.json";

// Helper function to read/write users
function readUsers() {
  if (!fs.existsSync(usersFile)) {
    return [];
  }
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const existing = users.find((u) => u.email === email);

  if (existing) {
    return res.status(400).json({ message: "Email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  writeUsers(users);

  res.json({ message: "Signup successful!" });
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: "Invalid email or password." });
  }

  res.json({ message: "Login successful!" });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
