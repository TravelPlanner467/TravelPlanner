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

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

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
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT e.*, 
                       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS average_rating,
                       COUNT(r.rating) AS rating_count,
                       ARRAY_AGG(k.name) FILTER (WHERE k.name IS NOT NULL) AS keywords
                FROM experiences e
                LEFT JOIN experience_ratings r ON e.experience_id = r.experience_id
                LEFT JOIN experience_keywords ek ON e.experience_id = ek.experience_id
                LEFT JOIN keywords k ON ek.keyword_id = k.keyword_id
                GROUP BY e.experience_id
                ORDER BY e.create_date DESC
            """)
            results = cur.fetchall()

        return jsonify(results), 200

    finally:
        conn.close()


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

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch experience details along with average rating, rating count, and keywords
            cur.execute("""
                        SELECT e.*,
                               COALESCE(ROUND(AVG(r.rating::numeric), 2), 0.00) AS average_rating,
                               COUNT(r.rating) AS rating_count,
                               ARRAY_AGG(k.name) FILTER (WHERE k.name IS NOT NULL) AS keywords
                        FROM experiences e
                                 LEFT JOIN experience_ratings r ON e.experience_id = r.experience_id
                                 LEFT JOIN experience_keywords ek ON e.experience_id = ek.experience_id
                                 LEFT JOIN keywords k ON ek.keyword_id = k.keyword_id
                        WHERE e.user_id = %s
                        GROUP BY e.experience_id
                        ORDER BY e.create_date DESC
                        """, (user_id,))
            results = cur.fetchall()
        return jsonify(results), 200
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
    """Retrieve a specific experience by ID. Public version - doesn't return a user_rating.
    Args:
        experience_id (int): The unique identifier of the experience
    Returns:
        tuple: JSON object with experience data and HTTP 200, or error message and HTTP 404
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch experience details along with average rating, number of ratings, and keywords
            cur.execute("""
                SELECT e.*, 
                       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS average_rating,
                       COUNT(r.rating) AS rating_count,
                       ARRAY_AGG(DISTINCT k.name) FILTER (WHERE k.name IS NOT NULL) AS keywords
                FROM experiences e
                LEFT JOIN experience_ratings r ON e.experience_id = r.experience_id
                LEFT JOIN experience_keywords ek ON e.experience_id = ek.experience_id
                LEFT JOIN keywords k ON ek.keyword_id = k.keyword_id
                WHERE e.experience_id = %s
                GROUP BY e.experience_id
            """, (experience_id,))
            experience = cur.fetchone()

            if not experience:
                return jsonify({"error": "Experience not found"}), 404

            experience["average_rating"] = float(experience["average_rating"])

        return jsonify(experience), 200

    finally:
        conn.close()

@experiences_bp.route('/user_details/<int:experience_id>', methods=['GET'])
@require_auth
def get_user_experience_details(experience_id):
    """Retrieve a specific experience by ID. Authenticated version - returns a user_rating.
    Args:
        experience_id (int): The unique identifier of the experience
    Returns:
        tuple: JSON object with experience data and HTTP 200, or error message and HTTP 404
    """
    user_id = g.user_id
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch experience details with average rating and keywords
            cur.execute("""
                SELECT e.*, 
                       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS average_rating, 
                       COUNT(r.rating) AS rating_count,
                       ARRAY_AGG(DISTINCT k.name) FILTER (WHERE k.name IS NOT NULL) AS keywords
                FROM experiences e
                LEFT JOIN experience_ratings r ON e.experience_id = r.experience_id
                LEFT JOIN experience_keywords ek ON e.experience_id = ek.experience_id
                LEFT JOIN keywords k ON ek.keyword_id = k.keyword_id
                WHERE e.experience_id = %s
                GROUP BY e.experience_id
            """, (experience_id,))
            experience = cur.fetchone()

            if not experience:
                return jsonify({"error": "Experience not found"}), 404

            # Fetch user-specific rating
            cur.execute("""
                SELECT rating
                FROM experience_ratings
                WHERE experience_id = %s AND user_id = %s
            """, (experience_id, user_id))
            user_rating = cur.fetchone()

            # Add ratings information to the response object
            experience["user_rating"] = user_rating["rating"] if user_rating else None
            experience["average_rating"] = float(experience["average_rating"])

            # Change experience_date format
            experience["experience_date"] = experience["experience_date"].strftime("%Y-%m-%d")

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
    data = request.get_json()
    required_fields = ["title", "description", "experience_date"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    user_id = g.user_id
    title = data["title"]
    description = data["description"]
    exp_date = data["experience_date"]
    address = data.get("address", "")
    lat = data.get("latitude")
    lon = data.get("longitude")
    keywords = data.get("keywords", [])
    user_rating = data.get("user_rating")

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Insert experience
            cur.execute("""
                        INSERT INTO experiences (user_id, title, description, experience_date, address, latitude,
                                                 longitude)
                        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING experience_id
                        """, (user_id, title, description, exp_date, address, lat, lon))
            experience_id = cur.fetchone()["experience_id"]

            # Handle keywords
            for kw in keywords:
                cur.execute("INSERT INTO keywords (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", (kw,))
                cur.execute("SELECT keyword_id FROM keywords WHERE name = %s;", (kw,))
                keyword_id = cur.fetchone()["keyword_id"]
                cur.execute("""
                            INSERT INTO experience_keywords (experience_id, keyword_id)
                            VALUES (%s, %s) ON CONFLICT DO NOTHING
                            """, (experience_id, keyword_id))

            # Insert initial user_rating
            if user_rating and 1 <= user_rating <= 5:
                cur.execute("""
                            INSERT INTO experience_ratings (experience_id, user_id, rating)
                            VALUES (%s, %s, %s) ON CONFLICT (experience_id, user_id)
                        DO
                            UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
                            """, (experience_id, user_id, user_rating))

        conn.commit()
        return jsonify({"message": "Experience created", "experience_id": experience_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
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
    user_id = data['session_user_id']
    experience_id = data['experience_id']
    header_user_id = g.user_id

    # Authorization check
    if user_id != header_user_id:
        return jsonify({'error': 'User Unauthorized'}), 403

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Verify ownership of experience
            cur.execute("SELECT * FROM experiences WHERE experience_id = %s", (experience_id,))
            experience = cur.fetchone()
            if not experience:
                return jsonify({'error': 'Experience not found'}), 404
            if experience['user_id'] != user_id:
                return jsonify({'error': 'Unauthorized to modify this experience'}), 403

            # Load / Set experience data
            title = data.get('title', experience['title'])
            description = data.get('description', experience['description'])
            date = data.get('experience_date', experience['experience_date'])
            address = data.get('address', experience['address'])
            latitude = data.get('latitude', experience['latitude'])
            longitude = data.get('longitude', experience['longitude'])
            keywords = data.get('keywords', [])
            user_rating = data.get('user_rating')
            last_updated = data.get('last_updated')

            # Update experience details
            cur.execute('''
                        UPDATE experiences
                        SET title           = %s,
                            description     = %s,
                            experience_date = %s,
                            address         = %s,
                            latitude        = %s,
                            longitude       = %s,
                            last_updated    = %s
                        WHERE experience_id = %s RETURNING experience_id, title, description, experience_date, address, 
                              latitude, longitude, user_id, create_date, last_updated
                        ''', (title, description, date, address, latitude, longitude, last_updated, experience_id))
            updated_experience = cur.fetchone()

            # Update keywords (junction table)
            cur.execute("DELETE FROM experience_keywords WHERE experience_id = %s", (experience_id,))
            for kw in keywords:
                cur.execute("INSERT INTO keywords (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", (kw,))
                cur.execute("SELECT keyword_id FROM keywords WHERE name = %s;", (kw,))
                keyword_id = cur.fetchone()['keyword_id']
                cur.execute("""
                            INSERT INTO experience_keywords (experience_id, keyword_id)
                            VALUES (%s, %s) ON CONFLICT DO NOTHING
                            """, (experience_id, keyword_id))

            # Update or insert rating
            if user_rating and 1 <= user_rating <= 5:
                cur.execute("""
                            INSERT INTO experience_ratings (experience_id, user_id, rating)
                            VALUES (%s, %s, %s) ON CONFLICT (experience_id, user_id)
                        DO
                            UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
                            """, (experience_id, user_id, user_rating))

        conn.commit()
        return jsonify({
            "message": "Experience updated successfully",
            "experience": updated_experience
        }), 200

    except Exception as e:
        conn.rollback()
        print(f"Error updating experience: {str(e)}")
        return jsonify({'error': 'Failed to update experience'}), 500

    finally:
        conn.close()

@experiences_bp.route('/rate', methods=['PUT'])
@require_auth
def rate_experience():
    """Rate an experience (1–5), update if already rated by user."""
    data = request.get_json()
    experience_id = data.get("experience_id")
    rating = data.get("rating")
    user_id = g.user_id

    if not experience_id or not rating or not (1 <= rating <= 5):
        return jsonify({"error": "Invalid input"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO experience_ratings (experience_id, user_id, rating)
                VALUES (%s, %s, %s)
                ON CONFLICT (experience_id, user_id)
                DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
            """, (experience_id, user_id, rating))
        conn.commit()
        return jsonify({"status": "success", "message": "Experience rated"}), 200
    finally:
        conn.close()

@experiences_bp.route('/top_experiences', methods=['GET'])
def get_top_experiences():
    """Retrieve the top 10 experiences most frequently added to trips.

    Fetches experiences ordered by how many times they've been added to trips,
    including the count of trips each experience appears in. No authentication required.

    Returns:
        tuple: JSON array of experience objects with trip_count, HTTP 200
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT e.*,
                               COUNT(te.trip_id) as trip_count
                        FROM experiences e
                                 LEFT JOIN trip_experiences te ON e.experience_id = te.experience_id
                        GROUP BY e.experience_id
                        ORDER BY trip_count DESC, e.create_date DESC LIMIT 6
                        """)

            top_experiences = cur.fetchall()

            # Convert Row objects to dictionaries for JSON serialization
            return jsonify([dict(exp) for exp in top_experiences]), 200

    except Exception as e:
        print(f"Error fetching top experiences: {str(e)}")
        return jsonify({'error': 'Failed to fetch top experiences'}), 500

    finally:
        conn.close()