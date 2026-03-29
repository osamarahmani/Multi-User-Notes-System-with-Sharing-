from flask import Flask
from flask_cors import CORS

from routes.auth_route import auth_bp
from routes.note_route import note_bp
from routes.share_route import share_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(note_bp)
app.register_blueprint(share_bp)


@app.route("/")
def home():
    return {"message": "Backend running"}


if __name__ == "__main__":
    app.run(debug=True)