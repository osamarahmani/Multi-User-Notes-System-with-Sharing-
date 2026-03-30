import React, { useState } from "react";

function NotesList({ notes, userId, refreshNotes, isOwner }) {
  const [sharingNoteId, setSharingNoteId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editData, setEditData] = useState({ title: "", content: "", tags: [] }); // tags is now an array
  const [recipient, setRecipient] = useState("");

  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditData({ 
      title: note.title, 
      content: note.content, 
      tags: note.tags || [] 
    });
  };

  const handleUpdate = async (noteId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/update-note/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId, 
          title: editData.title, 
          content: editData.content,
          tags: editData.tags 
        }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        refreshNotes();
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    await fetch(`http://127.0.0.1:5000/delete-note/${noteId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    refreshNotes();
  };

  const handleShare = async (noteId) => {
    // Correct logic for your backend sharing route
    await fetch("http://127.0.0.1:5000/share-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id: noteId, shared_with: recipient, permission: "read" }),
    });
    alert(`Note shared with ${recipient}`);
    setSharingNoteId(null);
    setRecipient("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
      {notes.map((note) => (
        <div key={note._id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          
          {editingNoteId === note._id ? (
            <div>
              <input 
                style={{ width: "100%", marginBottom: "10px", padding: "8px", boxSizing: "border-box" }}
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
              />
              <textarea 
                style={{ width: "100%", height: "80px", padding: "8px", boxSizing: "border-box", marginBottom: "10px" }}
                value={editData.content}
                onChange={(e) => setEditData({...editData, content: e.target.value})}
              />
              <input 
                placeholder="Tags (comma separated)"
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "10px" }}
                value={editData.tags.join(", ")}
                onChange={(e) => setEditData({...editData, tags: e.target.value.split(",").map(t => t.trim())})}
              />
              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => handleUpdate(note._id)} style={{ flex: 1, background: "#2ecc71", color: "white", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditingNoteId(null)} style={{ flex: 1, background: "#95a5a6", color: "white", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>{note.title}</h4>
              <p style={{ fontSize: "14px", color: "#333", minHeight: "40px" }}>{note.content}</p>
              
              {/* --- TAG BADGES --- */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                {note.tags && note.tags.map((tag, i) => (
                  <span key={i} style={{ background: "#e1f5fe", color: "#0288d1", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>
                    #{tag}
                  </span>
                ))}
              </div>
              
              {isOwner && (
                <div style={{ marginTop: "15px", display: "flex", gap: "8px" }}>
                  <button onClick={() => startEditing(note)} style={{ flex: 1, background: "#f1c40f", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => setSharingNoteId(sharingNoteId === note._id ? null : note._id)} style={{ flex: 1, background: "#3498db", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer" }}>Share</button>
                  <button onClick={() => handleDelete(note._id)} style={{ flex: 1, background: "#e74c3c", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
                </div>
              )}

              {sharingNoteId === note._id && (
                <div style={{ marginTop: "15px", padding: "10px", background: "#f9f9f9", borderRadius: "5px", border: "1px solid #eee" }}>
                  <input 
                    placeholder="Username" 
                    value={recipient} 
                    onChange={(e) => setRecipient(e.target.value)}
                    style={{ width: "65%", padding: "5px", boxSizing: "border-box" }}
                  />
                  <button onClick={() => handleShare(note._id)} style={{ marginLeft: "5px", padding: "5px 10px", background: "#2ecc71", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Send</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default NotesList;