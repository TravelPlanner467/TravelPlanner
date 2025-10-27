import os
import psycopg2
from dotenv import load_dotenv
from flask import jsonify, Blueprint,request
from functools import wraps
from psycopg2.extras import RealDictCursor

experiences_bp = Blueprint('experiences', __name__)

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

def require_auth(f):
    """Decorator to require authentication for protected endpoints.

    Checks for the presence of the X-User-Id header in the request.
    If the header is missing, returns a 401 Unauthorized response.

    Args:
        f: The function to be decorated

    Returns:
        function: Decorated function with authentication check
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('X-User-Id') or request.headers.get('userID')
        if not auth_header:
            return jsonify({'error': 'Authentication required'}), 401
        g.user_id = auth_header
        return f(*args, **kwargs)
    return decorated

@experiences_bp.route('', methods=['GET'])
def experiences_root():
    return jsonify({"message": "Hello from Experiences"})

@experiences_bp.route('/all', methods=['GET'])
def get_all_experiences():
    """Retrieve all experiences.

    Fetches all experiences from the database, ordered by creation date (newest first).
    No authentication required - this is a public endpoint.

    Returns:
        tuple: JSON array of experience objects, HTTP 200
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT *
                        FROM experiences
                        ORDER BY create_date DESC
                        """, ())

            experiences = cur.fetchall()
    finally:
        conn.close()

    # Convert Row objects to dictionaries for JSON serialization
    return jsonify([dict(experience) for experience in experiences]), 200
