import React, { useState } from "react";

function CreateNote({ userId, refreshNotes }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault(); // Prevents page refresh
    
    if (!title.trim() || !content.trim()) {
      alert("Please enter both a title and content.");
      return;
    }

    setLoading(true);

    try {
      // Use 127.0.0.1 to avoid Windows 'localhost' resolution issues
      const res = await fetch("http://127.0.0.1:5000/create-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId, // Backend expects 'user_id'
          title: title,
          content: content,
          tags: []
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Clear the inputs
        setTitle("");
        setContent("");
        // Tell Dashboard to refresh the list automatically
        refreshNotes(); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Could not connect to the server. Is Flask running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleCreate}>
        <h3 style={{ marginTop: 0 }}>Create New Note</h3>
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ ...inputStyle, height: "100px", resize: "none" }}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Adding..." : "Add Note"}
        </button>
      </form>
    </div>
  );
}

// Simple styles to make it look clean
const containerStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  marginBottom: "30px"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  boxSizing: "border-box",
  display: "block"
};

const btnStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default CreateNote;