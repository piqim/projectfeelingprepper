import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";

interface User {
  _id: string;
  username: string;
  email: string;
  streak: number;
  petStats?: {
    status: "happy" | "neutral" | "sad";
    level: number;
    experience: number;
  };
}

interface GrapesEntry {
  _id: string;
  gentle: string;
  recreation: string;
  accomplishment: string;
  pleasure: string;
  exercise: string;
  social: string;
  completed: boolean;
  date: string;
}

interface CogTriEntry {
  _id: string;
  situation: string;
  thoughts: string;
  feelings: string;
  behavior: string;
  complete: boolean;
  date: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [latestGrapes, setLatestGrapes] = useState<GrapesEntry | null>(null);
  const [latestCogTri, setLatestCogTri] = useState<CogTriEntry | null>(null);

  // API URL from config
  const API_URL = config.API_URL;

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    // Check if user is logged in (userId stored in localStorage) 
    const userId = localStorage.getItem("userId");

    if (!userId) {
      // User not logged in - this shouldn't happen due to ProtectedRoute
      // but handle gracefully just in case
      return;
    }

    try {
      // Fetch dashboard data (user, latest GRAPES, latest CogTri)
      const response = await fetch(`${API_URL}/dashboard/${userId}`);
      console.log("API response status:", response.status, response.statusText, response.url);

      if (!response.ok) {
        if (response.status === 404) {
          //User not found - invalid userId
          localStorage.removeItem("userId");
          alert("User not found. Please log in again.");
          navigate("/user/login");
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setUser(data.user);
      setLatestGrapes(data.latestGrapes);
      setLatestCogTri(data.latestCogTri);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Failed to load data. Please try again.");
      // Optionally redirect to login on error
      // navigate("/user/login");
    } finally {
      setLoading(false);
    }
  };

  // Calculate how many GRAPES activities are filled
  const calculateGrapesCount = () => {
    if (!latestGrapes) return 0;

    let count = 0;
    if (latestGrapes.gentle && latestGrapes.gentle.trim() !== "") count++;
    if (latestGrapes.recreation && latestGrapes.recreation.trim() !== "") count++;
    if (latestGrapes.accomplishment && latestGrapes.accomplishment.trim() !== "") count++;
    if (latestGrapes.pleasure && latestGrapes.pleasure.trim() !== "") count++;
    if (latestGrapes.exercise && latestGrapes.exercise.trim() !== "") count++;
    if (latestGrapes.social && latestGrapes.social.trim() !== "") count++;

    return count;
  };

  // Get pet status message
  const getPetMessage = () => {
    const status = user?.petStats?.status || "neutral";

    if (status === "happy") {
      return "Your pet is feeling great! Keep up the good work :)";
    } else if (status === "sad") {
      return "Your pet is sad. Complete more activities to cheer them up!";
    } else {
      return "Your pet is neutral. Keep working on your mental health!";
    }
  };

  // Get pet status color
  const getPetStatusColor = () => {
    const status = user?.petStats?.status || "neutral";

    if (status === "happy") return "text-green-500";
    if (status === "sad") return "text-red-500";
    return "text-gray-500";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-dark text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user data after loading, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-dark text-xl font-semibold mb-4">
            Unable to load user data
          </p>
          <button
            onClick={() => navigate("/user/login")}
            className="bg-primary-light text-highlight px-6 py-3 rounded-lg font-semibold hover:bg-primary-base transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const grapesCount = calculateGrapesCount();

  return (
    <div className="bg-neutral p-4 flex flex-col gap-4">

      {/* Welcome Message */}
      <div className="montserrat-alternates mb-2">
        <h2 className="text-dark text-3xl font-semibold tracking-wider">
          Welcome Back, {user.username}!
        </h2>
      </div>

      {/* PET SECTION --> integrate pet feature soon*/}
      <div className="border-4 border-dark rounded-2xl overflow-hidden flex h-48 relative">
        {/* Coming Soon Veil --> remove once pet feature is integrated!!! */}
        <div className="absolute inset-0 bg-dark/60 flex items-center justify-center z-20 pointer-events-none select-none">
          <div className="text-center">
            <p className="text-white text-4xl font-bold montserrat-alternates tracking-wider">
              Coming Soon!
            </p>
          </div>
        </div>

        {/* Left side (scene with fish) */}
        <div className="relative flex-1 bg-primary-light/20 flex items-end justify-center pb-8">
          {/* Sun */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-accent-1 rounded-full"></div>

          {/* Ground/Grass */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-accent-3 rounded-bl-xl"></div>

          {/* Fish Character */}
          <div className="relative z-10">
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
        </div>

        {/* Right side (Pet Stats) */}
        <div className="bg-accent-2 flex flex-col items-center justify-start py-4 px-4 w-2/5">
          <h2 className="text-xl font-bold text-dark">Pet Stats</h2>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-md font-semibold text-dark">Status:</span>
            <span className={`text-md font-bold ${getPetStatusColor()}`}>
              {user.petStats?.status || "neutral"}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm font-semibold text-center text-dark/80 leading-relaxed">
            {getPetMessage()}
          </p>
        </div>
      </div>

      {/* TODAY'S GRAPES CARD */}
      <div className="bg-secondary rounded-2xl px-5 py-5 flex items-start">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="montserrat-alternates text-highlight text-3xl font-semibold">
              Last GRAPES
            </h3>
            {/* Info Icon */}
            <button
              onClick={() =>
                window.open(
                  "https://www.integritycounselinggroup.com/blog/2018/12/22/how-to-use-the-grapes-tool-daily-to-combat-depression",
                  "_blank"
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="0.5" fill="white" />
              </svg>
            </button>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-4xl font-semibold text-dark underline decoration-2 underline-offset-4">
                {grapesCount}
              </span>
              <span className="text-3xl font-semibold text-highlight ml-2">
                / 6
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-dark">
                {latestGrapes?.date ? new Date(latestGrapes.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "No date"}
              </span>
              <span className="text-xs font-bold text-dark">
                {latestGrapes?.date ? new Date(latestGrapes.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }) : "No time"}
              </span>
            </div>

          </div>
        </div>

        {/* Divider Line */}
        <div className="w-[2px] h-24 bg-highlight/40 mx-4"></div>

        {/* Right Section */}
        <div className="flex flex-col items-center gap-2">
          <Link
            to="/grapes"
            className="text-highlight text-xl font-semibold whitespace-nowrap"
          >
            Go to:
          </Link>

          {/* Grape Icon */}
          <Link to="/grapes">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              fill="white"
              className="w-16 h-16"
            >
              <circle cx="32" cy="18" r="5" />
              <circle cx="23" cy="24" r="5" />
              <circle cx="41" cy="24" r="5" />
              <circle cx="32" cy="30" r="5" />
              <circle cx="23" cy="36" r="5" />
              <circle cx="41" cy="36" r="5" />
              <circle cx="32" cy="42" r="5" />
              <path d="M30 8c0-3 4-6 8-4-2 2-4 3-4 6z" fill="white" />
            </svg>
          </Link>
        </div>
      </div>

      {/* LAST COG TRI CARD */}
      <div className="bg-primary-light rounded-2xl px-5 py-5 flex items-start">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="montserrat-alternates text-highlight text-3xl font-semibold">
              Last Cog Tri
            </h3>
            {/* Info Icon */}
            <button
              onClick={() =>
                window.open(
                  "https://hudsontherapygroup.com/blog/cognitive-triangle",
                  "_blank"
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="0.5" fill="white" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-dark border-b-2 border-dark pb-1">
              {latestCogTri?.situation || "No recent entries"}
            </span>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-[2px] h-24 bg-highlight/40 mx-4"></div>

        {/* Right Section */}
        <div className="flex flex-col items-center gap-2">
          <Link
            to="/cogtri"
            className="text-highlight text-xl font-semibold whitespace-nowrap"
          >
            Go to:
          </Link>

          {/* Triangle Icon */}
          <Link to="/cogtri">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              fill="white"
              className="w-16 h-16"
            >
              <polygon points="32,15 8,52 56,52" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Calendar and Streak Section --> WIP, need to figure out the backend for ts :/ */}
      <div className="flex gap-0 relative h-72">

        {/* Coming Soon Veil --> remove once streak feature is integrated!!! */}
        <div className="absolute inset-0 bg-dark/60 rounded-2xl flex items-center justify-center z-10 pointer-events-none select-none">
          <div className="text-center">
            <p className="text-white text-4xl font-bold montserrat-alternates tracking-wider">
              Coming Soon!
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-accent-2 px-5 py-4 rounded-l-2xl w-[35%] relative z-5">
          <div className="font-bold text-2xl text-accent-1 leading-tight mb-2">
            You're on a roll!
          </div>
          {/* Divider Line */}
          <div className="w-[100%] h-[2px] my-3 bg-accent-1"></div>
          {/* Number of Days */}
          <div className="flex items-baseline gap-1 text-accent-1 mb-2">
            <p className="font-extrabold text-6xl leading-none">{user.streak}</p>
            <p className="font-bold text-xl">days</p>
          </div>
          {/* Fire Emoji */}
          <div className="mt-4">
            <span className="text-7xl">🔥</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-highlight rounded-r-2xl flex-1 -ml-4 pl-6 relative shadow-sm">
          <h2 className="text-xl px-2 py-3 text-highlight bg-primary-light rounded-tr-2xl font-bold mb-3 -ml-6 pl-8">
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2 px-2">
            <div>S</div>
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
          </div>
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold px-2">
            {/* Empty cells for days before month starts */}
            {[1, 2, 3].map((day) => (
              <div key={`empty-${day}`} className="p-2"></div>
            ))}
            {/* October days (starts on Friday in the PDF) */}
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              // Days 1-25 and 31 are highlighted in teal in the PDF
              const isHighlighted = day <= 25 || day === 31;
              return (
                <div
                  key={day}
                  className={`p-2 rounded ${isHighlighted
                    ? "bg-primary-light text-highlight"
                    : "bg-gray-200 text-gray-400"
                    }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;