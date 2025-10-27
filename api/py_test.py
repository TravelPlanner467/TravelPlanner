from flask import jsonify, Flask

app = Flask(__name__)

### CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response

@app.route('/', methods=['GET'])
def test_root():
    return jsonify({"message": "Hello from Test!"})

@app.route('/hello', methods=['GET'])
def test_hello():
    return jsonify({"message": "Hello from Test/Hello!"})

if __name__ == "__main__":
    app.run()