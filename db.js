const { MongoClient } = require("mongodb");
require("dotenv").config(); // Load .env file into process.env

// eslint-disable-next-line no-undef
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function getUser(username) {
  try {
    await client.connect();
    const database = client.db("barbershop");
    const users = database.collection("users");
    const user = await users.findOne({ username: username });
    return user;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

module.exports = { getUser };
