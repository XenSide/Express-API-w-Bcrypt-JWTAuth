/* eslint-disable no-unused-vars */
const express = require("express");
const cors = require("cors");
const app = express();
const { loginHandler, generateJWT } = require("./controller");

require("dotenv").config(); // Load .env file into process.env

var { expressjwt } = require("express-jwt");

// eslint-disable-next-line no-undef
const secret = process.env.JWT_SECRET;
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3200;

const checkJWTmw = expressjwt({
  secret: secret,
  algorithms: ["HS256"],
  userProperty: "auth",
});

var corsOptions = {
  origin: "http://localhost:3200",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());

app.post("/login", async (req, res) => {
  var { username, password } = req.body;
  username = username.toLowerCase();

  let user;
  try {
    user = await loginHandler(username, password);
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
  if (user?.type !== "admin")
    return res.status(403).json({ message: "Admin only access" });

  res.status(200).json({ token: generateJWT(username) }); //respond with token in JSONbody
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.get("/data", checkJWTmw, async (req, res) => {
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

connectDB().then(() => {
  app.listen(port, () => {
    console.log("Click here to access the server: http://localhost:" + port);
  });
});
