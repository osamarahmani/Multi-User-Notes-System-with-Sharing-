import React, { useState } from "react";

function Login({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents page reload on form submit
    setError("");
    setLoading(true);

    try {
      // Using 127.0.0.1 to avoid Windows localhost DNS delays
      const res = await fetch("https://multi-user-notes-system-with-sharing.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.user_id) {
        // ✅ CRITICAL: Save to localStorage so App.js can find it on refresh
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("username", username);
        
        // Update the global state in App.js
        setUserId(data.user_id);
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Cannot connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Login</h2>
        
        {error && <p style={{ color: "#e74c3c", fontSize: "14px", textAlign: "center" }}>{error}</p>}

        <div style={{ marginBottom: "15px" }}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

// --- STYLES ---
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "70vh",
};

const formStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  width: "320px",
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#34495e",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  boxSizing: "border-box",
};

const btnStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

export default Login;