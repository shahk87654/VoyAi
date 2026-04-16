# 🗺️ Mapbox API Integration Guide for VoyAI

Recommended Mapbox APIs to integrate into VoyAI's trip planning platform.

---

## 📊 API Priority Ranking

### 🔴 **ESSENTIAL (Implement First)**

#### 1. **Geocoding API** - Location Resolution
**What it does:** Convert addresses ↔ coordinates

```
Input: "Paris, France"
Output: { lat: 48.8566, lng: 2.3522 }
```

**Use Cases in VoyAI:**
- User searches "London" → get city coordinates
- Hotel address → get precise location on map
- Restaurant name → geocode to coordinates
- "Things to do near coordinates" searches

**API Endpoint:**
```
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
```

**Integration Points:**
- ✅ Destination search in trip planner
- ✅ Hotel location lookup
- ✅ Restaurant/activity search
- ✅ Map centering and zoom

**Free Tier:** 600 requests/month

---

#### 2. **Search Box API** - Interactive Location Search
**What it does:** Autocomplete + search for locations, POIs, addresses

```
User types: "Eff"
Results: ["Eiffel Tower", "Effingham, IL", ...]
```

**Use Cases in VoyAI:**
- As-you-type location suggestions
- Find specific hotels by name
- Search restaurants and attractions
- Autocomplete for activity selection

**API Endpoints:**
```
POST /search/searchbox/v1/suggest
POST /search/searchbox/v1/retrieve
```

**Better Than Geocoding Because:**
- Real-time suggestions
- Better UX with autocomplete
- Finds POIs (not just addresses)
- Handles typos

**Integration Points:**
- ✅ Destination input field
- ✅ Hotel search autocomplete
- ✅ Activity/restaurant search
- ✅ Attractions discovery

**Free Tier:** 500 suggestions/month + 100 retrieve

---

### 🟡 **HIGHLY RECOMMENDED (Implement Second)**

#### 3. **Directions API** - Route Planning
**What it does:** Calculate routes and travel times between points

```
Start: Hotel (48.8566, 2.3522)
End: Eiffel Tower (48.8584, 2.2945)
Output: { distance: 3.1km, duration: 12min, route: [...] }
```

**Use Cases in VoyAI:**
- Calculate travel time between day activities
- Show walking routes
- Estimate travel duration for itinerary planning
- Provide turn-by-turn directions
- Optimize activity order based on travel time

**Routing Profiles:**
- `driving` - By car
- `walking` - On foot
- `cycling` - By bicycle

**Integration Points:**
- ✅ Day itinerary planning (activity sequencing)
- ✅ "How to get there?" in itinerary view
- ✅ Estimate time between activities
- ✅ Export directions with PDF

**Free Tier:** 600 requests/month

---

#### 4. **Isochrone API** - Reachability Analysis
**What it does:** Show areas reachable within X time from a location

```
Location: Hotel
Radius: 15 minutes walking
Output: Polygon showing all reachable areas
```

**Use Cases in VoyAI:**
- Show "What's within 15 min walk of your hotel?"
- Help users understand area accessibility
- Identify convenient activities near accommodation
- Visualize neighborhood exploration zones

**Integration Points:**
- ✅ Hotel detail view
- ✅ "Area guide" section
- ✅ Activity accessibility filtering
- ✅ Walking tours planning

**Free Tier:** 100 requests/month

---

### 🟢 **OPTIONAL (Nice to Have)**

#### 5. **Static Images API** - Map Snapshots
**What it does:** Generate PNG map images

```
Generates a map image showing:
- Markers for activities
- Route lines
- Zoom level and style
```

**Use Cases in VoyAI:**
- Itinerary preview images
- Map snapshots in PDF export
- Shareable trip previews
- Social media sharing

**Integration Points:**
- ✅ PDF export (map image per day)
- ✅ Itinerary preview cards
- ✅ Trip sharing links
- ✅ Social sharing

**Free Tier:** Included

---

#### 6. **Matrix API** - Multi-Point Travel Times
**What it does:** Calculate travel times between multiple points

```
Durations from Hotel to: [Museum, Restaurant, Park]
Output: [ 8min, 5min, 12min ]
```

**Use Cases in VoyAI:**
- Optimize activity order (TSP-like problem)
- Find best restaurant order for efficiency
- Create optimized day routes
- Show activity accessibility

**Advanced use:** Consider for future optimization

**Free Tier:** 100 requests/month

---

## 🎯 Implementation Roadmap

### Phase 1: MVP (Week 1-2)
```
✅ Geocoding API
  ├─ Location search in trip planner
  ├─ Hotel/activity location lookup
  └─ Map centering

✅ Search Box API
  ├─ Autocomplete for destinations
  ├─ POI search
  └─ Better UX than geocoding
```

### Phase 2: Enhanced UX (Week 3-4)
```
✅ Directions API
  ├─ Travel times between activities
  ├─ Route visualization
  └─ Itinerary sequencing

✅ Isochrone API
  ├─ Neighborhood exploration zones
  ├─ Accessibility visualization
  └─ Area guides
```

### Phase 3: Polish (Week 5+)
```
✅ Static Images API
  ├─ PDF export with maps
  ├─ Trip preview images
  └─ Social sharing

✅ Matrix API
  ├─ Route optimization
  ├─ Activity ordering
  └─ Efficiency scoring
```

---

## 📝 Architecture Example

### Component: Activity Search
```tsx
import { useMapbox } from '@/hooks/useMapbox'

export function ActivitySearch() {
  const { searchBox, geocoding } = useMapbox()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  // Real-time suggestions using Search Box API
  const handleSearch = async (text) => {
    const results = await searchBox.suggest({
      query: text,
      proximity: [-74.5, 40], // User's current location
    })
    setSuggestions(results)
  }

  // Go to activity location
  const handleSelectActivity = async (activity) => {
    const coordinates = await geocoding.forward(activity.name)
    map.flyTo({ center: [coordinates.lng, coordinates.lat] })
  }

  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      onSelect={handleSelectActivity}
    />
  )
}
```

### Component: Itinerary Timeline
```tsx
export function ItineraryTimeline({ activities }) {
  const { directions } = useMapbox()
  const [timings, setTimings] = useState([])

  // Calculate travel times using Directions API
  useEffect(() => {
    const calculateTravelTimes = async () => {
      const times = []
      for (let i = 0; i < activities.length - 1; i++) {
        const route = await directions.get({
          coordinates: [
            [activities[i].lng, activities[i].lat],
            [activities[i + 1].lng, activities[i + 1].lat],
          ],
          profile: 'walking', // or 'driving'
        })
        times.push(route.duration)
      }
      setTimings(times)
    }
    calculateTravelTimes()
  }, [activities])

  return (
    <div>
      {activities.map((activity, i) => (
        <div key={i}>
          <ActivityCard {...activity} />
          {i < activities.length - 1 && (
            <TravelTime duration={timings[i]} distance={distances[i]} />
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 🔗 API Integration Checklist

### Geocoding API
- [ ] Install `@mapbox/mapbox-sdk` or use REST API
- [ ] Create helper function for forward geocoding
- [ ] Create helper function for reverse geocoding
- [ ] Add to location search component
- [ ] Cache results in Redis

### Search Box API
- [ ] Setup API endpoint wrapper
- [ ] Implement debounced search
- [ ] Handle autocomplete suggestions
- [ ] Add proximity bias for better results
- [ ] Display POIs with icons

### Directions API
- [ ] Create directions service wrapper
- [ ] Calculate travel times between activities
- [ ] Show route on map
- [ ] Export directions (text/PDF)
- [ ] Support multiple routing profiles

### Isochrone API
- [ ] Draw reachability polygons
- [ ] Show in neighborhood view
- [ ] Color code by time (5min, 10min, 15min)
- [ ] Filter activities by reachability
- [ ] Mobile-friendly visualization

---

## 📦 Dependencies to Install

```bash
# Mapbox GL JS (for maps)
npm install mapbox-gl

# Mapbox SDK (for directions, geocoding, etc.)
npm install @mapbox/mapbox-sdk

# Type definitions
npm install -D @types/mapbox-gl @types/mapbox__mapbox-sdk

# For map visualization
npm install react-map-gl  # Optional, easier React integration
```

---

## 💰 Cost Analysis (Monthly)

| API | Free Quota | Cost After | Estimate/Month |
|-----|-----------|-----------|-----------------|
| Geocoding | 600 req | $0.50 per 1K | ~$8-15 |
| Search Box | 500 sug + 100 ret | $0.40 + $0.40 per 1K | ~$5-10 |
| Directions | 600 req | $0.50 per 1K | ~$10-20 |
| Isochrone | 100 req | $0.50 per 1K | ~$3-5 |
| Static Images | Included | Included | Free |
| Matrix | 100 req | $0.60 per 1K | ~$3-5 |
| **Total** | - | - | **~$30-55/mo** |

→ Covers 5,000-10,000 active users with buffer

---

## 🔧 Setup Files to Create

1. **`src/lib/mapbox.ts`**
   - Initialize Mapbox client
   - Wrapper functions for each API

2. **`src/hooks/useMapbox.ts`**
   - Custom hooks for map operations
   - Caching logic with Redis

3. **`src/components/map/`**
   - MapContainer
   - SearchBox
   - ActivityMarkers
   - RouteVisualization
   - IsochroneLayers

4. **`src/api/mapbox/`**
   - `/geocode` - Forward/reverse geocoding
   - `/search` - Location search
   - `/directions` - Route calculation
   - `/isochrone` - Reachability zones

---

## ✅ Recommendation

**Start with:**
1. ✅ **Geocoding API** (foundational)
2. ✅ **Search Box API** (better UX)

**Then add:**
3. ✅ **Directions API** (core feature)
4. ✅ **Isochrone API** (nice visualization)

**Polish with:**
5. ✅ **Static Images API** (PDF export)

This gives you 80% of mapping value with ~20% of effort.

---

## 📚 Resources

- [Mapbox API Docs](https://docs.mapbox.com/api/overview/)
- [Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Search Box API](https://docs.mapbox.com/api/search/search-box/)
- [Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [Isochrone API](https://docs.mapbox.com/api/navigation/isochrone/)
- [Mapbox SDK (Node.js)](https://github.com/mapbox/mapbox-sdk-js)
