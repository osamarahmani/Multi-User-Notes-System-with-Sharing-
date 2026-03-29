from config import db


def share_note(data):
    return db.note_shares.insert_one(data)


def get_shared_notes(user_id):
    notes = list(db.note_shares.find({"shared_with": user_id}))

    for note in notes:
        note["_id"] = str(note["_id"])

    return notes


# 🔐 CHECK PERMISSION
def get_note_permission(note_id, user_id):
    return db.note_shares.find_one({
        "note_id": note_id,
        "shared_with": user_id
    })


# ❌ UNSHARE NOTE (NEW)
def unshare_note(note_id, user_id):
    return db.note_shares.delete_one({
        "note_id": note_id,
        "shared_with": user_id
    })