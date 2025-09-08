import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
function Navbar({ onLogout }) {
  const username = localStorage.getItem("username");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary px-3">
      <Link className="navbar-brand fw-bold" to="/">
        VR App
      </Link>

      {/* Toggler button */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Collapsible Content */}
      <div className="collapse navbar-collapse" id="navbarContent">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/conversation" className="nav-link">
              Conversation
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/feedback" className="nav-link">
              Feedback
            </Link>
          </li>
        </ul>

        {/* User Info + Logout */}
        <div className="d-flex align-items-center">
          <FaUserCircle size={24} className="me-2" />
          <span className="me-3">{username}</span>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              if (onLogout) onLogout();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
