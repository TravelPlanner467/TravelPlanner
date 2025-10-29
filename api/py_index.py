from flask import Flask, jsonify, request
from flask_cors import CORS
from api.py_test import test_bp
from api.py_experiences import experiences_bp
from api.py_trips import trips_bp

app = Flask(__name__)
CORS(app)

# Register blueprint
app.register_blueprint(test_bp, url_prefix='/py/test')
app.register_blueprint(experiences_bp, url_prefix='/py/experiences')
app.register_blueprint(trips_bp, url_prefix='/py/trips')

@app.route('/py', methods=['GET'])
def root():
    return jsonify({"message": "Flask Index Root",
                    "available_routes": [str(rule) for rule in app.url_map.iter_rules()]
                    })

# Catch-all for debugging
@app.route('/py/debug', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({
        "error": "Route not found",
        "received_path": path,
        "full_path": request.full_path,
        "available_routes": [str(rule) for rule in app.url_map.iter_rules()]
    }), 404