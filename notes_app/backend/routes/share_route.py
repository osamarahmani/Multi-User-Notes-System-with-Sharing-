from flask import Blueprint, request, jsonify
from config import db
from models.share_model import share_note

share_bp = Blueprint("share", __name__)

@share_bp.route("/share-note", methods=["POST"])
def share_note_api():
    try:
        data = request.json
        # React sends 'shared_with' for the target username
        target_username = data.get("shared_with") 
        note_id = data.get("note_id")
        owner_id = data.get("user_id") # React sends the owner as 'user_id'

        if not target_username or not note_id:
            return jsonify({"message": "Recipient username and Note ID are required"}), 400

        # 1. Find the recipient user
        recipient = db.users.find_one({"username": target_username})
        
        if not recipient:
            return jsonify({"message": f"User '{target_username}' not found"}), 404

        # 2. Prevent sharing with yourself
        if str(recipient["_id"]) == str(owner_id):
            return jsonify({"message": "You cannot share a note with yourself"}), 400

        # 3. Save the share record
        share_note({
            "note_id": str(note_id),
            "owner_id": str(owner_id),
            "shared_with": str(recipient["_id"]),
            "permission": "read"
        })
        
        return jsonify({"message": f"Note shared with {target_username}!"}), 200

    except Exception as e:
        print(f"❌ Share Error: {e}")
        return jsonify({"message": "Internal server error"}), 500