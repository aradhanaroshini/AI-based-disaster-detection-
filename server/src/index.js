import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(null);
        return;
      }
      reject(error);
    });
  });
}

async function startServer() {
  let port = Number(process.env.PORT) || 5000;

  while (true) {
    const server = await listenOnPort(port);
    if (server) {
      process.env.PORT = String(port);
      console.log(`Server running on http://localhost:${port}`);
      return server;
    }
    port += 1;
  }
}

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(uploadDir));

const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, callback) => callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${imageExtensions[file.mimetype] || ""}`)
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_, file, callback) => {
    if (imageExtensions[file.mimetype]) return callback(null, true);
    callback(new Error("Upload a JPG, PNG, WebP or GIF image."));
  }
});

const regions = [
  { id: "ariyalur", name: "Ariyalur", lat: 11.1401, lng: 79.0786 },
  { id: "chengalpattu", name: "Chengalpattu", lat: 12.6819, lng: 79.9888 },
  { id: "chennai", name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { id: "tiruvallur", name: "Tiruvallur", lat: 13.143, lng: 79.907 },
  { id: "cuddalore", name: "Cuddalore", lat: 11.748, lng: 79.7714 },
  { id: "dharmapuri", name: "Dharmapuri", lat: 12.1277, lng: 78.1579 },
  { id: "dindigul", name: "Dindigul", lat: 10.3673, lng: 77.9803 },
  { id: "erode", name: "Erode", lat: 11.341, lng: 77.7172 },
  { id: "kallakurichi", name: "Kallakurichi", lat: 11.7401, lng: 78.9597 },
  { id: "kancheepuram", name: "Kancheepuram", lat: 12.8185, lng: 79.6947 },
  { id: "karur", name: "Karur", lat: 10.9601, lng: 78.0766 },
  { id: "krishnagiri", name: "Krishnagiri", lat: 12.5186, lng: 78.2137 },
  { id: "madurai", name: "Madurai", lat: 9.9252, lng: 78.1198 },
  { id: "mayiladuthurai", name: "Mayiladuthurai", lat: 11.1035, lng: 79.655 },
  { id: "nagapattinam", name: "Nagapattinam", lat: 10.7672, lng: 79.8449 },
  { id: "thoothukudi", name: "Thoothukudi", lat: 8.7642, lng: 78.1348 },
  { id: "kanniyakumari", name: "Kanniyakumari", lat: 8.1745, lng: 77.4344 },
  { id: "namakkal", name: "Namakkal", lat: 11.2189, lng: 78.1677 },
  { id: "perambalur", name: "Perambalur", lat: 11.2342, lng: 78.8807 },
  { id: "pudukkottai", name: "Pudukkottai", lat: 10.3797, lng: 78.8208 },
  { id: "ramanathapuram", name: "Ramanathapuram", lat: 9.3639, lng: 78.8395 },
  { id: "ranipet", name: "Ranipet", lat: 12.9273, lng: 79.3333 },
  { id: "salem", name: "Salem", lat: 11.6643, lng: 78.146 },
  { id: "sivaganga", name: "Sivaganga", lat: 9.8433, lng: 78.4809 },
  { id: "tenkasi", name: "Tenkasi", lat: 8.9595, lng: 77.3152 },
  { id: "thanjavur", name: "Thanjavur", lat: 10.787, lng: 79.1378 },
  { id: "theni", name: "Theni", lat: 10.0104, lng: 77.4777 },
  { id: "tiruchirappalli", name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047 },
  { id: "tirunelveli", name: "Tirunelveli", lat: 8.7139, lng: 77.7567 },
  { id: "tirupathur", name: "Tirupathur", lat: 12.4957, lng: 78.5676 },
  { id: "tiruppur", name: "Tiruppur", lat: 11.1085, lng: 77.3411 },
  { id: "tiruvannamalai", name: "Tiruvannamalai", lat: 12.2253, lng: 79.0747 },
  { id: "tiruvarur", name: "Tiruvarur", lat: 10.7727, lng: 79.6368 },
  { id: "vellore", name: "Vellore", lat: 12.9165, lng: 79.1325 },
  { id: "viluppuram", name: "Viluppuram", lat: 11.9401, lng: 79.4861 },
  { id: "virudhunagar", name: "Virudhunagar", lat: 9.568, lng: 77.9624 },
  { id: "nilgiris", name: "The Nilgiris", lat: 11.4102, lng: 76.695 },
  { id: "coimbatore", name: "Coimbatore", lat: 11.0168, lng: 76.9558 }
];

const demoReports = [
  { id: 1, regionId: "chennai", type: "Flood", text: "Water rising near a low-lying residential road.", image: null, createdAt: new Date().toISOString(), lat: 13.071, lng: 80.25 },
  { id: 2, regionId: "cuddalore", type: "Waterlogging", text: "Road is partially blocked after heavy rain.", image: null, createdAt: new Date().toISOString(), lat: 11.746, lng: 79.77 },
  { id: 3, regionId: "nilgiris", type: "Landslide", text: "Loose soil reported beside a hill road.", image: null, createdAt: new Date().toISOString(), lat: 11.406, lng: 76.693 }
];

let memoryReports = [...demoReports];

const ReportSchema = new mongoose.Schema({
  regionId: String,
  type: String,
  text: String,
  area: String,
  needsHelp: Boolean,
  peopleAffected: Number,
  image: String,
  imageMime: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now }
});
const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

async function getHistorical(regionId) {
  if (mongoose.connection.readyState === 1) {
    return Report.find({ regionId }).sort({ createdAt: -1 }).limit(30).lean();
  }
  return memoryReports.filter(r => r.regionId === regionId).slice(-30).reverse();
}

async function getWeather(region) {
  if (!process.env.GOOGLE_WEATHER_API_KEY) {
    return {
      source: "demo",
      temperature: 29,
      humidity: 82,
      precipitationProbability: 72,
      windSpeed: 18,
      alert: "Demo: heavy-rain watch"
    };
  }

  const url = new URL("https://weather.googleapis.com/v1/currentConditions:lookup");
  url.searchParams.set("key", process.env.GOOGLE_WEATHER_API_KEY);
  url.searchParams.set("location.latitude", region.lat);
  url.searchParams.set("location.longitude", region.lng);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API ${response.status}`);
  const data = await response.json();

  return {
    source: "Google Weather API",
    temperature: data.temperature?.degrees,
    humidity: data.relativeHumidity,
    precipitationProbability: data.precipitation?.probability?.percent,
    windSpeed: data.wind?.speed?.value,
    condition: data.weatherCondition?.description?.text
  };
}

function satelliteUrl(region) {
  const date = new Date().toISOString().slice(0, 10);
  return `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG4326&TIME=${date}&WRAP=DAY&FORMAT=image/jpeg&WIDTH=900&HEIGHT=650&BBOX=${region.lng - 0.25},${region.lat - 0.25},${region.lng + 0.25},${region.lat + 0.25}`;
}

async function groqAgent(prompt, imageData = []) {
  if (!process.env.GROQ_API_KEY) return null;

  const content = [{ type: "text", text: prompt }];
  for (const image of imageData.slice(0, 3)) {
    content.push({
      type: "image_url",
      image_url: { url: image }
    });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a disaster-risk decision-support agent for Tamil Nadu. Never claim certainty. Use evidence, identify uncertainty, prioritize life safety, and tell users to follow official emergency authorities. Return valid JSON."
        },
        { role: "user", content }
      ]
    })
  });

  if (!response.ok) throw new Error(`Groq API ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

app.get("/api/regions", (_, res) => res.json(regions));

app.get("/api/map/reports", async (_, res, next) => {
  try {
    const reports = mongoose.connection.readyState === 1
      ? await Report.find({ lat: { $type: "number" }, lng: { $type: "number" } })
          .select("regionId type area lat lng createdAt")
          .sort({ createdAt: -1 })
          .limit(300)
          .lean()
      : memoryReports.map((report) => ({ ...report, sample: true }));
    res.json(reports.filter((report) => Number.isFinite(Number(report.lat)) && Number.isFinite(Number(report.lng))));
  } catch (error) {
    next(error);
  }
});

app.get("/api/regions/:id/feed", async (req, res) => {
  const region = regions.find(r => r.id === req.params.id);
  if (!region) return res.status(404).json({ error: "Region not found" });

  const reports = await getHistorical(region.id);
  res.json({
    region,
    reports,
    satellite: satelliteUrl(region),
    ai: {
      status: "ready",
      lastUpdated: new Date().toISOString()
    }
  });
});

app.post("/api/reports", upload.single("image"), async (req, res) => {
  const { regionId, type = "Community report", text = "", area = "", needsHelp, peopleAffected, lat, lng } = req.body;
  if (!regions.some(r => r.id === regionId)) return res.status(400).json({ error: "Invalid region" });
  if (!text.trim()) return res.status(400).json({ error: "Please describe what is happening." });

  const report = {
    regionId,
    type,
    text: text.trim(),
    area: area.trim(),
    needsHelp: needsHelp === "true",
    peopleAffected: Math.max(0, Number(peopleAffected) || 0),
    lat: Number(lat),
    lng: Number(lng),
    image: req.file ? `/uploads/${req.file.filename}` : null,
    imageMime: req.file?.mimetype || null,
    createdAt: new Date().toISOString()
  };

  if (mongoose.connection.readyState === 1) {
    const saved = await Report.create(report);
    return res.json(saved);
  }
  report.id = Date.now();
  memoryReports.push(report);
  res.json(report);
});

app.use((error, _, res, next) => {
  if (error instanceof multer.MulterError || error.message === "Only image files are supported.") {
    return res.status(400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "Image must be 8 MB or smaller." : error.message });
  }
  next(error);
});

const historicalIncidents = {
  "chennai-2015": {
    title: "November–December 2015 Chennai floods",
    documented: "Tamil Nadu CAG Performance Audit Report No.4 of 2017 reports repeated torrential rain, 289 flood-related deaths in Chennai, Kancheepuram and Tiruvallur, and 23.25 lakh houses inundated in the worst-affected districts. The audit describes disruption to daily life.",
    effects: ["Homes and neighbourhoods were inundated.", "Floodwater and transport disruption interrupted daily travel and access to help.", "The CAG audit recorded 289 deaths in the three worst-affected districts."],
    response: ["Prioritize life safety, verified warnings and evacuation support for exposed locations.", "Coordinate rescue, safe shelter, drinking water and medicine access.", "Verify road access and provide support for people with mobility or health needs."],
    source: "https://cag.gov.in/en/audit-report/details/45722"
  },
  "gaja-2018": {
    title: "Cyclone Gaja, November 2018",
    documented: "Tamil Nadu Government Gazette declared Nagapattinam, Tiruvarur, Thanjavur, Pudukkottai and Dindigul cyclone-affected. Tamil Nadu rural development policy notes describe damage to rural livelihoods, farms and coconut plantations across Gaja-affected blocks.",
    effects: ["The State declared five districts cyclone-affected.", "Wind damage affected housing, farms and coconut plantations.", "Farm and fishing livelihoods needed support during recovery."],
    response: ["Prioritize wind-safety checks and support for households with damaged roofs.", "Coordinate safe shelter, drinking water and essential supplies.", "Track farm, fishing and livelihood recovery needs after immediate rescue."],
    source: "https://www.stationeryprinting.tn.gov.in/extra_ordinary_lists.php?id=MjAxOA%3D%3D"
  },
  "michaung-2023": {
    title: "Cyclone Michaung and north Tamil Nadu floods, December 2023",
    documented: "Tamil Nadu Government Gazette declared Chennai, Tiruvallur, Chengalpattu and Kancheepuram cyclone-affected following extremely heavy rainfall and flooding. IMD's Michaung report documents very heavy rainfall across these districts.",
    effects: ["Extremely heavy rain produced flooding in the declared districts.", "People in low-lying urban areas faced inundation and disrupted journeys.", "Essential travel and access to local services were affected by flood conditions."],
    response: ["Prioritize verified flood alerts and evacuation support in low-lying areas.", "Check safe routes before dispatch and communicate road closures.", "Coordinate rescue, shelter, drinking water and medicine access."],
    source: "https://www.stationeryprinting.tn.gov.in/extra_ordinary_lists.php?id=MjAyMw%3D%3D"
  },
  "south-flood-2023": {
    title: "Southern Tamil Nadu floods, December 2023",
    documented: "Tamil Nadu Government Gazette declared Tirunelveli, Thoothukudi, Kanniyakumari, Tenkasi, Ramanathapuram and Virudhunagar flood-affected after unprecedented extremely heavy rainfall and flooding.",
    effects: ["Six southern districts were declared flood-affected.", "Residents in exposed low-lying areas faced inundation and temporary shelter needs.", "Flooding disrupted local access and put essential travel at risk."],
    response: ["Prioritize safety checks and evacuation support for exposed communities.", "Verify roads, bridges and access to essential services before dispatch.", "Coordinate shelters, clean water, medicines and family reunification."],
    source: "https://www.stationeryprinting.tn.gov.in/extra_ordinary_lists.php?id=MjAyMw%3D%3D"
  }
};

app.post("/api/agent/replay", async (req, res) => {
  const { incidentId, regionId, language = "en" } = req.body || {};
  const incident = historicalIncidents[incidentId];
  const region = regions.find(item => item.id === regionId);
  if (!incident || !region) return res.status(400).json({ error: "Select a supported historical incident and district." });

  const fallback = {
    incidentId,
    region: region.name,
    summary: `${incident.title}: ${incident.documented}`,
    peopleImpacts: incident.effects,
    responsePriorities: incident.response,
    uncertainty: "Curated historical replay based on the cited public record. It is not a live assessment or official warning.",
    source: incident.source,
    generatedBy: "Curated historical replay"
  };
  const prompt = `Create a historical disaster-response replay for ${incident.title}, focused on ${region.name}, Tamil Nadu.

DOCUMENTED RECORD (treat as the only verified facts): ${incident.documented}

TASK: Summarize what is documented about effects on people and communities; distinguish the record from reasonable response priorities. Do not invent person-level experiences, casualty or household counts, evacuation counts, shelter locations, road closures, damage measurements, or other statistics. If the district is not known to be in the record, state that limitation. Give 3 concise peopleImpacts and 3 concise responsePriorities, plus a short summary and uncertainty statement. This is a retrospective educational scenario, never current advice or an official warning. ${language === "ta" ? "Write every response field in clear, natural Tamil." : "Write in clear English."}

Return JSON: {"summary":"","peopleImpacts":[""],"responsePriorities":[""],"uncertainty":""}`;

  try {
    const generated = await groqAgent(prompt);
    if (generated) return res.json({ ...fallback, ...generated, generatedBy: "AI historical replay agent" });
  } catch (error) {
    console.error("Historical replay agent unavailable:", error.message);
  }
  if (language === "ta") {
    fallback.summary = `${incident.title}: ${incident.documented}`;
    fallback.peopleImpacts = incident.effects.map(x => `வரலாற்றுப் பதிவு: ${x}`);
    fallback.responsePriorities = incident.response.map(x => `முன்னுரிமை: ${x}`);
  }
  res.json(fallback);
});

app.post("/api/agent/analyze", async (req, res) => {
  const { regionId, language = "en" } = req.body;
  const region = regions.find(r => r.id === regionId);
  if (!region) return res.status(404).json({ error: "Region not found" });

  const [historical, weather] = await Promise.all([
    getHistorical(regionId),
    getWeather(region).catch(() => ({ source: "unavailable" }))
  ]);

  const recentImages = historical.filter(r => r.image).map(r => {
    const file = path.resolve(r.image.replace("/uploads/", "uploads/"));
    if (!fs.existsSync(file)) return null;
    const mime = r.imageMime || "image/jpeg";
    const base64 = fs.readFileSync(file).toString("base64");
    return `data:${mime};base64,${base64}`;
  }).filter(Boolean);

  const prompt = `
Analyze disaster risk for ${region.name}, Tamil Nadu.

DATA:
Region coordinates: ${region.lat}, ${region.lng}
Weather: ${JSON.stringify(weather)}
Historical/community observations: ${JSON.stringify(historical)}
Satellite imagery URL available to the system: ${satelliteUrl(region)}

Return JSON with:
{
  "riskLevel": "LOW|MODERATE|HIGH|CRITICAL",
  "hazards": [{"name":"","confidence":0,"evidence":""}],
  "summary":"",
  "whatToDo":[""],
  "whatNotToDo":[""],
  "resourcesNeeded":[{"resource":"","priority":"LOW|MEDIUM|HIGH","reason":""}],
  "watchFor":[""],
  "uncertainty":"",
  "nextCheckMinutes":60
}

Do not invent official evacuation orders, shelter availability, road closures, casualty numbers, or resource stock. Distinguish observed facts from AI inference.
${language === "ta" ? "Write every user-facing response field in clear, natural Tamil. Keep riskLevel as the required English enum." : "Write user-facing response fields in clear English."}
`;

  try {
    const ai = await groqAgent(prompt, recentImages);
    if (ai) return res.json({ region, weather, satellite: satelliteUrl(region), historical, ai, generatedBy: "Groq detection + response agents" });
  } catch (error) {
    console.error(error.message);
  }

  // Safe demo fallback
  const rainfall = Number(weather.precipitationProbability || 0);
  const riskLevel = rainfall >= 80 ? "HIGH" : rainfall >= 55 ? "MODERATE" : "LOW";

  res.json({
    region,
    weather,
    satellite: satelliteUrl(region),
    historical,
    generatedBy: "Demo fallback",
    ai: {
      riskLevel,
      hazards: rainfall >= 55 ? [{ name: "Heavy rainfall / waterlogging", confidence: 0.64, evidence: "Weather precipitation probability and community reports." }] : [],
      summary: language === "ta" ? `${region.name} மாவட்டத்திற்கான மாதிரி மதிப்பீடு. இது உதவி முடிவெடுப்புக்கான தகவல் மட்டுமே; அதிகாரப்பூர்வ எச்சரிக்கை அல்ல.` : `Current demo assessment for ${region.name}. This is decision support, not an official warning.`,
      whatToDo: language === "ta" ? ["தமிழ்நாடு பேரிடர் மேலாண்மைத் துறை மற்றும் IMD அறிவுறுத்தல்களைப் பின்பற்றுங்கள்.", "தொலைபேசியை சார்ஜ் செய்து, அத்தியாவசிய மருந்துகள் மற்றும் ஆவணங்களைத் தயாராக வைத்திருங்கள்.", "ஓடும் நீர் அல்லது ஆழம் தெரியாத வெள்ளநீரில் இறங்காதீர்கள்."] : ["Follow official TN disaster-management and IMD alerts.", "Keep phones charged and essential medicines/documents ready.", "Avoid entering flowing or unknown-depth water."],
      whatNotToDo: language === "ta" ? ["வெள்ளத்தில் மூழ்கிய சாலையை நடந்து அல்லது வாகனத்தில் கடக்காதீர்கள்.", "இந்த AI மதிப்பீட்டை வெளியேற்ற உத்தரவாகக் கருதாதீர்கள்."] : ["Do not cross flooded roads on foot or by vehicle.", "Do not rely on this AI assessment as an evacuation order."],
      resourcesNeeded: rainfall >= 55 ? [
        { resource: "Drinking water", priority: "HIGH", reason: "Potential disruption to local access." },
        { resource: "First-aid kits", priority: "MEDIUM", reason: "Useful for community response points." },
        { resource: "Emergency lighting", priority: "MEDIUM", reason: "Preparedness for power disruption." }
      ] : [],
      watchFor: ["Rapid rainfall increase", "Water level rise", "New community reports"],
      uncertainty: language === "ta" ? "செயற்கைக்கோள் படங்கள், மேக மூட்டம் மற்றும் சமூக நிலவரங்கள் முழுமையற்றதாக இருக்கலாம்." : "Satellite/cloud and community observations can be incomplete.",
      nextCheckMinutes: 30
    }
  });
});

async function connectMongo() {
  if (!process.env.MONGO_URI) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (e) {
    console.warn("MongoDB unavailable; using demo memory storage.");
  }
}

app.get("/api/health", (_, res) => res.json({ ok: true, service: "TN Disaster AI" }));

connectMongo()
  .then(() => startServer())
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
