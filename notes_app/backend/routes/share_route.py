from flask import Blueprint, request, jsonify
from models.share_model import share_note, get_shared_notes, unshare_note
from config import db
from bson.objectid import ObjectId

share_bp = Blueprint("share", __name__)


# ✅ SHARE NOTE (UPDATED)
@share_bp.route("/share-note", methods=["POST"])
def share_note_api():
    data = request.json

    note_id = data.get("note_id")
    owner_id = data.get("owner_id")
    shared_with = data.get("shared_with")
    permission = data.get("permission")

    # ✅ Validate input
    if not all([note_id, owner_id, shared_with, permission]):
        return jsonify({"message": "All fields required"}), 400

    # ✅ Check note exists
    note = db.notes.find_one({"_id": ObjectId(note_id)})
    if not note:
        return jsonify({"message": "Note not found"}), 404

    # ✅ Only owner can share
    if note["user_id"] != owner_id:
        return jsonify({"message": "Only owner can share"}), 403

    # ✅ Prevent duplicate sharing
    existing = db.note_shares.find_one({
        "note_id": note_id,
        "shared_with": shared_with
    })

    if existing:
        return jsonify({"message": "Note already shared"}), 400

    share_data = {
        "note_id": note_id,
        "owner_id": owner_id,
        "shared_with": shared_with,
        "permission": permission
    }

    share_note(share_data)

    return jsonify({"message": "Note shared successfully"})


# ✅ GET SHARED NOTES
@share_bp.route("/shared-notes/<user_id>", methods=["GET"])
def get_shared_notes_api(user_id):
    notes = get_shared_notes(user_id)
    return jsonify(notes)


# ❌ UNSHARE NOTE (NEW)
@share_bp.route("/unshare-note", methods=["DELETE"])
def unshare_note_api():
    data = request.json

    note_id = data.get("note_id")
    user_id = data.get("user_id")

    if not note_id or not user_id:
        return jsonify({"message": "note_id and user_id required"}), 400

    result = unshare_note(note_id, user_id)

    if result.deleted_count == 0:
        return jsonify({"message": "Share not found"}), 404

    return jsonify({"message": "Note unshared successfully"})