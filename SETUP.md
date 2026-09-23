# WeatherGPT setup guide (Windows 10/11)

Follow these steps in order. Every command is meant to be typed into a terminal inside VS Code.

---

## Step 1 — Install Node.js

Download the LTS installer from https://nodejs.org and run it with the default options.
Then open a new terminal and check it worked:

```bash
node -v
npm -v
```

You should see something like `v20.x.x` and `10.x.x`. Node 18 or newer is required.

---

## Step 2 — Open the project in VS Code

Extract `WeatherGPT.zip`, then in VS Code choose **File → Open Folder** and select the `WeatherGPT` folder.

---

## Step 3 — Open a terminal

In VS Code press **Ctrl + `** (or **Terminal → New Terminal**). You will need two terminals: one for the backend and
one for the frontend.

---

## Step 4 — Install backend dependencies

```bash
cd backend
npm install
```

---

## Step 5 — Install frontend dependencies

Open a **second** terminal and run:

```bash
cd frontend
npm install
```

---

## Step 6 — Create the .env files

In the backend terminal:

```bash
cd backend
copy .env.example .env
```

In the frontend terminal:

```bash
cd frontend
copy .env.example .env
```

(If you use PowerShell and `copy` is unavailable, use `Copy-Item .env.example .env`.)

---

## Step 7 — Add your MongoDB connection string

**Option A — MongoDB Atlas (free, no install)**

1. Create an account at https://www.mongodb.com/cloud/atlas and create a free M0 cluster.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, add your IP address (or `0.0.0.0/0` while developing).
4. Click **Connect → Drivers** and copy the connection string.
5. Put it in `backend/.env`, replacing `<password>` with your password and adding the database name:

```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/weathergpt
```

**Option B — Local MongoDB**

Install MongoDB Community Server from https://www.mongodb.com/try/download/community, then use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/weathergpt
```

Also set a JWT secret in `backend/.env`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

```env
JWT_SECRET=paste_the_generated_string_here
```

---

## Step 8 — Add your Gemini API key

1. Go to https://aistudio.google.com/app/apikey and sign in with a Google account.
2. Click **Create API key** and copy it.
3. Put it in `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Without a key the app still runs: answers are composed from live weather data and the risk engine, and each reply says
it is in rule-based mode.

**Open-Meteo needs no key and no account.** It is called directly by the backend.

---

## Step 9 — Configure email (optional)

Password reset and email verification work without SMTP: the link is printed in the backend terminal and, while
`EXPOSE_DEV_TOKENS=true`, also shown on the Forgot password page. That is enough for development and demos.

To send real email, fill these in `backend/.env` (for Gmail, use an App Password, not your account password):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_FROM=WeatherGPT <you@gmail.com>
```

---

## Step 10 — Start the backend

In the backend terminal:

```bash
cd backend
npm run dev
```

You should see `WeatherGPT API listening on http://localhost:5000`. Check
http://localhost:5000/api/health in your browser — it reports whether the database, Gemini, email and knowledge base
are ready.

---

## Step 11 — Start the frontend

In the frontend terminal:

```bash
cd frontend
npm run dev
```

Vite prints `Local: http://localhost:5173/`.

*Prefer one command?* From the `WeatherGPT` root, run `npm install` once and then `npm run dev` to start both together.
If that behaves oddly on your machine, use the two separate terminals above — they are the reliable path on Windows.

---

## Step 12 — Open the browser

Go to http://localhost:5173 in Chrome or Edge. Voice input needs one of those two browsers.

---

## Step 13 — Register

Click **Sign up**. Enter your name, email, a password with at least 8 characters including an uppercase letter, a
lowercase letter and a number, then pick a language and a default location. You are signed in straight away.

---

## Step 14 — Sign in

Sign out from the menu, then sign in again at http://localhost:5173/login to confirm the flow works. To test password
reset, use **Forgot password** — in development the reset link appears on the page and in the backend terminal.

---

## Step 15 — Test WeatherGPT

1. Open **WeatherGPT** from the navigation.
2. Ask: *Will it rain tomorrow evening in Bellary?*
3. Check the answer shows the location, the numbers, a risk level and its sources.
4. Try the microphone button and ask: *Is it safe to travel today?*
5. Switch language in the header and ask again — the wording changes, the numbers do not.
6. Visit **Alerts**, **Map** and **Climate**.
7. Save a location under **Saved locations**, then reopen **Chat history**.

---

## Optional extras

Rebuild the knowledge base after editing anything in `rag/documents/`:

```bash
cd backend
npm run build:rag
```

Add a few demo alerts to MongoDB for a presentation (they are clearly labelled as demo data):

```bash
cd backend
npm run seed:alerts
```

Run the tests:

```bash
cd backend
npm test
```

---

## If something goes wrong

- **`'npm' is not recognized`** — Node.js is not installed, or the terminal was opened before installing it. Close and reopen VS Code.
- **Port 5000 already in use** — change `PORT` in `backend/.env` and set `VITE_API_URL` in `frontend/.env` to match.
- **`MongooseServerSelectionError`** — the connection string is wrong, or Atlas is blocking your IP under Network Access.
- **Blank page in the browser** — look at the frontend terminal for a build error, and at the browser console (F12).
- **"Cannot reach the WeatherGPT server"** — the backend terminal is not running `npm run dev`.
- **Weather will not load** — check your internet connection; the app shows an error rather than inventing values.
