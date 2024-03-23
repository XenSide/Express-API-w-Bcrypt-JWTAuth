const express = require("express");
const app = express();
require("dotenv").config(); // Load .env file into process.env
const { connectDB } = require("./db");
const cors = require("cors");
const { expressjwt } = require("express-jwt");
const ratelimit = require("express-rate-limit");
const { AppError, errorHandler, loginHandler, registerHandler, generateJWT } = require("./controller");

const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 75,
  message: "Too many requests from this IP, please try again later",
});

const secret = process.env.JWT_SECRET;
const port = process.env.PORT || 3200;

const checkJWTmw = expressjwt({
  secret: secret,
  algorithms: ["HS256"],
  userProperty: "auth",
});

const corsOptions = {
  origin: "http://localhost:3200",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());

async function registerUser(req, res, next, userType = "user") {
  let { username, password } = req.body;
  if (!username || !password) {
    next(new AppError("Username and password are required", 400));
    return;
  }

  try {
    await registerHandler(username, password, userType);
    res.status(200).json({ message: "User created successfully" });
  } catch (e) {
    next(e);
  }
}

//Handles creation of new client accounts
app.post("/register", limiter, async (req, res, next) => {
  registerUser(req, res, next);
});

//Handles creation of new administrator accounts
app.post("/adminregister", limiter, checkJWTmw, async (req, res, next) => {
  registerUser(req, res, next, "admin");
});

app.post("/login", limiter, async (req, res, next) => {
  let { username, password } = req.body;
  if (!username || !password) {
    next(new AppError("Username and password are required", 400));
    return;
  }
  username = username.toLowerCase().trim();
  let user;
  try {
    user = await loginHandler(username, password);
    if (user?.type !== "admin") {
      throw new AppError("Admin only access", 403);
    }
    res.status(200).json({ token: generateJWT(username) }); //respond with token in JSONbody
  } catch (e) {
    next(e);
  }
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

// eslint-disable-next-line no-unused-vars
app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log("Click here to access the server: http://localhost:" + port);
  });
});
