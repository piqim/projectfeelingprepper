import { useState } from "react";
import config from "../../config";

interface User {
  _id: string;
  userId: string;
  username: string;
  email: string;
  streak: number;
  petStats?: {
    status: string;
    level: number;
    experience: number;
  };
  createdAt: string;
}

interface GrapesEntry {
  _id: string;
  userId: string;
  date: string;
  gentle: string;
  recreation: string;
  accomplishment: string;
  pleasure: string;
  exercise: string;
  social: string;
  completed: boolean;
}

interface CogTriEntry {
  _id: string;
  userId: string;
  date: string;
  situation: string;
  thoughts: string;
  feelings: string;
  behavior: string;
  complete: boolean;
}

const Dev = () => {
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "connected" | "error"
  >("idle");
  const [connectionMessage, setConnectionMessage] = useState("");

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [grapesEntries, setGrapesEntries] = useState<GrapesEntry[]>([]);
  const [cogtriEntries, setCogtriEntries] = useState<CogTriEntry[]>([]);

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingGrapes, setLoadingGrapes] = useState(false);
  const [loadingCogtri, setLoadingCogtri] = useState(false);

  // Expanded states for viewing details
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedGrapes, setExpandedGrapes] = useState<string | null>(null);
  const [expandedCogtri, setExpandedCogtri] = useState<string | null>(null);

  // API base URL from config
  const API_URL = config.API_URL;

  // Test connection to server
  const testConnection = async () => {
    setConnectionStatus("testing");
    setConnectionMessage("Testing connection...");

    try {
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        setConnectionStatus("connected");
        setConnectionMessage("✓ Successfully connected to MongoDB server!");
      } else {
        setConnectionStatus("error");
        setConnectionMessage(`✗ Server responded with status: ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus("error");
      setConnectionMessage(`✗ Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        alert(`Error fetching users: ${response.status}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch all GRAPES entries
  const fetchGrapesEntries = async () => {
    setLoadingGrapes(true);
    try {
      // Note: This endpoint doesn't exist in your current server.js
      // You'll need to add GET /grapes to fetch all entries
      const response = await fetch(`${API_URL}/grapes`);
      if (response.ok) {
        const data = await response.json();
        setGrapesEntries(data);
      } else {
        alert(`Error fetching GRAPES entries: ${response.status}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingGrapes(false);
    }
  };

  // Fetch all CogTri entries
  const fetchCogtriEntries = async () => {
    setLoadingCogtri(true);
    try {
      // Note: This endpoint doesn't exist in your current server.js
      // You'll need to add GET /cogtri to fetch all entries
      const response = await fetch(`${API_URL}/cogtri`);
      if (response.ok) {
        const data = await response.json();
        setCogtriEntries(data);
      } else {
        alert(`Error fetching CogTri entries: ${response.status}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingCogtri(false);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchGrapesEntries(),
      fetchCogtriEntries(),
    ]);
  };

  return (
    <div className="min-h-screen bg-neutral p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-dark text-3xl font-bold mb-2 montserrat-alternates">
          🛠️ Development Panel
        </h1>
        <p className="text-gray-600">
          Testing MongoDB connections and viewing collections
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-dark mb-4">
          Connection Status
        </h2>

        <button
          onClick={testConnection}
          disabled={connectionStatus === "testing"}
          className="bg-primary-light text-highlight font-semibold px-6 py-3 rounded-lg hover:bg-primary-base transition-colors disabled:opacity-50 mb-4"
        >
          {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
        </button>

        {connectionMessage && (
          <div
            className={`p-4 rounded-lg ${connectionStatus === "connected"
              ? "bg-accent-3/20 text-accent-3"
              : connectionStatus === "error"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
              }`}
          >
            {connectionMessage}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>API URL:</strong> {API_URL}
          </p>
        </div>
      </div>

      {/* Fetch All Data Button */}
      <div className="mb-6">
        <button
          onClick={fetchAllData}
          className="w-full bg-gradient-to-r from-primary-light to-primary-base text-highlight font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
        >
          📊 Fetch All Collections
        </button>
      </div>

      {/* Users Collection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">
            👥 Users Collection ({users.length})
          </h2>
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="bg-secondary text-dark font-semibold px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {loadingUsers ? "Loading..." : "Refresh"}
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500 italic">
            No users found. Click Refresh to load data.
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="border-l-4 border-secondary bg-gray-50 rounded-lg p-4"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedUser(
                      expandedUser === user._id ? null : user._id
                    )
                  }
                >
                  <div>
                    <p className="font-bold text-dark">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm bg-accent-1 text-white px-3 py-1 rounded-full">
                      🔥 {user.streak} days
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedUser === user._id ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {expandedUser === user._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm space-y-2">
                    <p>
                      <strong>ID:</strong> {user._id}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                    {user.petStats && (
                      <div>
                        <strong>Pet Stats:</strong>
                        <ul className="ml-4 mt-1">
                          <li>Status: {user.petStats.status}</li>
                          <li>Level: {user.petStats.level}</li>
                          <li>Experience: {user.petStats.experience}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRAPES Entries Collection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">
            🍇 GRAPES Entries ({grapesEntries.length})
          </h2>
          <button
            onClick={fetchGrapesEntries}
            disabled={loadingGrapes}
            className="bg-secondary text-dark font-semibold px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {loadingGrapes ? "Loading..." : "Refresh"}
          </button>
        </div>

        {grapesEntries.length === 0 ? (
          <p className="text-gray-500 italic">
            No GRAPES entries found. Click Refresh to load data.
          </p>
        ) : (
          <div className="space-y-3">
            {grapesEntries.map((entry) => (
              <div
                key={entry._id}
                className="border-l-4 border-secondary bg-gray-50 rounded-lg p-4"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedGrapes(
                      expandedGrapes === entry._id ? null : entry._id
                    )
                  }
                >
                  <div>
                    <p className="font-bold text-dark">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      User ID: {entry.userId.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.completed ? (
                      <span className="text-sm bg-accent-3 text-white px-3 py-1 rounded-full">
                        ✓ Complete
                      </span>
                    ) : (
                      <span className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded-full">
                        Partial
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedGrapes === entry._id ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {expandedGrapes === entry._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm space-y-2">
                    <p>
                      <strong>ID:</strong> {entry._id}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <strong>Gentle:</strong> {entry.gentle || "—"}
                      </div>
                      <div>
                        <strong>Recreation:</strong> {entry.recreation || "—"}
                      </div>
                      <div>
                        <strong>Accomplishment:</strong>{" "}
                        {entry.accomplishment || "—"}
                      </div>
                      <div>
                        <strong>Pleasure:</strong> {entry.pleasure || "—"}
                      </div>
                      <div>
                        <strong>Exercise:</strong> {entry.exercise || "—"}
                      </div>
                      <div>
                        <strong>Social:</strong> {entry.social || "—"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CogTri Entries Collection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">
            △ CogTri Entries ({cogtriEntries.length})
          </h2>
          <button
            onClick={fetchCogtriEntries}
            disabled={loadingCogtri}
            className="bg-primary-light text-highlight font-semibold px-4 py-2 rounded-lg hover:bg-primary-base transition-colors disabled:opacity-50"
          >
            {loadingCogtri ? "Loading..." : "Refresh"}
          </button>
        </div>

        {cogtriEntries.length === 0 ? (
          <p className="text-gray-500 italic">
            No CogTri entries found. Click Refresh to load data.
          </p>
        ) : (
          <div className="space-y-3">
            {cogtriEntries.map((entry) => (
              <div
                key={entry._id}
                className="border-l-4 border-primary-light bg-gray-50 rounded-lg p-4"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedCogtri(
                      expandedCogtri === entry._id ? null : entry._id
                    )
                  }
                >
                  <div className="flex-1">
                    <p className="font-bold text-dark">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {entry.situation.slice(0, 50)}
                      {entry.situation.length > 50 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.complete ? (
                      <span className="text-sm bg-accent-3 text-white px-3 py-1 rounded-full">
                        ✓ Complete
                      </span>
                    ) : (
                      <span className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded-full">
                        Partial
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedCogtri === entry._id ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {expandedCogtri === entry._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm space-y-3">
                    <p>
                      <strong>ID:</strong> {entry._id}
                    </p>
                    <p>
                      <strong>User ID:</strong> {entry.userId}
                    </p>
                    <div className="space-y-2">
                      <div className="bg-primary-base/10 p-2 rounded">
                        <strong>Situation:</strong> {entry.situation || "—"}
                      </div>
                      <div className="bg-accent-3/10 p-2 rounded">
                        <strong>Thoughts:</strong> {entry.thoughts || "—"}
                      </div>
                      <div className="bg-accent-1/10 p-2 rounded">
                        <strong>Feelings:</strong> {entry.feelings || "—"}
                      </div>
                      <div className="bg-accent-2/10 p-2 rounded">
                        <strong>Behavior:</strong> {entry.behavior || "—"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary-light to-primary-base rounded-2xl shadow-lg p-6 text-highlight">
        <h2 className="text-xl font-bold mb-4">📈 Database Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm opacity-90">Users</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{grapesEntries.length}</p>
            <p className="text-sm opacity-90">GRAPES Entries</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{cogtriEntries.length}</p>
            <p className="text-sm opacity-90">CogTri Entries</p>
          </div>
        </div>
      </div>

      {/* Drawing Board for Characters - Dev / UI Dsgnr use only!!! */}
      <div className="border-4 border-dark rounded-2xl overflow-hidden flex h-48 mt-6">
        {/* Left side (scene with fish/seal) */}
        <div className="relative flex-1 bg-primary-light/20 flex items-end justify-center pb-8">
          {/* Sun */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-accent-1 rounded-full"></div>

          {/* Ground/Grass */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-accent-3 rounded-bl-xl"></div>

          {/* Fish Character */}
          <div className="relative z-10" id="fish">
            <svg
              viewBox="0 0 120 100"
              className="w-32 h-32"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Body torso */}
              <path
                d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18"
                fill="#0281A7"
                stroke="#222089"
                strokeWidth="3"
              />
              {/* Fish body */}
              <ellipse
                cx="55"
                cy="35"
                rx="35"
                ry="25"
                fill="#FF7F50"
                stroke="#222089"
                strokeWidth="3"
              />
              {/* Smile */}
              <path
                d="M 23 45 Q 44 48 55 38"
                stroke="#222089"
                strokeWidth="2"
                fill="none"
              />
              {/* Fish tail */}
              <path
                d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35"
                fill="#FF7F50"
                stroke="#222089"
                strokeWidth="3"
              />

              {/* Eye outer */}
              <circle
                cx="45"
                cy="30"
                r="8"
                fill="white"
                stroke="#222089"
                strokeWidth="2"
              />
              {/* Eye inner */}
              <circle cx="45" cy="30" r="4" fill="#222089" />
              {/* Gills */}
              <path
                d="M 65 30 Q 70 35, 65 40"
                stroke="#222089"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 70 32 Q 75 37, 70 42"
                stroke="#222089"
                strokeWidth="2"
                fill="none"
              />

            </svg>
          </div>

          {/* Seal Character */}
          <div className="relative z-10" id="seal">
            <svg
              viewBox="0 0 120 100"
              className="w-32 h-32"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left flipper */}
              <ellipse
                cx="25"
                cy="78"
                rx="8"
                ry="9"
                transform="rotate(30 25 78)"
                fill="#9BB7BD"
                stroke="#5C6F75"
                strokeWidth="2"
              />

              {/* tail flipper */}
              <ellipse
                cx="110"
                cy="80"
                rx="7"
                ry="9"
                transform="rotate(105 110 78)"
                fill="#9BB7BD"
                stroke="#5C6F75"
                strokeWidth="2"
              />

              {/* right flipper */}
              <ellipse
                cx="58"
                cy="88"
                rx="9"
                ry="7"
                fill="#9BB7BD"
                stroke="#5C6F75"
                strokeWidth="2"
              />
              {/* Body */}
              <path
                d="M 22 52 Q 18 91 49 88 Q 101 96 108 77 Q 112 51 74.5 50.5 Q 71.5 17.5 47.5 17.5 Q 23.5 17.5 22 52"
                fill="#9BB7BD"
                stroke="#5C6F75"
                strokeWidth="3"
              />






              {/* Eyes */}
              <circle cx="38" cy="40" r="5" fill="#222" />
              <circle cx="58" cy="40" r="5" fill="#222" />

              <circle cx="39.5" cy="38.5" r="2" fill="white" />
              <circle cx="59.5" cy="38.5" r="2" fill="white" />

              {/* Nose */}
              <ellipse
                cx="48"
                cy="52"
                rx="3"
                ry="2"
                fill="#444"
              />

              {/* Mouth */}
              <path
                d="M 41 55 Q 45 60 48 54 Q 51 60 55 55"
                stroke="#444"
                strokeWidth="2"
                fill="none"
              />

              {/* Eyebrows */}
              <path
                d="M 34 32 Q 38 30 42 32"
                stroke="#5C6F75"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 54 32 Q 58 30 62 32"
                stroke="#5C6F75"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>


        </div>

        {/* Right side (Pet Stats) */}
        <div className="bg-accent-2 flex flex-col items-center justify-start py-4 px-4 w-2/5">
          <h2 className="text-xl font-bold text-dark">Pet Stats</h2>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-md font-semibold text-dark">Status:</span>
            <span className={`text-md font-bold text-green-500`}>
              Happy!
            </span>
          </div>

          {/* Message */}
          <p className="text-sm font-semibold text-center text-dark/80 leading-relaxed">
            He's happy to see you!
          </p>
        </div>
      </div>

    </div>
  );
};

export default Dev;