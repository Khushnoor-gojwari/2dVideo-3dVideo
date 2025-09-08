import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Components/LoginPage";
import Signup from "./Components/SignUp";
import Home from "./Components/Home";
import Conversation from "./Components/Conversation";
import Feedback from "./Components/Feedback";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token on first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Home
                onLogout={() => {
                  localStorage.removeItem("token");
                  setIsLoggedIn(false);
                }}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* About page */}

        {/* Conversation page */}
        <Route
          path="/conversation"
          element={isLoggedIn ? <Conversation /> : <Navigate to="/login" />}
        />
        <Route
          path="/feedback"
          element={isLoggedIn ? <Feedback /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={<Login onLogin={() => setIsLoggedIn(true)} />}
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
