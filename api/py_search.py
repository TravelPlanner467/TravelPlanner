import os
import psycopg2
from dotenv import load_dotenv
from flask import jsonify, Blueprint, request
from psycopg2.extras import RealDictCursor
import math

search_bp = Blueprint('search', __name__)

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula.

    Args:
        lat1 (float): Latitude of first point
        lon1 (float): Longitude of first point
        lat2 (float): Latitude of second point
        lon2 (float): Longitude of second point

    Returns:
        float: Distance in kilometers
    """
    # Radius of Earth in kilometers
    R = 6371.0

    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance


@search_bp.route('', methods=['GET'])
def search_root():
    """Root endpoint for search service."""
    return jsonify({"message": "Hello from Search API"})


@search_bp.route('/keyword', methods=['GET'])
def search_by_keyword():
    """Search experiences by keyword.

    Searches through experience titles, descriptions, and keywords array.
    Returns results ranked by relevance and user rating.

    Query Parameters:
        q (str): Search query string (required)
        limit (int): Maximum number of results to return (default: 50)
        offset (int): Number of results to skip for pagination (default: 0)

    Returns:
        tuple: JSON array of matching experience objects with relevance scores, HTTP 200
    """
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)

    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400

    # Validate limit and offset
    if limit < 1 or limit > 100:
        limit = 50
    if offset < 0:
        offset = 0

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Search using ILIKE for case-insensitive pattern matching
            # Also search in the keywords array
            search_pattern = f'%{query}%'

            cur.execute("""
                SELECT
                    *,
                    CASE
                        WHEN LOWER(title) LIKE LOWER(%s) THEN 3
                        WHEN LOWER(description) LIKE LOWER(%s) THEN 2
                        WHEN EXISTS (
                            SELECT 1 FROM unnest(keywords) AS keyword
                            WHERE LOWER(keyword) LIKE LOWER(%s)
                        ) THEN 1
                        ELSE 0
                    END as relevance_score
                FROM experiences
                WHERE
                    LOWER(title) LIKE LOWER(%s)
                    OR LOWER(description) LIKE LOWER(%s)
                    OR EXISTS (
                        SELECT 1 FROM unnest(keywords) AS keyword
                        WHERE LOWER(keyword) LIKE LOWER(%s)
                    )
                ORDER BY
                    relevance_score DESC,
                    user_rating DESC NULLS LAST,
                    create_date DESC
                LIMIT %s OFFSET %s
            """, (search_pattern, search_pattern, search_pattern,
                  search_pattern, search_pattern, search_pattern,
                  limit, offset))

            experiences = cur.fetchall()

            return jsonify({
                'query': query,
                'count': len(experiences),
                'limit': limit,
                'offset': offset,
                'results': [dict(exp) for exp in experiences]
            }), 200

    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({'error': 'Search failed', 'message': str(e)}), 500
    finally:
        conn.close()


@search_bp.route('/location', methods=['GET'])
def search_by_location():
    """Search experiences by geographic location.

    Finds experiences within a specified radius of given coordinates.

    Query Parameters:
        lat (float): Latitude (required)
        lon (float): Longitude (required)
        radius (float): Search radius in kilometers (default: 50, max: 500)
        limit (int): Maximum number of results (default: 50)
        offset (int): Number of results to skip (default: 0)

    Returns:
        tuple: JSON array of experiences with distance information, HTTP 200
    """
    try:
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        radius = float(request.args.get('radius', 50))
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid coordinates or radius'}), 400

    if not lat or not lon:
        return jsonify({'error': 'Latitude (lat) and longitude (lon) are required'}), 400

    # Validate parameters
    if lat < -90 or lat > 90:
        return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
    if lon < -180 or lon > 180:
        return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
    if radius < 1:
        radius = 50
    if radius > 500:
        radius = 500
    if limit < 1 or limit > 100:
        limit = 50
    if offset < 0:
        offset = 0

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Using Haversine formula for distance calculation
            # This calculates the distance in kilometers
            # Using subquery to allow filtering on calculated distance
            cur.execute("""
                SELECT * FROM (
                    SELECT
                        *,
                        (
                            6371 * acos(
                                cos(radians(%s)) *
                                cos(radians(latitude)) *
                                cos(radians(longitude) - radians(%s)) +
                                sin(radians(%s)) *
                                sin(radians(latitude))
                            )
                        ) AS distance_km
                    FROM experiences
                    WHERE
                        latitude IS NOT NULL
                        AND longitude IS NOT NULL
                ) AS exp_with_distance
                WHERE distance_km <= %s
                ORDER BY
                    distance_km ASC,
                    user_rating DESC NULLS LAST
                LIMIT %s OFFSET %s
            """, (lat, lon, lat, radius, limit, offset))

            experiences = cur.fetchall()

            return jsonify({
                'location': {'lat': lat, 'lon': lon},
                'radius_km': radius,
                'count': len(experiences),
                'limit': limit,
                'offset': offset,
                'results': [dict(exp) for exp in experiences]
            }), 200

    except Exception as e:
        print(f"Location search error: {e}")
        return jsonify({'error': 'Location search failed', 'message': str(e)}), 500
    finally:
        conn.close()


@search_bp.route('/combined', methods=['GET'])
def search_combined():
    """Search experiences by both keyword and location.

    Combines keyword search with geographic filtering.
    Results are ranked by relevance, distance, and rating.

    Query Parameters:
        q (str): Search query string (required)
        lat (float): Latitude (required)
        lon (float): Longitude (required)
        radius (float): Search radius in kilometers (default: 50, max: 500)
        limit (int): Maximum number of results (default: 50)
        offset (int): Number of results to skip (default: 0)

    Returns:
        tuple: JSON array of matching experiences with relevance and distance, HTTP 200
    """
    query = request.args.get('q', '').strip()

    try:
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        radius = float(request.args.get('radius', 50))
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid coordinates or radius'}), 400

    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    if not lat or not lon:
        return jsonify({'error': 'Latitude (lat) and longitude (lon) are required'}), 400

    # Validate parameters
    if lat < -90 or lat > 90:
        return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
    if lon < -180 or lon > 180:
        return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
    if radius < 1:
        radius = 50
    if radius > 500:
        radius = 500
    if limit < 1 or limit > 100:
        limit = 50
    if offset < 0:
        offset = 0

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            search_pattern = f'%{query}%'

            # Using subquery to allow filtering on calculated distance and relevance
            cur.execute("""
                SELECT * FROM (
                    SELECT
                        *,
                        CASE
                            WHEN LOWER(title) LIKE LOWER(%s) THEN 3
                            WHEN LOWER(description) LIKE LOWER(%s) THEN 2
                            WHEN EXISTS (
                                SELECT 1 FROM unnest(keywords) AS keyword
                                WHERE LOWER(keyword) LIKE LOWER(%s)
                            ) THEN 1
                            ELSE 0
                        END as relevance_score,
                        (
                            6371 * acos(
                                cos(radians(%s)) *
                                cos(radians(latitude)) *
                                cos(radians(longitude) - radians(%s)) +
                                sin(radians(%s)) *
                                sin(radians(latitude))
                            )
                        ) AS distance_km
                    FROM experiences
                    WHERE
                        latitude IS NOT NULL
                        AND longitude IS NOT NULL
                        AND (
                            LOWER(title) LIKE LOWER(%s)
                            OR LOWER(description) LIKE LOWER(%s)
                            OR EXISTS (
                                SELECT 1 FROM unnest(keywords) AS keyword
                                WHERE LOWER(keyword) LIKE LOWER(%s)
                            )
                        )
                ) AS exp_with_scores
                WHERE distance_km <= %s
                ORDER BY
                    relevance_score DESC,
                    distance_km ASC,
                    user_rating DESC NULLS LAST
                LIMIT %s OFFSET %s
            """, (search_pattern, search_pattern, search_pattern,
                  lat, lon, lat,
                  search_pattern, search_pattern, search_pattern,
                  radius, limit, offset))

            experiences = cur.fetchall()

            return jsonify({
                'query': query,
                'location': {'lat': lat, 'lon': lon},
                'radius_km': radius,
                'count': len(experiences),
                'limit': limit,
                'offset': offset,
                'results': [dict(exp) for exp in experiences]
            }), 200

    except Exception as e:
        print(f"Combined search error: {e}")
        return jsonify({'error': 'Combined search failed', 'message': str(e)}), 500
    finally:
        conn.close()


@search_bp.route('/suggestions', methods=['GET'])
def get_search_suggestions():
    """Get keyword suggestions based on partial query.

    Returns unique keywords and titles that match the partial query.
    Useful for autocomplete functionality.

    Query Parameters:
        q (str): Partial query string (required, min 2 characters)
        limit (int): Maximum number of suggestions (default: 10, max: 20)

    Returns:
        tuple: JSON array of suggestion strings, HTTP 200
    """
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', 10, type=int)

    if not query or len(query) < 2:
        return jsonify({'error': 'Query must be at least 2 characters'}), 400

    if limit < 1 or limit > 20:
        limit = 10

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            search_pattern = f'{query}%'

            # Get suggestions from titles and keywords
            cur.execute("""
                WITH keyword_suggestions AS (
                    SELECT DISTINCT unnest(keywords) as suggestion
                    FROM experiences
                    WHERE EXISTS (
                        SELECT 1 FROM unnest(keywords) AS k
                        WHERE LOWER(k) LIKE LOWER(%s)
                    )
                ),
                title_suggestions AS (
                    SELECT DISTINCT title as suggestion
                    FROM experiences
                    WHERE LOWER(title) LIKE LOWER(%s)
                )
                SELECT suggestion FROM keyword_suggestions
                UNION
                SELECT suggestion FROM title_suggestions
                ORDER BY suggestion
                LIMIT %s
            """, (search_pattern, search_pattern, limit))

            suggestions = cur.fetchall()

            return jsonify({
                'query': query,
                'suggestions': [s['suggestion'] for s in suggestions]
            }), 200

    except Exception as e:
        print(f"Suggestions error: {e}")
        return jsonify({'error': 'Failed to get suggestions', 'message': str(e)}), 500
    finally:
        conn.close()
