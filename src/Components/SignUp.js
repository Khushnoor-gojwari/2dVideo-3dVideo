import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const bgStyle = {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://khushnoor-video-vr180.hf.space/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! Please login.");
        navigate("/login"); // redirect to login page
      } else {
        alert(data.detail || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={bgStyle}
    >
      <div
        className="bg-dark bg-opacity-50 p-4 rounded shadow-lg"
        style={{ width: "350px" }}
      >
        <h2 className="text-light text-center">Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="form-control mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="form-control mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="form-control mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success w-100">
            Signup
          </button>
        </form>
        <p className="text-light text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-warning">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
