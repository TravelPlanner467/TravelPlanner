# Quick Start Guide

## What Changed?

Your trips service now integrates with the experiences microservice using a **junction table** approach. Experiences are stored in the experiences microservice, and your trips service just maintains the relationships.

## Files Updated

1. **app.py** - Main Flask application with new endpoints
2. **migrate_trip_experiences.py** - Database migration script
3. **requirements.txt** - Added `requests` library
4. **MICROSERVICE_INTEGRATION_README.md** - Comprehensive documentation

## Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
pip install requests
```

### 2. Run Migration
```bash
python migrate_trip_experiences.py
```

### 3. Set Environment Variable (Optional)
```bash
export EXPERIENCES_SERVICE_URL=http://127.0.0.1:5001
```

Default is already set to `http://127.0.0.1:5001` in the code.

## How It Works Now

### Before (Old Way - Not Used Anymore)
```
Trips Database
└── experiences table (stored directly)
```

### After (New Way - Current Implementation)
```
Trips Database                    Experiences Microservice
└── trip_experiences              └── experiences table
    (just IDs & order)                (full experience data)
         │                                    ↑
         └─── calls API to fetch ────────────┘
```

## API Changes Summary

### Modified Endpoint
- **GET /api/trips/<trip_id>** - Now fetches experiences from microservice

### New Endpoints
- **POST /api/trips/<trip_id>/experiences** - Add experience to trip
- **DELETE /api/trips/<trip_id>/experiences/<experience_id>** - Remove from trip
- **PUT /api/experiences/update_order** - Reorder experiences (updated to include trip_id)

## Testing Workflow

1. **Start Experiences Service** (port 5001)
   ```bash
   cd experiences-service
   python app.py
   ```

2. **Start Trips Service** (port 5000)
   ```bash
   cd trips-service
   python app.py
   ```

3. **Create an Experience** (in experiences service)
   ```bash
   curl -X POST http://127.0.0.1:5001/experiences \
     -H "Content-Type: application/json" \
     -H "X-User-Id: testuser" \
     -d '{
       "user_id": "testuser",
       "title": "Golden Gate Bridge",
       "description": "Beautiful walk",
       "experience_date": "2025-08-15",
       "latitude": 37.8199,
       "longitude": -122.4783,
       "address": "San Francisco, CA"
     }'
   ```
   
   **Remember the experience_id from the response!**

4. **Add Experience to Trip** (in trips service)
   ```bash
   curl -X POST http://127.0.0.1:5000/api/trips/1/experiences \
     -H "Content-Type: application/json" \
     -d '{"experience_id": "1", "order": 1}'
   ```

5. **View Trip with Experiences**
   ```bash
   curl http://127.0.0.1:5000/api/trips/1
   ```

## Response Format (As Requested)

```json
{
    "user_id": "1",
    "trip_id": "1",
    "title": "California Coast Adventure",
    "description": "A scenic road trip",
    "start_date": "2025-08-14T10:00:00Z",
    "end_date": "2025-08-22T17:00:00Z",
    "experiences": [
        {
            "experience_id": "101",
            "title": "Golden Gate Bridge Walk",
            "order": 1,
            "location": {
                "lat": 37.8199,
                "lng": -122.4783,
                "address": "Golden Gate Bridge, San Francisco, CA"
            },
            "description": "A scenic stroll",
            "average_rating": 4.9
        }
    ]
}
```

✅ All strings except: `order`, `lat`, `lng`, `average_rating` (numbers)

## Frontend Integration

### Reorder Experiences (Updated - Now Requires trip_id)

```javascript
const updates = experiences.map((exp, index) => ({
    experience_id: exp.experience_id,
    order: index + 1
}));

await fetch('/api/experiences/update_order', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        trip_id: currentTripId,  // NEW: Must include trip_id
        updates: updates
    })
});
```

## Key Differences from First Version

1. **No direct experiences table** - Uses junction table instead
2. **Fetches from microservice** - Real-time data from experiences API
3. **Requires trip_id in update_order** - To update correct trip's experience order
4. **New endpoints** - Add/remove experiences from trips

## Need Help?

See **MICROSERVICE_INTEGRATION_README.md** for full documentation including:
- Detailed API reference
- Error handling
- Troubleshooting
- Architecture diagrams
- More examples
