# Trip-Experiences Microservice Integration

## Overview

This integration connects your Trips service with the Experiences microservice. Instead of storing experience data directly in the trips database, we use a **junction table** (`trip_experiences`) that links trips to experiences stored in the experiences microservice.

## Architecture

```
Trips Service (Flask)
  └── trip_experiences table (junction)
      └── references experience_id
          └── fetches from → Experiences Microservice API
```

## Database Schema

### New Junction Table: `trip_experiences`

```sql
CREATE TABLE trip_experiences (
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    experience_id INTEGER,  -- ID from experiences microservice
    display_order INTEGER DEFAULT 0,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (trip_id, experience_id)
);
```

### Updated Trips Table

```sql
ALTER TABLE trips ADD COLUMN description TEXT;
```

## API Endpoints

### 1. Get Trip Details with Experiences
**GET** `/api/trips/<trip_id>`

Returns trip with experiences fetched from the experiences microservice.

**Response Format:**
```json
{
    "user_id": "1",
    "trip_id": "1",
    "title": "California Coast Adventure",
    "description": "A scenic road trip along Highway 1",
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
            "description": "A scenic stroll across the iconic bridge",
            "average_rating": 4.9
        }
    ]
}
```

**Data Types:**
- Strings: `user_id`, `trip_id`, `title`, `description`, `start_date`, `end_date`, `experience_id`, `address`
- Numbers: `order`, `lat`, `lng`, `average_rating`

### 2. Add Experience to Trip
**POST** `/api/trips/<trip_id>/experiences`

Adds an existing experience from the experiences microservice to a trip.

**Request Body:**
```json
{
    "experience_id": "101",
    "order": 1
}
```

**Response:**
```json
{
    "trip_id": 1,
    "experience_id": 101,
    "display_order": 1,
    "added_at": "2025-01-15T10:30:00Z"
}
```

### 3. Remove Experience from Trip
**DELETE** `/api/trips/<trip_id>/experiences/<experience_id>`

Removes an experience from a trip (doesn't delete the experience itself).

**Response:** `204 No Content`

### 4. Update Experience Order
**PUT** `/api/experiences/update_order`

Updates the display order of multiple experiences within a trip.

**Request Body:**
```json
{
    "trip_id": "1",
    "updates": [
        {"experience_id": "101", "order": 2},
        {"experience_id": "102", "order": 1},
        {"experience_id": "103", "order": 3}
    ]
}
```

**Response:**
```json
{
    "message": "Experience orders updated successfully"
}
```

## Installation & Setup

### Prerequisites

1. **Experiences Microservice Running**
   ```bash
   cd experiences-service
   python app.py  # Should run on port 5001
   ```

2. **Install Required Package**
   ```bash
   pip install requests
   ```

### Step 1: Set Environment Variable

```bash
export EXPERIENCES_SERVICE_URL=http://127.0.0.1:5001
```

Or add to your `.env` file:
```
EXPERIENCES_SERVICE_URL=http://127.0.0.1:5001
```

### Step 2: Run Migration

```bash
python migrate_trip_experiences.py
```

This creates:
- `trip_experiences` junction table
- `description` column in trips table
- Necessary indexes

### Step 3: Start Trips Service

```bash
python app.py  # Runs on port 5000
```

## Testing the Integration

### 1. Create an Experience (in Experiences Service)

First, create an experience using the experiences microservice:

```bash
curl -X POST http://127.0.0.1:5001/experiences \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user123" \
  -d '{
    "user_id": "user123",
    "title": "Golden Gate Bridge Walk",
    "description": "A scenic stroll across the iconic bridge",
    "experience_date": "2025-08-15",
    "address": "Golden Gate Bridge, San Francisco, CA",
    "latitude": 37.8199,
    "longitude": -122.4783,
    "keywords": ["bridge", "scenic", "walking"]
  }'
```

Note the `experience_id` returned (e.g., 1).

### 2. Add Experience to a Trip

```bash
curl -X POST http://127.0.0.1:5000/api/trips/1/experiences \
  -H "Content-Type: application/json" \
  -d '{
    "experience_id": "1",
    "order": 1
  }'
```

### 3. Get Trip with Experiences

```bash
curl http://127.0.0.1:5000/api/trips/1
```

### 4. Reorder Experiences

```bash
curl -X PUT http://127.0.0.1:5000/api/experiences/update_order \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": "1",
    "updates": [
      {"experience_id": "1", "order": 2},
      {"experience_id": "2", "order": 1}
    ]
  }'
```

### 5. Remove Experience from Trip

```bash
curl -X DELETE http://127.0.0.1:5000/api/trips/1/experiences/1
```

## How It Works

1. **Trips service** stores only the relationship between trips and experiences in `trip_experiences` table
2. **Experience data** lives in the experiences microservice database
3. When fetching trip details:
   - Trips service gets the trip from its database
   - Trips service gets experience IDs from `trip_experiences`
   - Trips service **calls the experiences microservice API** to fetch full experience details
   - Response is formatted according to the spec

## Benefits of This Architecture

✅ **Separation of Concerns**: Each service owns its data  
✅ **Reusability**: Experiences can be shared across multiple trips  
✅ **Independent Scaling**: Services can scale independently  
✅ **Clear Ownership**: Experiences service handles all experience CRUD  
✅ **Flexibility**: Easy to add more relationships (e.g., users bookmarking experiences)

## Error Handling

The trips service gracefully handles failures:

- If experiences microservice is down, trip details return with empty experiences array
- If a specific experience can't be fetched, it's skipped (other experiences still returned)
- Errors are logged to console for debugging

## Configuration Options

### Change Experiences Service URL

Update in your environment or `.env`:
```bash
EXPERIENCES_SERVICE_URL=http://your-experiences-service.com
```

### Adjust Timeout

In `app.py`, modify the timeout:
```python
exp_response = requests.get(
    f"{EXPERIENCES_SERVICE_URL}/experiences/{experience_id}",
    timeout=10  # Increase timeout to 10 seconds
)
```

## Frontend Integration

### Fetching Trip with Experiences

```javascript
const response = await fetch(`/api/trips/${tripId}`);
const trip = await response.json();

// trip.experiences is an array of experience objects
trip.experiences.forEach(exp => {
    console.log(`${exp.title} at ${exp.location.address}`);
});
```

### Adding Experience to Trip

```javascript
await fetch(`/api/trips/${tripId}/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        experience_id: experienceId,
        order: 1
    })
});
```

### Reordering Experiences (Drag & Drop)

```javascript
// After drag and drop, send updated order
const updates = experiences.map((exp, index) => ({
    experience_id: exp.experience_id,
    order: index + 1
}));

await fetch('/api/experiences/update_order', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        trip_id: tripId,
        updates: updates
    })
});
```

## Troubleshooting

### Issue: "Could not verify experience"

**Cause:** Experiences microservice is not running or not accessible

**Solution:** 
1. Start experiences service: `python app.py` (in experiences directory)
2. Verify it's running: `curl http://127.0.0.1:5001/health`
3. Check `EXPERIENCES_SERVICE_URL` environment variable

### Issue: Empty experiences array

**Cause:** No experiences added to trip yet

**Solution:** Use POST `/api/trips/<trip_id>/experiences` to add experiences

### Issue: Experience data seems outdated

**Cause:** Data is fetched in real-time from experiences service

**Solution:** Check the experiences service directly to verify data

## Development Tips

1. **Local Development**: Run both services simultaneously in different terminals
2. **Testing**: Create sample experiences in the experiences service first
3. **Debugging**: Check console logs for API call errors
4. **Performance**: Consider caching experience data if needed

## Next Steps

Consider implementing:
- **Caching**: Cache experience data to reduce API calls
- **Batch Fetching**: Fetch all experiences in one API call
- **Webhooks**: Update trips when experiences are modified
- **Search**: Search experiences to add to trips
