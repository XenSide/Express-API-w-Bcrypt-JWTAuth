const { connectDB } = require("./db");

const express = require("express");
const cors = require("cors");
const app = express();
const { AppError, errorHandler, loginHandler, generateJWT } = require("./controller");

require("dotenv").config(); // Load .env file into process.env
const { connectDB } = require("./db");
const cors = require("cors");
const { expressjwt } = require("express-jwt");
const { AppError, errorHandler, loginHandler, generateJWT } = require("./controller");

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

app.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  username = username.toLowerCase();

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
