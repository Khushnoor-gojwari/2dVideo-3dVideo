import Navbar from "./Navbar";
import axios from "axios";

function Home({ onLogout }) {
  const username = localStorage.getItem("username");

  const vrFeatures = [
    {
      icon: "fas fa-vr-cardboard",
      title: "360° Immersion",
      description:
        "Experience complete 360-degree environments that respond to your every movement",
    },
    {
      icon: "fas fa-hand-paper",
      title: "Hand Tracking",
      description: "Natural hand gestures and interactions without controllers",
    },
    {
      icon: "fas fa-eye",
      title: "Eye Tracking",
      description:
        "Advanced eye tracking for more intuitive and realistic interactions",
    },
    {
      icon: "fas fa-brain",
      title: "Haptic Feedback",
      description:
        "Feel textures, impacts, and sensations through advanced haptic technology",
    },
    {
      icon: "fas fa-users",
      title: "Social VR",
      description: "Connect and interact with others in shared virtual spaces",
    },
    {
      icon: "fas fa-graduation-cap",
      title: "Educational Content",
      description:
        "Learn through immersive educational experiences and simulations",
    },
  ];

  const heroStyle = {
    background:
      "linear-gradient(135deg, rgba(17, 24, 39, 0.4), rgba(75, 85, 99, 0.8), rgba(17, 24, 39, 0.9)), url('https://plus.unsplash.com/premium_photo-1711664260571-89851270a90d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    position: "relative",
    
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    height: "100%",
  };

  const iconStyle = {
    fontSize: "2.5rem",
    color: "#00d4ff",
    textShadow: "0 0 20px rgba(0, 212, 255, 0.6)",
    marginBottom: "1rem",
  };

  const gradientTextStyle = {
    background: "linear-gradient(45deg, #00d4ff, #ff6b6b, #4ecdc4)",
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "gradientShift 3s ease-in-out infinite",
  };

  return (
    <div className="text-white">
      {/* Navbar */}
      <Navbar onLogout={onLogout} />

      {/* Hero Section */}
      <main
        style={heroStyle}
        className="d-flex flex-column justify-content-center align-items-center text-center px-4 text-white"
      >
        <div className="container">
          {/* Welcome */}
          <div className="mb-5">
            <h1 className="display-3 mb-4 pulse-animation">
               Welcome, <span style={gradientTextStyle}>{username}</span>!
            </h1>
            <p
              className="lead fs-4 mb-4 text-white mx-auto"
              style={{ maxWidth: "800px" }}
            >
              Virtual Reality (VR) is a simulated 3D environment that allows
              users to interact with digital worlds in a way that feels real.
              The VR180 experience gives you an immersive half-sphere view,
              combining lifelike visuals with depth perception.
            </p>
            <div className="floating-icon">
              <i
                className="fas fa-vr-cardboard"
                style={{ fontSize: "4rem", color: "#00d4ff" }}
              ></i>
            </div>
          </div>

          {/* Features */}
          <div className="mb-5">
            <h2 className="mb-4" style={gradientTextStyle}>
              Experience the Future
            </h2>
            <div className="row g-4">
              {vrFeatures.map((feature, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card feature-card hero-card h-100 text-grey border-0 p-4">
                    <div className="card-body text-center d-flex flex-column">
                      <i className={feature.icon} style={iconStyle}></i>
                      <h5 className="card-title mb-3">{feature.title}</h5>
                      <p className="card-text flex-grow-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications */}
          <div className="mb-5">
            <h3 className="mb-4">Transform Your World</h3>
            <div className="col-lg-8 mx-auto">
              <div className="card text-white border-0 p-4" style={cardStyle}>
                <div className="card-body">
                  <p className="mb-3">
                    VR technology is revolutionizing industries worldwide:
                  </p>
                  <div className="row text-start">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-gamepad text-info me-2"></i>
                          Gaming & Entertainment
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-graduation-cap text-info me-2"></i>
                          Education & Training
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-heartbeat text-info me-2"></i>
                          Healthcare & Therapy
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-building text-info me-2"></i>
                          Architecture & Design
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-plane text-info me-2"></i>
                          Travel & Exploration
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-handshake text-info me-2"></i>
                          Social Interaction
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}

export default Home;
