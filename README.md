# Tamil Nadu AI Disaster Early Detection & Community Response

A MERN-style prototype for region-based disaster monitoring across Tamil Nadu.

## Core flow

1. User selects a Tamil Nadu region/district.
2. The regional feed loads community photos and reports.
3. The Detection Agent combines:
   - historical observations stored in MongoDB
   - live weather data
   - satellite imagery metadata/image
   - community-uploaded images
4. The Response Agent generates:
   - current risk
   - what to do
   - what not to do
   - likely resource requirements
   - explanation/evidence
5. The regional feed displays the AI analysis and community reports.
6. Google Maps displays the selected region and report markers.

## APIs

- Google Maps JavaScript API
- Google Weather API / Public Alerts
- NASA GIBS / Worldview satellite imagery
- Groq API for agentic analysis
- MongoDB for community reports, historical observations and resource requests

Google's weather public-alert endpoint can provide real-time alert information for a latitude/longitude, including severity, affected areas and safety recommendations.
NASA GIBS provides standard services for interactive satellite imagery.

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### Required environment variables

Server:

- `MONGO_URI`
- `GROQ_API_KEY`
- `GOOGLE_WEATHER_API_KEY`
- `PORT`

Client:

- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_API_BASE_URL`

### Demo mode

If external keys are missing, the UI still works with seeded demo data. Live AI/weather/satellite calls will show as unavailable instead of breaking the dashboard.

## Suggested production architecture

Community image -> moderation -> object/hazard classifier -> Detection Agent
                                             |
Historical DB + Weather + Satellite -------+
                                             |
                                      Risk Assessment
                                             |
                              Response + Resource Agents
                                             |
                                      Regional Feed

For a real emergency deployment, AI output must be treated as decision support and verified against authoritative disaster-management alerts.
# AI-based-disaster-detection-
