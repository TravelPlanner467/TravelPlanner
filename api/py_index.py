from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Python API root",
        "endpoints": ["/py/index", "/py/test"]
    })

@app.route('/hello', methods=['GET'])
def test_hello():
    return jsonify({"message": "Hello from Index/Hello!"})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'index'}), 200