# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React/JavaScript)                            │
└────────────────┬─────────────────────────┬──────────────────────┘
                 │                         │
                 │ HTTP Requests           │ HTTP Requests
                 │                         │
                 ▼                         ▼
┌────────────────────────────┐   ┌─────────────────────────────┐
│    TRIPS SERVICE           │   │   EXPERIENCES SERVICE        │
│    (Flask - Port 5000)     │   │   (Flask - Port 5001)        │
│                            │   │                              │
│  Endpoints:                │   │  Endpoints:                  │
│  • GET /api/trips/:id      │   │  • GET /experiences/:id      │
│  • POST /api/trips         │   │  • POST /experiences         │
│  • PUT /api/trips/:id      │   │  • PUT /experiences/:id      │
│  • DELETE /api/trips/:id   │   │  • DELETE /experiences/:id   │
│  • POST /trips/:id/exp     │   │  • POST /experiences/photos  │
│  • DELETE /trips/:id/exp   │   │                              │
│  • PUT /exp/update_order   │   │                              │
└──────────┬─────────────────┘   └───────────┬─────────────────┘
           │                                  │
           │ PostgreSQL                       │ PostgreSQL
           │                                  │
           ▼                                  ▼
┌──────────────────────┐            ┌─────────────────────────┐
│   TRIPS DATABASE     │            │  EXPERIENCES DATABASE   │
│                      │            │                         │
│  Tables:             │            │  Tables:                │
│  • trips             │            │  • experiences          │
│  • users             │            │  • experience_photos    │
│  • trip_experiences  │            │                         │
│    (junction table)  │            │  Full experience data   │
│                      │            │  with photos, location, │
│  Stores:             │            │  ratings, etc.          │
│  - Trip metadata     │            │                         │
│  - Experience IDs    │            │                         │
│  - Display order     │            │                         │
└──────────────────────┘            └─────────────────────────┘
```

## Data Flow: Fetching a Trip with Experiences

```
1. Frontend Request
   │
   ▼
2. GET /api/trips/1
   │
   ▼
┌──────────────────────────────────────────────────────────┐
│ TRIPS SERVICE                                             │
│                                                           │
│  Step 1: Query trips database                            │
│  ┌───────────────────────────────────────┐               │
│  │ SELECT * FROM trips WHERE id = 1      │               │
│  └───────────────────────────────────────┘               │
│           │                                               │
│           ▼                                               │
│  Step 2: Query trip_experiences junction table           │
│  ┌───────────────────────────────────────┐               │
│  │ SELECT experience_id, display_order   │               │
│  │ FROM trip_experiences                 │               │
│  │ WHERE trip_id = 1                     │               │
│  │ ORDER BY display_order                │               │
│  └───────────────────────────────────────┘               │
│           │                                               │
│           ▼                                               │
│  Results: [                                               │
│    {experience_id: 101, display_order: 1},               │
│    {experience_id: 102, display_order: 2}                │
│  ]                                                        │
│           │                                               │
│           ▼                                               │
│  Step 3: For each experience_id...                       │
│  ┌───────────────────────────────────────┐               │
│  │ HTTP GET Request                      │               │
│  │ http://127.0.0.1:5001/experiences/101 │───────┐       │
│  └───────────────────────────────────────┘       │       │
│                                                   │       │
└───────────────────────────────────────────────────┼───────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────┐
                                    │ EXPERIENCES SERVICE      │
                                    │                          │
                                    │ Query experiences DB     │
                                    │ Return full data:        │
                                    │ {                        │
                                    │   experience_id: 101,    │
                                    │   title: "...",          │
                                    │   latitude: 37.8199,     │
                                    │   longitude: -122.4783,  │
                                    │   description: "...",    │
                                    │   ...                    │
                                    │ }                        │
                                    └──────────────────────────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────┐
                                    │ Response sent back to    │
                                    │ Trips Service            │
                                    └──────────────────────────┘
                                                    │
                                                    ▼
┌───────────────────────────────────────────────────────────────┐
│ TRIPS SERVICE                                                  │
│                                                                │
│  Step 4: Transform & Combine Data                             │
│  ┌──────────────────────────────────────────┐                 │
│  │ For each experience from microservice:   │                 │
│  │   - Convert IDs to strings               │                 │
│  │   - Map latitude/longitude to lat/lng    │                 │
│  │   - Add display_order as "order"         │                 │
│  │   - Format location object               │                 │
│  └──────────────────────────────────────────┘                 │
│           │                                                    │
│           ▼                                                    │
│  Step 5: Build Final Response                                 │
│  ┌──────────────────────────────────────────┐                 │
│  │ {                                        │                 │
│  │   "user_id": "1",                        │                 │
│  │   "trip_id": "1",                        │                 │
│  │   "title": "California Coast",           │                 │
│  │   "experiences": [                       │                 │
│  │     {                                    │                 │
│  │       "experience_id": "101",            │                 │
│  │       "title": "Golden Gate Bridge",     │                 │
│  │       "order": 1,                        │                 │
│  │       "location": {                      │                 │
│  │         "lat": 37.8199,                  │                 │
│  │         "lng": -122.4783,                │                 │
│  │         "address": "..."                 │                 │
│  │       },                                 │                 │
│  │       ...                                │                 │
│  │     }                                    │                 │
│  │   ]                                      │                 │
│  │ }                                        │                 │
│  └──────────────────────────────────────────┘                 │
└────────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │   Frontend     │
                        │ Receives Data  │
                        └────────────────┘
```

## Junction Table Design

```
trip_experiences Table
┌──────────┬───────────────┬───────────────┬─────────────┐
│ trip_id  │ experience_id │ display_order │  added_at   │
├──────────┼───────────────┼───────────────┼─────────────┤
│    1     │     101       │       1       │  2025-01-15 │
│    1     │     102       │       2       │  2025-01-15 │
│    1     │     103       │       3       │  2025-01-16 │
│    2     │     101       │       1       │  2025-01-17 │
│    2     │     105       │       2       │  2025-01-17 │
└──────────┴───────────────┴───────────────┴─────────────┘
          │                 │
          │                 └──> Controls order within trip
          │
          └──> References experience in experiences service
               (not stored locally)

Key Features:
• Composite Primary Key (trip_id, experience_id)
• ON DELETE CASCADE (if trip deleted, mappings deleted)
• experience_id is just a number, not a foreign key
• Same experience can be in multiple trips
• Each trip can have different ordering
```

## Why This Architecture?

### ✅ Advantages

1. **Separation of Concerns**
   - Trips service: Trip planning, itineraries
   - Experiences service: Experience data, photos, ratings

2. **Data Reusability**
   - Same experience can be added to multiple trips
   - Experience data stored once, used many times

3. **Independent Scaling**
   - Scale experiences service for high read volume
   - Scale trips service for trip planning features

4. **Clear Ownership**
   - Experiences service owns experience CRUD
   - Trips service owns trip-experience relationships

5. **Flexibility**
   - Easy to add new relationships (bookmarks, favorites, etc.)
   - Can add more microservices without coupling

### ⚠️ Trade-offs

1. **Network Overhead**
   - Additional HTTP calls to fetch experience data
   - Solution: Caching, batch fetching

2. **Service Dependency**
   - Trips service depends on experiences service being available
   - Solution: Graceful degradation, circuit breakers

3. **Data Consistency**
   - Experience might be deleted in experiences service
   - Solution: Handle 404s, periodic cleanup job

4. **Complexity**
   - More moving parts to deploy and monitor
   - Solution: Good documentation, health checks
```
