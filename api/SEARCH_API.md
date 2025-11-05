# Search API Documentation

The Search API provides comprehensive search functionality for experiences in the Travel Planner application. It supports keyword search, location-based search, combined search, and search suggestions.

## Base URL

All endpoints are prefixed with `/py/search`

For example: `http://localhost:5328/py/search/keyword`

## Endpoints

### 1. Keyword Search

Search experiences by keywords in titles, descriptions, and keyword tags.

**Endpoint:** `GET /py/search/keyword`

**Query Parameters:**
- `q` (required): Search query string
- `limit` (optional): Maximum number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip for pagination (default: 0)

**Example Request:**
```
GET /py/search/keyword?q=beach&limit=10
```

**Example Response:**
```json
{
  "query": "beach",
  "count": 10,
  "limit": 10,
  "offset": 0,
  "results": [
    {
      "experience_id": "123",
      "title": "Beach Sunset Walk",
      "description": "Beautiful sunset walk along the beach",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "keywords": ["beach", "sunset", "walking"],
      "user_rating": 5,
      "relevance_score": 3,
      ...
    }
  ]
}
```

**Relevance Scoring:**
- Title match: 3 points
- Description match: 2 points
- Keyword match: 1 point

Results are sorted by relevance score, then user rating, then creation date.

---

### 2. Location Search

Find experiences within a specified radius of given coordinates.

**Endpoint:** `GET /py/search/location`

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in kilometers (default: 50, max: 500)
- `limit` (optional): Maximum number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Example Request:**
```
GET /py/search/location?lat=34.0522&lon=-118.2437&radius=25
```

**Example Response:**
```json
{
  "location": {
    "lat": 34.0522,
    "lon": -118.2437
  },
  "radius_km": 25,
  "count": 15,
  "limit": 50,
  "offset": 0,
  "results": [
    {
      "experience_id": "456",
      "title": "Santa Monica Pier",
      "latitude": 34.0095,
      "longitude": -118.4988,
      "distance_km": 23.5,
      ...
    }
  ]
}
```

Results are sorted by distance (closest first), then user rating.

---

### 3. Combined Search

Search experiences by both keyword and location.

**Endpoint:** `GET /py/search/combined`

**Query Parameters:**
- `q` (required): Search query string
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in kilometers (default: 50, max: 500)
- `limit` (optional): Maximum number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Example Request:**
```
GET /py/search/combined?q=hiking&lat=34.0522&lon=-118.2437&radius=50
```

**Example Response:**
```json
{
  "query": "hiking",
  "location": {
    "lat": 34.0522,
    "lon": -118.2437
  },
  "radius_km": 50,
  "count": 8,
  "limit": 50,
  "offset": 0,
  "results": [
    {
      "experience_id": "789",
      "title": "Mountain Hiking Trail",
      "description": "Challenging hiking trail with great views",
      "latitude": 34.1234,
      "longitude": -118.3456,
      "distance_km": 12.3,
      "relevance_score": 3,
      "user_rating": 4,
      ...
    }
  ]
}
```

Results are sorted by relevance score, then distance, then user rating.

---

### 4. Search Suggestions

Get keyword and title suggestions for autocomplete functionality.

**Endpoint:** `GET /py/search/suggestions`

**Query Parameters:**
- `q` (required): Partial query string (minimum 2 characters)
- `limit` (optional): Maximum number of suggestions (default: 10, max: 20)

**Example Request:**
```
GET /py/search/suggestions?q=hik&limit=5
```

**Example Response:**
```json
{
  "query": "hik",
  "suggestions": [
    "hiking",
    "hiking trail",
    "hiking boots",
    "hike the mountains",
    "hiking adventure"
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Query parameter 'q' is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Search failed",
  "message": "Database connection error"
}
```

---

## Frontend Integration

The frontend uses the search actions from `lib/actions/search-actions.ts`:

### Example: Keyword Search
```typescript
import { searchByKeyword } from "@/lib/actions/search-actions";

const result = await searchByKeyword({
  query: "beach",
  limit: 20
});

if ("error" in result) {
  console.error(result.error);
} else {
  console.log(`Found ${result.count} experiences`);
  console.log(result.results);
}
```

### Example: Location Search
```typescript
import { searchByLocation } from "@/lib/actions/search-actions";

const result = await searchByLocation({
  lat: 34.0522,
  lon: -118.2437,
  radius: 50
});
```

### Example: Combined Search
```typescript
import { searchCombined } from "@/lib/actions/search-actions";

const result = await searchCombined({
  query: "hiking",
  lat: 34.0522,
  lon: -118.2437,
  radius: 25
});
```

### Example: Get Suggestions
```typescript
import { getSearchSuggestions } from "@/lib/actions/search-actions";

const result = await getSearchSuggestions("hik", 10);
if ("error" not in result) {
  console.log(result.suggestions);
}
```

---

## Implementation Notes

### Distance Calculation

The API uses the Haversine formula to calculate distances between coordinates:

```sql
6371 * acos(
  cos(radians(lat1)) * cos(radians(lat2)) *
  cos(radians(lon2) - radians(lon1)) +
  sin(radians(lat1)) * sin(radians(lat2))
)
```

This provides accurate distance calculations in kilometers.

### Keyword Matching

Keyword search uses case-insensitive pattern matching (`ILIKE`) in PostgreSQL, searching across:
- Experience titles
- Experience descriptions
- Keyword arrays (using `unnest()`)

### Performance Considerations

- Results are limited to prevent excessive data transfer
- Pagination is supported via `limit` and `offset` parameters
- Database queries use indexed columns where possible
- Search results are not cached to ensure freshness

---

## Testing

You can test the API endpoints using curl or Postman:

```bash
# Test keyword search
curl "http://localhost:5328/py/search/keyword?q=beach&limit=5"

# Test location search
curl "http://localhost:5328/py/search/location?lat=34.0522&lon=-118.2437&radius=50"

# Test combined search
curl "http://localhost:5328/py/search/combined?q=hiking&lat=34.0522&lon=-118.2437&radius=25"

# Test suggestions
curl "http://localhost:5328/py/search/suggestions?q=hik&limit=5"
```

---

## Future Enhancements

Potential improvements to the Search API:

1. **Full-Text Search**: Implement PostgreSQL's `tsvector` and `tsquery` for more sophisticated text search
2. **Fuzzy Matching**: Add support for typo-tolerant searches
3. **Filters**: Add date ranges, rating thresholds, and other filters
4. **Sorting Options**: Allow users to specify custom sort orders
5. **Caching**: Implement Redis caching for frequently searched terms
6. **Analytics**: Track popular search terms and locations
7. **Geospatial Indexes**: Add PostGIS for improved location query performance
8. **Multi-language Support**: Search in multiple languages
