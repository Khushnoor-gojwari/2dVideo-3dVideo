import React, { useEffect, useState } from "react";
import { getProfile } from "./api";

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-3">
      <h2>User Profile</h2>
      {profile ? (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default Profile;