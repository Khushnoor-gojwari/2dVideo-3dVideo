import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function Conversation({ onLogout }) {
  const [file, setFile] = useState(null);
  const [processedVideos, setProcessedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved videos from localStorage
  useEffect(() => {
    const savedVideos = localStorage.getItem('convertedVideos');
    if (savedVideos) {
      try {
        const videos = JSON.parse(savedVideos);
        setProcessedVideos(videos);
      } catch (error) {
        console.error('Error loading saved videos:', error);
      }
    }
  }, []);

  // Save videos to localStorage
  useEffect(() => {
    if (processedVideos.length > 0) {
      localStorage.setItem('convertedVideos', JSON.stringify(processedVideos));
    } else {
      localStorage.removeItem('convertedVideos');
    }
  }, [processedVideos]);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a video!");
    
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Starting conversion...");
      const response = await axios.post(
        "https://khushnoor-video-vr180.hf.space/convert-2d-to-vr180",
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" }, 
          responseType: "blob",
          
        }
      );

      console.log("Conversion complete, creating URL...");
      
      // Create blob with proper MIME type
      const blob = new Blob([response.data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      
      // Create video element to test playback
      const video = document.createElement("video");
      video.src = url;
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded, duration:", video.duration);
          
          const videoData = {
            url,
            name: file.name,
            originalName: file.name,
            timestamp: new Date().toLocaleString(),
            size: response.data.size,
            duration: video.duration,
            playable: true,
            blob: blob // Keep reference to blob for better handling
          };
          
          setProcessedVideos(prev => [...prev, videoData]);
          resolve(true);
        };
        
        video.onerror = () => {
          console.error("Video playback error - may be encoding issue");
          
          const videoData = {
            url,
            name: file.name,
            originalName: file.name,
            timestamp: new Date().toLocaleString(),
            size: response.data.size,
            playable: false,
            blob: blob
          };
          
          setError("Video converted successfully but may have playback issues in browser. Download works perfectly!");
          setProcessedVideos(prev => [...prev, videoData]);
          resolve(false);
        };
        
        // Load the video to trigger events
        video.load();
      });

    } catch (error) {
      console.error("Error converting video:", error);
      let errorMessage = "Failed to process video.";
      
      if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${error.response.data}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check if the backend is running on port 8000.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The video may be too long or server is busy.";
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (video) => {
    // Create a download link from the blob
    const url = URL.createObjectURL(video.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vr180-${video.originalName.replace(/\.[^/.]+$/, "")}.mp4`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDelete = (index) => {
    const newVideos = [...processedVideos];
    const deletedVideo = newVideos.splice(index, 1)[0];
    
    // Clean up the object URL and blob
    URL.revokeObjectURL(deletedVideo.url);
    if (deletedVideo.blob) {
      deletedVideo.blob = null; // Help GC
    }
    
    setProcessedVideos(newVideos);
  };

  const clearAllVideos = () => {
    // Clean up all object URLs and blobs
    processedVideos.forEach(video => {
      URL.revokeObjectURL(video.url);
      video.blob = null;
    });
    
    setProcessedVideos([]);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const bgStyle = {
    backgroundImage: "url('https://plus.unsplash.com/premium_photo-1661764248803-c23d7ec546ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ2fHx8ZW58MHx8fHx8')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  return (
    <div style={bgStyle} className="text-white">
      <Navbar onLogout={onLogout} />

      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 56px)" }}>
        <div className="bg-dark bg-opacity-75 p-5 rounded shadow-lg" style={{ maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
          <h2 className="mb-4 text-center">🎥 2D to VR180 Conversion</h2>

          {/* Upload Section */}
          <div className="mb-4 p-3 bg-dark rounded">
            <input
              type="file"
              accept="video/*"
              className="form-control mb-3"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />

            <button
              className="btn btn-primary w-100"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing... (This may take several minutes)
                </>
              ) : (
                "Upload & Convert to VR180"
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-warning">
              <strong>Note:</strong> {error}
            </div>
          )}

          {/* Converted Videos Section */}
          {processedVideos.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Converted Videos ({processedVideos.length})</h4>
                <button className="btn btn-outline-danger btn-sm" onClick={clearAllVideos}>
                  Clear All
                </button>
              </div>

              <div className="row">
                {processedVideos.map((video, index) => (
                  <div key={index} className="col-12 mb-4">
                    <div className="card bg-dark text-white">
                      <div className="card-body">
                        <h6 className="card-title">
                          {video.originalName}
                          <small className="text-muted ms-2">
                            ({formatFileSize(video.size)} • {formatDuration(video.duration)})
                          </small>
                        </h6>
                        <p className="text-muted small mb-2">
                          Converted: {video.timestamp}
                        </p>
                        
                        {!video.playable && (
                          <div className="alert alert-warning mb-3">
                            <small style={{color:"white"    }}>⚠️ Video may not play in browser. Download works perfectly!</small>
                          </div>
                        )}
                        
                        <video
                          src={video.url}
                          controls
                          style={{ width: "100%", borderRadius: "8px", maxHeight: "300px" }}
                          className="mb-3"
                          preload="metadata"
                        />
                        
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success flex-fill"
                            onClick={() => handleDownload(video)}
                          >
                            ⬇️ Download VR180 Video
                          </button>
                          <button
                            className="btn btn-outline-light"
                            onClick={() => handleDelete(index)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {processedVideos.length === 0 && !loading && (
            <div className="text-center text-muted py-4">
              <p style={{color:"white"    }}>No converted videos yet. Upload a video to get started!</p>
              <small style={{color:"white"    }}>Videos will be saved and persist across page refreshes</small>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Conversation;
