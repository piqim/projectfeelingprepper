import { useState } from "react";

const Settings = () => {
  const [username, setUsername] = useState("piqim");
  const [email, setEmail] = useState("piqim@example.com");
  const [password, setPassword] = useState("********");

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save changes:", { username, email, password });
    setActiveModal(null);
  };

  const handleDataExport = () => {
    console.log("Data export requested");
  };

  const handleDeleteAccount = () => {
    console.log("Delete account requested");
  };

  const handleLogout = () => {
    console.log("User logged out");
    setActiveModal(null);
  };

  return (
    <div className="max-h-screen bg-gray-50 p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-red-200 shadow rounded-xl p-4 text-center">
        <h1 className="text-xl font-semibold">Settings ⚙️</h1>
      </div>

      {/* Expand Buttons */}
      <div className="flex flex-col gap-4">
        {/* Edit Profile trigger */}
        <button
          onClick={() =>
            setActiveModal(activeModal === "profile" ? null : "profile")
          }
          className="bg-white shadow rounded-xl p-4 text-left font-semibold hover:bg-gray-100"
        >
          Edit Profile
        </button>

        {/* Privacy Settings trigger */}
        <button
          onClick={() =>
            setActiveModal(activeModal === "privacy" ? null : "privacy")
          }
          className="bg-white shadow rounded-xl p-4 text-left font-semibold hover:bg-gray-100"
        >
          Privacy Settings
        </button>
      </div>

      {/* Active Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-3 right-3 text-gray-500 text-xl"
            >
              ×
            </button>

            {/* Modal Content */}
            {activeModal === "profile" && (
              <form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
                <h2 className="text-lg font-semibold border-b pb-2">
                  Edit Profile
                </h2>

                <div>
                  <label className="block text-sm text-gray-600">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  />
                </div>

                {/* Save + Logout inside modal */}
                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeModal === "privacy" && (
              <div className="flex flex-col gap-6 mt-2">
                <h2 className="text-lg font-semibold border-b pb-2">
                  Privacy Settings
                </h2>

                <div className="flex gap-3">
                  <button
                    onClick={handleDataExport}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Data Export
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Out outside modal(s) */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
