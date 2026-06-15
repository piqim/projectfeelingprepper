import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { extractMongoId } from "../utils/userId";

/**
 * Register — new account creation form.
 *
 * Username requires a minimum of 3 characters (validated at submit); there is
 * no maximum length.
 *
 * On success, stores the normalized userId and redirects to Home.
 */
type ModalType = "terms" | "privacy" | null;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    notifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalText, setModalText] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  const { message, type, visible, showToast } = useToast();

  const API_URL = config.API_URL;

  const openModal = async (type: "terms" | "privacy") => {
    setModalType(type);
    setLoadingModal(true);
    setModalText("");
    const url =
      type === "terms" ? "/terms-and-conditions.txt" : "/privacy-policy.txt";
    try {
      const res = await fetch(url);
      const text = await res.text();
      setModalText(text);
    } catch {
      setModalText("Unable to load this document. Please try again later.");
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => setModalType(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setError("You must agree to the Terms and Conditions and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      // Create user via API (password will be hashed by backend)
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          notifications: formData.notifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const normalizedUserId = extractMongoId(data?.insertedId);

      if (!normalizedUserId) {
        setError("Registration succeeded but user ID is invalid. Please try logging in.");
        setLoading(false);
        return;
      }

      localStorage.setItem("userId", normalizedUserId);
      localStorage.setItem("fp_token", data.token);
      showToast("Account created successfully! Welcome to FeelingPrepper!", "success");

      // Brief delay so user sees the toast before redirect
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh bg-gradient-to-br from-secondary to-primary-light flex items-center justify-center p-8"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 2rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
      }}
    >
      <Toast message={message} type={type} visible={visible} />
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-highlight montserrat-alternates mb-1">
            FeelingPrepper
          </h1>
          <p className="text-dark/80 text-sm font-semibold">Meet your companions — pick one after you sign up!</p>
        </div>

        {/* Characters: Fish + Seal side by side */}
        <div className="flex justify-center items-end gap-4 mb-4">
          {/* Fish */}
          <div className="fp-bob flex flex-col items-center">
            <svg viewBox="0 0 120 100" className="w-24 h-24" xmlns="http://www.w3.org/2000/svg">
              <path d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18" fill="var(--color-secondary)" stroke="#222089" strokeWidth="3" />
              <ellipse cx="55" cy="35" rx="35" ry="25" fill="#FF7F50" stroke="#222089" strokeWidth="3" />
              <path d="M 23 45 Q 44 48 55 38" stroke="#222089" strokeWidth="2" fill="none" />
              <path className="fp-tailwag" d="M 85 35 Q 100 25, 95 35 Q 100 45, 85 35" fill="#FF7F50" stroke="#222089" strokeWidth="3" />
              <circle cx="45" cy="30" r="8" fill="white" stroke="#222089" strokeWidth="2" />
              <ellipse className="fp-blink" cx="45" cy="30" rx="4" ry="4" fill="#222089" />
              <path d="M 65 30 Q 70 35, 65 40" stroke="#222089" strokeWidth="2" fill="none" />
              <path d="M 70 32 Q 75 37, 70 42" stroke="#222089" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-xs font-bold text-highlight mt-1">Fish</span>
          </div>
          {/* Seal */}
          <div className="fp-bob flex flex-col items-center" style={{ animationDelay: "0.4s" }}>
            <svg viewBox="0 0 120 100" className="w-24 h-24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="25" cy="78" rx="8" ry="9" transform="rotate(30 25 78)" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
              <ellipse cx="110" cy="80" rx="7" ry="9" transform="rotate(105 110 78)" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
              <ellipse cx="58" cy="88" rx="9" ry="7" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="2" />
              <path d="M 22 52 Q 18 91 49 88 Q 101 96 108 77 Q 112 51 74.5 50.5 Q 71.5 17.5 47.5 17.5 Q 23.5 17.5 22 52" fill="#9BB7BD" stroke="#5C6F75" strokeWidth="3" />
              <circle cx="38" cy="40" r="5" fill="#222" />
              <circle cx="58" cy="40" r="5" fill="#222" />
              <circle cx="39.5" cy="38.5" r="2" fill="white" />
              <circle cx="59.5" cy="38.5" r="2" fill="white" />
              <ellipse cx="48" cy="52" rx="3" ry="2" fill="#444" />
              <path d="M 41 55 Q 45 60 48 54 Q 51 60 55 55" stroke="#444" strokeWidth="2" fill="none" />
              <path d="M 34 32 Q 38 30 42 32" stroke="#5C6F75" strokeWidth="2" fill="none" />
              <path d="M 54 32 Q 58 30 62 32" stroke="#5C6F75" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-xs font-bold text-highlight mt-1">Seal</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-surface rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-ink mb-6 text-center">
            Create Account
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="At least 3 characters"
                minLength={3}
                className="w-full px-4 py-3 border-2 border-line bg-surface-2 text-ink rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-line bg-surface-2 text-ink rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-12 border-2 border-line bg-surface-2 text-ink rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-ink mb-2"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 pr-12 border-2 border-line bg-surface-2 text-ink rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-line my-6"></div>

            {/* Preferences Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink">Preferences</h3>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-2 rounded-lg">
                <div>
                  <label
                    htmlFor="notifications"
                    className="text-sm font-semibold text-ink cursor-pointer"
                  >
                    Enable Notifications
                  </label>
                  <p className="text-xs text-muted mt-1">
                    Get reminders for daily check-ins
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light"></div>
                </label>
              </div>
            </div>

            {/* Terms & Privacy Acceptance */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-surface-2 rounded-lg border-2 border-line">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (error) setError("");
                }}
                className="mt-0.5 w-4 h-4 flex-shrink-0 accent-primary-light cursor-pointer"
                disabled={loading}
              />
              <label
                htmlFor="termsAccepted"
                className="text-sm text-ink leading-relaxed cursor-pointer select-none"
              >
                I have read and agree to the{" "}
                <button
                  type="button"
                  onClick={() => openModal("terms")}
                  className="text-primary-light font-semibold underline hover:text-primary-base transition-colors"
                  disabled={loading}
                >
                  Terms and Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => openModal("privacy")}
                  className="text-primary-light font-semibold underline hover:text-primary-base transition-colors"
                  disabled={loading}
                >
                  Privacy Policy
                </button>
                . <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-light text-highlight font-bold py-4 rounded-lg shadow-lg hover:bg-primary-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-muted">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/user/login"
            className="block w-full text-center bg-secondary text-dark font-bold py-4 rounded-lg shadow-lg hover:bg-secondary/80 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-dark/60 text-sm">
            © {new Date().getFullYear()} FeelingPrepper · All Rights Reserved
          </p>
        </div>
      </div>

      {/* Legal Modal — bottom sheet */}
      {modalType && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="bg-surface w-full max-w-md rounded-2xl h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
              <h3 className="text-base font-bold text-ink">
                {modalType === "terms"
                  ? "Terms & Conditions"
                  : "Privacy Policy"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-ink p-1 rounded-lg hover:bg-surface-2 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {loadingModal ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-7 h-7 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <pre className="text-xs text-ink whitespace-pre-wrap font-sans leading-relaxed">
                  {modalText}
                </pre>
              )}
            </div>

            {/* Modal Footer — accept button */}
            <div className="px-5 py-4 border-t border-line flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  closeModal();
                }}
                className="w-full bg-primary-light text-highlight font-bold py-3 rounded-lg hover:bg-primary-base transition-colors"
              >
                I Agree
              </button>
              <p className="text-xs text-muted text-center mt-2">
                Tapping "I Agree" checks the agreement box on the form.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;