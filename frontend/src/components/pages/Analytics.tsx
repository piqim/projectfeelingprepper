import { useState, useEffect } from "react";
import config from "../../config";

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

const Analytics = () => {
  const API_URL = config.API_URL;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`${API_URL}/analytics/${userId}`);
        if (response.ok) {
          setData(await response.json());
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-dark text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center px-6">
        <p className="text-dark text-center text-sm">{error || "No data available."}</p>
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
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-bold text-dark text-lg">No data yet</p>
          <p className="text-sm text-gray-500 mt-1">Start using GRAPES and CogTri to see your stats here.</p>
        </div>
      ) : (
        <>
          {/* Streak Stats */}
          <div className="bg-white rounded-2xl p-4">
            <h2 className="font-bold text-dark text-base mb-3">Streak Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-primary-light">{data.longestStreak}</p>
                <p className="text-xs text-dark/60 mt-1">Longest streak</p>
              </div>
              <div className="bg-neutral rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-primary-light">{data.totalActiveDaysThisYear}</p>
                <p className="text-xs text-dark/60 mt-1">Active days this year</p>
              </div>
            </div>
          </div>

          {/* Entry Totals */}
          <div className="bg-white rounded-2xl p-4">
            <h2 className="font-bold text-dark text-base mb-3">Total Entries</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-dark">{data.totalGrapesEntries}</p>
                <p className="text-xs text-dark/60 mt-1">GRAPES entries</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-dark">{data.totalCogtriEntries}</p>
                <p className="text-xs text-dark/60 mt-1">CogTri entries</p>
              </div>
            </div>
          </div>

          {/* GRAPES Category Breakdown */}
          {data.totalGrapesEntries > 0 && (
            <div className="bg-white rounded-2xl p-4">
              <h2 className="font-bold text-dark text-base mb-1">GRAPES Breakdown</h2>
              <p className="text-xs text-dark/50 mb-4">How often each category has been filled</p>
              <div className="flex flex-col gap-3">
                {Object.entries(data.grapesCategoryCounts).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-dark">{CATEGORY_LABELS[cat]}</span>
                      <span className="text-xs text-dark/50">{count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-light rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((count / maxGrapesCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CogTri Weekly Frequency */}
          {data.totalCogtriEntries > 0 && (
            <div className="bg-white rounded-2xl p-4">
              <h2 className="font-bold text-dark text-base mb-1">CogTri Frequency</h2>
              <p className="text-xs text-dark/50 mb-4">Entries per week over the last 4 weeks</p>
              <div className="flex items-end justify-around gap-2 h-28">
                {data.weeklyCogtri.map((count, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-bold text-dark">{count}</span>
                    <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: "80px" }}>
                      <div
                        className="w-full bg-secondary rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.round((count / maxWeekly) * 80)}px`, marginTop: `${80 - Math.round((count / maxWeekly) * 80)}px` }}
                      />
                    </div>
                    <span className="text-xs text-dark/50 text-center leading-tight">{weekLabels[i]}</span>
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
