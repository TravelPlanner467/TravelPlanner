from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def root():
    return jsonify({
        "message": "Python API root",
        "endpoints": ["/py/index", "/py/test"]
    })

@app.route('/hello', methods=['GET'])
@app.route('/index/hello', methods=['GET'])
def test_hello():
    return jsonify({"message": "Hello from Index/Hello!"})

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'healthy', 'service': 'index'}, 200

if __name__ == "__main__":
    app.run()