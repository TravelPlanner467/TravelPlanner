from flask import jsonify, Blueprint

test_bp = Blueprint('test', __name__)

@test_bp.route('/', methods=['GET'])
def test_root():
    return jsonify({"message": "Hello from Test!"})

@test_bp.route('/hello', methods=['GET'])
def test_hello():
    return jsonify({"message": "Hello from Test/Hello!"})
