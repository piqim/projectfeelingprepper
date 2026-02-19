import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";

interface User {
  _id: string;
  username: string;
  email: string;
  streak: number;
  petStats?: {
    type?: string | null;
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
  const [requiresPetSelection, setRequiresPetSelection] = useState(false);
  const [selectingPet, setSelectingPet] = useState(false);
  const [petSelectionError, setPetSelectionError] = useState("");
  const [latestGrapes, setLatestGrapes] = useState<GrapesEntry | null>(null);
  const [latestCogTri, setLatestCogTri] = useState<CogTriEntry | null>(null);

  // API URL from config
  const API_URL = config.API_URL;

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const hasPetType = (type?: string | null) => {
    if (typeof type !== "string") return false;
    return type.trim().length > 0;
  };

  const isValidObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

  const extractMongoId = (value: unknown): string | null => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (isValidObjectId(trimmed)) return trimmed;

      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (
            parsed &&
            typeof parsed === "object" &&
            "$oid" in parsed &&
            typeof (parsed as { $oid?: unknown }).$oid === "string"
          ) {
            const oid = (parsed as { $oid: string }).$oid;
            return isValidObjectId(oid) ? oid : null;
          }
        } catch {
        }
      }

      return null;
    }

    if (value && typeof value === "object" && "$oid" in value) {
      const oid = (value as { $oid?: unknown }).$oid;
      if (typeof oid === "string" && isValidObjectId(oid)) return oid;
    }

    return null;
  };

  const getSessionUserId = () => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) return null;

    const normalizedUserId = extractMongoId(storedUserId);
    if (!normalizedUserId) return null;

    if (storedUserId !== normalizedUserId) {
      localStorage.setItem("userId", normalizedUserId);
    }

    return normalizedUserId;
  };

  const checkAuthAndFetchData = async () => {
    // Check if user is logged in (userId stored in localStorage) 
    const userId = getSessionUserId();

    if (!userId) {
      // User not logged in - this shouldn't happen due to ProtectedRoute
      // but handle gracefully just in case
      localStorage.removeItem("userId");
      setLoading(false);
      navigate("/user/login");
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
      const normalizedResponseUserId = extractMongoId(data?.user?._id);
      if (normalizedResponseUserId) {
        localStorage.setItem("userId", normalizedResponseUserId);
      }

      setUser(data.user);
      setRequiresPetSelection(
        typeof data.requiresPetSelection === "boolean"
          ? data.requiresPetSelection
          : !hasPetType(data?.user?.petStats?.type)
      );
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
    if (!hasPetType(user?.petStats?.type)) {
      return "Choose your pet to start your journey!";
    }

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

  const getSelectedPetType = () => {
    const type = user?.petStats?.type;
    if (!hasPetType(type)) return null;
    return type!.trim().toLowerCase();
  };

  const getSelectedPetName = () => {
    const selectedType = getSelectedPetType();
    if (selectedType === "fish") return "Fish";
    if (selectedType === "seal") return "Seal";
    return "Not selected";
  };

  const renderPetCharacter = () => {
    const selectedType = getSelectedPetType();

    if (selectedType === "seal") {
      return (
        <div className="relative z-10" id="seal">
          <svg
            viewBox="0 0 120 100"
            className="w-32 h-32"
            xmlns="http://www.w3.org/2000/svg"
          >
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

            <ellipse
              cx="58"
              cy="88"
              rx="9"
              ry="7"
              fill="#9BB7BD"
              stroke="#5C6F75"
              strokeWidth="2"
            />

            <path
              d="M 22 52 Q 18 91 49 88 Q 101 96 108 77 Q 112 51 74.5 50.5 Q 71.5 17.5 47.5 17.5 Q 23.5 17.5 22 52"
              fill="#9BB7BD"
              stroke="#5C6F75"
              strokeWidth="3"
            />

            <circle cx="38" cy="40" r="5" fill="#222" />
            <circle cx="58" cy="40" r="5" fill="#222" />

            <circle cx="39.5" cy="38.5" r="2" fill="white" />
            <circle cx="59.5" cy="38.5" r="2" fill="white" />

            <ellipse
              cx="48"
              cy="52"
              rx="3"
              ry="2"
              fill="#444"
            />

            <path
              d="M 41 55 Q 45 60 48 54 Q 51 60 55 55"
              stroke="#444"
              strokeWidth="2"
              fill="none"
            />

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
      );
    }

    if (selectedType === "fish") {
      return (
        <div className="relative z-10" id="fish">
          <svg
            viewBox="0 0 120 100"
            className="w-32 h-32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18"
              fill="#0281A7"
              stroke="#222089"
              strokeWidth="3"
            />
            <ellipse
              cx="55"
              cy="35"
              rx="35"
              ry="25"
              fill="#FF7F50"
              stroke="#222089"
              strokeWidth="3"
            />
            <path
              d="M 23 45 Q 44 48 55 38"
              stroke="#222089"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35"
              fill="#FF7F50"
              stroke="#222089"
              strokeWidth="3"
            />

            <circle
              cx="45"
              cy="30"
              r="8"
              fill="white"
              stroke="#222089"
              strokeWidth="2"
            />
            <circle cx="45" cy="30" r="4" fill="#222089" />
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
      );
    }

    return null;
  };

  const renderPetPreview = (petType: "fish" | "seal") => {
    if (petType === "seal") {
      return (
        <svg
          viewBox="0 0 120 100"
          className="w-20 h-20"
          xmlns="http://www.w3.org/2000/svg"
        >
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
          <ellipse
            cx="58"
            cy="88"
            rx="9"
            ry="7"
            fill="#9BB7BD"
            stroke="#5C6F75"
            strokeWidth="2"
          />
          <path
            d="M 22 52 Q 18 91 49 88 Q 101 96 108 77 Q 112 51 74.5 50.5 Q 71.5 17.5 47.5 17.5 Q 23.5 17.5 22 52"
            fill="#9BB7BD"
            stroke="#5C6F75"
            strokeWidth="3"
          />
          <circle cx="38" cy="40" r="5" fill="#222" />
          <circle cx="58" cy="40" r="5" fill="#222" />
          <circle cx="39.5" cy="38.5" r="2" fill="white" />
          <circle cx="59.5" cy="38.5" r="2" fill="white" />
          <ellipse cx="48" cy="52" rx="3" ry="2" fill="#444" />
          <path
            d="M 41 55 Q 45 60 48 54 Q 51 60 55 55"
            stroke="#444"
            strokeWidth="2"
            fill="none"
          />
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
      );
    }

    return (
      <svg
        viewBox="0 0 120 100"
        className="w-20 h-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18"
          fill="#0281A7"
          stroke="#222089"
          strokeWidth="3"
        />
        <ellipse
          cx="55"
          cy="35"
          rx="35"
          ry="25"
          fill="#FF7F50"
          stroke="#222089"
          strokeWidth="3"
        />
        <path
          d="M 23 45 Q 44 48 55 38"
          stroke="#222089"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35"
          fill="#FF7F50"
          stroke="#222089"
          strokeWidth="3"
        />
        <circle
          cx="45"
          cy="30"
          r="8"
          fill="white"
          stroke="#222089"
          strokeWidth="2"
        />
        <circle cx="45" cy="30" r="4" fill="#222089" />
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
    );
  };

  const handlePetSelect = async (type: string) => {
    const userIdFromSession = getSessionUserId();
    const userIdFromUser = extractMongoId(user?._id);
    const resolvedUserId = userIdFromSession || userIdFromUser;

    if (!resolvedUserId) {
      setPetSelectionError("Session expired. Please log in again.");
      return;
    }

    setSelectingPet(true);
    setPetSelectionError("");

    try {
      const response = await fetch(`${API_URL}/users/${resolvedUserId}/pet-selection`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      const rawText = await response.text();
      let data: { error?: string; user?: User; requiresPetSelection?: boolean } = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        setPetSelectionError(
          data.error ||
          `Failed to save pet choice (${response.status}). Please restart backend and try again.`
        );
        return;
      }

      if (data.user) {
        setUser(data.user);
      }

      setRequiresPetSelection(
        typeof data.requiresPetSelection === "boolean"
          ? data.requiresPetSelection
          : !hasPetType(data?.user?.petStats?.type)
      );
    } catch (error) {
      console.error("Error saving pet selection:", error);
      setPetSelectionError("Failed to save pet choice. Please try again.");
    } finally {
      setSelectingPet(false);
    }
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
    <div className="bg-neutral p-4 flex flex-col gap-4 relative">

      {requiresPetSelection && (
        <div className="fixed inset-0 bg-dark/80 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-lg border-4 border-secondary p-6 w-full max-w-lg text-center">
            <p className="text-2xl mb-1">✨ 🐾 ✨</p>
            <h3 className="text-dark text-2xl font-bold mb-2">Choose Your Companion</h3>
            <p className="text-dark/80 text-sm font-semibold mb-5">
              Tap your favorite buddy to begin your journey.
            </p>

            <div className="flex flex-row gap-3 w-full">
              {[
                { label: "Fish", value: "fish" },
                { label: "Seal", value: "seal" },
              ].map((petType) => (
                <div
                  key={petType.value}
                  role="button"
                  tabIndex={selectingPet ? -1 : 0}
                  onClick={() => handlePetSelect(petType.value)}
                  onKeyDown={(event) => {
                    if (!selectingPet && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      handlePetSelect(petType.value);
                    }
                  }}
                  className={`flex-1 min-w-0 rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all ${
                    selectingPet
                      ? "opacity-60 cursor-not-allowed border-gray-300"
                      : "cursor-pointer border-primary-light hover:border-primary-base hover:bg-primary-light/10"
                  }`}
                >
                  <div className="mb-2">{renderPetPreview(petType.value as "fish" | "seal")}</div>
                  <p className="text-dark font-bold text-lg">{petType.label}</p>
                </div>
              ))}
            </div>

            {petSelectionError && (
              <p className="text-red-600 text-sm font-semibold mt-4">{petSelectionError}</p>
            )}

            {selectingPet && (
              <p className="text-dark text-sm font-semibold mt-4">Saving your pet...</p>
            )}
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <div className="montserrat-alternates mb-2">
        <h2 className="text-dark text-2xl font-bold min-[420px]:text-3xl min-[420px]:font-semibold tracking-wider">
          Welcome Back, {user.username}!
        </h2>
      </div>

      {/* PET SECTION */}
      <div className="border-4 border-dark rounded-2xl overflow-hidden flex h-48 relative">
        {/* Left side (scene with pet) */}
        <div className="relative flex-1 bg-primary-light/20 flex items-end justify-center pb-8">
          {/* Sun */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-accent-1 rounded-full"></div>

          {/* Ground/Grass */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-accent-3 rounded-bl-xl"></div>

          {renderPetCharacter()}
        </div>

        {/* Right side (Pet Stats) */}
        <div className="bg-accent-2 flex flex-col items-center justify-start py-4 px-4 w-2/5">
          <h2 className="text-xl font-bold text-dark">{getSelectedPetName()} Stats</h2>

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
            <h3 className="montserrat-alternates text-highlight text-2xl min-[410px]:text-3xl font-semibold">
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
              <span className="text-3xl min-[410px]:text-4xl font-semibold text-dark underline decoration-2 underline-offset-4">
                {grapesCount}
              </span>
              <span className="text-2xl min-[410px]:text-3xl font-semibold text-highlight ml-2">
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
            className="text-highlight text-lg min-[410px]:text-xl font-semibold whitespace-nowrap"
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
            <h3 className="montserrat-alternates text-highlight text-2xl min-[410px]:text-3xl font-semibold">
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
            <span className="text-xl min-[410px]:text-2xl font-semibold text-dark border-b-2 border-dark pb-1">
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
            className="text-highlight text-lg min-[410px]:text-xl font-semibold whitespace-nowrap"
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