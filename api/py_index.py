from flask import Flask, jsonify

from experiences import experiences_bp

app = Flask(__name__)

# # Register the test blueprint
# app.register_blueprint(experiences_bp, url_prefix='/experiences')

@app.route('/', methods=['GET'])
def test_root():
    return jsonify({"message": "Hello from Index!"})

@app.route('/hello', methods=['GET'])
def test_hello():
    return jsonify({"message": "Hello from Index/Hello!"})

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'healthy', 'service': 'index'}, 200

if __name__ == "__main__":
    app.run()