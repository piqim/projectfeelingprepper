import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();

const getNormalizedPetType = (petStats) => {
  const type = petStats?.type;

  if (typeof type !== "string") return null;

  const normalized = type.trim();
  return normalized.length > 0 ? normalized : null;
};

const hasSelectedPet = (petStats) => getNormalizedPetType(petStats) !== null;

// XP awarded per action
const XP_REWARDS = {
  grapes: 10,
  cogtri: 10,
  feed: 5,
};

// Total XP required to reach each level (index = level number)
const LEVEL_THRESHOLDS = [0, 0, 50, 120, 220, 350, 520, 730, 990, 1300, 1670];
const MAX_LEVEL = 10;

// Returns the level a given total XP corresponds to
const getLevelForXP = (xp) => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
};

// Adds XP to a user's petStats, recomputes level, and persists the update.
// Returns { newExperience, newLevel, leveledUp }
const awardXP = async (userId, amount) => {
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { petStats: 1 } }
  );
  if (!user) return null;

  const currentLevel = user.petStats?.level ?? 1;
  if (currentLevel >= MAX_LEVEL) {
    return { newExperience: user.petStats?.experience ?? 0, newLevel: currentLevel, leveledUp: false };
  }

  // Atomically increment XP and read the post-increment total
  const updated = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $inc: { "petStats.experience": amount } },
    { projection: { "petStats.experience": 1, "petStats.level": 1 }, returnDocument: "after" }
  );
  if (!updated) return null;

  const newXP = updated.petStats.experience;
  const newLevel = getLevelForXP(newXP);
  const leveledUp = newLevel > currentLevel;

  if (leveledUp) {
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { "petStats.level": newLevel } }
    );
  }

  return { newExperience: newXP, newLevel, leveledUp };
};

const authenticateToken = (req, res, next) => {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = payload.userId;
    next();
  });
};

// Rejects requests to admin-only routes that lack the correct X-Admin-Key header
const requireAdminKey = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Parses a client-supplied YYYY-MM-DD local date and returns a UTC-midnight Date for it.
// Falls back to `now` if the format is invalid or the date is more than 2 days from server time
// (guards against backdating streak claims).
const parseLocalDate = (localDate, now) => {
  if (typeof localDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return now;
  const basis = new Date(localDate + "T00:00:00Z");
  const diffMs = Math.abs(now - basis);
  return diffMs <= 2 * 24 * 60 * 60 * 1000 ? basis : now;
};

const isSameUTCDay = (a, b) => {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
};

// Returns true if date `a` is exactly one UTC calendar day before date `b`
const isUTCYesterday = (a, b) => {
  const yesterday = new Date(b);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return isSameUTCDay(a, yesterday);
};

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

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
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

// Get all users (admin only)
router.get("/users", requireAdminKey, async (req, res) => {
  try {
    const collection = db.collection("users");
    const results = await collection.find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single user by ID
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const collection = db.collection("users");
    const user = await collection.findOne({ _id: new ObjectId(req.userId) });
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
router.get("/users/:id/pet-selection", authenticateToken, async (req, res) => {
  try {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.userId) },
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
router.patch("/users/:id/pet-selection", authenticateToken, async (req, res) => {
  try {
    if (typeof req.body.type !== "string" || req.body.type.trim().length === 0) {
      return res.status(400).json({ error: "type is required" });
    }

    const petType = req.body.type.trim().toLowerCase();
    const allowedPetTypes = ["fish", "seal"];

    if (!allowedPetTypes.includes(petType)) {
      return res.status(400).json({ error: "type must be fish or seal" });
    }

    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(req.userId) },
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
      { _id: new ObjectId(req.userId) },
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
      lastStreakDate: null,
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

    const token = jwt.sign(
      { userId: result.insertedId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      insertedId: result.insertedId,
      token,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update user by ID
router.patch("/users/:id", authenticateToken, async (req, res) => {
  try {
    const updates = { $set: {} };
    const allowedFields = ["username", "email", "preferences"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.$set[field] = req.body[field];
      }
    });

    // Allow toggling just the notifications preference without clobbering the
    // rest of `preferences` (e.g. theme), via a dot-path update.
    if (req.body.notifications !== undefined) {
      updates.$set["preferences.notifications"] = req.body.notifications;
    }

    if (Object.keys(updates.$set).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(req.userId) },
      updates
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Change password — verifies current password before hashing and storing the new one
router.post("/users/:id/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(req.userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const saltRounds = 10;
    const hashedNew = await bcrypt.hash(newPassword, saltRounds);

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.userId) },
      { $set: { password: hashedNew } }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete user by ID — JWT ownership verified via token
router.delete("/users/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

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
router.get("/grapes", requireAdminKey, async (req, res) => {
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
router.get("/grapes/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
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
router.get("/grapes/user/:userId/latest", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
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
router.get("/grapes/user/:userId/range", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
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
router.get("/grapes/:id", authenticateToken, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const entry = await db.collection("grapes-entries")
      .findOne({ _id: new ObjectId(req.params.id), userId: req.userId });

    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new GRAPES entry
router.post("/grapes", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { date, gentle, recreation, accomplishment, pleasure, exercise, social, completed } = req.body;

    // Check for an existing entry today (UTC day) — upsert instead of duplicate
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const existing = await db.collection("grapes-entries").findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    let result;
    if (existing) {
      // Update the existing entry for today
      await db.collection("grapes-entries").updateOne(
        { _id: existing._id },
        {
          $set: {
            gentle: gentle || "",
            recreation: recreation || "",
            accomplishment: accomplishment || "",
            pleasure: pleasure || "",
            exercise: exercise || "",
            social: social || "",
            completed: completed || false,
            updatedAt: now,
          },
        }
      );
      result = { insertedId: existing._id, updated: true };
    } else {
      const newEntry = {
        userId,
        date: date ? new Date(date) : now,
        gentle: gentle || "",
        recreation: recreation || "",
        accomplishment: accomplishment || "",
        pleasure: pleasure || "",
        exercise: exercise || "",
        social: social || "",
        completed: completed || false,
        createdAt: now,
      };
      const inserted = await db.collection("grapes-entries").insertOne(newEntry);
      result = { insertedId: inserted.insertedId, updated: false };
    }

    // Streak + XP updates — isolated so a failure here doesn't roll back the saved entry
    let streakUpdated = true;
    let xpResult = null;
    try {
      const basis = parseLocalDate(req.body.localDate, now);

      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { streak: 1, lastStreakDate: 1 } });
      if (user) {
        const lastStreakDate = user.lastStreakDate ?? null;
        let newStreak = user.streak ?? 0;
        if (lastStreakDate === null || (!isSameUTCDay(new Date(lastStreakDate), basis) && !isUTCYesterday(new Date(lastStreakDate), basis))) {
          newStreak = 1;
        } else if (isUTCYesterday(new Date(lastStreakDate), basis)) {
          newStreak = newStreak + 1;
        }
        if (lastStreakDate === null || !isSameUTCDay(new Date(lastStreakDate), basis)) {
          await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { streak: newStreak, lastStreakDate: basis } }
          );
        }
      }
      xpResult = await awardXP(userId, XP_REWARDS.grapes);
    } catch (streakErr) {
      console.error("Streak/XP update failed after GRAPES save:", streakErr);
      streakUpdated = false;
    }

    res.status(201).json({
      insertedId: result.insertedId,
      updated: result.updated,
      streakUpdated,
      leveledUp: xpResult?.leveledUp ?? false,
      newLevel: xpResult?.newLevel ?? null,
      message: result.updated ? "GRAPES entry updated successfully" : "GRAPES entry created successfully",
    });
  } catch (err) {
    console.error("Error creating GRAPES entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update GRAPES entry by ID
router.patch("/grapes/:id", authenticateToken, async (req, res) => {
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
      { _id: new ObjectId(req.params.id), userId: req.userId },
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
router.delete("/grapes/:id", authenticateToken, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const result = await db.collection("grapes-entries")
      .deleteOne({ _id: new ObjectId(req.params.id), userId: req.userId });
    
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
router.get("/cogtri", requireAdminKey, async (req, res) => {
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
router.get("/cogtri/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
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
router.get("/cogtri/user/:userId/latest", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
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
router.get("/cogtri/user/:userId/range", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
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
router.get("/cogtri/:id", authenticateToken, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const entry = await db.collection("cogtri-entries")
      .findOne({ _id: new ObjectId(req.params.id), userId: req.userId });

    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new CogTri entry
router.post("/cogtri", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { date, situation, thoughts, feelings, behavior, complete } = req.body;

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

    // Streak + XP updates — isolated so a failure here doesn't roll back the saved entry
    const now = new Date();
    let streakUpdated = true;
    let xpResult = null;
    try {
      const basis = parseLocalDate(req.body.localDate, now);

      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { streak: 1, lastStreakDate: 1 } });
      if (user) {
        const lastStreakDate = user.lastStreakDate ?? null;
        let newStreak = user.streak ?? 0;
        if (lastStreakDate === null || (!isSameUTCDay(new Date(lastStreakDate), basis) && !isUTCYesterday(new Date(lastStreakDate), basis))) {
          newStreak = 1;
        } else if (isUTCYesterday(new Date(lastStreakDate), basis)) {
          newStreak = newStreak + 1;
        }
        if (lastStreakDate === null || !isSameUTCDay(new Date(lastStreakDate), basis)) {
          await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { streak: newStreak, lastStreakDate: basis } }
          );
        }
      }
      xpResult = await awardXP(userId, XP_REWARDS.cogtri);
    } catch (streakErr) {
      console.error("Streak/XP update failed after CogTri save:", streakErr);
      streakUpdated = false;
    }

    res.status(201).json({
      insertedId: result.insertedId,
      streakUpdated,
      leveledUp: xpResult?.leveledUp ?? false,
      newLevel: xpResult?.newLevel ?? null,
      message: "CogTri entry created successfully",
    });
  } catch (err) {
    console.error("Error creating CogTri entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update CogTri entry by ID
router.patch("/cogtri/:id", authenticateToken, async (req, res) => {
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
      { _id: new ObjectId(req.params.id), userId: req.userId },
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
router.delete("/cogtri/:id", authenticateToken, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const result = await db.collection("cogtri-entries")
      .deleteOne({ _id: new ObjectId(req.params.id), userId: req.userId });
    
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
router.get("/dashboard/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Query current month with a 1-day buffer on each side to handle timezone edge cases
    // (e.g. a user in UTC+8 posting at 11pm local time gets stored as next UTC day)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setDate(monthStart.getDate() - 1); // 1-day buffer before
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    monthEnd.setDate(monthEnd.getDate() + 1); // 1-day buffer after

    const monthFilter = { userId, date: { $gte: monthStart, $lte: monthEnd } };

    // Fetch everything in parallel
    const [user, latestGrapes, latestCogTri, grapeCount, cogtriCount, grapeDates, cogtriDates] = await Promise.all([
      db.collection("users").findOne({ _id: new ObjectId(userId) }),
      db.collection("grapes-entries").findOne({ userId }, { sort: { date: -1 } }),
      db.collection("cogtri-entries").findOne({ userId }, { sort: { date: -1 } }),
      db.collection("grapes-entries").countDocuments({ userId, completed: true }),
      db.collection("cogtri-entries").countDocuments({ userId, complete: true }),
      db.collection("grapes-entries").find(monthFilter, { projection: { date: 1 } }).toArray(),
      db.collection("cogtri-entries").find(monthFilter, { projection: { date: 1 } }).toArray(),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    // Streak reset check — runs every time the dashboard loads (Option A)
    const lastStreakDate = user.lastStreakDate ?? null;
    if (user.streak > 0) {
      const shouldReset =
        lastStreakDate === null || // streak with no recorded date = inconsistent, reset
        (!isSameUTCDay(new Date(lastStreakDate), now) && !isUTCYesterday(new Date(lastStreakDate), now));
      if (shouldReset) {
        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          { $set: { streak: 0 } }
        );
        userWithoutPassword.streak = 0;
      }
    }

    // Combine entry dates from both collections
    const activityDates = [
      ...grapeDates.map(e => e.date),
      ...cogtriDates.map(e => e.date),
    ];

    res.status(200).json({
      user: userWithoutPassword,
      requiresPetSelection: !hasSelectedPet(user.petStats),
      latestGrapes,
      latestCogTri,
      activityDates,
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

// Feed pet
router.patch("/users/:id/pet-feed", authenticateToken, async (req, res) => {
  try {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { petStats: 1 } }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    // Reject if user has not selected a pet yet
    if (!hasSelectedPet(user.petStats)) {
      return res.status(400).json({ error: "No pet selected" });
    }

    const now = new Date();
    const lastFed = user.petStats?.lastFed ?? null;

    // Already fed within the last 12 hours — return early without writing
    if (lastFed && (now - new Date(lastFed)) < 12 * 60 * 60 * 1000) {
      return res.status(200).json({ alreadyFed: true, petStats: user.petStats });
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.userId) },
      { $set: { "petStats.lastFed": now, "petStats.status": "happy" } }
    );

    const newPetStats = { ...user.petStats, lastFed: now, status: "happy" };

    // Award XP for feeding — isolated so a failure doesn't break the feed response
    let xpResult = null;
    try {
      xpResult = await awardXP(req.userId, XP_REWARDS.feed);
    } catch (xpErr) {
      console.error("XP award failed after feed:", xpErr);
    }

    res.status(200).json({
      alreadyFed: false,
      petStats: newPetStats,
      leveledUp: xpResult?.leveledUp ?? false,
      newLevel: xpResult?.newLevel ?? null,
    });
  } catch (err) {
    console.error("Error feeding pet:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get activity dates for a given month (used for calendar navigation)
router.get("/activity-dates/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    const m = parseInt(month);
    const y = parseInt(year);

    if (isNaN(m) || isNaN(y) || m < 0 || m > 11) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    // 1-day buffer on each side to handle timezone edge cases
    const monthStart = new Date(y, m, 1);
    monthStart.setDate(monthStart.getDate() - 1);
    const monthEnd = new Date(y, m + 1, 1);
    monthEnd.setDate(monthEnd.getDate() + 1);

    const monthFilter = { userId, date: { $gte: monthStart, $lte: monthEnd } };

    const [grapeDates, cogtriDates] = await Promise.all([
      db.collection("grapes-entries").find(monthFilter, { projection: { date: 1 } }).toArray(),
      db.collection("cogtri-entries").find(monthFilter, { projection: { date: 1 } }).toArray(),
    ]);

    const activityDates = [
      ...grapeDates.map(e => e.date),
      ...cogtriDates.map(e => e.date),
    ];

    res.status(200).json({ activityDates });
  } catch (err) {
    console.error("Error fetching activity dates:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Analytics endpoint — derives all stats from existing entry data
router.get("/analytics/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const [grapesEntries, cogtriEntries] = await Promise.all([
      db.collection("grapes-entries").find({ userId }, { projection: { date: 1, gentle: 1, recreation: 1, accomplishment: 1, pleasure: 1, exercise: 1, social: 1 } }).toArray(),
      db.collection("cogtri-entries").find({ userId }, { projection: { date: 1 } }).toArray(),
    ]);

    // --- Longest streak & total active days this year ---
    // Build a deduplicated set of UTC date strings across both collections
    const toUTCDateStr = (d) => {
      const dt = new Date(d);
      return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
    };

    const allDates = new Set([
      ...grapesEntries.map(e => toUTCDateStr(e.date)),
      ...cogtriEntries.map(e => toUTCDateStr(e.date)),
    ]);

    const sortedDates = Array.from(allDates).sort();

    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    for (const dateStr of sortedDates) {
      if (!prevDate) {
        currentStreak = 1;
      } else {
        const prev = new Date(prevDate + "T00:00:00Z");
        const curr = new Date(dateStr + "T00:00:00Z");
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = dateStr;
    }

    const thisYear = new Date().getUTCFullYear();
    const totalActiveDaysThisYear = sortedDates.filter(d => d.startsWith(String(thisYear))).length;

    // --- GRAPES category fill counts ---
    const categories = ["gentle", "recreation", "accomplishment", "pleasure", "exercise", "social"];
    const grapesCategoryCounts = {};
    for (const cat of categories) {
      grapesCategoryCounts[cat] = grapesEntries.filter(e => e[cat] && e[cat].trim() !== "").length;
    }

    // --- CogTri entries per week for the last 4 weeks ---
    const now = new Date();
    const weeklyCogtri = [0, 0, 0, 0]; // index 0 = current week, 3 = 4 weeks ago
    for (const entry of cogtriEntries) {
      const entryDate = new Date(entry.date);
      const diffMs = now - entryDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 4) {
        weeklyCogtri[weekIndex]++;
      }
    }

    res.status(200).json({
      longestStreak,
      totalActiveDaysThisYear,
      grapesCategoryCounts,
      weeklyCogtri,
      totalGrapesEntries: grapesEntries.length,
      totalCogtriEntries: cogtriEntries.length,
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;