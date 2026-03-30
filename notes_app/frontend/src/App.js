import React, { useState } from "react"; // 👈 Removed useEffect from here
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

function App() {
  // Start with null so the login page ALWAYS appears first
  const [userId, setUserId] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  if (!userId) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial" }}>
        <h1 style={{ color: "#2c3e50" }}>📂 Multi-User Notes System</h1>
        <div style={{ background: "#f9f9f9", padding: "30px", borderRadius: "10px", display: "inline-block", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          {showSignup ? (
            <Signup setUserId={setUserId} />
          ) : (
            <Login setUserId={setUserId} />
          )}
          
          <button 
            onClick={() => setShowSignup(!showSignup)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#3498db", 
              cursor: "pointer", 
              marginTop: "20px",
              textDecoration: "underline",
              fontSize: "14px"
            }}
          >
            {showSignup ? "Already have an account? Login" : "New user? Create an account"}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard only appears after a successful login session
  return <Dashboard userId={userId} setUserId={setUserId} />;
}

export default App;