import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

def insert_sample_experiences():
    """Insert sample experiences data into the database"""

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
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Statue of Liberty Crown Access",
            "description": "Climbed 354 steps to the crown for panoramic views of NYC harbor. Book tickets months in advance - they sell out quickly. The climb is narrow and can be claustrophobic, but the view is incredible. Security is thorough, similar to airport screening. Only small items allowed. The museum on Liberty Island is also excellent and included with your ticket.",
            "experience_date": "2025-04-20",
            "address": "Liberty Island, New York, NY 10004, USA",
            "latitude": 40.6892,
            "longitude": -74.0445,
            "keywords": ["monument", "history", "city view", "museum", "iconic landmark"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Antelope Canyon Lower Tour",
            "description": "Otherworldly slot canyon with stunning light beams (best March-October around noon). Booked guided tour - required for entry. The canyon is narrow and involves climbing some metal stairs. Highly recommend bringing a camera, though phone photos also turn out amazing. Tours are limited to preserve the site. Wear sturdy shoes as the ground can be uneven.",
            "experience_date": "2025-06-28",
            "address": "Antelope Canyon, Page, AZ 86040, USA",
            "latitude": 36.8619,
            "longitude": -111.3743,
            "keywords": ["slot canyon", "photography", "guided tour", "natural wonder", "desert"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "French Quarter Jazz Walk",
            "description": "Spent an evening strolling through the historic French Quarter. Live jazz music spills from every bar on Bourbon Street. Frenchmen Street has the best authentic jazz clubs. Grabbed beignets at Café Du Monde (open 24/7) - arrive early or late to avoid lines. The architecture with wrought-iron balconies is beautiful. Keep belongings secure in crowded areas.",
            "experience_date": "2025-03-15",
            "address": "French Quarter, New Orleans, LA 70116, USA",
            "latitude": 29.9584,
            "longitude": -90.0644,
            "keywords": ["jazz music", "nightlife", "historic district", "food", "culture"],
            "user_rating": 4
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Yosemite Valley Hiking Trail",
            "description": "Hiked the Mist Trail to Vernal Fall - 5.4 miles round trip with stunning views. Trail is well-maintained but steep in sections. The mist from the waterfall soaks you near the top - wear a rain jacket or embrace getting wet! Arrived at the park at 6 AM to secure parking. Bring plenty of water, snacks, and sun protection. Best visited in late spring when waterfall flow is strongest.",
            "experience_date": "2025-05-25",
            "address": "Yosemite Valley, CA 95389, USA",
            "latitude": 37.7456,
            "longitude": -119.5934,
            "keywords": ["hiking", "waterfall", "national park", "nature", "scenic view"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Space Needle Observation Deck",
            "description": "360-degree views of Seattle from the iconic 520-foot tower. The rotating glass floor is both thrilling and terrifying. Book tickets online for a discount and skip-the-line access. Sunset timing is popular but crowded. The outdoor observation deck allows for great photos without glare. Staff are knowledgeable and point out landmarks. Plan to spend 45-60 minutes.",
            "experience_date": "2025-08-05",
            "address": "400 Broad St, Seattle, WA 98109, USA",
            "latitude": 47.6205,
            "longitude": -122.3493,
            "keywords": ["observation deck", "city view", "iconic landmark", "architecture", "urban"],
            "user_rating": 4
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Alcatraz Island Night Tour",
            "description": "Night tour offers a unique, eerie perspective on the famous former prison. Less crowded than daytime tours. The audio guide with prisoner and guard testimonials is incredibly immersive. Dress warmly - island winds can be cold even in summer. The ferry ride provides beautiful views of San Francisco's skyline at night. Book well in advance - tours sell out weeks ahead.",
            "experience_date": "2025-07-18",
            "address": "Alcatraz Island, San Francisco, CA 94133, USA",
            "latitude": 37.8267,
            "longitude": -122.4233,
            "keywords": ["historic site", "prison tour", "museum", "night tour", "boat ride"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Zion National Park Angels Landing",
            "description": "Challenging 5.4-mile hike with 1,500 feet elevation gain to one of the most famous viewpoints in America. The final half-mile involves chain-assisted scrambling with sheer drop-offs - not for those afraid of heights. Started at sunrise to beat the heat and crowds. Permit required (lottery system). The views from the top are absolutely breathtaking and worth the effort.",
            "experience_date": "2025-09-22",
            "address": "Zion National Park, Springdale, UT 84767, USA",
            "latitude": 37.2690,
            "longitude": -112.9473,
            "keywords": ["hiking", "extreme trail", "national park", "scenic view", "adventure"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Bourbon Street Late Night Experience",
            "description": "The party atmosphere on Bourbon Street is unlike anywhere else. Street performers, live bands, and neon lights create electric energy. Tried a Hurricane cocktail at Pat O'Brien's - strong and sweet. Open container laws mean you can walk the street with drinks. Gets very crowded and rowdy after 10 PM. Not ideal for families with young children.",
            "experience_date": "2025-03-16",
            "address": "Bourbon St, New Orleans, LA 70130, USA",
            "latitude": 29.9546,
            "longitude": -90.0678,
            "keywords": ["nightlife", "party", "bars", "live music", "street performance"],
            "user_rating": 3
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Redwood National Park Drive",
            "description": "Drove the Avenue of the Giants - 31-mile scenic route through ancient redwood forests. Stopped at several groves to walk among trees over 1,000 years old. The scale is hard to comprehend until you're standing next to them. Founder's Grove and Rockefeller Forest are must-see stops. Peaceful and humbling experience. Free to drive and explore. Allow 2-3 hours minimum.",
            "experience_date": "2025-08-30",
            "address": "Avenue of the Giants, Humboldt County, CA 95571, USA",
            "latitude": 40.3520,
            "longitude": -123.9279,
            "keywords": ["scenic drive", "old-growth forest", "nature", "hiking", "redwoods"],
            "user_rating": 5
        },
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "title": "Savannah Historic District Walking Tour",
            "description": "Self-guided walk through 22 beautiful park squares filled with Spanish moss-draped oak trees. The architecture is stunning - antebellum mansions and historic churches on every block. Stopped at several museums and the famous Forsyth Park fountain. Very walkable city with plenty of restaurants and cafes. Free to explore, though some historic homes charge admission. Best in spring or fall when weather is mild.",
            "experience_date": "2025-04-10",
            "address": "Historic District, Savannah, GA 31401, USA",
            "latitude": 32.0809,
            "longitude": -81.0912,
            "keywords": ["historic district", "architecture", "walking tour", "southern charm", "parks"],
            "user_rating": 4
        }
    ]

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            for exp in experiences:
                # Insert experience with postGIS data
                cur.execute("""
                    INSERT INTO experiences
                    (user_id, title, description, experience_date, address, latitude, longitude, location)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, ST_Point(%s, %s)::geography)
                    RETURNING experience_id
                """, (
                    exp["user_id"],
                    exp["title"],
                    exp["description"],
                    exp["experience_date"],
                    exp["address"],
                    exp["latitude"],
                    exp["longitude"],
                    exp["longitude"],
                    exp["latitude"]
                ))

                experience_id = cur.fetchone()[0]
                print(f"✓ Inserted: {exp['title']} (ID: {experience_id})")

                # Insert keywords
                for keyword_name in exp["keywords"]:
                    # Insert or get keyword
                    cur.execute("""
                        INSERT INTO keywords (name)
                        VALUES (%s) 
                        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                        RETURNING keyword_id
                    """, (keyword_name,))

                    keyword_id = cur.fetchone()[0]

                    # Link keyword to experience
                    cur.execute("""
                        INSERT INTO experience_keywords (experience_id, keyword_id)
                        VALUES (%s, %s) ON CONFLICT DO NOTHING
                    """, (experience_id, keyword_id))

                print(f"  → Added {len(exp['keywords'])} keywords")

                # Insert rating
                if "user_rating" in exp:
                    cur.execute("""
                        INSERT INTO experience_ratings (experience_id, user_id, rating)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (experience_id, user_id) 
                        DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
                    """, (experience_id, exp["user_id"], exp["user_rating"]))
                    print(f"  → Added rating: {exp['user_rating']}/5")

        conn.commit()
        print(f"\n{'='*60}")
        print(f"✓ Successfully inserted {len(experiences)} experiences!")
        print(f"{'='*60}")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error inserting experiences: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    insert_sample_experiences()