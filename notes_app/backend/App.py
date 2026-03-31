from flask import Flask
from flask_cors import CORS
from routes.auth_route import auth_bp
from routes.note_route import note_bp
from routes.share_route import share_bp

app = Flask(__name__)

# ✅ Essential for React connection
CORS(app, resources={r"/*": {"origins": "https://multi-user-notes-system-with-sharin.vercel.app"}})

# ✅ Registering your features
app.register_blueprint(auth_bp)
app.register_blueprint(note_bp)
app.register_blueprint(share_bp)

@app.route("/")
def home():
    return {"message": "Server is stable and running"}, 200

if __name__ == "__main__":
    # --- WINDOWS CRASH FIX ---
    # use_reloader=False prevents WinError 10038
    # threaded=True ensures the server handles React requests without freezing
    print("🚀 Server starting on https://multi-user-notes-system-with-sharing.onrender.com")
    app.run(debug=True, port=5000, use_reloader=False, threaded=True)