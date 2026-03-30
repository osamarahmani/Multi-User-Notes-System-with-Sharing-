from config import db
from bson.objectid import ObjectId
from datetime import datetime

def create_note(note_data):
    note_data["created_at"] = datetime.utcnow()
    note_data["is_deleted"] = False
    if "user_id" in note_data:
        note_data["user_id"] = str(note_data["user_id"])
    return db.notes.insert_one(note_data)

def get_notes_by_user(user_id):
    notes = list(db.notes.find({
        "user_id": str(user_id),
        "is_deleted": False
    }))
    for note in notes:
        note["_id"] = str(note["_id"])
    return notes

def update_note(note_id, updated_data):
    # ✅ Only allow editing of specific fields
    allowed_fields = ["title", "content", "tags"]
    filtered_data = {k: v for k, v in updated_data.items() if k in allowed_fields}
    
    filtered_data["updated_at"] = datetime.utcnow()

    return db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": filtered_data}
    )

def delete_note(note_id):
    return db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {"is_deleted": True}}
    )

def search_notes(user_id, query=None, tag=None):
    shared_notes = db.note_shares.find({"shared_with": str(user_id)})
    shared_note_ids = [ObjectId(s["note_id"]) for s in shared_notes if "note_id" in s]

    filter_query = {
        "is_deleted": False,
        "$or": [
            {"user_id": str(user_id)},
            {"_id": {"$in": shared_note_ids}}
        ]
    }

    if query:
        filter_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"content": {"$regex": query, "$options": "i"}}
        ]

    notes = list(db.notes.find(filter_query))
    for note in notes:
        note["_id"] = str(note["_id"])
    return notes