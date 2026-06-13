import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import Toast from "../Toast";
import { useToast } from "../../hooks/useToast";

interface User {
  _id: string;
  username: string;
  email: string;
  streak: number;
  petStats?: any;
  preferences?: any;
}

const Settings = () => {
  const navigate = useNavigate();
  const API_URL = config.API_URL;

  // User data
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { message, type, visible, showToast } = useToast();

  // Get userId from localStorage
  const getUserId = () => {
    return localStorage.getItem("userId");
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    const userId = getUserId();
    if (!userId) {
      navigate("/user/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username,
          email: data.email,
          password: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const userId = getUserId();
    if (!userId) return;

    // Validation
    if (!formData.username || !formData.email) {
      setError("Username and email are required");
      return;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    // If changing password
    if (formData.newPassword) {
      if (!formData.password) {
        setError("Please enter your current password");
        return;
      }
      if (formData.newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError("New passwords do not match");
        return;
      }
    }

    try {
      // Handle password change separately via dedicated endpoint
      if (formData.newPassword) {
        const pwResponse = await fetch(`${API_URL}/users/${userId}/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: formData.password,
            newPassword: formData.newPassword,
          }),
        });

        if (!pwResponse.ok) {
          const data = await pwResponse.json();
          setError(data.error || "Failed to change password");
          return;
        }
      }

      // Update username / email via general PATCH
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
        }),
      });

      if (response.ok) {
        await fetchUserData();
        setFormData({ ...formData, password: "", newPassword: "", confirmNewPassword: "" });
        showToast("Profile updated successfully!", "success");
        setTimeout(() => setActiveModal(null), 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  // Export data to CSV
  const handleDataExport = async () => {
    setIsExporting(true);
    const userId = getUserId();
    if (!userId) return;

    try {
      // Fetch all user data
      const [grapesResponse, cogtriResponse] = await Promise.all([
        fetch(`${API_URL}/grapes/user/${userId}`),
        fetch(`${API_URL}/cogtri/user/${userId}`),
      ]);

      const grapesData = await grapesResponse.json();
      const cogtriData = await cogtriResponse.json();

      // Create CSV content
      let csvContent = "FeelingPrepper Data Export\n\n";

      // GRAPES CSV
      csvContent += "=== GRAPES ENTRIES ===\n";
      csvContent += "Date,Gentle,Recreation,Accomplishment,Pleasure,Exercise,Social,Completed\n";
      grapesData.forEach((entry: any) => {
        const date = new Date(entry.date).toLocaleDateString();
        csvContent += `"${date}","${entry.gentle || ""}","${entry.recreation || ""}","${entry.accomplishment || ""}","${entry.pleasure || ""}","${entry.exercise || ""}","${entry.social || ""}","${entry.completed}"\n`;
      });

      csvContent += "\n\n";

      // CogTri CSV
      csvContent += "=== COGNITIVE TRIANGLE ENTRIES ===\n";
      csvContent += "Date,Situation,Thoughts,Feelings,Behavior,Complete\n";
      cogtriData.forEach((entry: any) => {
        const date = new Date(entry.date).toLocaleDateString();
        csvContent += `"${date}","${entry.situation || ""}","${entry.thoughts || ""}","${entry.feelings || ""}","${entry.behavior || ""}","${entry.complete}"\n`;
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `FeelingPrepper_Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Data exported successfully!", "success");
    } catch {
      showToast("Failed to export data. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        localStorage.removeItem("userId");
        sessionStorage.removeItem("sessionVerified");
        showToast("Your account and all data have been deleted.", "info");
        setTimeout(() => navigate("/user/login"), 1500);
      } else {
        setError("Failed to delete account");
        setIsDeleting(false);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userId");
    sessionStorage.removeItem("sessionVerified");
    navigate("/user/login");
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-neutral flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-dark text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral flex flex-col pb-20">
      <Toast message={message} type={type} visible={visible} />
      {/* Header */}
      <div className="bg-primary-light p-4 text-center">
        <h1 className="text-2xl font-bold text-highlight montserrat-alternates">
          Settings ⚙️
        </h1>
      </div>

      {/* User Info Card */}
      <div className="bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-base to-primary-light rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-highlight">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">{user?.username}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-xs text-primary-light font-semibold mt-1">
              🔥 {user?.streak} day streak
            </p>
          </div>
        </div>
      </div>

      {/* Settings Buttons */}
      <div className="flex flex-col gap-3 m-6">
        {/* Edit Profile */}
        <button
          onClick={() => setActiveModal("profile")}
          className="bg-white shadow-lg rounded-xl p-4 text-left font-semibold text-dark hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <span>✏️ Edit Profile</span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Privacy Settings */}
        <button
          onClick={() => setActiveModal("privacy")}
          className="bg-white shadow-lg rounded-xl p-4 text-left font-semibold text-dark hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <span>🔒 Privacy & Data</span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Logout Button */}
      <div className="m-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
        >
          Log Out
        </button>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setActiveModal(null);
                setError("");
                setSuccess("");
                setDeleteConfirmText("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>

            {/* Edit Profile Modal */}
            {activeModal === "profile" && (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-2">
                <h2 className="text-2xl font-bold text-dark border-b-2 border-gray-200 pb-3">
                  ✏️ Edit Profile
                </h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary-light focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary-light focus:outline-none"
                  />
                </div>

                <div className="border-t-2 border-gray-200 pt-4 mt-2">
                  <h3 className="text-lg font-bold text-dark mb-3">
                    Change Password
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter current password"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary-light focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary-light focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-dark mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        placeholder="Re-enter new password"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary-light focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-primary-light text-highlight font-bold py-4 rounded-lg hover:bg-primary-base transition-colors"
                >
                  Save Changes
                </button>
              </form>
            )}

            {/* Privacy Modal */}
            {activeModal === "privacy" && (
              <div className="flex flex-col gap-6 mt-2">
                <h2 className="text-2xl font-bold text-dark border-b-2 border-gray-200 pb-3">
                  🔒 Privacy & Data
                </h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                {/* Data Export */}
                <div className="bg-neutral border-2 border-gray-200 rounded-xl p-4">
                  <h3 className="font-bold text-dark mb-2">📊 Export Your Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download all your GRAPES and CogTri entries as a CSV file.
                  </p>
                  <button
                    onClick={handleDataExport}
                    disabled={isExporting}
                    className="w-full bg-primary-base text-highlight font-bold py-3 rounded-lg hover:bg-dark transition-colors disabled:opacity-50"
                  >
                    {isExporting ? "Exporting..." : "📥 Download Data"}
                  </button>
                </div>

                {/* Delete Account */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-dark mb-2">🗑️ Delete Account</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Permanently delete your account and all data. This action cannot be undone.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => {
                        setDeleteConfirmText(e.target.value);
                        setError("");
                      }}
                      placeholder="DELETE"
                      className="w-full border-2 border-red-300 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== "DELETE"}
                    className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "🗑️ Delete Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;