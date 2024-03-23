const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:29000/";

const client = new MongoClient(uri);

let _db;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to database");
    _db = client.db("AuthDB");
  } catch (e) {
    console.error(e);
    process.exit(1); // Exit process with failure
  }
}

async function getUser(username) {
  const users = _db.collection("users");
  const user = await users.findOne({ username: username });
  return user;
}

async function createUser(username, hash, type) {
  const users = _db.collection("users");
  const user = await users.insertOne({ username, hash, type });
  return user;
}
module.exports = { getUser, createUser, connectDB };
