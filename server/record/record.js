import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * -----------------------
 * USERS
 * -----------------------
 */

// Get all users
router.get("/users", async (req, res) => {
  try {
    const collection = db.collection("users");
    const results = await collection.find({}).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Get single user by ID
router.get("/users/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const collection = db.collection("users");
    const user = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).send("User not found");
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Add new user
router.post("/users", async (req, res) => {
  try {
    const newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, // ⚠️ hash this in real life
      createdAt: new Date(),
      streak: req.body.streak || 0,
    };
    const collection = db.collection("users");
    const result = await collection.insertOne(newUser);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update user by ID
router.patch("/users/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const updates = { $set: {} };
    const fields = ["username", "email", "password", "streak"];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.$set[field] = req.body[field];
      }
    });

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete user by ID
router.delete("/users/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send("User not found");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

/** FUTURE UPDATE : TIPP
 * -----------------------
 * TIPP ENTRIES
 * -----------------------
 *

// Get all TIPP entries
router.get("/tipp", async (req, res) => {
  try {
    const collection = db.collection("tipp-entries");
    const results = await collection.find({}).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching TIPP entries:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Get single TIPP entry
router.get("/tipp/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const entry = await db.collection("tipp-entries").findOne({ _id: new ObjectId(req.params.id) });
    if (!entry) return res.status(404).send("Entry not found");
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching TIPP entry:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Add new TIPP entry
router.post("/tipp", async (req, res) => {
  try {
    const newEntry = {
      userId: req.body.userId,
      date: req.body.date || new Date(),
      activities: req.body.activities || {},
    };
    const result = await db.collection("tipp-entries").insertOne(newEntry);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error adding TIPP entry:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update TIPP entry
router.patch("/tipp/:id", async (req, res) => {
  try {
    const updates = { $set: {} };
    if (req.body.activities) updates.$set.activities = req.body.activities;
    if (req.body.date) updates.$set.date = req.body.date;

    const result = await db.collection("tipp-entries").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating TIPP entry:", err);
    res.status(500).send("Internal Server Error");
  }
});

*/


/**
 * -----------------------
 * GRAPE ENTRIES
 * -----------------------
 */

router.get("/grapes", async (req, res) => {
  try {
    const results = await db.collection("grape-entries").find({}).toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/grapes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const entry = await db.collection("grape-entries").findOne({ _id: new ObjectId(req.params.id) });
    if (!entry) return res.status(404).send("Not found");
    res.json(entry);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/grapes", async (req, res) => {
  try {
    const newEntry = {
      userId: req.body.userId,
      date: req.body.date || new Date(),
      activities: req.body.activities || {},
    };
    const result = await db.collection("grape-entries").insertOne(newEntry);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/grapes/:id", async (req, res) => {
  try {
    const updates = { $set: {} };
    if (req.body.activities) updates.$set.activities = req.body.activities;
    if (req.body.date) updates.$set.date = req.body.date;

    const result = await db.collection("grape-entries").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );
    res.json(result);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// Delete GRAPE entry
router.delete("/grapes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const result = await db.collection("grape-entries").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send("Not found");
    res.status(200).json({ message: "GRAPE entry deleted successfully" });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

/**
 * -----------------------
 * COG TRI ENTRIES
 * -----------------------
 */

router.get("/cogtri", async (req, res) => {
  try {
    const results = await db.collection("cogtri-entries").find({}).toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/cogtri/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const entry = await db.collection("cogtri-entries").findOne({ _id: new ObjectId(req.params.id) });
    if (!entry) return res.status(404).send("Not found");
    res.json(entry);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/cogtri", async (req, res) => {
  try {
    const newEntry = {
      userId: req.body.userId,
      date: req.body.date || new Date(),
      situation: req.body.situation,
      thoughts: req.body.thoughts,
      feelings: req.body.feelings,
      behavior: req.body.behavior,
    };
    const result = await db.collection("cogtri-entries").insertOne(newEntry);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/cogtri/:id", async (req, res) => {
  try {
    const updates = { $set: {} };
    ["situation", "thoughts", "feelings", "behavior", "date"].forEach(field => {
      if (req.body[field] !== undefined) updates.$set[field] = req.body[field];
    });

    const result = await db.collection("cogtri-entries").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );
    res.json(result);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// Delete COGTRI entry
router.delete("/cogtri/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const result = await db.collection("cogtri-entries").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send("Not found");
    res.status(200).json({ message: "COGTRI entry deleted successfully" });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
