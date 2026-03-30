from flask import Blueprint, request, jsonify
from models.user_model import create_user, find_user_by_username
from utils.auth_utils import hash_password, check_password

# --- STEP 1: DEFINE THE BLUEPRINT FIRST ---
# This must happen before any @auth_bp.route decorators
auth_bp = Blueprint("auth", __name__)

# --- STEP 2: DEFINE THE ROUTES ---

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    # Check if user already exists
    if find_user_by_username(username):
        return jsonify({"message": "User already exists"}), 400

    # Hash the password for security
    hashed_pw = hash_password(password)

    # Save user to DB
    result = create_user({
        "username": username,
        "password": hashed_pw
    })

    return jsonify({
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    user = find_user_by_username(username)

    # Verify user exists and password matches
    if user and check_password(password, user["password"]):
        return jsonify({
            "message": "Login successful",
            "user_id": str(user["_id"])
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401