const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:29000/";

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
