const { getUser } = require("./db");
const { compare } = require("bcrypt");

const jwt = require("jsonwebtoken");

// eslint-disable-next-line no-undef
function generateJWT(username, secret = process.env.JWT_SECRET) {
  return jwt.sign({ username: username }, secret, { expiresIn: "1h" });
}

async function loginHandler(username, password) {
  let user;
  user = await getUser(username);
  if (user) {
    return new Promise((resolve, reject) => {
      compare(password, user.password, (err, res) => {
        if (!user || !res) {
          reject(new Error("invalid username or password"));
        } else {
          resolve(user);
        }
      });
    });
  } else {
    throw new Error("invalid username or password");
  }
}

module.exports = { generateJWT, loginHandler };
