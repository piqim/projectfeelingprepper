import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";
import { useToast } from "../hooks/useToast";
import Toast from "./Toast";

// Mirrored from backend — keeps XP bar in sync without an extra fetch
const LEVEL_THRESHOLDS = [0, 0, 50, 120, 220, 350, 520, 730, 990, 1300, 1670];
const MAX_LEVEL = 10;

interface User {
  _id: string;
  username: string;
  email: string;
  streak: number;
  petStats?: {
    type?: string | null;
    status: "happy" | "neutral" | "sad";
    lastFed?: string | null;
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

const isSameUTCDay = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const getDerivedPetStatus = (lastFed?: string | Date | null): "happy" | "neutral" | "sad" => {
  if (!lastFed) return "sad";
  const now = new Date();
  const fed = new Date(lastFed);
  if (isSameUTCDay(fed, now)) return "happy";
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (isSameUTCDay(fed, yesterday)) return "neutral";
  return "sad";
};

const Home = () => {
  const navigate = useNavigate();
  const { message, type, visible, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [requiresPetSelection, setRequiresPetSelection] = useState(false);
  const [selectingPet, setSelectingPet] = useState(false);
  const [petSelectionError, setPetSelectionError] = useState("");
  const [latestGrapes, setLatestGrapes] = useState<GrapesEntry | null>(null);
  const [latestCogTri, setLatestCogTri] = useState<CogTriEntry | null>(null);
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [feedAnim, setFeedAnim] = useState<"idle" | "feeding" | "done">("idle");
  const [isOfflineCache, setIsOfflineCache] = useState(false);
  // Increments every minute to re-derive pet status without a network call
  const [, setTick] = useState(0);
  const calendarControllerRef = useRef<AbortController | null>(null);

  const API_URL = config.API_URL;

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    checkAuthAndFetchData(controller.signal);
    return () => controller.abort();
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

  const checkAuthAndFetchData = async (signal: AbortSignal) => {
    const userId = getSessionUserId();

    if (!userId) {
      localStorage.removeItem("userId");
      setLoading(false);
      navigate("/user/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/dashboard/${userId}`, { signal });

      if (!response.ok) {
        if (response.status === 404) {
          localStorage.removeItem("userId");
          sessionStorage.removeItem("sessionVerified");
          showToast("User not found. Please log in again.", "error");
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

      // Persist dashboard snapshot for offline use
      localStorage.setItem(
        `fp_cache_${userId}`,
        JSON.stringify({
          user: data.user,
          latestGrapes: data.latestGrapes,
          latestCogTri: data.latestCogTri,
          activityDates: data.activityDates,
          cachedAt: new Date().toISOString(),
        })
      );

      setIsOfflineCache(false);
      setUser(data.user);
      setRequiresPetSelection(
        typeof data.requiresPetSelection === "boolean"
          ? data.requiresPetSelection
          : !hasPetType(data?.user?.petStats?.type)
      );
      setLatestGrapes(data.latestGrapes);
      setLatestCogTri(data.latestCogTri);

      if (Array.isArray(data.activityDates)) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const todayDate = today.getDate();

        const days = new Set<number>(
          data.activityDates
            .map((d: string) => new Date(d))
            .filter((d: Date) => d.getMonth() === currentMonth && d.getFullYear() === currentYear && d.getDate() <= todayDate)
            .map((d: Date) => d.getDate())
        );
        setActiveDays(days);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      // Try to load cached snapshot before showing an error
      const cached = localStorage.getItem(`fp_cache_${userId}`);
      if (cached) {
        try {
          const snap = JSON.parse(cached);
          setUser(snap.user);
          setRequiresPetSelection(!hasPetType(snap.user?.petStats?.type));
          setLatestGrapes(snap.latestGrapes);
          setLatestCogTri(snap.latestCogTri);
          setIsOfflineCache(true);

          if (Array.isArray(snap.activityDates)) {
            const today = new Date();
            const days = new Set<number>(
              snap.activityDates
                .map((d: string) => new Date(d))
                .filter((d: Date) => d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && d.getDate() <= today.getDate())
                .map((d: Date) => d.getDate())
            );
            setActiveDays(days);
          }
        } catch {
          showToast("Failed to load data. Please try again.", "error");
        }
      } else {
        showToast("Failed to load data. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarDates = async (month: number, year: number) => {
    calendarControllerRef.current?.abort();
    const controller = new AbortController();
    calendarControllerRef.current = controller;

    const userId = getSessionUserId();
    if (!userId) return;

    setCalendarLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/activity-dates/${userId}?month=${month}&year=${year}`,
        { signal: controller.signal }
      );
      if (!response.ok) return;
      const data = await response.json();

      const today = new Date();
      const isCurrentMonthView = month === today.getMonth() && year === today.getFullYear();

      const days = new Set<number>(
        (data.activityDates as string[])
          .map((d) => new Date(d))
          .filter((d) => {
            if (d.getMonth() !== month || d.getFullYear() !== year) return false;
            if (isCurrentMonthView && d.getDate() > today.getDate()) return false;
            return true;
          })
          .map((d) => d.getDate())
      );
      setActiveDays(days);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Error fetching calendar dates:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleFeed = async () => {
    const userId = getSessionUserId();
    if (!userId || feedAnim === "feeding") return;

    setFeedAnim("feeding");
    try {
      const response = await fetch(`${API_URL}/users/${userId}/pet-feed`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to feed pet", "error");
        setFeedAnim("idle");
        return;
      }

      if (data.alreadyFed) {
        showToast("Already fed today!", "info");
        setFeedAnim("idle");
        return;
      }

      setUser(prev =>
        prev ? { ...prev, petStats: { ...prev.petStats!, ...data.petStats } } : prev
      );
      setFeedAnim("done");

      if (data.leveledUp) {
        showToast(`Your pet leveled up to Lv. ${data.newLevel}!`, "success");
      }

      setTimeout(() => setFeedAnim("idle"), 1500);
    } catch {
      showToast("Failed to feed pet. Check your connection.", "error");
      setFeedAnim("idle");
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  const isThreeMonthsBack = () => {
    const today = new Date();
    const limit = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const viewing = new Date(viewYear, viewMonth, 1);
    return viewing <= limit;
  };

  const handlePrevMonth = () => {
    if (isThreeMonthsBack()) return;
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewMonth(newMonth);
    setViewYear(newYear);
    setActiveDays(new Set());
    fetchCalendarDates(newMonth, newYear);
  };

  const handleNextMonth = () => {
    if (isCurrentMonth()) return;
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewMonth(newMonth);
    setViewYear(newYear);
    setActiveDays(new Set());
    fetchCalendarDates(newMonth, newYear);
  };

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

  // Derived each render — tick state ensures it updates every minute
  const petStatus = getDerivedPetStatus(user?.petStats?.lastFed);

  const getPetMessage = () => {
    if (!hasPetType(user?.petStats?.type)) {
      return "Choose your pet to start your journey!";
    }
    if (petStatus === "happy") return "Your pet is feeling great! Keep up the good work :)";
    if (petStatus === "sad") return "Your pet is sad. Feed them and complete more activities!";
    return "Your pet is neutral. Keep working on your mental health!";
  };

  const getPetStatusColor = () => {
    if (petStatus === "happy") return "text-green-500";
    if (petStatus === "sad") return "text-red-500";
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
    return "No Pet Yet";
  };

  const isFedToday = () => {
    const lastFed = user?.petStats?.lastFed;
    if (!lastFed) return false;
    return isSameUTCDay(new Date(lastFed), new Date());
  };

  const petLevel = user?.petStats?.level ?? 1;
  const petXP = user?.petStats?.experience ?? 0;
  const isMaxLevel = petLevel >= MAX_LEVEL;
  const xpInLevel = isMaxLevel ? 0 : petXP - LEVEL_THRESHOLDS[petLevel];
  const xpForLevel = isMaxLevel ? 1 : LEVEL_THRESHOLDS[petLevel + 1] - LEVEL_THRESHOLDS[petLevel];
  const xpPercent = isMaxLevel ? 100 : Math.min(100, (xpInLevel / xpForLevel) * 100);

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

  if (loading) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center p-4">
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
  const fedToday = isFedToday();

  return (
    <div className="bg-neutral p-4 flex flex-col gap-4 relative">
      <Toast message={message} type={type} visible={visible} />

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
        {isOfflineCache && (
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Showing cached data — connect to refresh
          </p>
        )}
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

          {/* Feed overlay — shows "Feeding..." then "Yum!" */}
          {feedAnim !== "idle" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-dark/40 rounded-bl-xl">
              <p className="text-highlight font-bold text-lg">
                {feedAnim === "feeding" ? "Feeding..." : "Yum!"}
              </p>
            </div>
          )}

          {/* Orange — tappable, fades when already fed */}
          {hasPetType(user?.petStats?.type) && (
            <button
              onClick={handleFeed}
              disabled={fedToday || feedAnim === "feeding"}
              className={`absolute z-10 top-1 right-1 flex flex-col items-center gap-0.5 transition-opacity ${
                fedToday ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer active:scale-95"
              }`}
            >
              <img
                src="/src/assets/orange.png"
                alt="Feed pet"
                className="w-10 h-10"
              />
              <span className="text-[10px] font-bold text-dark leading-none">
                {fedToday ? "Fed!" : "Feed"}
              </span>
            </button>
          )}
        </div>

        {/* Right side (Pet Stats) */}
        <div className="bg-accent-2 flex flex-col items-center justify-start py-3 px-3 w-2/5">
          <h2 className="text-lg font-bold text-dark mb-1">{getSelectedPetName()}</h2>

          {hasPetType(user?.petStats?.type) ? (
            <>
              {/* Status */}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-semibold text-dark">Status:</span>
                <span className={`text-xs font-bold capitalize ${getPetStatusColor()}`}>
                  {petStatus}
                </span>
              </div>

              {/* XP bar */}
              <div className="w-full mt-1">
                {isMaxLevel ? (
                  <p className="text-center text-xs font-bold text-accent-1">MAX</p>
                ) : (
                  <>
                    <div className="flex justify-between text-[10px] text-dark/70 mb-1">
                      <span>Lv. {petLevel}</span>
                      <span>{xpInLevel} / {xpForLevel} XP</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1.5">
                      <div
                        className="bg-accent-1 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Message */}
              <p className="text-[10px] font-semibold text-center text-dark/80 leading-tight mt-2">
                {getPetMessage()}
              </p>
            </>
          ) : (
            <p className="text-xs font-semibold text-center text-dark/70 leading-relaxed mt-1">
              {getPetMessage()}
            </p>
          )}
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

      {/* Calendar and Streak Section */}
      <div className="flex gap-0 relative h-72">

        {/* Streak */}
        <div className="bg-accent-2 px-5 py-4 rounded-l-2xl w-[35%] relative z-5">
          <div className="font-bold text-2xl text-accent-1 leading-tight mb-2">
            {user.streak === 0
              ? "Start today!"
              : user.streak === 1
              ? "Keep going!"
              : "On a roll!"}
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
          <div className="flex items-center justify-between bg-primary-light rounded-tr-2xl px-2 py-3 mb-3 -ml-6 pl-8 pr-3">
            <button
              onClick={handlePrevMonth}
              disabled={isThreeMonthsBack()}
              className={`text-lg px-1 font-bold transition-opacity ${isThreeMonthsBack() ? "opacity-20 cursor-not-allowed" : "text-highlight active:opacity-60"}`}
            >
              ◀
            </button>
            <h2 className="text-sm font-bold text-highlight text-center flex-1">
              {new Date(viewYear, viewMonth).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth()}
              className={`text-lg px-1 font-bold transition-opacity ${isCurrentMonth() ? "opacity-20 cursor-not-allowed" : "text-highlight active:opacity-60"}`}
            >
              ▶
            </button>
          </div>
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
          {(() => {
            const today = new Date();
            const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
            const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            const showingCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();
            return calendarLoading ? (
              <div className="text-center text-xs text-gray-400 py-4">Loading...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold px-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = showingCurrentMonth && day === today.getDate();
                  const isActive = activeDays.has(day);
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded ${isActive
                        ? "bg-primary-light text-highlight"
                        : isToday
                        ? "bg-accent-1/30 text-dark"
                        : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
};

export default Home;
