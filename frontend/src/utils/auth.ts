export const authHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("fp_token") ?? ""}`,
});

export const clearAuthStorage = () => {
  localStorage.removeItem("fp_token");
  localStorage.removeItem("userId");
  sessionStorage.removeItem("sessionVerified");
};
