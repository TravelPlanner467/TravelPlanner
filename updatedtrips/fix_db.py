
from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

print("Adding description column...")
cur.execute('ALTER TABLE trips ADD COLUMN IF NOT EXISTS description TEXT;')

conn.commit()
cur.close()
conn.close()

print('Description column added successfully!')