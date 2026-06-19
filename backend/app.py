import os
from flask import Flask, jsonify
from flask_cors import CORS
from admin.admin_logic import admin_bp
from user.user_logic import user_bp

# 1. Initialize core Flask app container
app = Flask(__name__)

# 2. Configure Cross-Origin Resource Sharing (CORS) for Vite frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# 3. Register the modular blueprints for routing channels
app.register_blueprint(admin_bp,url_prefix="/api/admin")
app.register_blueprint(user_bp,url_prefix="/api/user")

# Centralized Global Error Handling
@app.errorhandler(404)
def route_not_found(e):
    return jsonify({"error": "Route not found."}), 404

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal server error."}), 500

# Fixed: Changed parameter name from 'method' to 'methods'
@app.route("/", methods=["GET"])
def system_heartbeat():
    return jsonify({
        "status": "online",
        "message": "KIRTI_AI BOT is operational and ready to assist.",
        "port": 5000
    }), 200

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 KIRTI_AI CORE ENGINE BOOTSTRAPPED SUCCESSFULLY")
    print("📡 Listening for agent incoming requests on: http://localhost:5000")
    print("="*60 + "\n")
    
    # Run server locally on Port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)