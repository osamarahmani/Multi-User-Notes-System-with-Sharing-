import React, { useEffect, useState, useCallback } from "react";
import NotesList from "./NotesList";

function Dashboard({ userId, setUserId }) {
  const [ownNotes, setOwnNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    // We don't use localStorage anymore as per our "First Page Login" update
    setUserId(null);
  };

  const fetchNotes = useCallback(async () => {
    try {
      // If there is a search query, we use the search endpoint
      // Otherwise, we get the standard note list
      const endpoint = searchQuery.trim().length > 0 
        ? `http://127.0.0.1:5000/search-notes/${userId}?query=${searchQuery}`
        : `http://127.0.0.1:5000/get-notes/${userId}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      
      if (searchQuery.trim().length > 0) {
        // Search API usually returns a flat list of all matching notes
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
    
    // Convert the comma-separated string from the input into a clean array for MongoDB
    const tagArray = newNote.tags.split(",")
      .map(t => t.trim())
      .filter(t => t !== "");

    try {
      const response = await fetch("http://127.0.0.1:5000/create-note", {
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
        fetchNotes(); // Refresh to show the new note
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.message || "Could not save note"));
      }
    } catch (err) {
      alert("Backend Error: Failed to connect. Is your Flask server running on port 5000?");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* --- NAVIGATION BAR --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#2c3e50", padding: "15px 25px", borderRadius: "10px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ margin: 0, letterSpacing: "1px" }}>🗒️ My Notebook</h2>
        <div style={{ width: "40%", position: "relative" }}>
          <input 
            type="text"
            placeholder="Search notes or #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "10px 15px 10px 35px", borderRadius: "20px", border: "none", width: "100%", outline: "none", fontSize: "14px" }}
          />
          <span style={{ position: "absolute", left: "12px", top: "8px", color: "#888" }}>🔍</span>
        </div>
        <button onClick={handleLogout} style={{ background: "#e74c3c", color: "white", border: "none", padding: "8px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" }}>Logout</button>
      </div>

      {/* --- CREATE NOTE ACTION --- */}
      <button 
        onClick={() => setShowCreate(!showCreate)}
        style={{ marginTop: "25px", width: "100%", padding: "15px", background: "#3498db", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      >
        {showCreate ? "✖ Cancel Note" : "+ Create New Note"}
      </button>

      {/* --- CREATE FORM --- */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{ marginTop: "20px", padding: "25px", border: "1px solid #ddd", borderRadius: "10px", background: "#fff", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
          <input 
            placeholder="Note Title" 
            value={newNote.title} 
            onChange={(e) => setNewNote({...newNote, title: e.target.value})} 
            style={formInputStyle}
          />
          <textarea 
            placeholder="Type your content here..." 
            value={newNote.content} 
            onChange={(e) => setNewNote({...newNote, content: e.target.value})} 
            style={{ ...formInputStyle, height: "120px", resize: "none" }}
          />
          <input 
            placeholder="Tags (separate with commas: work, home, urgent)" 
            value={newNote.tags} 
            onChange={(e) => setNewNote({...newNote, tags: e.target.value})} 
            style={formInputStyle}
          />
          <button type="submit" style={{ width: "100%", padding: "12px", background: "#2ecc71", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>Save Note</button>
        </form>
      )}

      {/* --- NOTES SECTIONS --- */}
      <h3 style={{ marginTop: "40px", color: "#34495e", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>
        {searchQuery ? "🔍 Search Results" : "📁 My Private Notes"}
      </h3>
      <NotesList notes={ownNotes} userId={userId} refreshNotes={fetchNotes} isOwner={true} />

      {!searchQuery && sharedNotes.length > 0 && (
        <>
          <h3 style={{ marginTop: "50px", color: "#27ae60", borderBottom: "2px solid #ecf0f1", paddingBottom: "10px" }}>📥 Shared With Me</h3>
          <NotesList notes={sharedNotes} userId={userId} refreshNotes={fetchNotes} isOwner={false} />
        </>
      )}

      {ownNotes.length === 0 && sharedNotes.length === 0 && !showCreate && (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#95a5a6" }}>
          <p fontSize="18px">No notes found. Start by creating one!</p>
        </div>
      )}
    </div>
  );
}

// Internal CSS for the form inputs
const formInputStyle = { 
  width: "100%", 
  padding: "12px", 
  marginBottom: "15px", 
  boxSizing: "border-box", 
  borderRadius: "6px", 
  border: "1px solid #ccc", 
  fontSize: "14px",
  outlineColor: "#3498db"
};

export default Dashboard;