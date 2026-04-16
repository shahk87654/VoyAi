# Mapbox Sandbox Setup Guide

## 📍 How to Activate Mapbox with Sandbox

Follow these steps to set up your Mapbox token for development/sandbox use:

---

## Step 1: Create a Mapbox Account (if needed)
1. Go to [mapbox.com](https://mapbox.com)
2. Click **Sign up** or **Log in**
3. Create an account with your email

---

## Step 2: Create a Sandbox Token

### Option A: Create a New Test Token (Recommended)
1. After logging in, go to your **Account** dashboard
2. Click **Tokens** in the left sidebar
3. Click **Create a token** button
4. Fill in the token details:
   - **Token name**: `VoyAI-Sandbox` (or `VoyAI-Dev`)
   - **Token type**: Leave as default
   - **Scopes**: Enable these permissions:
     - ✅ `maps:read` (for displaying maps)
     - ✅ `styles:read` (for map styling)
     - ✅ `geospatial:read` (for geospatial queries)
   - **Resource restrictions** (Optional):
     - Domain: `localhost:3000` (for local development)
5. Click **Create token**
6. Copy the token (starts with `pk.eyJ...`)

### Option B: Use Default Token
1. Your default token is shown in the **Tokens** page
2. Look for the token labeled "Default public token"
3. Copy it

---

## Step 3: Update Your `.env.local`

Replace the placeholder with your actual token:

```bash
# Before:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# After (example - use YOUR token):
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1bSI6InZveWFpIiwiYSI6ImNtN2R0Y250MzAxa3gycW41dzd6MnZ5N3gifQ.abcDEF1234XYZ789
```

---

## Step 4: Test the Connection

### Method 1: Check in Browser Console
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Open browser **DevTools** (F12)
4. Go to **Console** tab
5. Type: `mapboxgl.accessToken`
6. You should see your token displayed

### Method 2: Test a Map Component
- Navigate to a page with a map (if you have one in your app)
- The map should load without errors
- Check console for any Mapbox errors

### Method 3: Manual Test
Add this to any React component:

```tsx
import mapboxgl from 'mapbox-gl'

useEffect(() => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
  console.log('Mapbox token set:', mapboxgl.accessToken)
  
  // Create a map
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.5, 40],
    zoom: 9,
  })
}, [])

return <div id="map" style={{ width: '100%', height: '400px' }} />
```

---

## Token Types in Mapbox

| Token Type | Use Case | Visibility |
|-----------|----------|-----------|
| **Public Token** `pk.` | Frontend/public (safe to expose) | Client-side ✅ |
| **Secret Token** `sk.` | Backend/private (keep secret) | Server-side only 🔒 |
| **Temporary Token** | Limited-time access | Temporary 🕐 |

→ **For VoyAI**: Use **Public Token** (`pk.` prefix) with `NEXT_PUBLIC_` prefix

---

## ⚙️ Sandbox vs Production Tokens

### Development (Sandbox)
- **Token name**: `VoyAI-Sandbox` or `VoyAI-Dev`
- **Domain**: `localhost:3000` or none
- **Scopes**: `maps:read`, `styles:read`, `geospatial:read`
- **Features**: Full map functionality, no restrictions
- **Cost**: Free tier applies

### Production
- **Token name**: `VoyAI-Production`
- **Domain**: `yourdomain.com`
- **Scopes**: Minimal (only what's needed)
- **Features**: Rate limited based on plan
- **Cost**: Paid tier if over free limits

---

## 🆓 Free Tier Limits

Mapbox free tier is generous for most use cases:

| Feature | Free Limit |
|---------|-----------|
| Map views | 50,000/month |
| Tileset upload | 1 GB/month |
| API requests | 600/month (for advanced features) |
| Pricing after | $5-500+/month |

→ For a travel app, this is **more than enough** for testing

---

## 🛠️ Troubleshooting

### Error: "Access token is not valid"
- **Solution**: Verify token copy is exact (no extra spaces)
- Check token starts with `pk.eyJ`
- Regenerate token if unsure

### Error: "API key or token is invalid"
- **Solution**: Token might be expired or revoked
- Try regenerating the token in Mapbox dashboard

### Map not rendering
- **Solution**: Check browser console for errors
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`
- Restart dev server: `npm run dev`

### Domain restriction issues
- **Solution**: Remove domain restrictions for localhost testing
- Or add `localhost:3000` to allowed domains

### Rate limiting
- **Solution**: Check Mapbox usage dashboard
- Upgrade plan if exceeding free tier
- Implement request caching (Upstash Redis)

---

## 📊 Monitor Your Usage

1. Go to **Mapbox Account Dashboard**
2. Click **Stats & Usage**
3. View:
   - Map loads today
   - API request count
   - Bandwidth usage
4. Set up alerts if needed

---

## 🔄 Rotating Tokens

To rotate your token periodically for security:

1. **Create new token** in Mapbox dashboard (Steps 1-4 above)
2. **Test in dev environment** first
3. **Update `.env.local`** with new token
4. **Update `.env.production`** if using production token
5. **Restart dev server**
6. **Delete old token** from Mapbox dashboard after confirming new one works

---

## 🎯 Next Steps

1. ✅ Create Mapbox token (sandbox)
2. ✅ Add to `.env.local`
3. ✅ Restart dev server
4. ✅ Test map rendering
5. ✅ Monitor usage in dashboard

---

## 📚 Useful Resources

- [Mapbox Documentation](https://docs.mapbox.com)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js)
- [Mapbox Studio](https://studio.mapbox.com) - Create custom styles
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/examples)
- [Rate Limiting Docs](https://docs.mapbox.com/help/troubleshooting/rate-limits)
