import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
const router = express.Router();

const getNormalizedPetType = (petStats) => {
  const type = petStats?.type;

  if (typeof type !== "string") return null;

  const normalized = type.trim();
  return normalized.length > 0 ? normalized : null;
};

const hasSelectedPet = (petStats) => getNormalizedPetType(petStats) !== null;

/**
 * ======================
 * AUTHENTICATION
 * ======================
 */

// Login endpoint
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const collection = db.collection("users");
    const user = await collection.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Login successful - return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      requiresPetSelection: !hasSelectedPet(user.petStats),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ======================
 * USERS
 * ======================
 */

// Get all users (admin only - consider adding auth)
router.get("/users", async (req, res) => {
  try {
    const collection = db.collection("users");
    const results = await collection.find({}).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
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
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Don't send password to client
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      ...userWithoutPassword,
      requiresPetSelection: !hasSelectedPet(user.petStats),
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user pet selection status
router.get("/users/:id/pet-selection", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { petStats: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const selectedType = getNormalizedPetType(user.petStats);

    res.status(200).json({
      type: selectedType,
      requiresPetSelection: selectedType === null,
    });
  } catch (err) {
    console.error("Error fetching pet selection:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Choose or update user pet type
router.patch("/users/:id/pet-selection", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    if (typeof req.body.type !== "string" || req.body.type.trim().length === 0) {
      return res.status(400).json({ error: "type is required" });
    }

    const petType = req.body.type.trim().toLowerCase();
    const allowedPetTypes = ["fish", "seal"];

    if (!allowedPetTypes.includes(petType)) {
      return res.status(400).json({ error: "type must be fish or seal" });
    }

    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          "petStats.type": petType,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    );

    res.status(200).json({
      message: "Pet type updated successfully",
      user: updatedUser,
      requiresPetSelection: !hasSelectedPet(updatedUser?.petStats),
    });
  } catch (err) {
    console.error("Error updating pet selection:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new user
router.post("/users", async (req, res) => {
  try {
    const { username, email, password, notifications, theme } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword, // Store hashed password
      createdAt: new Date(),
      streak: 0,
      petStats: {
        type: null,
        status: "happy", // happy, neutral, sad
        lastFed: new Date(), // Same as createdAt
        level: 1,
        experience: 0,
      },
      preferences: {
        notifications: notifications !== undefined ? notifications : true,
        theme: theme || "light",
      },
    };

    const collection = db.collection("users");
    
    // Check if email already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const result = await collection.insertOne(newUser);
    res.status(201).json({ 
      insertedId: result.insertedId,
      message: "User created successfully" 
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update user by ID
router.patch("/users/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const updates = { $set: {} };
    const allowedFields = ["username", "email", "password", "streak", "petStats", "preferences"];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.$set[field] = req.body[field];
      }
    });

    if (Object.keys(updates.$set).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ 
      message: "User updated successfully",
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete user by ID
router.delete("/users/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const userId = req.params.id;

    // Delete user and all their entries
    await Promise.all([
      db.collection("users").deleteOne({ _id: new ObjectId(userId) }),
      db.collection("grapes-entries").deleteMany({ userId }),
      db.collection("cogtri-entries").deleteMany({ userId }),
    ]);

    res.status(200).json({ message: "User and all related data deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ======================
 * GRAPES ENTRIES
 * ======================
 */

// Get all GRAPES entries (admin/dev use)
router.get("/grapes", async (req, res) => {
  try {
    const results = await db.collection("grapes-entries")
      .find({})
      .sort({ date: -1 })
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching all GRAPES entries:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all GRAPES entries for a user
router.get("/grapes/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await db.collection("grapes-entries")
      .find({ userId })
      .sort({ date: -1 }) // Most recent first
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching GRAPES entries:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get latest GRAPES entry for a user
router.get("/grapes/user/:userId/latest", async (req, res) => {
  try {
    const { userId } = req.params;
    const entry = await db.collection("grapes-entries")
      .findOne({ userId }, { sort: { date: -1 } });
    
    if (!entry) {
      return res.status(404).json({ error: "No entries found" });
    }
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching latest GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get GRAPES entries by date range
router.get("/grapes/user/:userId/range", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }

    const results = await db.collection("grapes-entries")
      .find({
        userId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .sort({ date: -1 })
      .toArray();

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching GRAPES entries by range:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single GRAPES entry by ID
router.get("/grapes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const entry = await db.collection("grapes-entries")
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new GRAPES entry
router.post("/grapes", async (req, res) => {
  try {
    const { userId, date, gentle, recreation, accomplishment, pleasure, exercise, social, completed } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const newEntry = {
      userId,
      date: date ? new Date(date) : new Date(),
      gentle: gentle || "",
      recreation: recreation || "",
      accomplishment: accomplishment || "",
      pleasure: pleasure || "",
      exercise: exercise || "",
      social: social || "",
      completed: completed || false,
      createdAt: new Date(),
    };

    const result = await db.collection("grapes-entries").insertOne(newEntry);
    res.status(201).json({ 
      insertedId: result.insertedId,
      message: "GRAPES entry created successfully" 
    });
  } catch (err) {
    console.error("Error creating GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update GRAPES entry by ID
router.patch("/grapes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const updates = { $set: {} };
    const allowedFields = ["date", "gentle", "recreation", "accomplishment", "pleasure", "exercise", "social", "completed"];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.$set[field] = field === "date" ? new Date(req.body[field]) : req.body[field];
      }
    });

    if (Object.keys(updates.$set).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await db.collection("grapes-entries").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ 
      message: "GRAPES entry updated successfully",
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("Error updating GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete GRAPES entry by ID
router.delete("/grapes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const result = await db.collection("grapes-entries")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.status(200).json({ message: "GRAPES entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ======================
 * COGTRI ENTRIES
 * ======================
 */

// Get all CogTri entries (admin/dev use)
router.get("/cogtri", async (req, res) => {
  try {
    const results = await db.collection("cogtri-entries")
      .find({})
      .sort({ date: -1 })
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching all CogTri entries:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all CogTri entries for a user
router.get("/cogtri/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await db.collection("cogtri-entries")
      .find({ userId })
      .sort({ date: -1 }) // Most recent first
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching CogTri entries:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get latest CogTri entry for a user
router.get("/cogtri/user/:userId/latest", async (req, res) => {
  try {
    const { userId } = req.params;
    const entry = await db.collection("cogtri-entries")
      .findOne({ userId }, { sort: { date: -1 } });
    
    if (!entry) {
      return res.status(404).json({ error: "No entries found" });
    }
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching latest CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get CogTri entries by date range
router.get("/cogtri/user/:userId/range", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }

    const results = await db.collection("cogtri-entries")
      .find({
        userId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .sort({ date: -1 })
      .toArray();

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching CogTri entries by range:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single CogTri entry by ID
router.get("/cogtri/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const entry = await db.collection("cogtri-entries")
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new CogTri entry
router.post("/cogtri", async (req, res) => {
  try {
    const { userId, date, situation, thoughts, feelings, behavior, complete } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const newEntry = {
      userId,
      date: date ? new Date(date) : new Date(),
      situation: situation || "",
      thoughts: thoughts || "",
      feelings: feelings || "",
      behavior: behavior || "",
      complete: complete || false,
      createdAt: new Date(),
    };

    const result = await db.collection("cogtri-entries").insertOne(newEntry);
    res.status(201).json({ 
      insertedId: result.insertedId,
      message: "CogTri entry created successfully" 
    });
  } catch (err) {
    console.error("Error creating CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update CogTri entry by ID
router.patch("/cogtri/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const updates = { $set: {} };
    const allowedFields = ["date", "situation", "thoughts", "feelings", "behavior", "complete"];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.$set[field] = field === "date" ? new Date(req.body[field]) : req.body[field];
      }
    });

    if (Object.keys(updates.$set).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await db.collection("cogtri-entries").updateOne(
      { _id: new ObjectId(req.params.id) },
      updates
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ 
      message: "CogTri entry updated successfully",
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("Error updating CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete CogTri entry by ID
router.delete("/cogtri/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const result = await db.collection("cogtri-entries")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.status(200).json({ message: "CogTri entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * ======================
 * DASHBOARD / STATS
 * ======================
 */

// Get user dashboard data (for home page)
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Fetch user, latest GRAPES, latest CogTri in parallel
    const [user, latestGrapes, latestCogTri, grapeCount, cogtriCount] = await Promise.all([
      db.collection("users").findOne({ _id: new ObjectId(userId) }),
      db.collection("grapes-entries").findOne({ userId }, { sort: { date: -1 } }),
      db.collection("cogtri-entries").findOne({ userId }, { sort: { date: -1 } }),
      db.collection("grapes-entries").countDocuments({ userId, completed: true }),
      db.collection("cogtri-entries").countDocuments({ userId, complete: true }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
      requiresPetSelection: !hasSelectedPet(user.petStats),
      latestGrapes,
      latestCogTri,
      stats: {
        completedGrapesEntries: grapeCount,
        completedCogtriEntries: cogtriCount,
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;