import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type Tab = "terms" | "privacy";

const Legal = () => {
  const [activeTab, setActiveTab] = useState<Tab>("terms");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "privacy") setActiveTab("privacy");
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setText("");
    const url =
      activeTab === "terms"
        ? "/terms-and-conditions.txt"
        : "/privacy-policy.txt";

    fetch(url)
      .then((res) => res.text())
      .then((data) => {
        setText(data);
        setLoading(false);
      })
      .catch(() => {
        setText("Unable to load this document. Please try again later.");
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      {/* Header */}
      <div className="bg-primary-light px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
        <button
          onClick={() => navigate(-1)}
          className="text-highlight p-1 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-highlight montserrat-alternates flex-1">
          Legal
        </h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b-2 border-line bg-surface flex-shrink-0">
        <button
          onClick={() => setActiveTab("terms")}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${
            activeTab === "terms"
              ? "text-primary-light border-b-2 border-primary-light -mb-0.5"
              : "text-muted hover:text-ink"
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${
            activeTab === "privacy"
              ? "text-primary-light border-b-2 border-primary-light -mb-0.5"
              : "text-muted hover:text-ink"
          }`}
        >
          Privacy Policy
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <pre className="text-xs text-ink whitespace-pre-wrap font-sans leading-relaxed">
            {text}
          </pre>
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 py-3 bg-surface border-t border-line flex-shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <p className="text-xs text-muted text-center">
          Contact{" "}
          <span className="text-primary-light font-semibold">
            mbinburhanuddin@gmail.com
          </span>{" "}
          with any questions.
        </p>
      </div>
    </div>
  );
};

export default Legal;
