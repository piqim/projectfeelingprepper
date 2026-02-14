import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from config.env
dotenv.config();

const URL = process.env.ATLAS_URL;
const db_name = process.env.MONGO_DB;

const client = new MongoClient(URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB! " + "Database name: " + client.db(db_name).databaseName);
} catch (err) {
  console.error(err);
}

let db = client.db(db_name);

export default db;
