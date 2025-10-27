from flask import Flask, jsonify, request
from flask_cors import CORS
from api.py_test import test_bp

app = Flask(__name__)
CORS(app)

# Register blueprint
app.register_blueprint(test_bp, url_prefix='/py/test')

@app.route('/py', methods=['GET'])
def root():
    return jsonify({"message": "Flask is running"})

@app.route('/hello')
def root_hello():
    return jsonify({"message": "root_hello"})

# Catch-all for debugging
@app.route('/debug', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({
        "error": "Route not found",
        "received_path": path,
        "full_path": request.full_path,
        "available_routes": [str(rule) for rule in app.url_map.iter_rules()]
    }), 404