# FeelingPrepper - MongoDB Database Schema

## Collections Overview

### 1. **users**
Stores user account information and profile settings.

**Schema:**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  createdAt: Date,
  streak: Number,
  petStats: {
    status: String, // "happy", "neutral", "sad"
    lastFed: Date,
    level: Number,
    experience: Number
  },
  preferences: {
    notifications: Boolean,
    theme: String // "light" or "dark"
  }
}
```

**Indexes:**
- `email` (unique)
- `username` (unique, optional)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "Piqim",
  "email": "piqim@example.com",
  "password": "$2b$10$hashedpassword...",
  "createdAt": "2025-02-13T10:00:00.000Z",
  "streak": 12,
  "petStats": {
    "status": "happy",
    "lastFed": "2025-02-13T09:00:00.000Z",
    "level": 3,
    "experience": 450
  },
  "preferences": {
    "notifications": true,
    "theme": "light"
  }
}
```

---

### 2. **grapes-entries**
Stores daily GRAPES activity tracking entries.

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: String, // References users._id
  date: Date,
  gentle: String,
  recreation: String,
  accomplishment: String,
  pleasure: String,
  exercise: String,
  social: String,
  completed: Boolean,
  createdAt: Date
}
```

**Indexes:**
- `userId` (for filtering user entries)
- `{ userId: 1, date: -1 }` (compound index for sorting)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "date": "2025-02-13T00:00:00.000Z",
  "gentle": "Took a nap",
  "recreation": "Played guitar",
  "accomplishment": "Finished homework",
  "pleasure": "Ate favorite snack",
  "exercise": "Yoga",
  "social": "Called a friend",
  "completed": true,
  "createdAt": "2025-02-13T14:30:00.000Z"
}
```

---

### 3. **cogtri-entries**
Stores Cognitive Triangle reflection entries.

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: String, // References users._id
  date: Date,
  situation: String,
  thoughts: String,
  feelings: String,
  behavior: String,
  complete: Boolean,
  createdAt: Date
}
```

**Indexes:**
- `userId` (for filtering user entries)
- `{ userId: 1, date: -1 }` (compound index for sorting)

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "date": "2025-02-13T00:00:00.000Z",
  "situation": "Failed an exam",
  "thoughts": "I never do well in this class, why even try?",
  "feelings": "Shame, hopelessness",
  "behavior": "Not trying on/studying for future exams",
  "complete": true,
  "createdAt": "2025-02-13T15:00:00.000Z"
}
```

---

## API Endpoints Summary

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user and all entries

### GRAPES Entries
- `GET /grapes/user/:userId` - Get all entries for user
- `GET /grapes/user/:userId/latest` - Get latest entry
- `GET /grapes/user/:userId/range?startDate=...&endDate=...` - Get entries by date range
- `GET /grapes/:id` - Get entry by ID
- `POST /grapes` - Create new entry
- `PATCH /grapes/:id` - Update entry
- `DELETE /grapes/:id` - Delete entry

### CogTri Entries
- `GET /cogtri/user/:userId` - Get all entries for user
- `GET /cogtri/user/:userId/latest` - Get latest entry
- `GET /cogtri/user/:userId/range?startDate=...&endDate=...` - Get entries by date range
- `GET /cogtri/:id` - Get entry by ID
- `POST /cogtri` - Create new entry
- `PATCH /cogtri/:id` - Update entry
- `DELETE /cogtri/:id` - Delete entry

### Dashboard
- `GET /dashboard/:userId` - Get all data for home page (user, latest entries, stats)

---

## MongoDB Setup Commands

### Create Indexes (run in MongoDB shell):

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// GRAPES entries collection
db["grapes-entries"].createIndex({ userId: 1 });
db["grapes-entries"].createIndex({ userId: 1, date: -1 });

// CogTri entries collection
db["cogtri-entries"].createIndex({ userId: 1 });
db["cogtri-entries"].createIndex({ userId: 1, date: -1 });
```

---

## Frontend Integration Examples

### Fetching Latest GRAPES Entry (for Home Page):
```javascript
const userId = "507f1f77bcf86cd799439011";
const response = await fetch(`/api/grapes/user/${userId}/latest`);
const latestEntry = await response.json();

// Use latestEntry.gentle, latestEntry.recreation, etc.
```

### Creating New GRAPES Entry:
```javascript
const newEntry = {
  userId: "507f1f77bcf86cd799439011",
  date: new Date().toISOString(),
  gentle: "Meditated",
  recreation: "Read a book",
  accomplishment: "Cleaned room",
  pleasure: "Ice cream",
  exercise: "Walk",
  social: "Video call",
  completed: true
};

const response = await fetch('/api/grapes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newEntry)
});
```

### Fetching Dashboard Data (for Home Page):
```javascript
const userId = "507f1f77bcf86cd799439011";
const response = await fetch(`/api/dashboard/${userId}`);
const { user, latestGrapes, latestCogTri, stats } = await response.json();

// user.streak -> for "12 days" display
// latestGrapes -> for "4/6 GRAPES" card
// latestCogTri.situation -> for "Anxious at work" display
// stats.completedGrapesEntries -> total count
```

---

## Security Recommendations

1. **Password Hashing**: Use bcrypt to hash passwords before storing
   ```javascript
   import bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Authentication**: Add JWT tokens for user sessions
3. **Authorization**: Verify userId matches authenticated user
4. **Input Validation**: Use express-validator for request validation
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **CORS**: Configure CORS properly for production

---

## Future Enhancements

### Potential Collections:
- **achievements** - Track user milestones and badges
- **reminders** - Store daily reminder preferences
- **journal-entries** - Free-form daily journaling
- **mood-tracking** - Quick daily mood check-ins
- **goals** - User-set mental health goals

### Analytics Features:
- Aggregate functions for weekly/monthly summaries
- Streak calculation and history
- Activity completion trends
- Mood patterns over time