import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
function Feedback({ onLogout }) {
  const [feedback, setFeedback] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const username = localStorage.getItem("username") || "Anonymous";

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("https://khushnoor-video-vr180.hf.space/feedback");
      setFeedbackList(res.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return alert("Feedback cannot be empty");

    try {
      await axios.post("https://khushnoor-video-vr180.hf.space/feedback", {
        username,
        text: feedback,
      });
      setFeedback("");
      fetchFeedback();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const bgStyle = {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1579600161224-cac5a2971069?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  return (
    <div style={bgStyle} className="text-white">
      {/* Navbar at the top */}
      <Navbar onLogout={onLogout} />

      {/* Main content centered */}
      <main
        className="d-flex flex-column justify-content-center align-items-center p-4"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div
          className="bg-dark bg-opacity-75 p-5 rounded shadow-lg text-white"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <h2 className="mb-3">💬 Feedback</h2>
          <textarea
            className="form-control mb-2"
            rows="3"
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
          <button
            className="btn btn-warning w-100 mb-3"
            onClick={handleFeedbackSubmit}
          >
            Submit Feedback
          </button>

          <div className="text-start">
            <h5>All Feedback:</h5>
            {feedbackList.length === 0 ? (
              <p>No feedback yet.</p>
            ) : (
              <div
                style={{
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              >
                <ul className="list-group">
                  {feedbackList.map((fb, index) => (
                    <li
                      key={index}
                      className="list-group-item bg-secondary text-white mb-2 rounded"
                    >
                      <strong>{fb.username}:</strong> {fb.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Feedback;
