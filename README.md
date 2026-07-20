# ⚗️ SciOlyPrep — Science Olympiad Test Prep

A free practice platform for Science Olympiad competitors. Pick any event, hit
**"Give me a quiz,"** and get a fresh, AI-generated, exam-style test with
instant scoring and a full explanation for every question.

- 🎯 Every Division B & C event — current **2025–26** season + projected **2027** slate
- ✨ Unlimited AI-generated quizzes (powered by Groq)
- 📚 Curated question bank for popular study events
- 📊 Instant scoring, answer key, explanations, and saved progress
- 🔒 Questions graded server-side; correct answers never leak to the browser

**Tech:** Next.js (App Router) · PostgreSQL · Drizzle ORM · Tailwind CSS

---

## 🚀 Deploy to Vercel (free, ~5 minutes)

A standard Next.js app. Battles + accounts need a database and an AI key, so
you'll set **two** environment variables: a hosted Postgres connection string
and a free Groq key. The database tables **auto-create on first launch**, so no
migration commands are needed.

### Step 1 — Push this project to GitHub
Create a new (private recommended) repo and push this code to it.

### Step 2 — Get a free Groq API key (for battle questions)
1. Go to **[console.groq.com/keys](https://console.groq.com/keys)** and create a key (free, no card).
2. Copy the key (starts with `gsk_`).

### Step 3 — Import to Vercel
1. Go to **[vercel.com/new](https://vercel.com/new)** and import your GitHub repo.
2. Vercel auto-detects Next.js — leave the build settings as-is.
3. Under **Environment Variables**, add **two**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | *(your Neon pooled connection string from Step 1)* |
   | `GROQ_API_KEY` | *(your `gsk_...` key from Step 2)* |

4. Click **Deploy**. 🎉

> **The database tables auto-create on first launch** (users, sessions, battles)
> — you don't need to run any migrations.

You'll get a permanent URL like `scioly-prep.vercel.app`. You can rename it in
**Project → Settings → Domains**, or add a custom domain you own (free on Vercel).

### Optional: change the AI model
Add `GROQ_MODEL` (e.g. `llama-3.1-8b-instant` for faster, `llama-3.3-70b-versatile`
for higher quality). Default is `llama-3.3-70b-versatile`.

---

## 💻 Run locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your values
cp .env.example .env.local
#   then edit .env.local: set DATABASE_URL and GROQ_API_KEY

# 3. Start a local Postgres (or use a hosted one)
#    The app auto-creates + seeds tables on first run.

# 4. Run the dev server
npm run dev
```

Open **http://localhost:3000**.

---

## 🔐 Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string (accounts + battles) — tables auto-create |
| `GROQ_API_KEY` | ✅ Yes | Free Groq key — powers battle questions |
| `GROQ_MODEL` | Optional | Model name (default: `llama-3.3-70b-versatile`) |

See [`.env.example`](.env.example).

---

## 📂 Project structure

```
src/
├─ app/
│  ├─ page.tsx              # Home
│  ├─ events/               # Event directory + detail pages
│  ├─ practice/             # AI quiz builder ("Give me a quiz")
│  ├─ quiz/                 # Interactive quiz runner
│  ├─ results/[attemptId]/  # Score + full answer review
│  ├─ progress/             # Attempt history
│  └─ api/
│     ├─ ai-quiz/           # Generate AI questions (calls Groq)
│     ├─ ai-status/         # Connection health check
│     ├─ submit-quiz/       # Grade + save an attempt
│     └─ health/            # DB health check
├─ components/              # UI (quiz runner, builder, cards, dialogs)
├─ db/                      # Drizzle schema + seeding
└─ lib/                     # Data access, AI service, types, UI helpers
```

---

## ⚖️ Notes & credits

Science Olympiad is a trademark of Science Olympiad, Inc. This is an
independent study tool, **not** affiliated with or endorsed by Science Olympiad,
Inc. Curated questions are original items written in the style of publicly
available invitational tests and official rules manuals. For the full library of
community-shared tests, visit the [Scioly.org Test Exchange](https://scioly.org)
and [soinc.org](https://www.soinc.org).
