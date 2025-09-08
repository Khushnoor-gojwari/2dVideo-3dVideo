import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const bgStyle = {
    backgroundImage:
      "url('https://plus.unsplash.com/premium_photo-1682124543094-c2026d01d85e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        onLogin();
        navigate("/"); // 👈 redirect to Home
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
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
        <h2 className="text-light text-center">Login</h2>
        <form onSubmit={handleSubmit}>
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
            Login
          </button>
        </form>
        <p className="text-light text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-warning">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
