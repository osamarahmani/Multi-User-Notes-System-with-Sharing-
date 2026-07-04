from config import db
from bson.objectid import ObjectId

def share_note(data):
    # Ensure all IDs are strings to prevent MongoDB type mismatches
    share_doc = {
        "note_id": str(data["note_id"]),
        "owner_id": str(data["owner_id"]),
        "shared_with": str(data["shared_with"]),
        "permission": data.get("permission", "read")
    }
    return db.note_shares.insert_one(share_doc)

def get_shared_notes(user_id):
    # Search for the user_id as a string in the 'shared_with' field
    shares = list(db.note_shares.find({"shared_with": str(user_id)}))
    
    shared_notes = []
    for s in shares:
        n_id = s.get("note_id")
        if n_id:
            try:
                # Convert the stored string note_id back to an ObjectId to find the note content
                note = db.notes.find_one({"_id": ObjectId(n_id), "is_deleted": False})
                if note:
                    note["_id"] = str(note["_id"])
                    note["permission"] = s.get("permission", "read")
                    shared_notes.append(note)
            except Exception as e:
                print(f"Error fetching shared note {n_id}: {e}")
    return shared_notes