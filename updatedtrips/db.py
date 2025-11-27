import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    conn = psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )
    return conn


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Create users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create trips table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS trips (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            keywords TEXT,
            start_date DATE,
            end_date DATE,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create trip_experiences junction table (NEW)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS trip_experiences (
            trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
            experience_id INTEGER NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (trip_id, experience_id)
        )
    ''')

    # Create indexes
    cur.execute('''
        CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id)
    ''')
    
    cur.execute('''
        CREATE INDEX IF NOT EXISTS idx_trip_experiences_order 
        ON trip_experiences(trip_id, display_order)
    ''')

    # Add a mock user for testing
    cur.execute('''
        INSERT INTO users (username, role)
        VALUES ('test_user', 'user')
        ON CONFLICT (username) DO NOTHING
    ''')

    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized successfully!")
    print("Tables created: users, trips, trip_experiences")
    print("Mock user created: username='test_user'")
