import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import orangeImg from "../assets/orange.png";
import config from "../config";
import { useToast } from "../hooks/useToast";
import { fireConfetti } from "../hooks/useConfetti";
import { formatFriendlyDateTime } from "../utils/date";
import { extractMongoId, getStoredUserId } from "../utils/userId";
import { LEVEL_THRESHOLDS, MAX_LEVEL, isSameUTCDay, getDerivedPetStatus } from "../utils/pet";
import PetCharacter from "./pet/PetCharacter";
import PetPreview from "./pet/PetPreview";
import Toast from "./Toast";

/**
 * Home — the main authenticated dashboard.
 *
 * Responsibilities:
 *  - Fetches and displays the user's pet, streak, GRAPES summary, and CogTri summary.
 *  - Manages the pet-selection modal on first login.
 *  - Drives the activity calendar with per-month lazy fetching.
 *  - Falls back to a localStorage cache snapshot when the network is unavailable.
 */

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
  // Increments every minute so getDerivedPetStatus re-runs without a network call,
  // allowing the pet to flip happy → neutral at midnight automatically.
  const [, setTick] = useState(0);
  // Separate controller for calendar fetches so rapid month navigation cancels
  // the previous in-flight request instead of letting responses arrive out of order.
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

  useEffect(() => {
    return () => { calendarControllerRef.current?.abort(); };
  }, []);

  /** Returns true when the user has an actual pet type set (non-empty string). */
  const hasPetType = (type?: string | null) => {
    if (typeof type !== "string") return false;
    return type.trim().length > 0;
  };

  /**
   * Validates the session, loads all dashboard data, and seeds the offline cache.
   * On network failure, falls back to the last-good localStorage snapshot so the
   * user can still see their data without an error screen.
   *
   * AbortErrors are swallowed silently — they are expected from React StrictMode's
   * double-mount in development, where the first mount is immediately unmounted and
   * its request aborted before the second mount completes normally.
   */
  const checkAuthAndFetchData = async (signal: AbortSignal) => {
    const userId = getStoredUserId();

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
          setTimeout(() => navigate("/user/login"), 1500);
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

      const streak = data.user?.streak ?? 0;
      const milestones = [7, 14, 30];
      // sessionStorage (not localStorage) so the celebration fires once per browser
      // session but resets on the next visit — the user sees it again next milestone.
      const sessionKey = `fp_streak_celebrated_${streak}`;
      if (milestones.includes(streak) && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");
        setTimeout(() => fireConfetti("big"), 600);
        setTimeout(() => showToast(`🔥 ${streak}-day streak! Amazing!`, "success"), 700);
      }

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
      setLoading(false);
    } catch (error) {
      // Don't set loading=false on abort — the component is unmounting and a
      // second fetch (StrictMode remount) will complete normally.
      if (error instanceof DOMException && error.name === "AbortError") return;

      // Try to load cached snapshot before showing an error
      try {
        const cached = localStorage.getItem(`fp_cache_${userId}`);
        if (cached) {
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
        } else {
          showToast("Failed to load data. Please try again.", "error");
        }
      } catch {
        showToast("Failed to load data. Please try again.", "error");
      }
      setLoading(false);
    }
  };

  /** Fetches activity dates for a given month, aborting any previous in-flight request. */
  const fetchCalendarDates = async (month: number, year: number) => {
    calendarControllerRef.current?.abort();
    const controller = new AbortController();
    calendarControllerRef.current = controller;

    const userId = getStoredUserId();
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
    const userId = getStoredUserId();
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
        fireConfetti("big");
      }

      setTimeout(() => setFeedAnim("idle"), 1500);
    } catch {
      showToast("Failed to feed pet. Check your connection.", "error");
      setFeedAnim("idle");
    }
  };

  /** True when the calendar is showing the current month — disables the "next" arrow. */
  const isCurrentMonth = () => {
    const today = new Date();
    return viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  /** True when the calendar has reached the 3-month lookback limit — disables "prev". */
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

  // Derived each render — the minute-tick state forces a re-render so the mood
  // can flip at midnight without waiting for a page reload or network call.
  const petStatus = getDerivedPetStatus(user?.petStats?.lastFed);

  /** Returns a mood-appropriate message for the pet stats bar. */
  const getPetMessage = () => {
    if (!hasPetType(user?.petStats?.type)) {
      return "Choose your pet to start your journey!";
    }
    if (petStatus === "happy") return "Your pet is feeling great! Keep up the good work :)";
    if (petStatus === "sad") return "Your pet is sad. Feed them and complete more activities!";
    return "Your pet is neutral. Keep working on your mental health!";
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
    return (Date.now() - new Date(lastFed).getTime()) < 12 * 60 * 60 * 1000;
  };

  const petLevel = user?.petStats?.level ?? 1;
  const petXP = user?.petStats?.experience ?? 0;
  const isMaxLevel = petLevel >= MAX_LEVEL;
  const xpInLevel = isMaxLevel ? 0 : petXP - LEVEL_THRESHOLDS[petLevel];
  const xpForLevel = isMaxLevel ? 1 : LEVEL_THRESHOLDS[petLevel + 1] - LEVEL_THRESHOLDS[petLevel];
  const xpPercent = isMaxLevel ? 100 : Math.min(100, (xpInLevel / xpForLevel) * 100);

  const handlePetSelect = async (type: string) => {
    // Dual-source ID: localStorage is the primary, but if there's a race where
    // the session key was cleared between dashboard load and pet selection,
    // fall back to the ID that arrived in the dashboard API response.
    const userIdFromSession = getStoredUserId();
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
        <div className="text-center bg-surface rounded-2xl shadow-lg p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-ink text-xl font-semibold mb-4">
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

  const grapesIsToday = latestGrapes?.date ? isSameUTCDay(new Date(latestGrapes.date), new Date()) : false;
  const grapesTodayStatus = grapesIsToday ? (latestGrapes?.completed ? "done" : "partial") : null;

  const cogtriIsToday = latestCogTri?.date ? isSameUTCDay(new Date(latestCogTri.date), new Date()) : false;
  const cogtriTodayStatus = cogtriIsToday ? (latestCogTri?.complete ? "done" : "partial") : null;

  return (
    <div className="bg-neutral p-4 pb-24 flex flex-col gap-4 relative">
      <Toast message={message} type={type} visible={visible} />

      {requiresPetSelection && (
        <div className="fixed inset-0 bg-dark/80 z-50 flex items-center justify-center p-6">
          <div className="bg-surface rounded-3xl shadow-lg border-4 border-secondary p-6 w-full max-w-lg text-center">
            <p className="text-2xl mb-1">✨ 🐾 ✨</p>
            <h3 className="text-ink text-2xl font-bold mb-2">Choose Your Companion</h3>
            <p className="text-ink/80 text-sm font-semibold mb-5">
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
                      ? "opacity-60 cursor-not-allowed border-line"
                      : "cursor-pointer border-primary-light hover:border-primary-base hover:bg-primary-light/10"
                  }`}
                >
                  <div className="mb-2"><PetPreview type={petType.value as "fish" | "seal"} /></div>
                  <p className="text-ink font-bold text-lg">{petType.label}</p>
                </div>
              ))}
            </div>

            {petSelectionError && (
              <p className="text-red-600 text-sm font-semibold mt-4">{petSelectionError}</p>
            )}

            {selectingPet && (
              <p className="text-ink text-sm font-semibold mt-4">Saving your pet...</p>
            )}
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <div className="montserrat-alternates mb-2">
        <h2 className="text-ink text-2xl font-bold min-[420px]:text-3xl min-[420px]:font-semibold tracking-wider text-center">
          Welcome Back, {user.username}!
        </h2>
        {isOfflineCache && (
          <p className="text-xs font-semibold text-muted mt-0.5">
            Showing cached data — connect to refresh
          </p>
        )}
      </div>

      {/* PET SECTION — hero */}
      <div className="border-2 border-dark/10 dark:border-ink/10 rounded-3xl overflow-hidden relative fp-card">
        {/* Immersive scene — daytime in light, moonlit night in dark */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-b from-[#BDEAF2] via-primary-light/25 to-accent-2/40 dark:from-[#0c1230] dark:via-[#161d3f] dark:to-[#243056]">
          {/* Sun by day → whitish-blue moon by night */}
          <div className="absolute top-5 right-6 w-14 h-14 rounded-full bg-accent-1 shadow-[0_0_45px_14px_rgba(248,110,46,0.35)] dark:bg-[#cdd9f0] dark:shadow-[0_0_45px_14px_rgba(205,217,240,0.30)]" />

          {/* Drifting clouds */}
          <div className="fp-drift absolute top-7 left-6 w-16 h-5 bg-white/80 rounded-full blur-[1px]" />
          <div className="fp-drift-slow absolute top-14 left-20 w-11 h-4 bg-white/60 rounded-full blur-[1px]" />
          <div className="fp-drift-slow absolute top-4 right-24 w-12 h-4 bg-white/50 rounded-full blur-[1px]" />

          {/* Back hill (depth) */}
          <div className="absolute -bottom-6 -left-10 -right-10 h-28 bg-accent-3/50 rounded-[100%_100%_0_0]" />
          {/* Mid hill */}
          <div className="absolute -bottom-4 -right-16 w-2/3 h-24 bg-accent-3/70 rounded-[100%_100%_0_0]" />
          {/* Front ground */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-accent-3" />
          {/* Ground highlight line */}
          <div className="absolute bottom-16 left-0 right-0 h-1 bg-white/20" />

          {/* Pet, standing on the ground */}
          <div className="absolute inset-0 flex items-end justify-center pb-6">
            <PetCharacter type={getSelectedPetType()} mood={petStatus} />
          </div>

          {/* Feed overlay — shows "Feeding..." then "Yum!" */}
          {feedAnim !== "idle" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-dark/40">
              <p className="text-highlight font-bold text-xl animate-pulse">
                {feedAnim === "feeding" ? "Feeding..." : "Yum! 😋"}
              </p>
            </div>
          )}

          {/* Orange — tappable, fades when already fed */}
          {hasPetType(user?.petStats?.type) && (
            <button
              onClick={handleFeed}
              disabled={fedToday || feedAnim === "feeding"}
              className={`absolute z-10 top-3 left-3 flex flex-col items-center gap-0.5 transition-opacity ${
                fedToday ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer active:scale-95"
              }`}
            >
              <img src={orangeImg} alt="Feed pet" className="w-11 h-11 drop-shadow" />
              <span className="text-[10px] font-bold text-dark dark:text-ink leading-none">
                {fedToday ? "Fed!" : "Feed"}
              </span>
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="bg-accent-2 dark:bg-accent-2/25 px-4 py-3">
          {hasPetType(user?.petStats?.type) ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">{getSelectedPetName()}</h2>
                  {!isMaxLevel && (
                    <span className="text-[11px] font-bold bg-ink/10 text-ink px-2 py-0.5 rounded-full">
                      Lv. {petLevel}
                    </span>
                  )}
                  {isMaxLevel && (
                    <span className="text-[11px] font-bold bg-accent-1 text-white px-2 py-0.5 rounded-full">
                      MAX
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold capitalize px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    petStatus === "happy"
                      ? "bg-accent-3/30 text-green-700 dark:text-green-300"
                      : petStatus === "sad"
                      ? "bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-300"
                      : "bg-gray-200 dark:bg-ink/10 text-gray-500 dark:text-muted"
                  }`}
                >
                  ● {petStatus}
                </span>
              </div>

              {/* XP bar */}
              {!isMaxLevel && (
                <div>
                  <div className="flex justify-between text-[10px] text-ink/60 mb-1">
                    <span>XP</span>
                    <span>{xpInLevel} / {xpForLevel}</span>
                  </div>
                  <div className="w-full bg-ink/10 rounded-full h-2">
                    <div
                      className="bg-accent-1 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <p className="text-[11px] font-semibold text-ink/70 leading-tight mt-2 text-center">
                {getPetMessage()}
              </p>
            </>
          ) : (
            <div className="text-center py-1">
              <h2 className="text-lg font-bold text-ink">{getSelectedPetName()}</h2>
              <p className="text-xs font-semibold text-ink/70 leading-relaxed mt-1">
                {getPetMessage()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S GRAPES CARD */}
      <div className="bg-secondary/60 dark:bg-secondary/20 rounded-2xl px-5 py-5 flex items-start fp-card">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="montserrat-alternates text-ink text-2xl min-[410px]:text-3xl font-semibold">
                Last GRAPES
              </h3>
              {grapesTodayStatus === "done" && (
                <span className="text-[10px] font-bold bg-accent-3 text-white px-2 py-0.5 rounded-full">Done ✓</span>
              )}
              {grapesTodayStatus === "partial" && (
                <span className="text-[10px] font-bold bg-yellow-400 text-dark px-2 py-0.5 rounded-full">Partial</span>
              )}
              {grapesTodayStatus === null && (
                <span className="text-[10px] font-bold bg-ink/10 text-ink/60 px-2 py-0.5 rounded-full">Not yet</span>
              )}
            </div>
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
                className="w-5 h-5 opacity-50"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="0.5" fill="#222089" />
              </svg>
            </button>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-3xl min-[410px]:text-4xl font-semibold text-ink underline decoration-2 underline-offset-4">
                {grapesCount}
              </span>
              <span className="text-2xl min-[410px]:text-3xl font-semibold text-ink/40 ml-2">
                / 6
              </span>
            </div>

            <span className="text-xs font-semibold text-ink/60">
              {latestGrapes?.date ? formatFriendlyDateTime(latestGrapes.date) : "No entries yet"}
            </span>

          </div>
        </div>

        {/* Divider Line */}
        <div className="w-[2px] h-24 bg-ink/10 mx-4"></div>

        {/* Right Section */}
        <div className="flex flex-col items-center justify-center self-stretch">
          {/* Grape Icon */}
          <Link to="/grapes" aria-label="Open GRAPES">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              fill="#A86FC4"
              className="w-16 h-16"
            >
              <circle cx="32" cy="18" r="5" />
              <circle cx="23" cy="24" r="5" />
              <circle cx="41" cy="24" r="5" />
              <circle cx="32" cy="30" r="5" />
              <circle cx="23" cy="36" r="5" />
              <circle cx="41" cy="36" r="5" />
              <circle cx="32" cy="42" r="5" />
              <path d="M30 8c0-3 4-6 8-4-2 2-4 3-4 6z" fill="#A86FC4" />
            </svg>
          </Link>
        </div>
      </div>

      {/* LAST COG TRI CARD */}
      <div className="bg-primary-light/40 dark:bg-primary-light/20 rounded-2xl px-5 py-5 flex items-start fp-card">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="montserrat-alternates text-ink text-2xl min-[410px]:text-3xl font-semibold">
                Last COG TRI
              </h3>
              {cogtriTodayStatus === "done" && (
                <span className="text-[10px] font-bold bg-accent-3 text-white px-2 py-0.5 rounded-full">Done ✓</span>
              )}
              {cogtriTodayStatus === "partial" && (
                <span className="text-[10px] font-bold bg-yellow-400 text-dark px-2 py-0.5 rounded-full">Partial</span>
              )}
              {cogtriTodayStatus === null && (
                <span className="text-[10px] font-bold bg-ink/10 text-ink/60 px-2 py-0.5 rounded-full">Not yet</span>
              )}
            </div>
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
                className="w-5 h-5 opacity-50"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="0.5" fill="#222089" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xl min-[410px]:text-2xl font-semibold text-ink border-b-2 border-ink/30 pb-1 flex-1 min-w-0 truncate">
              {latestCogTri?.situation || "No recent entries"}
            </span>
            <span className="text-xs font-semibold text-ink/60 shrink-0">
              {latestCogTri?.date ? formatFriendlyDateTime(latestCogTri.date) : "No entries yet"}
            </span>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-[2px] h-24 bg-ink/10 mx-4"></div>

        {/* Right Section */}
        <div className="flex flex-col items-center justify-center self-stretch">
          {/* Triangle Icon */}
          <Link to="/cogtri" aria-label="Open CogTri">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              fill="#0281A7"
              className="w-16 h-16"
            >
              <polygon points="32,15 8,52 56,52" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Calendar and Streak Section */}
      <div className="flex gap-3 items-stretch">

        {/* Streak */}
        <div className="bg-accent-2/80 px-4 py-4 rounded-2xl w-[36%] flex flex-col fp-card">
          <div className="font-bold text-xl min-[410px]:text-2xl text-accent-1 leading-tight mb-2">
            {user.streak === 0
              ? "Start today!"
              : user.streak === 1
              ? "Keep going!"
              : "On a roll!"}
          </div>
          {/* Divider Line */}
          <div className="w-full h-[2px] my-2 bg-accent-1"></div>
          {/* Number of Days */}
          <div className="flex items-baseline gap-1 text-accent-1">
            <p className="font-extrabold text-5xl min-[410px]:text-6xl leading-none">{user.streak}</p>
            <p className="font-bold text-lg">days</p>
          </div>
          {/* Fire Emoji */}
          <div className="mt-auto pt-3">
            <span className="text-6xl">🔥</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-highlight dark:bg-surface rounded-2xl flex-1 p-3 fp-card flex flex-col">
          <div className="flex items-center justify-between bg-primary-light rounded-xl px-2 py-2 mb-2">
            <button
              onClick={handlePrevMonth}
              disabled={isThreeMonthsBack()}
              className={`text-base px-2 font-bold transition-opacity ${isThreeMonthsBack() ? "opacity-20 cursor-not-allowed" : "text-highlight active:opacity-60"}`}
            >
              ◀
            </button>
            <h2 className="text-xs min-[410px]:text-sm font-bold text-highlight text-center flex-1">
              {new Date(viewYear, viewMonth).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth()}
              className={`text-base px-2 font-bold transition-opacity ${isCurrentMonth() ? "opacity-20 cursor-not-allowed" : "text-highlight active:opacity-60"}`}
            >
              ▶
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted mb-1">
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
              <div className="text-center text-xs text-muted py-4">Loading...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = showingCurrentMonth && day === today.getDate();
                  const isActive = activeDays.has(day);
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-md ${isActive
                        ? "bg-primary-light text-highlight"
                        : isToday
                        ? "bg-accent-1/30 text-ink"
                        : "bg-gray-100 dark:bg-surface-2 text-gray-400 dark:text-muted"
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
