from flask import Flask, request, jsonify, render_template
from db import get_db_connection, init_db
import os
import requests

app = Flask(__name__)

# Configuration for experiences microservice
EXPERIENCES_SERVICE_URL = os.getenv('EXPERIENCES_SERVICE_URL', 'http://127.0.0.1:5001')

with app.app_context():
    init_db()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, username, role FROM users ORDER BY username')
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users)


@app.route('/api/trips', methods=['GET'])
def get_trips():
    user_id = request.args.get('user_id')

    conn = get_db_connection()
    cur = conn.cursor()

    if user_id:
        cur.execute('''
            SELECT t.*, u.username 
            FROM trips t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.user_id = %s 
            ORDER BY t.start_date DESC
        ''', (user_id,))
    else:
        cur.execute('''
            SELECT t.*, u.username 
            FROM trips t 
            JOIN users u ON t.user_id = u.id 
            ORDER BY t.start_date DESC
        ''')

    trips = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(trips)


@app.route('/api/trips/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Get trip details
    cur.execute('''
        SELECT t.user_id, t.id as trip_id, t.title, t.description, 
               t.start_date, t.end_date, u.username 
        FROM trips t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.id = %s
    ''', (trip_id,))

    trip = cur.fetchone()

    if not trip:
        cur.close()
        conn.close()
        return jsonify({'error': 'Trip not found'}), 404

    # Get trip_experiences (mapping table) for this trip
    cur.execute('''
        SELECT experience_id, display_order
        FROM trip_experiences
        WHERE trip_id = %s
        ORDER BY display_order
    ''', (trip_id,))

    trip_experiences = cur.fetchall()
    cur.close()
    conn.close()

    # Build the response object
    response = {
        "user_id": str(trip['user_id']),
        "trip_id": str(trip['trip_id']),
        "title": str(trip['title']) if trip['title'] else "",
        "description": str(trip['description']) if trip['description'] else "",
        "start_date": str(trip['start_date']) if trip['start_date'] else "",
        "end_date": str(trip['end_date']) if trip['end_date'] else "",
        "experiences": []
    }

    # Fetch experience details from experiences microservice
    for trip_exp in trip_experiences:
        experience_id = trip_exp['experience_id']
        display_order = trip_exp['display_order']

        try:
            # Call experiences microservice
            exp_response = requests.get(
                f"{EXPERIENCES_SERVICE_URL}/experiences/{experience_id}",
                timeout=5
            )

            if exp_response.status_code == 200:
                exp_data = exp_response.json()

                # Format experience data according to spec
                experience_obj = {
                    "experience_id": str(exp_data['experience_id']),
                    "title": str(exp_data.get('title', '')),
                    "order": display_order if display_order is not None else 0,
                    "location": {
                        "lat": float(exp_data.get('latitude', 0.0)),
                        "lng": float(exp_data.get('longitude', 0.0)),
                        "address": str(exp_data.get('address', ''))
                    },
                    "description": str(exp_data.get('description', '')),
                    "average_rating": float(exp_data.get('user_rating', 0.0)) if exp_data.get('user_rating') else 0.0
                }
                response['experiences'].append(experience_obj)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching experience {experience_id}: {e}")
            # Continue with other experiences even if one fails
            continue

    return jsonify(response)


@app.route('/api/trips', methods=['POST'])
def create_trip():
    data = request.get_json()

    if not data.get('user_id') or not data.get('title'):
        return jsonify({'error': 'user_id and title are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('''
            INSERT INTO trips (user_id, title, keywords, start_date, end_date, description)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING *
        ''', (
            data['user_id'],
            data['title'],
            data.get('keywords'),
            data.get('start_date'),
            data.get('end_date'),
            data.get('description')
        ))
        new_trip = cur.fetchone()
        conn.commit()
        return jsonify(new_trip), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@app.route('/api/trips/<int:trip_id>', methods=['PUT'])
def update_trip(trip_id):
    data = request.get_json()

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('''
            UPDATE trips 
            SET title = COALESCE(%s, title),
                keywords = COALESCE(%s, keywords),
                start_date = COALESCE(%s, start_date),
                end_date = COALESCE(%s, end_date),
                description = COALESCE(%s, description)
            WHERE id = %s
            RETURNING *
        ''', (
            data.get('title'),
            data.get('keywords'),
            data.get('start_date'),
            data.get('end_date'),
            data.get('description'),
            trip_id
        ))
        updated_trip = cur.fetchone()
        conn.commit()

        if updated_trip:
            return jsonify(updated_trip)
        return jsonify({'error': 'Trip not found'}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@app.route('/api/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM trips WHERE id = %s RETURNING id', (trip_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if deleted:
        return '', 204
    return jsonify({'error': 'Trip not found'}), 404


@app.route('/api/trips/<int:trip_id>/experiences', methods=['POST'])
def add_experience_to_trip(trip_id):
    """Add an existing experience to a trip"""
    data = request.get_json()

    if not data.get('experience_id'):
        return jsonify({'error': 'experience_id is required'}), 400

    experience_id = data['experience_id']
    display_order = data.get('order', 0)

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Verify trip exists
        cur.execute('SELECT id FROM trips WHERE id = %s', (trip_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Trip not found'}), 404

        # Verify experience exists in experiences microservice
        try:
            exp_response = requests.get(
                f"{EXPERIENCES_SERVICE_URL}/experiences/{experience_id}",
                timeout=5
            )
            if exp_response.status_code != 200:
                return jsonify({'error': 'Experience not found'}), 404
        except requests.exceptions.RequestException as e:
            return jsonify({'error': 'Could not verify experience'}), 500

        # Add to trip_experiences
        cur.execute('''
            INSERT INTO trip_experiences (trip_id, experience_id, display_order)
            VALUES (%s, %s, %s)
            ON CONFLICT (trip_id, experience_id) 
            DO UPDATE SET display_order = EXCLUDED.display_order
            RETURNING *
        ''', (trip_id, experience_id, display_order))

        trip_experience = cur.fetchone()
        conn.commit()
        return jsonify(trip_experience), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@app.route('/api/trips/<int:trip_id>/experiences/<int:experience_id>', methods=['DELETE'])
def remove_experience_from_trip(trip_id, experience_id):
    """Remove an experience from a trip"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('''
        DELETE FROM trip_experiences 
        WHERE trip_id = %s AND experience_id = %s 
        RETURNING *
    ''', (trip_id, experience_id))

    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if deleted:
        return '', 204
    return jsonify({'error': 'Trip experience not found'}), 404


@app.route('/api/experiences/update_order', methods=['PUT'])
def update_experience_order():
    """
    Update the order of multiple experiences within a trip
    Expected JSON format:
    {
        "trip_id": "1",
        "updates": [
            {"experience_id": "101", "order": 1},
            {"experience_id": "102", "order": 2},
            ...
        ]
    }
    """
    data = request.get_json()

    if not data or 'updates' not in data or 'trip_id' not in data:
        return jsonify({'error': 'trip_id and updates array are required'}), 400

    trip_id = data['trip_id']
    updates = data['updates']

    if not isinstance(updates, list) or len(updates) == 0:
        return jsonify({'error': 'updates must be a non-empty array'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Update each experience's order within the trip
        for update in updates:
            experience_id = update.get('experience_id')
            order = update.get('order')

            if experience_id is None or order is None:
                conn.rollback()
                return jsonify({'error': 'Each update must have experience_id and order'}), 400

            cur.execute('''
                UPDATE trip_experiences 
                SET display_order = %s
                WHERE trip_id = %s AND experience_id = %s
            ''', (order, trip_id, experience_id))

        conn.commit()
        return jsonify({'message': 'Experience orders updated successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
