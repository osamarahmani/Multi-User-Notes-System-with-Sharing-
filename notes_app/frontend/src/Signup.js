import React, { useState } from "react";

function Signup({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevents page reload
    setLoading(true);

    try {
      const res = await fetch("https://multi-user-notes-system-with-sharing.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: username, // 👈 Matches backend
            password: password 
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        alert("Account created!");
        // Save to localStorage so they stay logged in
        localStorage.setItem("userId", data.user_id);
        setUserId(data.user_id);
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert("Backend server is not running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSignup} style={formStyle}>
        <h2>Create Account</h2>
        <input
          type="text"
          placeholder="Choose a Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Create a Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

// Simple styles to make it look professional
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" };
const formStyle = { padding: "30px", border: "1px solid #ddd", borderRadius: "8px", background: "white", width: "300px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };
const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" };
const btnStyle = { width: "100%", padding: "10px", background: "#2ecc71", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };

export default Signup;