/* eslint-disable no-unused-vars */
const express = require("express");
const cors = require("cors");
const app = express();
const { getBarbers } = require("./db");
const { loginHandler } = require("./controller");
const { randomBytes, pbkdf2 } = require("crypto");
const { hash, compare } = require("bcrypt");

require("dotenv").config(); // Load .env file into process.env

var { expressjwt } = require("express-jwt");

const jwt = require("jsonwebtoken");

// eslint-disable-next-line no-undef
const secret = process.env.JWT_SECRET;
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3200;

const checkJWT = expressjwt({
  secret: secret,
  algorithms: ["HS256"],
  userProperty: "auth",
});

function generateJWT(username) {
  return jwt.sign({ username: username }, secret, { expiresIn: "1h" });
}

var corsOptions = {
  origin: "http://localhost:3200",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let user;
  try {
    user = await loginHandler(username, password);
  } catch (e) {
    return res.status(401).json({ message: e });
  }
  if (user?.type !== "admin")
    return res.status(403).json({ message: "Admin only access" });

  var token;

  token = generateJWT(username);
  res.status(200).json({ token: token });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.get("/data", checkJWT, async (req, res) => {
  res.json({ data: "This is a secret message" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(port, () => {
  console.log("Click here to access the server: http://localhost:" + port);
});
