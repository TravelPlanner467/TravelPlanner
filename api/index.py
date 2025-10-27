"""Experiences Microservice-- see readme.txt for instructions."""
import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, request, jsonify, g
from functools import wraps
from psycopg2.extras import RealDictCursor
from flask_cors import CORS

# Initialize Flask application
app = Flask(__name__)
CORS(app)

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

@app.route('/experiences/all', methods=['GET'])
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

@app.route('/experiences/user-experiences/', methods=['GET'])
@require_auth
def get_user_experiences():
    """Retrieve all experiences created by a specific user.

    Fetches all experiences where the user_id matches the provided user_id,
    ordered by creation date (newest first).

    Args:
        user_id (STR): The ID of the user whose experiences to retrieve

    Returns:
        tuple: JSON array of experience objects and HTTP 200
    """
    user_id = g.user_id

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT *
                        FROM experiences
                        WHERE user_id = %s
                        ORDER BY create_date DESC
                        """, (user_id,))

            experiences = cur.fetchall()
    finally:
        conn.close()

    return jsonify([dict(experience) for experience in experiences]), 200

@app.route('/experiences/<int:experience_id>', methods=['GET'])
def get_experience_details(experience_id):
    """Retrieve a specific experience by ID.

    Args:
        experience_id (int): The unique identifier of the experience

    Returns:
        tuple: JSON object with experience data and HTTP 200, or error message and HTTP 404
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                        SELECT * FROM experiences
                        WHERE experience_id = %s''', (experience_id,))
            experience = cur.fetchone()
            if not experience:
                return jsonify({'error': 'Experience not found'}), 404
        return jsonify(experience), 200
    finally:
        conn.close()

@app.route('/experiences', methods=['POST'])
@require_auth
def create_experience():
    """Create a new experience.

    Requires authentication via X-User-Id header. Creates a new experience with
    the provided title, description, and date.

    Required JSON fields:
        - title (str): Experience title
        - date (str): Experience date

    Optional JSON fields:
        - description (str): Experience description

    Returns:
        tuple: JSON object with created experience data and HTTP 201, or error and HTTP 400
    """
    header_user_id = g.user_id
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('title') or not data.get('experience_date'):
        return jsonify({'error': 'Missing required fields'}), 400

    # Extract experience data from request
    user_id = data['user_id']
    title = data['title']
    description = data.get('description', '')  # Default to empty string if not provided
    date = data['experience_date']
    address = data.get('address', '')  # Single string address
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    create_date = data.get('create_date')
    keywords = data.get('keywords', [])

    # Compare header user_id to payload user_id
    if user_id != header_user_id:
        return jsonify({'error': 'user_id Unauthorized'}), 403

    # REMOVED COORDINATE VALIDATION B/C IT ALREADY GETS HANDLED ON THE FRONTEND
    # def in_range(v, lo, hi):
    #     return isinstance(v, (int, float)) and lo <= float(v) <= hi
    # if latitude is not None and not in_range(latitude, -90, 90):
    #     return jsonify({'error': 'latitude must be between -90 and 90'}), 400
    # if longitude is not None and not in_range(longitude, -180, 180):
    #     return jsonify({'error': 'longitude must be between -180 and 180'}), 400

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        INSERT INTO experiences (title, description, experience_date, user_id, create_date, address,
                                                 latitude, longitude, keywords)
                        VALUES (%s, %s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s,
                                %s) RETURNING experience_id, title, description, experience_date, address, latitude, 
                                longitude, user_id, create_date, keywords
                        """, (title, description, date, user_id, create_date, address, latitude, longitude, keywords))
            added_row = cur.fetchone()
        conn.commit()
        # Return the created experience with HTTP 201 Created status
        return jsonify(added_row), 201
    finally:
        conn.close()

@app.route('/experiences/<int:experience_id>', methods=['DELETE'])
@require_auth
def delete_experience(experience_id):
    """Delete an experience.

    Requires authentication via X-User-Id header. Only the experience creator
    can delete their own experiences.

    Args:
        experience_id (int): The unique identifier of the experience to delete

    Returns:
        tuple: JSON success message and HTTP 200,
               or error message with HTTP 404/403
    """
    user_id = g.user_id

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # fetch experience
            cur.execute('SELECT * FROM experiences WHERE experience_id = %s', (experience_id,))
            experience = cur.fetchone()

            # Check if experience exists
            if not experience:
                return jsonify({'error': 'Experience not found'}), 404

            # Verify user is the creator of the experience
            if experience['user_id'] != user_id:
                return jsonify({'error': 'Unauthorized'}), 403

            # Delete the experience from the database
            cur.execute('DELETE FROM experiences where experience_id = %s', (experience_id,))
        conn.commit()
        return jsonify({'message': 'Experience deleted'}), 200

    finally:
        conn.close()

# @app.route('/experiences/<int:experience_id>', methods=['PUT'])
# @require_auth
# def update_experience(experience_id):
#     """Update an existing experience.
#
#     Requires authentication via X-User-Id header. Only the experience creator
#     can update their own experiences.
#
#     Args:
#         experience_id (int): The unique identifier of the experience to update
#
#     Optional JSON fields:
#         - title (str): Updated experience title
#         - description (str): Updated experience description
#         - date (str): Updated experience date
#
#     Returns:
#         tuple: JSON object with updated experience data and HTTP 200,
#                or error message with HTTP 404/403
#     """
#     header_user_id = g.user_id
#     data = request.get_json()
#
#     conn = get_db()
#     experience = conn.execute('SELECT * FROM experiences WHERE experience_id = ?', (experience_id,)).fetchone()
#
#     # Check if experience exists
#     if not experience:
#         conn.close()
#         return jsonify({'error': 'Experience not found'}), 404
#
#     # Verify user is the creator of the experience
#     if str(experience['user_id']) != header_user_id:
#         conn.close()
#         return jsonify({'error': 'Unauthorized'}), 403
#
#     # Use existing values if new ones aren't provided
#     user_id = experience['user_id']
#     title = data.get('title', experience['title'])
#     description = data.get('description', experience['description'])
#     date = data.get('date', experience['date'])
#     address = data.get('address', experience['address'] if 'address' in experience.keys() else '')
#     latitude = data.get('latitude', experience['latitude'] if 'latitude' in experience.keys() else None)
#     longitude = data.get('longitude', experience['longitude'] if 'longitude' in experience.keys() else None)
#
#     # Validate lat/lon ranges if provided
#     def in_range(v, lo, hi):
#         return v is None or isinstance(v, (int, float)) and lo <= float(v) <= hi
#     if not in_range(latitude, -90, 90):
#         conn.close()
#         return jsonify({'error': 'latitude must be between -90 and 90'}), 400
#     if not in_range(longitude, -180, 180):
#         conn.close()
#         return jsonify({'error': 'longitude must be between -180 and 180'}), 400
#
#     # Update the experience in the database
#     conn.execute('''
#         UPDATE experiences
#         SET title = ?, description = ?, date = ?, address = ?, latitude = ?, longitude = ?
#         WHERE experience_id = ?
#     ''', (title, description, date, address, latitude, longitude, experience_id))
#     conn.commit()
#     conn.close()
#
#     # Return the updated experience
#     return jsonify({
#         'id': experience_id,
#         'title': title,
#         'description': description,
#         'date': date,
#         'address': address,
#         'latitude': latitude,
#         'longitude': longitude,
#         'user_id': user_id,
#         'created_at': experience['created_at']
#     }), 200

# @app.route('/experiences/search', methods=['GET'])
# def search_experiences():
#     """Search for experiences by title or description.

#     Performs a case-insensitive search across experience titles and descriptions
#     using the query parameter 'q'.

#     Query Parameters:
#         q (str): Search query string (required)

#     Returns:
#         tuple: JSON array of matching experience objects and HTTP 200,
#                or error message and HTTP 400 if query is missing

#     Example:
#         GET /experiences/search?q=concert
#     """
#     query = request.args.get('q', '')

#     # Validate that a search query was provided
#     if not query:
#         return jsonify({'error': 'Search query required'}), 400

#     conn = get_db()
#     # Search for experiences where title or description contains the query string
#     experiences = conn.execute('''
#         SELECT * FROM experiences
#         WHERE title LIKE ? OR description LIKE ?
#         ORDER BY created_at DESC
#     ''', (f'%{query}%', f'%{query}%')).fetchall()
#     conn.close()

#     return jsonify([dict(experience) for experience in experiences]), 200

@app.route('/hello', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello, World!"})

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint.

    Returns the service status to verify the microservice is running.

    Returns:
        tuple: JSON response with status and service name, HTTP 200
    """
    return jsonify({'status': 'healthy', 'service': 'experiences'}), 200

def init_db():
    """Initialize database schema - runs at startup"""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                        CREATE TABLE IF NOT EXISTS experiences (
                                                                   "experience_id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
                                                                   "user_id" text NOT NULL,
                                                                   "title" text NOT NULL,
                                                                   "description" text NOT NULL,
                                                                   "experience_date" date NOT NULL,
                                                                   "create_date" timestamptz NOT NULL DEFAULT NOW(),
                            "address" text NOT NULL,
                            "latitude" double precision NOT NULL,
                            "longitude" double precision NOT NULL,
                            "keywords" text[] NOT NULL DEFAULT '{}',
                            "user_rating" integer
                            )
                        """)
            cur.execute('CREATE INDEX IF NOT EXISTS experiences_keywords_gin ON experiences USING GIN ("keywords");')
        conn.commit()
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5328)
