import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    notifications: true,
    theme: "light", // Locked to light for now
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = "http://localhost:5050";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    const nextValue =
      name === "username" && type !== "checkbox" ? value.slice(0, 5) : value;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : nextValue,
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

    if (formData.username.length < 3 || formData.username.length > 5) {
      setError("Username must be 3-5 characters long");
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
          theme: formData.theme,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Registration successful!
      console.log("Registration successful:", data);

      // Store userId in localStorage
      localStorage.setItem("userId", data.insertedId);

      // Show success message
      alert("Account created successfully! Welcome to FeelingPrepper 🎉");

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-min-[930px] bg-gradient-to-br from-secondary to-primary-light flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-highlight montserrat-alternates mb-2">
            FeelingPrepper
          </h1>
          <p className="text-dark/80 text-lg">Start your mental health journey!</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-dark mb-6 text-center">
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
                className="block text-sm font-semibold text-dark mb-2"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="3-5 characters"
                minLength={3}
                maxLength={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-dark mb-2"
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

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-dark mb-2"
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
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
            <div className="border-t-2 border-gray-200 my-6"></div>

            {/* Preferences Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-dark">Preferences</h3>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label
                    htmlFor="notifications"
                    className="text-sm font-semibold text-dark cursor-pointer"
                  >
                    Enable Notifications
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
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

              {/* Pet Selection (Coming Soon) */}
              <div className="relative">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-semibold text-dark">
                    Select your Starting Pet!
                  </label>
                  <p className="text-xs text-gray-600 mt-1 mb-3">
                    It will be your companion on this journey!
                  </p>
                  <div className="flex gap-3">
                    {/* Fish Pet */}
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="fish"
                        name="pet"
                        value="fish"
                        /*checked={formData.pet === "fish"}*/
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light focus:ring-primary-light"
                        disabled
                      />
                      <label
                        htmlFor="fish"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Fish
                      </label>
                    </div>
                    {/* Seal Pet */}
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="seal"
                        name="pet"
                        value="seal"
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light focus:ring-primary-light"
                        disabled
                      />
                      <label
                        htmlFor="seal"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Seal
                      </label>
                    </div>
                    {/* Bear Pet */}
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bear"
                        name="pet"
                        value="bear"
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light focus:ring-primary-light"
                        disabled
                      />
                      <label
                        htmlFor="bear"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Bear
                      </label>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Veil */}
                <div className="absolute inset-0 bg-dark/60 flex items-center justify-center z-20 rounded-lg pointer-events-none select-none">
                  <div className="text-center">
                    <p className="text-white text-2xl font-bold montserrat-alternates tracking-wider">
                      Coming Soon!
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Selection (Coming Soon) */}
              <div className="relative">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-semibold text-dark">
                    Theme Preference
                  </label>
                  <p className="text-xs text-gray-600 mt-1 mb-3">
                    Choose your preferred theme
                  </p>
                  <div className="flex gap-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="light"
                        name="theme"
                        value="light"
                        checked={formData.theme === "light"}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light focus:ring-primary-light"
                        disabled
                      />
                      <label
                        htmlFor="light"
                        className="ml-2 text-sm text-gray-700"
                      >
                        ☀️ Light
                      </label>
                    </div>
                    <div className="flex items-center opacity-50">
                      <input
                        type="radio"
                        id="dark"
                        name="theme"
                        value="dark"
                        checked={formData.theme === "dark"}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light focus:ring-primary-light"
                        disabled
                      />
                      <label
                        htmlFor="dark"
                        className="ml-2 text-sm text-gray-700"
                      >
                        🌙 Dark
                      </label>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Veil */}
                <div className="absolute inset-0 bg-dark/60 flex items-center justify-center z-20 rounded-lg pointer-events-none select-none">
                  <div className="text-center">
                    <p className="text-white text-2xl font-bold montserrat-alternates tracking-wider">
                      Coming Soon!
                    </p>
                  </div>
                </div>
              </div>
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
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
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
            © {new Date().getFullYear()} FeelingPrepper · Mental Health Tracker
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;