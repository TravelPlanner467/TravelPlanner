from flask import Flask

from api import experiences
from test import test_bp
from experiences import experiences_bp

app = Flask(__name__)

# Register the test blueprint
app.register_blueprint(test_bp, url_prefix='/test')
app.register_blueprint(experiences_bp, url_prefix='/experiences')

@app.route('/', methods=['GET'])
@app.route('/hello', methods=['GET'])
def index_routes():
    return {"message": "Hello from Index!"}

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'healthy', 'service': 'index'}, 200
