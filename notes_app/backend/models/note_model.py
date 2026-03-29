from config import db
from bson.objectid import ObjectId
from datetime import datetime


def create_note(note_data):
    note_data["created_at"] = datetime.utcnow()
    note_data["is_deleted"] = False
    return db.notes.insert_one(note_data)


def get_notes_by_user(user_id):
    notes = list(db.notes.find({
        "user_id": user_id,
        "is_deleted": False
    }))

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


def update_note(note_id, updated_data):
    allowed_fields = ["title", "content", "tags"]

    filtered_data = {
        k: v for k, v in updated_data.items() if k in allowed_fields
    }

    # ✅ Add updated time
    from datetime import datetime
    filtered_data["updated_at"] = datetime.utcnow()

    from bson.objectid import ObjectId
    return db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": filtered_data}
    )


def delete_note(note_id):
    return db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {"is_deleted": True}}
    )
    # 🔍 SEARCH NOTES
def search_notes(user_id, query=None, tag=None):
    from bson.objectid import ObjectId

    # ✅ get shared note ids
    shared_notes = db.note_shares.find({"shared_with": user_id})
    shared_note_ids = [ObjectId(s["note_id"]) for s in shared_notes]

    filter_query = {
        "is_deleted": False,
        "$or": [
            {"user_id": user_id},
            {"_id": {"$in": shared_note_ids}}
        ]
    }

    if query:
        filter_query["$and"] = [{
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}}
            ]
        }]

    if tag:
        filter_query["tags"] = tag

    notes = list(db.notes.find(filter_query))

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


# 🗑️ GET TRASH NOTES
def get_deleted_notes(user_id):
    notes = list(db.notes.find({
        "user_id": user_id,
        "is_deleted": True
    }))

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


# ♻️ RESTORE NOTE
def restore_note(note_id):
    return db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {"is_deleted": False}}
    )