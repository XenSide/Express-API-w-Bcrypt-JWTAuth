const { MongoClient } = require("mongodb");

// eslint-disable-next-line no-undef
const uri = process.env.mongo_uri;

const client = new MongoClient(uri);

async function getUser(username) {
  try {
    const database = client.db("barbershop");
    const users = database.collection("users");
    const user = await users.findOne({ username: username });
    return user;
  } catch (e) {
    console.error(e);
  }
}

module.exports = { getUser };
