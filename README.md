# ComicTracker

ComicTracker is a personal library tracker for manhwa, manga, and light novels.

It lets you import your library from XLSX, track chapters read, scores, and reading status, and keep everything synced in a Postgres database.

## Features

- 📥 Import entries from XLSX
- 🔁 Pre-deduped imports with merge rules (no accidental overwrites)
- 📚 Track chapters read, total chapters, score, and status
- 🏷️ Alternate title parsing with parenthesis exceptions (e.g. “(Remake)”)
- 🗂️ Separate tracking by type (Manhwa / Manga / Light Novel)
- 🧮 Clear import summary (created / updated / duplicates)
- ⚡ Built with Next.js App Router, Prisma, and Postgres (Neon)

---

## Getting Started (Local Development)

### 1) Configure environment variables

Create a `.env` file in the project root:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

Notes:
- Neon:
  - DATABASE_URL → pooled connection string
  - DIRECT_URL → non-pooled connection (used for migrations)
- Supabase:
  - You may use the same value for both if no separate direct URL is provided.

---

### 2) Apply schema and generate Prisma client

Run:

npx prisma migrate dev --name init
npx prisma generate

---

### 3) Run the dev server

npm run dev

Open http://localhost:3000

---

## Common Commands

npm run dev
npx prisma migrate dev
npx prisma generate

---

## Deployment (Vercel + Neon)

1. Push this repository to GitHub
2. Create a new project on https://vercel.com
3. Import the GitHub repository
4. Set environment variables in Vercel:
   - DATABASE_URL (Neon pooled connection)
   - DIRECT_URL (Neon direct connection)
5. Ensure Prisma runs at build time:
   - Add "postinstall": "prisma generate" to package.json
6. Deploy 🎉

Production migrations:

npx prisma migrate deploy

---

## Tech Stack

- Next.js (App Router)
- Prisma ORM
- Postgres (Neon)
- Vercel (hosting)

---

## License

This project is currently unlicensed and intended for personal use.
