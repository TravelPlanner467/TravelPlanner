#!/usr/bin/env python3
"""
Test script to demonstrate the trip-experiences integration
Run this after both services are running
"""

import requests
import json

TRIPS_URL = "http://127.0.0.1:5000"
EXPERIENCES_URL = "http://127.0.0.1:5001"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_integration():
    """Test the complete workflow"""
    
    print("\n🚀 Testing Trip-Experiences Integration\n")
    
    # Step 1: Create an experience in the experiences microservice
    print("\n📝 Step 1: Creating an experience...")
    experience_data = {
        "user_id": "testuser123",
        "title": "Golden Gate Bridge Walk",
        "description": "A scenic stroll across the iconic bridge with panoramic views",
        "experience_date": "2025-08-15",
        "address": "Golden Gate Bridge, San Francisco, CA",
        "latitude": 37.8199,
        "longitude": -122.4783,
        "keywords": ["bridge", "scenic", "walking", "san francisco"]
    }
    
    response = requests.post(
        f"{EXPERIENCES_URL}/experiences",
        json=experience_data,
        headers={"X-User-Id": "testuser123"}
    )
    print_response("Created Experience", response)
    
    if response.status_code != 201:
        print("❌ Failed to create experience. Is the experiences service running?")
        return
    
    experience_id = response.json()['experience_id']
    print(f"\n✅ Experience created with ID: {experience_id}")
    
    # Step 2: Create another experience
    print("\n📝 Step 2: Creating another experience...")
    experience_data2 = {
        "user_id": "testuser123",
        "title": "Monterey Bay Aquarium",
        "description": "Exploring marine exhibits and interactive displays",
        "experience_date": "2025-08-16",
        "address": "886 Cannery Row, Monterey, CA 93940",
        "latitude": 36.6181,
        "longitude": -121.9012,
        "keywords": ["aquarium", "marine", "monterey"]
    }
    
    response = requests.post(
        f"{EXPERIENCES_URL}/experiences",
        json=experience_data2,
        headers={"X-User-Id": "testuser123"}
    )
    print_response("Created Second Experience", response)
    
    experience_id2 = response.json()['experience_id']
    print(f"\n✅ Second experience created with ID: {experience_id2}")
    
    # Step 3: Add first experience to trip
    print("\n📝 Step 3: Adding first experience to trip 1...")
    response = requests.post(
        f"{TRIPS_URL}/api/trips/1/experiences",
        json={"experience_id": str(experience_id), "order": 1}
    )
    print_response("Added Experience to Trip", response)
    
    if response.status_code == 201:
        print("✅ Experience added to trip!")
    else:
        print("⚠️  Note: Make sure trip with ID=1 exists")
    
    # Step 4: Add second experience to trip
    print("\n📝 Step 4: Adding second experience to trip 1...")
    response = requests.post(
        f"{TRIPS_URL}/api/trips/1/experiences",
        json={"experience_id": str(experience_id2), "order": 2}
    )
    print_response("Added Second Experience to Trip", response)
    
    # Step 5: Get trip details with experiences
    print("\n📝 Step 5: Fetching trip with experiences...")
    response = requests.get(f"{TRIPS_URL}/api/trips/1")
    print_response("Trip Details with Experiences", response)
    
    if response.status_code == 200:
        trip = response.json()
        print(f"\n✅ Trip has {len(trip.get('experiences', []))} experiences!")
        
        # Verify data types
        if trip.get('experiences'):
            exp = trip['experiences'][0]
            print("\n🔍 Verifying data types:")
            print(f"  experience_id: {type(exp['experience_id']).__name__} (should be str)")
            print(f"  order: {type(exp['order']).__name__} (should be int)")
            print(f"  lat: {type(exp['location']['lat']).__name__} (should be float)")
            print(f"  lng: {type(exp['location']['lng']).__name__} (should be float)")
            print(f"  average_rating: {type(exp['average_rating']).__name__} (should be float)")
    
    # Step 6: Reorder experiences
    print("\n📝 Step 6: Reordering experiences (swapping order)...")
    response = requests.put(
        f"{TRIPS_URL}/api/experiences/update_order",
        json={
            "trip_id": "1",
            "updates": [
                {"experience_id": str(experience_id), "order": 2},
                {"experience_id": str(experience_id2), "order": 1}
            ]
        }
    )
    print_response("Updated Experience Order", response)
    
    # Step 7: Verify new order
    print("\n📝 Step 7: Verifying new order...")
    response = requests.get(f"{TRIPS_URL}/api/trips/1")
    if response.status_code == 200:
        trip = response.json()
        print("\n✅ New experience order:")
        for exp in trip.get('experiences', []):
            print(f"  Order {exp['order']}: {exp['title']}")
    
    # Step 8: Remove an experience
    print("\n📝 Step 8: Removing first experience from trip...")
    response = requests.delete(
        f"{TRIPS_URL}/api/trips/1/experiences/{experience_id}"
    )
    print_response("Removed Experience from Trip", response)
    
    # Step 9: Verify removal
    print("\n📝 Step 9: Verifying experience was removed...")
    response = requests.get(f"{TRIPS_URL}/api/trips/1")
    if response.status_code == 200:
        trip = response.json()
        print(f"\n✅ Trip now has {len(trip.get('experiences', []))} experience(s)")
    
    print("\n" + "="*60)
    print("🎉 Integration test complete!")
    print("="*60)

if __name__ == '__main__':
    try:
        test_integration()
    except requests.exceptions.ConnectionError as e:
        print("\n❌ Connection Error!")
        print("Make sure both services are running:")
        print("  - Experiences service: http://127.0.0.1:5001")
        print("  - Trips service: http://127.0.0.1:5000")
    except Exception as e:
        print(f"\n❌ Error: {e}")
