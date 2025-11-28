import json
import os
import traceback
import uuid
from functools import wraps
from urllib.parse import unquote

# psycopg2-binary==2.9.11
import psycopg2
from psycopg2.extras import RealDictCursor
# python-dotenv==1.0.1
from dotenv import load_dotenv
# Flask==3.1.0
from flask import jsonify, Blueprint,request, g
# firebase-admin==6.4.0
import firebase_admin
from firebase_admin import credentials, storage

# ==============================================================================
# Configuration
# ==============================================================================
experiences_bp = Blueprint('experiences', __name__)

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
FIREBASE_BUCKET = os.getenv('FIREBASE_BUCKET')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Phase 1 safeguards for location-based search
RESULTS_LIMIT = 200  # Max experiences returned
MAX_BOX_SIZE = 10.0  # Max degrees (prevents scanning entire planet)

# Initialize Firebase
try:
    # Try Vercel environment variable first
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        service_account_info = json.loads(service_account_json)
        print(f"Project: {service_account_info.get('project_id', 'NOT FOUND')}")
        print(f"Has private_key: {'private_key' in service_account_info}")

        cred = credentials.Certificate(service_account_info)
        print("Firebase: Using Vercel environment variable")
    else:
        # Fallback to local file
        cred = credentials.Certificate("firebase-credentials.json")
        print("Firebase: Using local firebase-credentials.json")

    firebase_admin.initialize_app(cred, {
        "storageBucket": FIREBASE_BUCKET
    })
    print("Firebase initialized successfully!")

except json.JSONDecodeError as e:
    print(f"❌ JSON Error: {e}")
    traceback.print_exc()
    raise

except Exception as e:
    print(f"❌ Firebase init failed: {e}")
    traceback.print_exc()
    raise


# ==============================================================================
# Database & Authentication Utilities
# ==============================================================================
# Database Connector
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# Auth
def require_auth(f):
    """Require authentication using X-User-Id or userID header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("X-User-Id") or request.headers.get("userID")
        if not auth_header:
            return jsonify({"error": "Authentication required"}), 401
        g.user_id = auth_header
        return f(*args, **kwargs)
    return decorated

# ==============================================================================
# Firebase File Handling Utilities
# ==============================================================================
# Verify file extension type
def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Upload photo (to firebase)
def upload_to_firebase(file, experience_id):
    """Upload file to Firebase Storage and return public URL"""
    try:
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"experiences/{experience_id}/{uuid.uuid4()}.{file_extension}"

        # Get Firebase storage bucket
        bucket = storage.bucket()
        blob = bucket.blob(unique_filename)

        # Reset the file pointer before upload
        if hasattr(file, "stream"):
            file.stream.seek(0)
            blob.upload_from_file(file.stream, content_type=file.content_type)
        else:
            file.seek(0)
            blob.upload_from_file(file, content_type=file.content_type)

        # Make the blob publicly accessible
        blob.make_public()

        # Get public URL
        return blob.public_url
    except Exception as error:
        print(f"Firebase upload error: {error}")
        raise

# Delete Photo (from firebase)
def delete_from_firebase(photo_url):
    """Delete file from Firebase Storage"""
    try:
        # Extract the file path from the URL
        if 'storage.googleapis.com' in photo_url:
            # Extract path after bucket name
            bucket_marker = f'{FIREBASE_BUCKET}/'
            if bucket_marker in photo_url:
                path = photo_url.split(bucket_marker)[-1]
                # Decode URL-encoded characters
                path = unquote(path)
            else:
                # Parse URL more carefully
                # URL format: https://storage.googleapis.com/bucket-name/experiences/123/uuid.jpg
                parts = photo_url.split('/')
                # Find index of bucket name and get everything after
                try:
                    bucket_index = parts.index(FIREBASE_BUCKET)
                    path = '/'.join(parts[bucket_index + 1:])
                    path = unquote(path)
                except ValueError:
                    print(f"Could not find bucket '{FIREBASE_BUCKET}' in URL: {photo_url}")
                    return

            print(f"Attempting to delete Firebase path: {path}")  # Debug

            bucket = storage.bucket()
            blob = bucket.blob(path)

            # Check if blob exists before deleting
            if blob.exists():
                blob.delete()
                print(f"✅ Deleted from Firebase: {path}")
            else:
                print(f"⚠️ Blob not found in Firebase: {path}")

    except Exception as error:
        print(f"Firebase delete error: {error}")
        traceback.print_exc()

# ==============================================================================
# FLASK ROUTES
# ==============================================================================
@experiences_bp.route('', methods=['GET'])
def experiences_root():
    return jsonify({"message": "Hello from Experiences"})

# ==============================================================================
# Create
# ==============================================================================
@experiences_bp.route('/create', methods=['POST'])
@require_auth
def create_experience():
    """Create a new experience with optional keywords."""
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        exp_date = request.form.get('experience_date')

        if not all([title, description, exp_date]):
            return jsonify({"error": "Missing required fields"}), 400

        user_id = g.user_id
        address = request.form.get('address', '')
        lat = request.form.get('latitude')
        lon = request.form.get('longitude')

        # Parse JSON arrays from form data
        keywords = json.loads(request.form.get('keywords', '[]'))
        user_rating = request.form.get('user_rating')
        if user_rating:
            user_rating = int(user_rating)

        # Get uploaded files
        files = request.files.getlist('photos')
        captions = json.loads(request.form.get('captions', '[]'))

    except (ValueError, json.JSONDecodeError) as error:
        return jsonify({"error": f"Invalid input  {str(error)}"}), 400

    conn = get_db_connection()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Insert experience with PostGIS location
            # Format: POINT(longitude latitude) - !!!NOTE!!! lon comes BEFORE lat in PostGIS
            # :geography casts the data type
            cur.execute("""
                        INSERT INTO experiences (user_id, title, description, experience_date,
                                                 address, latitude, longitude, location)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, ST_Point(%s, %s)::geography)
                        RETURNING experience_id
                        """, (user_id, title, description, exp_date, address, lat, lon, lon, lat))
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
                            DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
                            """, (experience_id, user_id, user_rating))

            # Upload photos to firebase & insert metadata into database
            for idx, file in enumerate(files):
                if file and file.filename and allowed_file(file.filename):
                    try:
                        # Upload to Firebase Storage
                        photo_url = upload_to_firebase(file, experience_id)

                        # Get caption if provided
                        caption = captions[idx] if idx < len(captions) else ''

                        # Save to database
                        cur.execute("""
                            INSERT INTO experience_photos (experience_id, photo_url, caption)
                            VALUES (%s, %s, %s)
                            RETURNING photo_id, experience_id, photo_url, caption, upload_date
                        """, (experience_id, photo_url, caption))

                    except Exception as error:
                        print(f"Error uploading {file.filename}: {error}")
                        continue

        conn.commit()
        return jsonify({
            "message": "Experience created",
            "experience_id": experience_id,
        }), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        conn.close()

# ==============================================================================
# Update
# ==============================================================================
@experiences_bp.route('/update', methods=['POST'])
@require_auth
def update_experience():
    """Update an existing experience, including keywords and user rating."""
    try:
        user_id = request.form.get('session_user_id')
        header_user_id = g.user_id

        # Authorization check
        if user_id != header_user_id:
            return jsonify({'error': 'User Unauthorized'}), 403

        # Get form fields
        experience_id = int(request.form.get('experience_id'))
        title = request.form.get('title')
        description = request.form.get('description')
        exp_date = request.form.get('experience_date')
        address = request.form.get('address', '')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')

        # Parse JSON arrays from form data
        keywords = json.loads(request.form.get('keywords', '[]'))
        user_rating = request.form.get('user_rating')
        if user_rating:
            user_rating = int(user_rating)

        # Get uploaded files and captions
        files = request.files.getlist('photos')
        captions = json.loads(request.form.get('captions', '[]'))
        photos_to_delete = json.loads(request.form.get('photos_to_delete', '[]'))

    except (ValueError, json.JSONDecodeError, KeyError) as error:
        return jsonify({"error": f"Invalid input: {str(error)}"}), 400

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

            # Use existing values as defaults if not provided
            title = title or experience['title']
            description = description or experience['description']
            exp_date = exp_date or experience['experience_date']
            address = address or experience['address']
            latitude = latitude or experience['latitude']
            longitude = longitude or experience['longitude']

            # Update experience details
            cur.execute('''
                        UPDATE experiences
                        SET title = %s,
                            description = %s,
                            experience_date = %s,
                            address = %s,
                            latitude = %s,
                            longitude = %s,
                            location = ST_Point(%s, %s)::geography,
                    last_updated = NOW()
                        WHERE experience_id = %s
                            RETURNING experience_id, title, description, experience_date, address,
                            latitude, longitude, user_id, create_date, last_updated
                        ''', (title, description, exp_date, address, latitude, longitude, longitude, latitude, experience_id))
            updated_experience = cur.fetchone()

            # Update keywords (clear and re-add)
            cur.execute("DELETE FROM experience_keywords WHERE experience_id = %s", (experience_id,))
            for kw in keywords:
                cur.execute("INSERT INTO keywords (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", (kw,))
                cur.execute("SELECT keyword_id FROM keywords WHERE name = %s;", (kw,))
                keyword_id = cur.fetchone()['keyword_id']
                cur.execute("""
                            INSERT INTO experience_keywords (experience_id, keyword_id)
                            VALUES (%s, %s) ON CONFLICT DO NOTHING
                            """, (experience_id, keyword_id))

            # Update or insert user rating
            if user_rating and 1 <= user_rating <= 5:
                cur.execute("""
                            INSERT INTO experience_ratings (experience_id, user_id, rating)
                            VALUES (%s, %s, %s)
                                ON CONFLICT (experience_id, user_id)
                    DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
                            """, (experience_id, user_id, user_rating))

            # Delete specified photos (from Firebase and database)
            if photos_to_delete:
                for photo_id in photos_to_delete:
                    # Get photo URL before deleting
                    cur.execute("""
                                SELECT photo_url
                                FROM experience_photos
                                WHERE photo_id = %s
                                """, (photo_id,))
                    photo = cur.fetchone()

                    if photo:
                        # Delete from database
                        cur.execute("""
                                    DELETE
                                    FROM experience_photos
                                    WHERE photo_id = %s
                                    """, (photo_id,))

                        # Delete from Firebase
                        try:
                            delete_from_firebase(photo['photo_url'])
                        except Exception as error:
                            print(f"Error deleting photo {photo_id} from Firebase: {error}")

            # Upload new photos to Firebase & insert metadata into database
            uploaded_photos = []
            for idx, file in enumerate(files):
                if file and file.filename and allowed_file(file.filename):
                    try:
                        # Upload to Firebase Storage
                        photo_url = upload_to_firebase(file, experience_id)

                        # Get caption if provided
                        caption = captions[idx] if idx < len(captions) else ''

                        # Save to database
                        cur.execute("""
                                    INSERT INTO experience_photos (experience_id, photo_url, caption)
                                    VALUES (%s, %s, %s)
                                        RETURNING photo_id, experience_id, photo_url, caption, upload_date
                                    """, (experience_id, photo_url, caption))

                        uploaded_photos.append(cur.fetchone())

                    except Exception as error:
                        print(f"Error uploading {file.filename}: {error}")
                        continue

        conn.commit()
        return jsonify({
            "message": "Experience updated successfully",
            "experience": updated_experience,
            "uploaded_photos": uploaded_photos,
            "deleted_photos": len(photos_to_delete) if photos_to_delete else 0
        }), 200

    except Exception as error:
        conn.rollback()
        print(f"Error updating experience: {str(error)}")
        return jsonify({'error': 'Failed to update experience'}), 500

    finally:
        conn.close()

# ==============================================================================
# Delete
# ==============================================================================
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

# ==============================================================================
# Read
# ==============================================================================
@experiences_bp.route('/all', methods=['GET'])
def get_all_experiences():
    """Retrieve all experiences. (Admin Only)

    Fetches all experiences from the database with:
    - Average rating from all users
    - Rating count from all users
    - Owner's own rating for their experience
    - Keywords associated with the experience

    Ordered by creation date (newest first).
    Requires admin authentication.

    Returns:
        tuple: JSON array of experience objects with ratings & keywords, HTTP 200
    """
    conn = get_db_connection()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                        SELECT e.*,
                               COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS average_rating,
                               COUNT(DISTINCT r.user_id) AS rating_count,
                               ARRAY_AGG(DISTINCT k.name) FILTER (WHERE k.name IS NOT NULL) AS keywords, owner_rating.rating AS owner_rating
                        FROM experiences e
                                 LEFT JOIN experience_ratings r ON e.experience_id = r.experience_id
                                 LEFT JOIN experience_keywords ek ON e.experience_id = ek.experience_id
                                 LEFT JOIN keywords k ON ek.keyword_id = k.keyword_id
                                 LEFT JOIN experience_ratings owner_rating
                                           ON e.experience_id = owner_rating.experience_id
                                               AND e.user_id = owner_rating.user_id
                        GROUP BY e.experience_id, owner_rating.rating
                        ORDER BY e.create_date DESC
                        """)
            results = cur.fetchall()

            # Convert to proper JSON format
            experiences = []
            for exp in results:
                exp_dict = dict(exp)
                # Ensure proper types for Rating
                exp_dict["average_rating"] = float(exp_dict["average_rating"])
                exp_dict["rating_count"] = int(exp_dict["rating_count"])
                # Change experience_date format
                exp_dict["experience_date"] = exp_dict["experience_date"].strftime("%Y-%m-%d")
                experiences.append(exp_dict)

        return jsonify(experiences), 200

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
                               COUNT(DISTINCT r.rating) AS rating_count,
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

            # Get photos metadata
            cur.execute("""
                        SELECT photo_id, photo_url, caption, upload_date
                        FROM experience_photos
                        WHERE experience_id = %s
                        ORDER BY upload_date ASC
                        """, (experience_id,))
            experience['photos'] = cur.fetchall()

            # Ensure proper type for average_rating
            experience["average_rating"] = float(experience["average_rating"])

        return jsonify(experience), 200

    finally:
        conn.close()

@experiences_bp.route('/user-experiences', methods=['GET'])
@require_auth
def get_user_experiences():
    """Retrieve all experiences created by a specific user.

    Fetches all experiences where the user_id matches the provided user_id,
    ordered by creation date (newest first).

    Args:
        user_id (STR): The ID of the user whose experiences are to retrieve

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
                               COUNT(DISTINCT r.rating) AS rating_count,
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

@experiences_bp.route('/user_details/<int:experience_id>', methods=['GET'])
@require_auth
def get_user_experience_details(experience_id):
    """
    Get single experience with all details for editing.

    Returns: experience details, average_rating, user_rating, keywords, and photos.

    Requires authentication.
    """
    user_id = g.user_id

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch experience details with average rating and keywords
            cur.execute("""
                        SELECT e.*,
                               COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS average_rating,
                               COUNT(DISTINCT r.user_id) AS rating_count,
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

            # Verify experience ownership
            if experience['user_id'] != user_id:
                return jsonify({"error": "Unauthorized to edit this experience"}), 403

            # Fetch user-specific rating
            cur.execute("""
                        SELECT rating
                        FROM experience_ratings
                        WHERE experience_id = %s AND user_id = %s
                        """, (experience_id, user_id))
            user_rating = cur.fetchone()

            # Fetch all photos for this experience
            cur.execute("""
                        SELECT photo_id, photo_url, caption, upload_date
                        FROM experience_photos
                        WHERE experience_id = %s
                        ORDER BY upload_date ASC
                        """, (experience_id,))
            photos = cur.fetchall()

            # Add all data to the response object
            experience["owner_rating"] = user_rating["rating"] if user_rating else None
            experience["average_rating"] = float(experience["average_rating"])
            experience["photos"] = photos

            # Format dates for frontend
            experience["experience_date"] = experience["experience_date"].strftime("%Y-%m-%d")
            experience["create_date"] = experience["create_date"].isoformat()
            if experience.get("last_updated"):
                experience["last_updated"] = experience["last_updated"].isoformat()

        return jsonify(experience), 200

    finally:
        conn.close()

@experiences_bp.route('/batch-experiences', methods=['POST'])
@require_auth
def get_batch_experiences():
    """Retrieve all experiences requested by a specific user.

    Fetches all experiences where the user_id matches the provided user_id,
    ordered by creation date (newest first).

    Args:
        user_id (STR): The ID of the user whose experiences are to retrieve

    Returns:
        tuple: JSON array of experience objects and HTTP 200
    """
    data=request.get_json()

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

    except Exception as error:
        print(f"Error fetching top experiences: {str(error)}")
        return jsonify({'error': 'Failed to fetch top experiences'}), 500

    finally:
        conn.close()

# ==============================================================================
# Location-based Search
# ==============================================================================
@experiences_bp.route('/location', methods=['POST'])
def get_experiences_by_location():
    """
    Query experiences within map bounds.

    Expected JSON body:
    {
        "northEast": {"lat": float, "lng": float},
        "southWest": {"lat": float, "lng": float}
    }

    Returns: Array of Experience objects within bounds (max 200)
    """
    data = request.get_json()

    # Validate request structure
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    ne = data.get('northEast', {})
    sw = data.get('southWest', {})

    # Extract and validate coordinates
    ne_lat, ne_lng = ne.get('lat'), ne.get('lng')
    sw_lat, sw_lng = sw.get('lat'), sw.get('lng')

    # Check all coordinates present
    if not all([ne_lat is not None, ne_lng is not None,
                sw_lat is not None, sw_lng is not None]):
        return jsonify({'error': 'Missing coordinates'}), 400

    # Validate coordinate ranges (basic validation)
    try:
        ne_lat, ne_lng = float(ne_lat), float(ne_lng)
        sw_lat, sw_lng = float(sw_lat), float(sw_lng)

        if not (-90 <= ne_lat <= 90 and -90 <= sw_lat <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        if not (-180 <= ne_lng <= 180 and -180 <= sw_lng <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'Coordinates must be numeric'}), 400

    # ⭐ PHASE 1 SAFEGUARD: Prevent massive area searches
    lat_span = abs(ne_lat - sw_lat)
    lng_span = abs(ne_lng - sw_lng)
    if lat_span > MAX_BOX_SIZE or lng_span > MAX_BOX_SIZE:
        return jsonify({
            'error': 'Search area too large',
            'message': f'Please zoom in. Maximum area: {MAX_BOX_SIZE}° x {MAX_BOX_SIZE}°'
        }), 400

    # Database query
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    e.*,
                    ARRAY_AGG(DISTINCT k.name) FILTER (WHERE k.name IS NOT NULL) AS keywords,
                    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0.0) AS average_rating,
                    COUNT(DISTINCT r.user_id) AS rating_count,
                    owner_rating.rating AS owner_rating
                FROM experiences e
                    LEFT JOIN experience_keywords ek ON e.experience_id = ek.experience_id
                    LEFT JOIN keywords k ON ek.keyword_id = k.keyword_id
                    LEFT JOIN experience_ratings r ON e.experience_id = r.experience_id
                    LEFT JOIN experience_ratings owner_rating
                        ON e.experience_id = owner_rating.experience_id
                        AND e.user_id = owner_rating.user_id
                WHERE
                    e.latitude BETWEEN %s AND %s
                    AND e.longitude BETWEEN %s AND %s
                GROUP BY e.experience_id, owner_rating.rating
                ORDER BY average_rating DESC, e.create_date DESC
                LIMIT %s
            """, (sw_lat, ne_lat, sw_lng, ne_lng, RESULTS_LIMIT))

            experiences = cur.fetchall()

            # Fetch photos for each experience (Phase 1: simple loop)
            # TODO Phase 2: Optimize with bulk fetch
            for exp in experiences:
                cur.execute("""
                    SELECT photo_id, photo_url, caption, upload_date
                    FROM experience_photos
                    WHERE experience_id = %s
                    ORDER BY upload_date
                """, (exp['experience_id'],))
                photos = cur.fetchall()
                exp['photos'] = photos if photos else []

            # Convert to proper JSON format
            result_experiences = []
            for exp in experiences:
                exp_dict = dict(exp)
                # Ensure proper types
                exp_dict["average_rating"] = float(exp_dict["average_rating"])
                exp_dict["rating_count"] = int(exp_dict["rating_count"])
                # Format dates
                exp_dict["experience_date"] = exp_dict["experience_date"].strftime("%Y-%m-%d")
                exp_dict["create_date"] = exp_dict["create_date"].isoformat()
                if exp_dict.get("last_updated"):
                    exp_dict["last_updated"] = exp_dict["last_updated"].isoformat()
                result_experiences.append(exp_dict)

            return jsonify(result_experiences), 200

    except Exception as e:
        print(f"Location search error: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Database error', 'message': str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# Rate
# ==============================================================================
@experiences_bp.route('/rate', methods=['POST'])
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
