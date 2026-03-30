from flask import Blueprint, request, jsonify
from models.note_model import create_note, get_notes_by_user, update_note, delete_note
from bson.objectid import ObjectId
from config import db

note_bp = Blueprint("note_bp", __name__)

# --- CREATE NOTE ---
@note_bp.route("/create-note", methods=["POST"])
def create_note_api():
    try:
        data = request.get_json()
        if not data or not data.get("title") or not data.get("content"):
            return jsonify({"message": "Title and Content are required"}), 400

        # ✅ FIXED: Create a single dictionary to match note_model.py
        note_payload = {
            "user_id": data.get("user_id"),
            "title": data.get("title"),
            "content": data.get("content"),
            "tags": data.get("tags", [])
        }

        # ✅ Calls create_note(note_data) with exactly ONE argument
        result = create_note(note_payload)
        
        return jsonify({
            "message": "Note created successfully", 
            "note_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"🔥 Backend Error: {e}")
        return jsonify({"message": "Server error while creating note"}), 500

# --- GET ALL NOTES ---
@note_bp.route("/get-notes/<user_id>", methods=["GET"])
def get_notes_api(user_id):
    from models.share_model import get_shared_notes
    own_notes = get_notes_by_user(user_id)
    shared_notes_list = get_shared_notes(user_id)
    return jsonify({"own_notes": own_notes, "shared_notes": shared_notes_list})

# --- UPDATE NOTE ---
@note_bp.route("/update-note/<note_id>", methods=["PUT"])
def update_note_api(note_id):
    try:
        data = request.get_json()
        user_id = str(data.get("user_id")).strip()

        note = db.notes.find_one({"_id": ObjectId(note_id)})
        if not note:
            return jsonify({"message": "Note not found"}), 404

        # Ownership check
        if str(note.get("user_id")).strip() == user_id:
            update_note(note_id, data)
            return jsonify({"message": "Note updated successfully"}), 200

        return jsonify({"message": "Permission denied"}), 403
    except Exception as e:
        return jsonify({"message": f"Update failed: {str(e)}"}), 500

# --- DELETE NOTE ---
@note_bp.route("/delete-note/<note_id>", methods=["DELETE"])
def delete_note_api(note_id):
    try:
        data = request.get_json() or {}
        user_id = str(data.get("user_id", ""))
        
        note = db.notes.find_one({"_id": ObjectId(note_id)})
        if note and str(note.get("user_id")) == user_id:
            delete_note(note_id) 
            return jsonify({"message": "Note deleted successfully"}), 200
            
        return jsonify({"message": "Permission denied"}), 403
    except Exception as e:
        return jsonify({"message": f"Delete failed: {str(e)}"}), 500