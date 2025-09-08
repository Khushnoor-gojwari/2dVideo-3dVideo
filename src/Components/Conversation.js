import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function Conversation({ onLogout }) {
  const [file, setFile] = useState(null);
  const [processedVideos, setProcessedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a video!");
    
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Starting conversion...");
      const response = await axios.post(
        "http://127.0.0.1:8001/convert-2d-to-vr180",
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" }, 
          responseType: "blob",
         
        }
      );

      console.log("Conversion complete, creating URL...");
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "video/mp4" }));
      
      // Test if the video can be played
      const video = document.createElement("video");
      video.src = url;
      video.onloadeddata = () => {
        console.log("Video loaded successfully, duration:", video.duration);
        setProcessedVideos(prev => [...prev, { url, name: file.name }]);
      };
      video.onerror = () => {
        console.error("Video playback error");
        setError("The converted video cannot be played in the browser. Please download it instead.");
        setProcessedVideos(prev => [...prev, { url, name: file.name, playable: false }]);
      };
      
      // Load the video to test it
      video.load();

    } catch (error) {
      console.error("Error converting video:", error);
      let errorMessage = "Failed to process video.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Server error: ${error.response.status} - ${error.response.data}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check if the backend is running.";
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = {
    backgroundImage:
      "url('https://plus.unsplash.com/premium_photo-1661764248803-c23d7ec546ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ2fHx8ZW58MHx8fHx8')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  return (
    <div style={bgStyle} className="text-white">
      <Navbar onLogout={onLogout} />

      <main
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div
          className="bg-dark bg-opacity-75 p-5 rounded shadow-lg text-center"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <h2 className="mb-4">🎥 2D to VR180 Conversion</h2>

          <input
            type="file"
            accept="video/*"
            className="form-control mb-3"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="btn btn-primary mb-3 w-100"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Processing... (This may take several minutes)" : "Upload & Convert to VR180"}
          </button>

          {error && (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
              <br />
              <small>Please try downloading the video instead of playing it.</small>
            </div>
          )}

          {/* Display all processed videos */}
          {processedVideos.map((video, index) => (
            <div key={index} className="mb-4">
              <h5>Converted Video {index + 1}</h5>
              <p className="text-muted">
                <small>Original: {video.name}</small>
              </p>
              
              {video.playable === false && (
                <div className="alert alert-warning">
                  <small>This video may not play in browser. Please download it.</small>
                </div>
              )}
              
              <video
                src={video.url}
                controls
                style={{ width: "100%", borderRadius: "8px" }}
                className="mb-2"
              />
              
              <div className="d-flex gap-2">
                <a
                  href={video.url}
                  download={`vr180-converted-${index + 1}.mp4`}
                  className="btn btn-success flex-fill"
                >
                  Download VR180 Video
                </a>
                <button 
                  className="btn btn-outline-light"
                  onClick={() => {
                    setProcessedVideos(prev => prev.filter((_, i) => i !== index));
                    URL.revokeObjectURL(video.url);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {processedVideos.length > 0 && (
            <div className="mt-3">
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  processedVideos.forEach(video => URL.revokeObjectURL(video.url));
                  setProcessedVideos([]);
                }}
              >
                Clear All Videos
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Conversation;