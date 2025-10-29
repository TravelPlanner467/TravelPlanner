import os
import psycopg2
from dotenv import load_dotenv
from flask import jsonify, Blueprint,request, g
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


@experiences_bp.route('/user-experiences', methods=['GET'])
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

@experiences_bp.route('/batch-experiences', methods=['POST'])
@require_auth
def get_batch_experiences():
    """Retrieve all experiences requested by a specific user.

    Fetches all experiences where the user_id matches the provided user_id,
    ordered by creation date (newest first).

    Args:
        user_id (STR): The ID of the user whose experiences to retrieve

    Returns:
        tuple: JSON array of experience objects and HTTP 200
    """
    data=request.get_json()
    print(f"Received  {data}")

    user_id = data['user_id']
    experience_ids = data['experience_ids']

    header_user_id = g.user_id

    # Return empty list if no IDs provided
    if not experience_ids:
        return jsonify([]), 200

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT *
                        FROM experiences
                        WHERE experience_id = ANY(%s)
                        ORDER BY create_date DESC
                        """, (experience_ids,))

            experiences = cur.fetchall()
            return jsonify([dict(experience) for experience in experiences]), 200

    finally:
        conn.close()


@experiences_bp.route('/details/<int:experience_id>', methods=['GET'])
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

            # Convert datetime fields to ISO 8601
            if experience.get('experience_date'):
                experience['experience_date'] = experience['experience_date'].isoformat()

        return jsonify(experience), 200
    finally:
        conn.close()


@experiences_bp.route('/create', methods=['PUT'])
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

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return None

    finally:
        conn.close()


@experiences_bp.route('/delete/<int:experience_id>', methods=['DELETE'])
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


@experiences_bp.route('/update', methods=['PUT'])
@require_auth
def update_experience():
    """Update an existing experience.

    Requires authentication via X-User-Id header. Only the experience creator
    can update their own experiences.

    Args:
        experience_id (int): The unique identifier of the experience to update

    Optional JSON fields:
        - title (str): Updated experience title
        - description (str): Updated experience description
        - date (str): Updated experience date

    Returns:
        tuple: JSON object with updated experience data and HTTP 200,
               or error message with HTTP 404/403
    """
    data = request.get_json()
    user_id = data['user_id']
    experience_id = data['experience_id']
    header_user_id = g.user_id

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                        SELECT * FROM experiences 
                        WHERE experience_id = %s''', (experience_id,))

            experience = cur.fetchone()

            # Check if experience exists
            if not experience:
                conn.close()
                return jsonify({'error': 'Experience not found'}), 404

            # Verify user is the creator of the experience
            if experience['user_id'] != user_id:
                conn.close()
                return jsonify({'error': 'User Unauthorized'}), 403

            # Extract experience data from request
            title = data['title']
            description = data.get('description', '')  # Default to empty string if not provided
            date = data['experience_date']
            address = data.get('address', experience['address'])
            latitude = data.get('latitude', experience['latitude'])
            longitude = data.get('longitude', experience['longitude'])
            keywords = data.get('keywords', experience.get('keywords', []))

            # Update the experience in the database
            cur.execute('''
                UPDATE experiences
                SET title = %s,
                    description = %s,
                    experience_date = %s,
                    address = %s,
                    latitude = %s,
                    longitude = %s,
                    keywords = %s
                WHERE experience_id = %s 
                RETURNING experience_id, title, description, experience_date, address, 
                          latitude, longitude, keywords, user_id, create_date
            ''', (title, description, date, address, latitude, longitude, keywords, experience_id))

            edited_row = cur.fetchone()
            conn.commit()

            # Return the updated experience
            return jsonify(edited_row), 200

    except Exception as e:
        conn.rollback()
        print(f"Error updating experience: {str(e)}")
        return jsonify({'error': 'Failed to update experience'}), 500

    finally:
        conn.close()