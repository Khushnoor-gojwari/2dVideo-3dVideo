import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { EventSourcePolyfill } from "event-source-polyfill";

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

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Create EventSource for streaming endpoint
    const evtSource = new EventSourcePolyfill(
      "https://khushnoor-video-vr180.hf.space/convert-2d-to-vr180-stream",
      {
        headers: { "Content-Type": "multipart/form-data" },
        method: "POST",
        body: formData
      }
    );

    let jobId = null;
    let processedFrames = 0;

evtSource.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (!jobId && data.job_id) jobId = data.job_id;

  if (data.status === "processing" && data.frame) {
    processedFrames = data.frame;
    console.log(`Job ${jobId}: processed frame ${processedFrames}`);

    // Update the last video object with progress
    setProcessedVideos(prev => {
      if (prev.length === 0) {
        // If no video yet, create placeholder
        return [{
          name: file.name,
          originalName: file.name,
          timestamp: new Date().toLocaleString(),
          size: 0,
          duration: 0,
          playable: false,
          job_id: jobId,
          progress: processedFrames,
          blob: null
        }];
      } else {
        const updated = [...prev];
        updated[updated.length - 1].progress = processedFrames;
        return updated;
      }
    });
  }

  if (data.status === "completed") {
    console.log(`Job ${jobId} completed! Output: ${data.output}`);

    // Fetch the final video as blob
    fetch(data.output)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const videoData = {
          url,
          name: file.name,
          originalName: file.name,
          timestamp: new Date().toLocaleString(),
          size: blob.size,
          duration: 0,
          playable: true,
          job_id: jobId,
          progress: processedFrames,
          blob
        };
        setProcessedVideos(prev => [...prev.slice(0, -1), videoData]); // replace placeholder with final video
        setLoading(false);
      });

    evtSource.close();
  }

  if (data.status === "error") {
    setError(`Job ${jobId} failed: ${data.error}`);
    setLoading(false);
    evtSource.close();
  }
};


    evtSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Streaming connection lost. Try again.");
      setLoading(false);
      evtSource.close();
    };

  } catch (err) {
    console.error("Upload error:", err);
    setError("Failed to start conversion.");
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
                  Processing... (Frame: {processedVideos[processedVideos.length - 1]?.progress || 0})
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
