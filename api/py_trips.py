import os
import psycopg2
from dotenv import load_dotenv
from flask import jsonify, Blueprint,request, g
from functools import wraps
from psycopg2.extras import RealDictCursor

trips_bp = Blueprint('trips', __name__)

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

@trips_bp.route('', methods=['GET'])
def experiences_root():
    return jsonify({"message": "Hello from Experiences"})

@trips_bp.route('/user-trips', methods=['GET'])
@require_auth
def get_all_user_trips():
    """Retrieve all trips."""
    user_id = g.user_id

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT t.*,
                               COUNT(te.experience_id) as experience_count
                        FROM trips t
                                 LEFT JOIN trip_experiences te ON t.trip_id = te.trip_id
                        WHERE t.user_id = %s
                        GROUP BY t.trip_id
                        ORDER BY t.create_date DESC
                        """, (user_id,))

            trips = cur.fetchall()
    finally:
        conn.close()

    return jsonify([dict(trip) for trip in trips]), 200

@trips_bp.route('/create-trip', methods=['PUT'])
@require_auth
def create_trip():
    """Create a trip"""
    data = request.get_json()

    header_user_id = g.user_id
    user_id = data['user_id']

    # Compare header user_id to payload user_id
    if user_id != header_user_id:
        return jsonify({'error': 'user_id Unauthorized'}), 403

    # Validate required fields
    if not data or not data.get('title'):
        return jsonify({'error': 'Missing required fields'}), 400

    # Extract experience data from request

    title = data.get('title')
    description = data.get('description', '')  # Default to empty string if not provided
    start_date = data.get('start_date') if data.get('start_date') else None
    end_date = data.get('end_date') if data.get('end_date') else None
    create_date = data.get('create_date')

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Insert trip and return the new trip_id
            cur.execute("""
                        INSERT INTO trips (user_id, title, description, start_date, end_date, create_date)
                        VALUES (%s, %s, %s, %s, %s, %s) 
                            RETURNING trip_id, user_id, title, description, start_date, end_date, create_date
                        """, (user_id, title, description, start_date, end_date, create_date))

            added_row = cur.fetchone()

        conn.commit()
        return added_row, 200

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return jsonify({'error': 'Database Error'}), 400

    finally:
        conn.close()

@trips_bp.route('/delete-trip/<int:trip_id>', methods=['DELETE'])
@require_auth
def delete_trip(trip_id):
    """Delete a Trip"""
    user_id = g.user_id

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # fetch experience
            cur.execute('SELECT * FROM trips WHERE trip_id = %s', (trip_id,))
            trip = cur.fetchone()

            # Check if experience exists
            if not trip:
                return jsonify({'error': 'Trip not found'}), 404

            # Verify user is the creator of the experience
            if trip['user_id'] != user_id:
                return jsonify({'error': 'Unauthorized'}), 403

            # Delete the experience from the database
            cur.execute('DELETE FROM trips where trip_id = %s', (trip_id,))
        conn.commit()
        return jsonify({'message': 'Trip deleted'}), 200

    finally:
        conn.close()

@trips_bp.route('/get-trip-details/<int:trip_id>', methods=['GET'])
@require_auth
def get_trip_details(trip_id):
    """Get a single trip by ID with its experiences and metadata."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch trip
            cur.execute(
                """
                SELECT *
                FROM trips
                WHERE trip_id = %s
                """,
                (trip_id,),
            )
            trip = cur.fetchone()
            if not trip:
                return jsonify({"error": "Trip not found"}), 404

            trip = dict(trip)

            # Convert date/datetime fields to ISO 8601 strings[web:126][web:131]
            for field in ("start_date", "end_date", "create_date"):
                if trip.get(field):
                    trip[field] = trip[field].isoformat()

            trip["trip_id"] = str(trip["trip_id"])
            trip["user_id"] = str(trip["user_id"])

            # Fetch experiences for this trip
            cur.execute(
                """
                SELECT
                    e.experience_id,
                    e.title,
                    e.latitude,
                    e.longitude,
                    e.address,
                    e.description,
                    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating
                FROM trip_experiences te
                JOIN experiences e
                    ON te.experience_id = e.experience_id
                LEFT JOIN experience_ratings r
                    ON e.experience_id = r.experience_id
                WHERE te.trip_id = %s
                GROUP BY
                    e.experience_id,
                    e.title,
                    e.latitude,
                    e.longitude,
                    e.address,
                    e.description
                ORDER BY
                    e.create_date
                """,
                (trip_id,),
            )
            rows = cur.fetchall()

            experiences = []
            for row in rows:
                experiences.append(
                    {
                        "experience_id": str(row["experience_id"]),
                        "title": row["title"],
                        "location": {
                            "lat": float(row["latitude"]) if row["latitude"] is not None else None,
                            "lng": float(row["longitude"]) if row["longitude"] is not None else None,
                            "address": row["address"],
                        },
                        "description": row["description"],
                        "average_rating": float(row["average_rating"])
                        if row["average_rating"] is not None
                        else None,
                    }
                )

            trip["experiences"] = experiences

            return jsonify(trip), 200

    except psycopg2.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()


@trips_bp.route('/add-experience', methods=['PUT'])
@require_auth
def add_experience_to_trip():
    """Add an experience to a trip"""
    data = request.get_json()
    print(data)
    trip_id = data['trip_id']
    experience_id = data['experience_id']

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO trip_experiences (trip_id, experience_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (trip_id, experience_id))
        conn.commit()
        return {'message': 'Experience added successfully'}, 200

    except Exception as e:
        conn.rollback()
        return {'error': str(e)}, 500

    finally:
        conn.close()

@trips_bp.route('/remove-experience', methods=['DELETE'])
@require_auth
def remove_experience_from_trip():
    """Remove an experience from a trip"""
    data = request.get_json()

    trip_id = data['trip_id']
    experience_id = data['experience_id']
    # user_id = data['user_id']

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            # Check if the relationship exists
            cur.execute("""
                        SELECT COUNT(*)
                        FROM trip_experiences
                        WHERE trip_id = %s
                          AND experience_id = %s
                        """, (trip_id, experience_id))

            if cur.fetchone()[0] == 0:
                return jsonify({"error": "Experience not found in this trip"}), 404

            # Delete the relationship
            cur.execute("""
                        DELETE
                        FROM trip_experiences
                        WHERE trip_id = %s
                          AND experience_id = %s
                        """, (trip_id, experience_id))

        conn.commit()
        return jsonify({
            "message": "Experience removed from trip successfully",
            "trip_id": trip_id,
            "experience_id": experience_id
        }), 200

    except psycopg2.Error as e:
        conn.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@trips_bp.route('/edit-trip', methods=['PUT'])
@require_auth
def edit_trip():
    """Edit/update an existing trip"""
    data = request.get_json()

    header_user_id = g.user_id
    user_id = data['user_id']
    trip_id = data.get('trip_id')

    # Compare header user_id to payload user_id
    if user_id != header_user_id:
        return jsonify({'error': 'user_id Unauthorized'}), 403

    # Validate required fields
    if not data or not trip_id:
        return jsonify({'error': 'Missing trip_id'}), 400

    if not data.get('title'):
        return jsonify({'error': 'Missing required field: title'}), 400

    # Extract trip data from request
    title = data.get('title')
    description = data.get('description', '')
    start_date = data.get('start_date') if data.get('start_date') else None
    end_date = data.get('end_date') if data.get('end_date') else None

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Update trip and return the updated row
            cur.execute("""
                        UPDATE trips
                        SET title       = %s,
                            description = %s,
                            start_date  = %s,
                            end_date    = %s
                        WHERE trip_id = %s
                          AND user_id = %s RETURNING trip_id, user_id, title, description, start_date, end_date, create_date
                        """, (title, description, start_date, end_date, trip_id, user_id))

            updated_row = cur.fetchone()

            # Check if a row was actually updated
            if not updated_row:
                conn.rollback()
                return jsonify({'error': 'Trip not found or unauthorized'}), 404

        conn.commit()
        return updated_row, 200

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return jsonify({'error': 'Database Error'}), 500

    finally:
        conn.close()