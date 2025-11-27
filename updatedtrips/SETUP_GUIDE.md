# 🚀 Complete Setup Guide - Trips Service with Experiences Integration

## 📦 What's Included

Your complete trips service with microservice integration:

```
trips-service/
├── app.py                  # Main Flask application (with experiences integration)
├── db.py                   # Database connection and initialization
├── .env                    # Environment variables (DATABASE_URL)
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html         # Web interface for trip management
└── README.md              # This file
```

## ✨ Key Features

✅ Full CRUD operations for trips  
✅ Microservice integration with experiences service  
✅ Junction table design (trip_experiences)  
✅ Returns trip data with experiences in specified format  
✅ Reorder, add, and remove experiences from trips  
✅ Web UI for trip management  

## 🔧 Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

**Installs:**
- Flask 3.0.0
- psycopg2-binary 2.9.9
- python-dotenv 1.0.0
- requests 2.31.0

### Step 2: Configure Environment
Your `.env` file is already configured with your Neon database:
```
DATABASE_URL=postgresql://neondb_owner:...@ep-proud-star-ahmtawqm-pooler.c-3.us-east-1.aws.neon.tech/neondb
```

**Optional:** Set experiences service URL (defaults to http://127.0.0.1:5001):
```bash
export EXPERIENCES_SERVICE_URL=http://127.0.0.1:5001
```

### Step 3: Run the Application
```bash
python app.py
```

The app will:
1. Connect to your Neon database
2. Create all necessary tables (users, trips, trip_experiences)
3. Create a test user
4. Start on http://127.0.0.1:5000

## 📊 Database Schema

### Tables Created Automatically

**users**
```sql
id | username | role | created_at
```

**trips**
```sql
id | user_id | title | description | keywords | start_date | end_date | created_date
```

**trip_experiences** (NEW - Junction Table)
```sql
trip_id | experience_id | display_order | added_at
```

## 🌐 API Endpoints

### Trip Management

#### Get All Trips
```bash
GET /api/trips
GET /api/trips?user_id=1
```

#### Get Trip with Experiences (NEW FORMAT)
```bash
GET /api/trips/1
```

**Response:**
```json
{
    "user_id": "1",
    "trip_id": "1",
    "title": "California Coast Adventure",
    "description": "A scenic road trip",
    "start_date": "2025-08-14",
    "end_date": "2025-08-22",
    "experiences": [
        {
            "experience_id": "101",
            "title": "Golden Gate Bridge",
            "order": 1,
            "location": {
                "lat": 37.8199,
                "lng": -122.4783,
                "address": "San Francisco, CA"
            },
            "description": "Iconic bridge walk",
            "average_rating": 4.9
        }
    ]
}
```

#### Create Trip
```bash
POST /api/trips
Content-Type: application/json

{
    "user_id": 1,
    "title": "My Trip",
    "description": "Trip description",
    "keywords": "beach,adventure",
    "start_date": "2025-08-01",
    "end_date": "2025-08-10"
}
```

#### Update Trip
```bash
PUT /api/trips/1
Content-Type: application/json

{
    "title": "Updated Title",
    "description": "New description"
}
```

#### Delete Trip
```bash
DELETE /api/trips/1
```

### Experience Management (NEW)

#### Add Experience to Trip
```bash
POST /api/trips/1/experiences
Content-Type: application/json

{
    "experience_id": "101",
    "order": 1
}
```

#### Remove Experience from Trip
```bash
DELETE /api/trips/1/experiences/101
```

#### Reorder Experiences
```bash
PUT /api/experiences/update_order
Content-Type: application/json

{
    "trip_id": "1",
    "updates": [
        {"experience_id": "101", "order": 2},
        {"experience_id": "102", "order": 1}
    ]
}
```

## 🖥️ Web Interface

Access the web UI at: **http://127.0.0.1:5000**

Features:
- ➕ Add new trips
- ✏️ Edit existing trips
- 🗑️ Delete trips
- 📅 Set start/end dates
- 🏷️ Add keywords
- 👤 Assign to users

## 🔗 Integration with Experiences Microservice

### How It Works

1. **Trip created** → Stored in trips table
2. **Experience added** → Relationship stored in trip_experiences table
3. **Trip fetched** → API calls experiences microservice for full data

```
GET /api/trips/1
    ↓
Trips Service queries trip_experiences table
    ↓
For each experience_id:
    HTTP GET → http://127.0.0.1:5001/experiences/{id}
    ↓
Combines data into response
```

### Prerequisites

**Experiences microservice must be running on port 5001**

To start experiences service:
```bash
cd /path/to/experiences-service
python app.py  # Starts on port 5001
```

### Graceful Degradation

If experiences service is unavailable:
- Trip details still return
- Experiences array will be empty
- Errors logged to console
- No crash or 500 errors

## 🧪 Testing

### Test the Web Interface
1. Open http://127.0.0.1:5000
2. Add a new trip
3. View your trips

### Test the API

**Create a trip:**
```bash
curl -X POST http://127.0.0.1:5000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "California Adventure",
    "description": "West coast road trip",
    "start_date": "2025-08-01",
    "end_date": "2025-08-10"
  }'
```

**Get all trips:**
```bash
curl http://127.0.0.1:5000/api/trips
```

**Get trip details:**
```bash
curl http://127.0.0.1:5000/api/trips/1
```

### Full Integration Test

1. **Start experiences service** (port 5001)
2. **Start trips service** (port 5000)
3. **Create an experience** in experiences service
4. **Add experience to trip** using trips service
5. **Fetch trip** to see combined data

## 📝 Environment Variables

### Required
```bash
DATABASE_URL=postgresql://...  # Your Neon database URL (already set)
```

### Optional
```bash
EXPERIENCES_SERVICE_URL=http://127.0.0.1:5001  # Default if not set
```

## 🔍 Troubleshooting

### Issue: "Could not verify experience"
**Cause:** Experiences service not running or wrong URL

**Solution:**
1. Start experiences service: `python app.py` (in experiences directory)
2. Verify: `curl http://127.0.0.1:5001/health`
3. Check EXPERIENCES_SERVICE_URL

### Issue: Empty experiences array
**Cause:** No experiences added to trip yet

**Solution:** Use `POST /api/trips/{id}/experiences` to add experiences

### Issue: "Trip not found"
**Cause:** Trip ID doesn't exist

**Solution:** Check trip exists with `GET /api/trips`

### Issue: Database connection errors
**Cause:** Invalid DATABASE_URL or network issues

**Solution:** 
1. Check .env file has correct DATABASE_URL
2. Test connection: `psql $DATABASE_URL`
3. Verify Neon database is active

## 📚 Data Flow Example

### Adding an Experience to a Trip

```
1. User creates experience in experiences service
   POST /experiences → experience_id: 101

2. User adds experience to trip
   POST /api/trips/1/experiences
   {"experience_id": "101", "order": 1}
   
   → Stored in trip_experiences table:
   trip_id | experience_id | display_order
   1       | 101           | 1

3. User fetches trip
   GET /api/trips/1
   
   → Trips service queries trip_experiences
   → Finds experience_id: 101
   → HTTP GET http://127.0.0.1:5001/experiences/101
   → Returns combined data
```

## 🎯 Next Steps

1. ✅ Run `python app.py` to start the service
2. ✅ Open http://127.0.0.1:5000 in browser
3. ✅ Create some test trips using the web UI
4. ✅ Start experiences microservice (if not running)
5. ✅ Add experiences to trips using the API
6. ✅ Test the GET endpoint to see combined data

## 🔗 Related Documentation

For more detailed information:
- **MICROSERVICE_INTEGRATION_README.md** - Full API reference
- **ARCHITECTURE.md** - System design and diagrams
- **QUICK_START.md** - Fast reference guide

## 💡 Tips

- **Use the web UI** for quick trip management
- **Use the API** for integration with frontend apps
- **Keep both services running** for full functionality
- **Check console logs** for debugging API calls
- **Test with curl** before integrating with frontend

## 📞 Support

If you encounter issues:
1. Check console logs for errors
2. Verify both services are running
3. Test API endpoints with curl
4. Review troubleshooting section above

---

**Ready to go!** Run `python app.py` and start building your trips! 🚀
