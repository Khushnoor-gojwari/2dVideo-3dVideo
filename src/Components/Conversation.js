import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function Conversation({ onLogout }) {
  const [file, setFile] = useState(null);
  const [processedVideos, setProcessedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
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

  // Poll job progress every 3 seconds
useEffect(() => {
  if (!jobId) return;

  const interval = setInterval(async () => {
    try {
      const res = await axios.get(`https://khushnoor-video-vr180.hf.space/job-status/${jobId}`);
      const data = res.data;

      if (data.status === "done" && data.output_path) {
        clearInterval(interval); // stop polling first

        // Fetch actual video from its URL
        const videoRes = await axios.get(data.output_path, { responseType: "blob" });
        const blob = videoRes.data;
        const url = URL.createObjectURL(blob);

        const videoEl = document.createElement("video");
        videoEl.src = url;

        videoEl.onloadedmetadata = () => {
          setProcessedVideos(prev => [
            ...prev,
            {
              url,
              name: file.name,
              originalName: file.name,
              timestamp: new Date().toLocaleString(),
              size: blob.size,
              duration: videoEl.duration,
              playable: true,
              blob,
            }
          ]);
          setLoading(false);
          setJobId(null);
          setProgress(0);
        };

        videoEl.onerror = () => {
          setProcessedVideos(prev => [
            ...prev,
            {
              url,
              name: file.name,
              originalName: file.name,
              timestamp: new Date().toLocaleString(),
              size: blob.size,
              playable: false,
              blob,
            }
          ]);
          setError("Video converted but may not play in browser. Download works.");
          setLoading(false);
          setJobId(null);
          setProgress(0);
        };

        videoEl.load();

      } else if (data.progress !== undefined) {
        setProgress(data.progress);
      }

    } catch (err) {
      console.error("Error fetching job status:", err);
      clearInterval(interval);
      setLoading(false);
    }
  }, 3000);

  return () => clearInterval(interval);

}, [jobId]);


  const handleUpload = async () => {
    if (!file) return alert("Please upload a video!");
    
    setError(null);
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://khushnoor-video-vr180.hf.space/start-vr180-job",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.job_id) {
        setJobId(res.data.job_id);
      } else {
        throw new Error("Failed to start job");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to start VR180 conversion.");
      setLoading(false);
    }
  };

  const handleDownload = (video) => {
    const url = URL.createObjectURL(video.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vr180-${video.originalName.replace(/\.[^/.]+$/, "")}.mp4`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDelete = (index) => {
    const newVideos = [...processedVideos];
    const deletedVideo = newVideos.splice(index, 1)[0];
    URL.revokeObjectURL(deletedVideo.url);
    if (deletedVideo.blob) deletedVideo.blob = null;
    setProcessedVideos(newVideos);
  };

  const clearAllVideos = () => {
    processedVideos.forEach(video => {
      URL.revokeObjectURL(video.url);
      video.blob = null;
    });
    setProcessedVideos([]);
  };

  const bgStyle = {
    backgroundImage: "url('https://plus.unsplash.com/premium_photo-1661764248803-c23d7ec546ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ2fHx8ZW58MHx8fHx8')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  return (
    <div className="text-white" style={bgStyle}>
      <Navbar onLogout={onLogout} />
      <main className="d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 56px)" }}>
        <div className="bg-dark bg-opacity-75 p-5 rounded shadow-lg" style={{ maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
          <h2 className="mb-4 text-center">🎥 2D to VR180 Conversion</h2>

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
                  Processing... {progress.toFixed(2)}%
                </>
              ) : (
                "Upload & Convert to VR180"
              )}
            </button>
          </div>

          {error && <div className="alert alert-warning">{error}</div>}

          {processedVideos.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Converted Videos ({processedVideos.length})</h4>
                <button className="btn btn-outline-danger btn-sm" onClick={clearAllVideos}>Clear All</button>
              </div>
              <div className="row">
                {processedVideos.map((video, index) => (
                  <div key={index} className="col-12 mb-4">
                    <div className="card bg-dark text-white">
                      <div className="card-body">
                        <h6 className="card-title">
                          {video.originalName}
                          <small className="text-muted ms-2">
                            ({(video.size/1024/1024).toFixed(2)} MB)
                          </small>
                        </h6>
                        <p className="text-muted small mb-2">
                          Converted: {video.timestamp}
                        </p>
                        {!video.playable && (
                          <div className="alert alert-warning mb-3">
                            ⚠️ Video may not play in browser. Download works perfectly!
                          </div>
                        )}
                        <video src={video.url} controls style={{ width: "100%", borderRadius: "8px", maxHeight: "300px" }} className="mb-3" />
                        <div className="d-flex gap-2">
                          <button className="btn btn-success flex-fill" onClick={() => handleDownload(video)}>⬇️ Download</button>
                          <button className="btn btn-outline-light" onClick={() => handleDelete(index)}>🗑️ Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && processedVideos.length === 0 && (
            <div className="text-center text-muted py-4">
              No converted videos yet. Upload a video to get started!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Conversation;
