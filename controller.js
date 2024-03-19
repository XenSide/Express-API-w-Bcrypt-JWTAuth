const { getUser } = require("./db");
const { compare } = require("bcrypt");

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

module.exports = { loginHandler };
