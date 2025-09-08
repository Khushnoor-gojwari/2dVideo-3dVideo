// src/api.js
export async function getProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://127.0.0.1:8000/profile", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized or error fetching profile");
  }

  return response.json();
}
