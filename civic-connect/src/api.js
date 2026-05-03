// ✅ Step 1: FIX BASE URL
const BASE_URL = "https://backendfullstack-production.up.railway.app";

// ================= AUTH =================
export const signup = (data) =>
  fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const login = (data) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getUsers = () =>
  fetch(`${BASE_URL}/auth/users`);


// ================= OTP (ADD THIS PART) =================
export const sendOtp = (email) =>
  fetch(`${BASE_URL}/api/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  export const checkEmailExists = async (email) => {
  const res = await fetch(
    `https://backendfullstack-production.up.railway.app/auth/check-email?email=${email}`
  );

  const data = await res.json();
  return data.exists; // 🔥 IMPORTANT
};