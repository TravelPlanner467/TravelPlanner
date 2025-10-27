from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def root():
    return jsonify({"message": "Python API works!"})

@app.route('/hello')
def hello():
    return jsonify({"message": "Hello endpoint works!"})
