// src/api.js
export async function getProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch("https://khushnoor-video-vr180.hf.space/profile", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized or error fetching profile");
  }

  return response.json();
}
