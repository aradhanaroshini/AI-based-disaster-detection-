# Tamil Nadu AI Disaster Early Detection & Community Response

A district-based disaster-monitoring prototype for Tamil Nadu. It combines community reports, weather data and AI-generated decision support with an OpenStreetMap view.

## Local development

Install the client and server dependencies once:

```bash
npm install --prefix client
npm install --prefix server
```

Add these settings to `server/.env` (the server also accepts the existing `server/.env2` as a local fallback):

```dotenv
PORT=5001
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GOOGLE_WEATHER_API_KEY=your_google_weather_api_key
```

Set `client/.env` so the website points to the API:

```dotenv
VITE_API_BASE_URL=http://localhost:5001
```

Start both the API and website from the project root:

```bash
npm run dev
```

Open `http://localhost:5179`. The root command runs the API and Vite together; press Ctrl+C to stop both.

## Features

- District-specific community report feeds and affected-area map markers
- OpenStreetMap with district selection and hazard filters
- AI risk analysis and historical incident replays
- Relief and shelter information
- District-specific fundraisers, pledge totals and goal progress

Fundraising currently records pledges only. It does not collect, hold or transfer money. Campaigns are community-created and are not independently verified by the prototype.

The AI and relief information are decision-support/demo features, not official alerts or confirmed live services. Follow authoritative emergency instructions.
