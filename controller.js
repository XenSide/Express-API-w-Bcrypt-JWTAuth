const { getUser } = require("./db");
const { compare } = require("bcrypt");

const jwt = require("jsonwebtoken");

function generateJWT(username, secret = process.env.JWT_SECRET) {
  return jwt.sign({ username: username }, secret, { expiresIn: "1h" });
}

async function loginHandler(username, password) {
  const user = await getUser(username);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const match = await compare(password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  return user;
}

module.exports = { generateJWT, loginHandler };
