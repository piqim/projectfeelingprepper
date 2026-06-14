import { useState, useEffect, useRef } from "react";
import config from "../../config";
import { authHeaders } from "../../utils/auth";

interface AnalyticsData {
  longestStreak: number;
  totalActiveDaysThisYear: number;
  grapesCategoryCounts: Record<string, number>;
  weeklyCogtri: number[];
  totalGrapesEntries: number;
  totalCogtriEntries: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  gentle: "Gentle",
  recreation: "Recreation",
  accomplishment: "Accomplishment",
  pleasure: "Pleasure",
  exercise: "Exercise",
  social: "Social",
};

const CATEGORY_COLORS: Record<string, string> = {
  gentle:        "bg-secondary",
  recreation:    "bg-accent-1",
  accomplishment:"bg-accent-3",
  pleasure:      "bg-accent-2",
  exercise:      "bg-primary-light",
  social:        "bg-primary-base",
};

const Analytics = () => {
  const API_URL = config.API_URL;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`${API_URL}/analytics/${userId}`, { headers: authHeaders() });
        if (response.ok) {
          setData(await response.json());
          animRef.current = setTimeout(() => setAnimated(true), 100);
        } else {
          setError("Failed to load analytics.");
        }
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalytics();
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-ink text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center px-6">
        <p className="text-ink text-center text-sm">{error || "No data available."}</p>
      </div>
    );
  }

  const hasAnyData = data.totalGrapesEntries > 0 || data.totalCogtriEntries > 0;

  const maxGrapesCount = Math.max(...Object.values(data.grapesCategoryCounts), 1);
  const maxWeekly = Math.max(...data.weeklyCogtri, 1);

  const weekLabels = ["This week", "Last week", "2 wks ago", "3 wks ago"];

  return (
    <div className="min-h-dvh bg-neutral flex flex-col pb-24">
      {/* Header */}
      <div className="bg-primary-light p-4 text-center">
        <h1 className="text-2xl font-bold text-highlight montserrat-alternates">Analytics</h1>
        <p className="text-sm text-highlight/80 mt-1">Your progress at a glance</p>
      </div>

      <div className="flex flex-col gap-4 p-4">
      {!hasAnyData ? (
        <div className="bg-surface rounded-2xl p-8 text-center flex flex-col items-center">
          <div className="fp-bob mb-2">
            <svg viewBox="0 0 120 100" className="w-24 h-24" xmlns="http://www.w3.org/2000/svg">
              <path d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18" fill="#0281A7" stroke="#222089" strokeWidth="3" />
              <ellipse cx="55" cy="35" rx="35" ry="25" fill="#FF7F50" stroke="#222089" strokeWidth="3" />
              <path d="M 23 45 Q 44 48 55 38" stroke="#222089" strokeWidth="2" fill="none" />
              <path className="fp-tailwag" d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35" fill="#FF7F50" stroke="#222089" strokeWidth="3" />
              <circle cx="45" cy="30" r="8" fill="white" stroke="#222089" strokeWidth="2" />
              <ellipse className="fp-blink" cx="45" cy="30" rx="4" ry="4" fill="#222089" />
            </svg>
          </div>
          <p className="font-bold text-ink text-lg">No stats yet!</p>
          <p className="text-sm text-muted mt-1">Start using GRAPES and CogTri — your progress will show up here.</p>
        </div>
      ) : (
        <>
          {/* Streak Stats */}
          <div className="bg-surface rounded-2xl p-4">
            <h2 className="font-bold text-ink text-base mb-3">Streak Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-primary-light">{data.longestStreak}</p>
                <p className="text-xs text-ink/60 mt-1">Longest streak</p>
              </div>
              <div className="bg-neutral rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-primary-light">{data.totalActiveDaysThisYear}</p>
                <p className="text-xs text-ink/60 mt-1">Active days this year</p>
              </div>
            </div>
          </div>

          {/* Entry Totals */}
          <div className="bg-surface rounded-2xl p-4">
            <h2 className="font-bold text-ink text-base mb-3">Total Entries</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-ink">{data.totalGrapesEntries}</p>
                <p className="text-xs text-ink/60 mt-1">GRAPES entries</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-ink">{data.totalCogtriEntries}</p>
                <p className="text-xs text-ink/60 mt-1">CogTri entries</p>
              </div>
            </div>
          </div>

          {/* GRAPES Category Breakdown */}
          {data.totalGrapesEntries > 0 && (
            <div className="bg-surface rounded-2xl p-4">
              <h2 className="font-bold text-ink text-base mb-1">GRAPES Breakdown</h2>
              <p className="text-xs text-ink/50 mb-4">How often each category has been filled</p>
              <div className="flex flex-col gap-3">
                {Object.entries(data.grapesCategoryCounts).map(([cat, count], i) => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-ink">{CATEGORY_LABELS[cat]}</span>
                      <span className="text-xs text-ink/50">{count}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${CATEGORY_COLORS[cat] ?? "bg-primary-light"}`}
                        style={{
                          width: animated ? `${Math.round((count / maxGrapesCount) * 100)}%` : "0%",
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CogTri Weekly Frequency */}
          {data.totalCogtriEntries > 0 && (
            <div className="bg-surface rounded-2xl p-4">
              <h2 className="font-bold text-ink text-base mb-1">CogTri Frequency</h2>
              <p className="text-xs text-ink/50 mb-4">Entries per week over the last 4 weeks</p>
              <div className="flex items-end justify-around gap-2 h-28">
                {data.weeklyCogtri.map((count, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-bold text-ink">{count}</span>
                    <div className="w-full bg-gray-100 dark:bg-surface-2 rounded-t-lg overflow-hidden" style={{ height: "80px" }}>
                      <div
                        className="w-full bg-primary-light rounded-t-lg transition-all duration-700"
                        style={{
                          height: animated ? `${Math.round((count / maxWeekly) * 80)}px` : "0px",
                          marginTop: animated ? `${80 - Math.round((count / maxWeekly) * 80)}px` : "80px",
                          transitionDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-ink/50 text-center leading-tight">{weekLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Analytics;
