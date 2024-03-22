const { getUser } = require("./db");
const { compare } = require("bcrypt");

const jwt = require("jsonwebtoken");

function generateJWT(username, secret = process.env.JWT_SECRET) {
  return jwt.sign({ username: username }, secret, { expiresIn: "1h" });
}

class AppError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

// Middleware for handling errors
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    // Custom application error
    res.status(err.status).json({ error: err.message });
  } else {
    // Other errors, such as syntax errors
    if (err.name === "UnauthorizedError")
      res.status(401).json({ error: err.message === "jwt expired" ? "Token expired" : err.message });
    else {
      console.log("🚀 ~ errorHandler ~ err.stack:", err.stack);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
}

async function loginHandler(username, password) {
  const user = await getUser(username);
  const match = user ? await compare(password, user.password) : false;

  if (!user || !match) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
}

module.exports = { AppError, errorHandler, generateJWT, loginHandler };
