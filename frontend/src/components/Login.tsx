import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = config.API_URL;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Call login endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        // debugging logs
        console.error("Login error:", data);
        console.log("Response status:", response.status);
        console.log("Form email: ", formData.email);
        console.log("Form password: ", formData.password);
        setLoading(false);
        return;
      }

      // Login successful!
      console.log("Login successful:", data);

      // Store userId in localStorage
      const normalizedUserId = extractMongoId(data?.user?._id);

      if (!normalizedUserId) {
        setError("Login succeeded but user ID is invalid. Please contact support.");
        setLoading(false);
        return;
      }

      localStorage.setItem("userId", normalizedUserId);

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-[930px] bg-gradient-to-br from-primary-base to-primary-light flex items-center justify-center p-8"> 
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-highlight montserrat-alternates mb-2">
            FeelingPrepper
          </h1>
          <p className="text-highlight/80 text-md font-semibold">Fishy welcomes you back to your favorite app!</p>
        </div>

        {/* Fish Character */}
        <div className="relative flex justify-center mb-2">
          <svg
            viewBox="0 0 120 100"
            className="w-32 h-32"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Body torso */}
            <path
              d="M 38 18 L 33 90 L 42 90 L 51 66 L 57 66 L 65 90 L 75 90 L 70 18 L 38 18"
              fill="var(--color-secondary)"
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-dark mb-6 text-center">
            Sign In
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-dark mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-dark mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-light text-highlight font-bold py-4 rounded-lg shadow-lg hover:bg-primary-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/user/register"
            className="block w-full text-center bg-secondary text-dark font-bold py-4 rounded-lg shadow-lg hover:bg-secondary/80 transition-all duration-200"
          >
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-highlight/60 text-sm">
            © {new Date().getFullYear()} FeelingPrepper · All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;