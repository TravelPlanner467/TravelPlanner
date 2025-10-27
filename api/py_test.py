from flask import jsonify, Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def test_root():
    return jsonify({"message": "Hello from Test!"})

@app.route('/hello', methods=['GET'])
def test_hello():
    return jsonify({"message": "Hello from Test/Hello!"})
