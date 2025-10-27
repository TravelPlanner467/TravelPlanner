from flask import Flask, jsonify
from flask_cors import CORS
from api.py_test import test_bp

app = Flask(__name__)
CORS(app)

# Register blueprint
app.register_blueprint(test_bp, url_prefix='/test')

@app.route('/')
def root():
    return jsonify({"message": "Flask is running"})
