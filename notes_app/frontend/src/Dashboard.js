import React, { useEffect, useState, useCallback } from "react";
import NotesList from "./NotesList";

// ✅ LIVE BACKEND URL
const BASE_URL = "https://multi-user-notes-system-with-sharing.onrender.com";

// --- PROFESSIONAL STYLES ---
const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#2c3e50",
  padding: "15px 25px",
  borderRadius: "10px",
  color: "white",
  marginBottom: "20px"
};

const searchInputStyle = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "none",
  width: "300px",
  outline: "none"
};

const actionBtnStyle = {
  padding: "10px 25px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  background: "#3498db",
  color: "white",
  marginBottom: "20px"
};

const formContainerStyle = {
  background: "#f4f7f6",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  border: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

function Dashboard({ userId, setUserId }) {
  const [ownNotes, setOwnNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    setUserId(null);
  };

  const fetchNotes = useCallback(async () => {
    try {
      const endpoint = searchQuery.trim().length > 0 
        ? `${BASE_URL}/search-notes/${userId}?query=${searchQuery}`
        : `${BASE_URL}/get-notes/${userId}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      
      if (searchQuery.trim().length > 0) {
        setOwnNotes(data || []);
        setSharedNotes([]); 
      } else {
        setOwnNotes(data.own_notes || []);
        setSharedNotes(data.shared_notes || []);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  }, [userId, searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return alert("Please enter both Title and Content");
    
    const tagArray = newNote.tags.split(",")
      .map(t => t.trim())
      .filter(t => t !== "");

    try {
      const response = await fetch(`${BASE_URL}/create-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId,
          title: newNote.title,
          content: newNote.content,
          tags: tagArray 
        }),
      });

      if (response.ok) {
        setNewNote({ title: "", content: "", tags: "" });
        setShowCreate(false);
        fetchNotes();
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.message || "Could not save note"));
      }
    } catch (err) {
      alert("Backend Error: Failed to connect.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* HEADER SECTION */}
      <div style={navStyle}>
        <h2 style={{ margin: 0 }}>🗒️ My Notebook</h2>
        <input 
          style={searchInputStyle}
          type="text"
          placeholder="Search notes or #tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          onClick={handleLogout}
          style={{ background: "#e74c3c", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          Logout
        </button>
      </div>

      {/* CREATE TOGGLE */}
      <button 
        style={{ ...actionBtnStyle, background: showCreate ? "#95a5a6" : "#3498db" }} 
        onClick={() => setShowCreate(!showCreate)}
      >
        {showCreate ? "✖ Cancel" : "➕ Create New Note"}
      </button>

      {/* FORM SECTION */}
      {showCreate && (
        <form onSubmit={handleCreate} style={formContainerStyle}>
          <div style={{ display: "flex", gap: "10px" }}>
             <input 
              style={{ ...inputStyle, flex: 2 }}
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
            />
            <input 
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Tags (e.g. work, study)"
              value={newNote.tags}
              onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
            />
          </div>
          <textarea 
            style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            placeholder="Write your content here..."
            value={newNote.content}
            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
          />
          <button type="submit" style={{ ...actionBtnStyle, background: "#27ae60", width: "150px", alignSelf: "flex-end" }}>
            💾 Save Note
          </button>
        </form>
      )}

      {/* NOTES DISPLAY */}
      <h3 style={{ color: "#2c3e50", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>
        {searchQuery ? "🔍 Search Results" : "📌 My Notes"}
      </h3>
      <NotesList notes={ownNotes} userId={userId} refreshNotes={fetchNotes} isOwner={true} />

      {sharedNotes.length > 0 && (
        <>
          <h3 style={{ color: "#27ae60", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px", marginTop: "40px" }}>
            🤝 Shared With Me
          </h3>
          <NotesList notes={sharedNotes} userId={userId} refreshNotes={fetchNotes} isOwner={false} />
        </>
      )}
    </div>
  );
}

export default Dashboard;