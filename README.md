# Logabook

A personal reading library and daily reading log. Keep your books as a shelf of covers, log the pages you read each day, save quotes and notes, and see whether you hit your 10-pages-a-day goal.

**Live app:** https://logabook.vercel.app

## What it does
- Sign up, log in and log out. Each reader only ever sees their own books.
- *(In progress, see [PLAN.md](PLAN.md))* Book library with covers, reading sessions with notes and quotes, stars, search and sort, a stats dashboard, a reading calendar, a streak counter and recommendations.

## Tools
- **Next.js 15** (App Router, TypeScript) with **Tailwind CSS**
- **Supabase**: Postgres database and email/password sign-up and login
- **Vercel**: hosting
- **Claude Code**: AI coding agent. Prompts for each feature are in [`prompts/`](prompts/).

## Run it locally
1. Install Node.js 20 or newer.
2. Clone the repo and install packages:
   ```bash
   git clone https://github.com/karimosman1/logabook.git
   cd logabook
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key. You'll find both in the Supabase dashboard under **Project Settings → API**.
4. Create the tables by running the SQL files in [`supabase/migrations/`](supabase/migrations/) in order, in the Supabase SQL editor.
5. Start the app:
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000.

## Docs
- [PLAN.md](PLAN.md): the original plan
- [schema.md](schema.md): database tables and relationships
