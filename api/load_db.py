import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')


def insert_sample_experiences():
    """Insert sample experiences data into the database"""

    # Sample experiences data
    experiences = [
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Grand Canyon South Rim Sunset",
            "description": "Breathtaking sunset view from Mather Point. Arrived around 6 PM and watched the canyon walls transform through shades of orange and red. The crowd was manageable, and there are accessible viewing platforms with safety railings. Highly recommend bringing layers as temperature drops quickly after sunset.",
            "experience_date": "2025-06-15",
            "address": "Grand Canyon Village, AZ 86023, USA",
            "latitude": 36.0544,
            "longitude": -112.1401,
            "keywords": ["scenic view", "national park", "sunset", "photography", "hiking"],
            "user_rating": 4
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Cloud Gate (The Bean) Morning Visit",
            "description": "Iconic Chicago sculpture in Millennium Park. Best visited early morning (7-8 AM) before crowds arrive for unobstructed photos. The reflective surface creates amazing distorted city skyline views. Free to visit and right in the heart of downtown. Spent about 30 minutes taking photos from different angles.",
            "experience_date": "2025-08-22",
            "address": "201 E Randolph St, Chicago, IL 60602, USA",
            "latitude": 41.8827,
            "longitude": -87.6233,
            "keywords": ["art installation", "photography", "city landmark", "free activity", "urban"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Santa Monica Pier at Sunset",
            "description": "Classic California beach experience with the iconic Ferris wheel and arcade. The pier gets busy on weekends but the atmosphere is fun and family-friendly. Great street performers, fresh seafood options, and the beach below is perfect for an evening stroll. Parking can be challenging - arrive early or use public transit.",
            "experience_date": "2025-07-10",
            "address": "200 Santa Monica Pier, Santa Monica, CA 90401, USA",
            "latitude": 34.0101,
            "longitude": -118.4967,
            "keywords": ["beach", "pier", "family-friendly", "amusement", "seafood", "sunset"],
            "user_rating": 2
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Old Faithful Geyser Eruption",
            "description": "Witnessed three eruptions of this famous geyser in Yellowstone. Erupts approximately every 90 minutes, shooting water 130-180 feet high for 2-5 minutes. The visitor center provides predicted eruption times. Arrive 20 minutes early to get a good viewing spot on the benches. Absolutely worth the wait - a true natural wonder.",
            "experience_date": "2025-09-05",
            "address": "Old Faithful, Yellowstone National Park, WY 82190, USA",
            "latitude": 44.4605,
            "longitude": -110.8283,
            "keywords": ["geyser", "national park", "natural wonder", "wildlife", "geothermal"],
            "user_rating": 3
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Horseshoe Bend Overlook Hike",
            "description": "Stunning 1,000-foot drop Colorado River bend viewpoint. The hike is 1.5 miles round trip over sandy terrain with no shade - bring plenty of water and sunscreen. Best lighting for photos is early morning or late afternoon. There's a safety rail at the overlook now, but still not recommended for those with fear of heights. Parking fee is $10.",
            "experience_date": "2025-05-18",
            "address": "Horseshoe Bend, Page, AZ 86040, USA",
            "latitude": 36.8790,
            "longitude": -111.5105,
            "keywords": ["hiking", "scenic view", "photography", "desert", "river"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Pike Place Market Food Tour",
            "description": "Started at the famous fish-throwing stall, then explored local vendors selling fresh produce, artisan cheeses, and baked goods. Don't miss the original Starbucks location (expect a line). The market has multiple levels - explore the lower floors for unique crafts and antiques. Budget 2-3 hours to fully experience everything. Cash is helpful for smaller vendors.",
            "experience_date": "2025-10-12",
            "address": "85 Pike St, Seattle, WA 98101, USA",
            "latitude": 47.6097,
            "longitude": -122.3422,
            "keywords": ["food market", "local cuisine", "shopping", "cultural", "seafood", "urban"],
            "user_rating": 4
        }
    ]

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            for exp in experiences:
                # Insert experience
                cur.execute("""
                            INSERT INTO experiences
                            (user_id, title, description, experience_date, address, latitude, longitude)
                            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING experience_id
                            """, (
                                exp["user_id"],
                                exp["title"],
                                exp["description"],
                                exp["experience_date"],
                                exp["address"],
                                exp["latitude"],
                                exp["longitude"]
                            ))

                experience_id = cur.fetchone()[0]
                print(f"Inserted experience: {exp['title']} (ID: {experience_id})")

                # Insert keywords and link them to experience
                for keyword_name in exp["keywords"]:
                    # Insert or get keyword
                    cur.execute("""
                                INSERT INTO keywords (name)
                                VALUES (%s) ON CONFLICT (name) DO
                                UPDATE SET name = EXCLUDED.name
                                    RETURNING keyword_id
                                """, (keyword_name,))

                    keyword_id = cur.fetchone()[0]

                    # Link keyword to experience
                    cur.execute("""
                                INSERT INTO experience_keywords (experience_id, keyword_id)
                                VALUES (%s, %s) ON CONFLICT DO NOTHING
                                """, (experience_id, keyword_id))

                print(f"  Added {len(exp['keywords'])} keywords")

                # Insert rating for this experience
                if "user_rating" in exp:
                    cur.execute("""
                                INSERT INTO experience_ratings (experience_id, user_id, rating)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (experience_id, user_id) 
                                DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
                                """, (experience_id, exp["user_id"], exp["user_rating"]))
                    print(f"  Added rating: {exp['user_rating']}/5")

        conn.commit()
        print(f"\nSuccessfully inserted {len(experiences)} experiences!")

    except Exception as e:
        conn.rollback()
        print(f"Error inserting  {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    insert_sample_experiences()
