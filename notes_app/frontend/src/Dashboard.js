import React, { useEffect, useState, useCallback } from "react";
import NotesList from "./NotesList";

// ✅ ADD THIS LINE (your backend URL)
const BASE_URL = "https://multi-user-notes-system-with-sharing.onrender.com";

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
      // ✅ UPDATED HERE
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
      // ✅ UPDATED HERE
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
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#2c3e50", padding: "15px 25px", borderRadius: "10px", color: "white" }}>
        <h2>🗒️ My Notebook</h2>

        <input 
          type="text"
          placeholder="Search notes or #tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button onClick={handleLogout}>Logout</button>
      </div>

      <button onClick={() => setShowCreate(!showCreate)}>
        {showCreate ? "Cancel" : "Create Note"}
      </button>

      {showCreate && (
        <form onSubmit={handleCreate}>
          <input 
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({...newNote, title: e.target.value})}
          />
          <textarea 
            placeholder="Content"
            value={newNote.content}
            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
          />
          <input 
            placeholder="Tags"
            value={newNote.tags}
            onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
          />
          <button type="submit">Save</button>
        </form>
      )}

      <h3>{searchQuery ? "Search Results" : "My Notes"}</h3>
      <NotesList notes={ownNotes} userId={userId} refreshNotes={fetchNotes} isOwner={true} />

      {sharedNotes.length > 0 && (
        <>
          <h3>Shared Notes</h3>
          <NotesList notes={sharedNotes} userId={userId} refreshNotes={fetchNotes} isOwner={false} />
        </>
      )}
    </div>
  );
}

export default Dashboard;