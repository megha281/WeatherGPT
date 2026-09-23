# WeatherGPT

Conversational AI for weather forecasting, alerts, climate information and actionable insights.

**Smart India Hackathon 2026** · Problem statement **SIH26068** · Theme: Disaster Management · Category: Software
**Team ID KU40 — Binary Brains**

---

## What it is

WeatherGPT answers weather questions in plain language — "Will it rain tomorrow evening in Bellary?" — and backs every
answer with real forecast data. Gemini reads the question and decides which data to fetch; Open-Meteo supplies the
numbers; a deterministic rules engine grades the risk; a local knowledge base adds meteorological and safety context.
Gemini writes the reply from those values and never invents a weather number.

## Features

- **Conversational assistant** with Gemini function calling over eight weather tools
- **Live weather**: current conditions, 24-hour and 7-day forecasts from Open-Meteo
- **Deterministic risk engine**: LOW / MODERATE / HIGH / SEVERE for rain, flooding, storms, heat, cold, wind, UV and visibility
- **Alerts page** that keeps *Official Weather Alert* and *WeatherGPT Risk Assessment* clearly apart
- **Weather RAG**: 16 curated documents, chunked into a local JSON vector store with BM25 lexical scoring, plus optional Gemini embeddings
- **Climate page**: monthly normals and a multi-year annual series from the ERA5 reanalysis archive
- **Interactive map** (React Leaflet + OpenStreetMap) — tap anywhere to read that point's weather
- **Charts** for temperature, rain probability, precipitation and wind (Recharts)
- **Multi-model comparison** (ECMWF, GFS, ICON) when Open-Meteo publishes more than one model for a point
- **Five languages**: English, Hindi, Kannada, Tamil, Telugu — numbers always stay as digits
- **Voice input** through browser speech recognition, with a clear fallback where it is unsupported
- **Accounts**: sign up, sign in, logout, forgot password, reset password, email verification, protected routes
- **Saved locations, chat history, profile and settings** per user
- **Source transparency** on every answer

## Architecture

```
React (Vite)  ──HTTP──►  Express API  ──►  Open-Meteo  (forecast, geocoding, ERA5 archive)
                              │
                              ├──►  Google Gemini      (understanding, tool calling, wording)
                              ├──►  Risk engine        (deterministic thresholds, no AI)
                              ├──►  Knowledge base     (local JSON vector store)
                              └──►  MongoDB            (users, saved locations, chats, alerts, reset tokens)
```

Answer pipeline:

```
question → query understanding → location → date and time of day → tool selection
        → Open-Meteo → weather analysis → risk engine → knowledge retrieval
        → grounded context → Gemini → structured response → React UI
```

The Gemini key lives only in the backend. The browser never sees it.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Recharts, React Leaflet, Lucide, Axios |
| Backend | Node.js, Express, Mongoose, Axios, JWT, bcryptjs, Helmet, express-validator, express-rate-limit |
| Database | MongoDB (local or Atlas) |
| AI | Google Gemini (`gemini-2.0-flash` by default) with function calling |
| Weather | Open-Meteo forecast, geocoding and historical APIs |
| RAG | Local JSON vector store: BM25 + hashed local embeddings, optional Gemini `text-embedding-004` |

## Folder structure

```
WeatherGPT/
├── backend/
│   ├── config/         env loading, MongoDB connection
│   ├── controllers/    auth, weather, location, chat, risk, alerts, climate, user
│   ├── middleware/     JWT protection, validation, rate limiting, error handler
│   ├── models/         User, SavedLocation, Chat, Alert, PasswordResetToken
│   ├── routes/         one router per resource, mounted under /api
│   ├── services/       weather, geocoding, gemini, rag, riskEngine, alerts, climate, email, cache
│   ├── tests/          jest + supertest
│   ├── utils/          weather codes, date parsing, logger, ApiError, demo alert seed
│   └── server.js
├── frontend/
│   ├── src/components/ weather cards, charts, chat, map, alerts, forms
│   ├── src/pages/      landing, auth, dashboard, weather, chat, alerts, climate, map, account
│   ├── src/context/    auth, language, location
│   ├── src/hooks/      useWeather, useSpeechRecognition, useDebounce
│   ├── src/services/   axios client and API wrappers
│   ├── src/i18n/       five-language UI strings
│   └── src/utils/      formatting, weather visuals, suggestions
├── rag/
│   ├── documents/      16 source documents
│   ├── embeddings/     generated knowledge-base.json (committed so the app runs immediately)
│   └── buildKnowledgeBase.js
├── README.md
├── SETUP.md
├── .gitignore
└── package.json
```

## Quick start (Windows)

Full step-by-step instructions are in [SETUP.md](SETUP.md). The short version:

```bash
cd backend
npm install
copy .env.example .env      # then fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev

# in a second terminal
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173.

To start both from the repository root instead:

```bash
npm install
npm run install:all
npm run dev
```

## Environment variables

`backend/.env`

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | no | Defaults to 5000 |
| `MONGODB_URI` | yes | Local or Atlas connection string |
| `JWT_SECRET` | yes | Any long random string |
| `GEMINI_API_KEY` | recommended | Without it the app answers in rule-based mode |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.0-flash` |
| `FRONTEND_URL` | no | Used for CORS and email links |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM` | no | Without them, reset and verification links print to the backend terminal |
| `EXPOSE_DEV_TOKENS` | no | `true` also returns those links in the API response while developing |

`frontend/.env`

```
VITE_API_URL=http://localhost:5000/api
```

Only `.env.example` files are committed. Real keys stay out of Git.

## API endpoints

**Auth** — `POST /api/auth/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email`,
`/resend-verification`; `GET /api/auth/me`

**Weather** — `GET /api/weather/current`, `/hourly`, `/daily`, `/forecast`, `/models` (all take `lat` and `lon`)

**Location** — `GET /api/location/search?q=`, `GET /api/location/reverse?lat=&lon=`

**Chat** — `POST /api/chat`; `GET /api/chat/history`; `GET /api/chat/:id`; `DELETE /api/chat/:id`; `DELETE /api/chat`

**Risk** — `POST /api/risk/analyze`

**Alerts** — `GET /api/alerts?lat=&lon=`, `GET /api/alerts/:location`

**Climate** — `GET /api/climate?lat=&lon=` or `?place=`

**User** — `GET`/`PUT /api/user/profile`, `PUT /api/user/preferences`, `GET`/`POST /api/user/locations`,
`DELETE /api/user/locations/:id`

**Health** — `GET /api/health` reports database, Gemini, email and knowledge-base status

## RAG

The knowledge base is built from `rag/documents/*.md` into `rag/embeddings/knowledge-base.json`. A prebuilt index ships
with the project, so nothing needs to run before first use. To rebuild after editing a document:

```bash
npm run build:rag            # from the repository root
# or
cd backend && npm run build:rag
```

With `GEMINI_API_KEY` set, the builder uses Gemini embeddings and falls back to the local hashed embedder if the API is
unavailable. Retrieval always combines vector similarity with BM25 lexical scoring, so it works offline either way.

## Testing

```bash
cd backend
npm test
```

The suite covers the risk engine, date and time-of-day parsing, knowledge retrieval, and the HTTP API. Tests that need
MongoDB or internet access skip themselves with a message rather than failing when those are unavailable.

## Demo flow for the SIH presentation

1. Landing page — live conditions for the visitor's location.
2. Register an account, choosing a language and a default location.
3. Dashboard — current weather, hourly and 7-day forecast, charts, risk panel, alerts.
4. Ask WeatherGPT: "Will it rain tomorrow evening in Bellary?" — show the answer, the numbers, the risk and the sources.
5. Switch language to Kannada and ask again; the numbers stay identical.
6. Use the microphone to ask "Is it safe to travel today?"
7. Alerts page — show the official versus WeatherGPT-generated distinction.
8. Map page — tap a point to read its weather.
9. Climate page — monthly normals and the measured trend, with the weather-versus-climate explanation.
10. Saved locations and chat history under the account.

## Deployment notes

Build the frontend with `npm run build --prefix frontend` and serve `frontend/dist` from any static host. Run the
backend with `npm start --prefix backend` behind HTTPS, set `NODE_ENV=production`, `EXPOSE_DEV_TOKENS=false`, a real
`JWT_SECRET`, an Atlas `MONGODB_URI` and SMTP credentials, and point `FRONTEND_URL` at the deployed site.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Cannot reach the WeatherGPT server" | The backend is not running, or it is on a port other than 5000 |
| Login fails with a 503 | MongoDB is not connected — check `MONGODB_URI` and that Atlas allows your IP |
| Answers say "rule-based mode" | `GEMINI_API_KEY` is missing or rejected; the app still works using live data and the risk engine |
| No reset email arrives | Email is not configured; the link is printed in the backend terminal and shown in the UI while `EXPOSE_DEV_TOKENS=true` |
| Weather fails to load | Open-Meteo could not be reached. The app shows an error instead of substituting made-up values |
| Voice button does nothing | Speech recognition needs Chrome or Edge and microphone permission |

## Honest limitations

- No official government alert feed is wired in. Everything on the alerts page under *WeatherGPT Risk Assessment* comes
  from our own rules, and the page says so.
- The climate trend uses 10 years of ERA5 data, which reflects natural variability as much as long-term change.
- Email delivery needs your own SMTP credentials; without them, links go to the terminal.
- Speech recognition is browser-dependent (Chrome and Edge).
- The knowledge base is a curated set of 16 documents, not an exhaustive meteorological reference.
