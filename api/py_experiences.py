from flask import jsonify, Blueprint

experiences_bp = Blueprint('experiences', __name__)

@experiences_bp.route('', methods=['GET'])
def experiences_root():
    return jsonify({"message": "Hello from Experiences"})

