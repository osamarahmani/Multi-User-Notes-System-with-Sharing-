from flask import Blueprint, request, jsonify
from models.note_model import (
    create_note,
    get_notes_by_user,
    update_note,
    delete_note
)
from bson.objectid import ObjectId
from config import db

note_bp = Blueprint("note_bp", __name__)


# ✅ CREATE NOTE (with tags support)
@note_bp.route("/create-note", methods=["POST"])
def create_note_api():
    data = request.json

    # add default tags if not present
    if "tags" not in data:
        data["tags"] = []

    result = create_note(data)

    return jsonify({
        "message": "Note created successfully",
        "note_id": str(result.inserted_id)
    })


# ✅ GET NOTES (OWN + SHARED)
@note_bp.route("/get-notes/<user_id>", methods=["GET"])
def get_notes_api(user_id):
    from models.share_model import get_shared_notes

    own_notes = get_notes_by_user(user_id)
    shared = get_shared_notes(user_id)

    shared_notes = []

    for share in shared:
        note = db.notes.find_one({"_id": ObjectId(share["note_id"])})

        if note and not note.get("is_deleted", False):
            note["_id"] = str(note["_id"])
            note["permission"] = share["permission"]
            shared_notes.append(note)

    return jsonify({
        "own_notes": own_notes,
        "shared_notes": shared_notes
    })


# ✅ UPDATE NOTE (OWNER + WRITE PERMISSION)

@note_bp.route("/update-note/<note_id>", methods=["PUT"])
def update_note_api(note_id):
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"message": "user_id required"}), 400

    note = db.notes.find_one({"_id": ObjectId(note_id)})

    if not note:
        return jsonify({"message": "Note not found"}), 404

    from models.share_model import get_note_permission
    permission = get_note_permission(note_id, user_id)

    # ✅ OWNER → allow directly
    if str(note["user_id"]) == str(user_id):
        update_note(note_id, data)
        return jsonify({"message": "Note updated successfully"})

    # ✅ SHARED USER WITH WRITE → allow
    if permission and permission["permission"] == "write":
        update_note(note_id, data)
        return jsonify({"message": "Note updated successfully"})

    # ❌ OTHERWISE → deny
    return jsonify({"message": "Permission denied"}), 403

# ✅ DELETE NOTE (ONLY OWNER)
@note_bp.route("/delete-note/<note_id>", methods=["DELETE"])
def delete_note_api(note_id):
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"message": "user_id required"}), 400

    note = db.notes.find_one({"_id": ObjectId(note_id)})

    if not note:
        return jsonify({"message": "Note not found"}), 404

    if note["user_id"] == user_id:
        delete_note(note_id)
        return jsonify({"message": "Note deleted successfully"})

    return jsonify({"message": "Permission denied"}), 403


# ✅ SEARCH NOTES (query + tag)
@note_bp.route("/search-notes/<user_id>", methods=["GET"])
def search_notes_api(user_id):
    query = request.args.get("query")
    tag = request.args.get("tag")

    from models.note_model import search_notes

    notes = search_notes(user_id, query, tag)
    return jsonify(notes)


# ✅ TRASH NOTES
@note_bp.route("/trash-notes/<user_id>", methods=["GET"])
def get_trash_notes(user_id):
    from models.note_model import get_deleted_notes

    notes = get_deleted_notes(user_id)
    return jsonify(notes)


# ✅ RESTORE NOTE
@note_bp.route("/restore-note/<note_id>", methods=["PUT"])
def restore_note_api(note_id):
    from models.note_model import restore_note

    restore_note(note_id)
    return jsonify({"message": "Note restored successfully"})