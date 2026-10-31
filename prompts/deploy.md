# Prompt log — Deploy to Vercel

## Prompt 1 (Claude Code, 2026-10-31)
> Deploy to Vercel

## What happened
1. The agent created a `logabook` project on Vercel with the CLI (already signed in as karimosman1) and added the two Supabase settings (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) for production, preview and development.
2. **Connecting the GitHub repo failed:** *"Failed to connect karimosman1/logabook to project."* Vercel's GitHub app isn't installed on my GitHub account yet, so I have to install it myself before merges can deploy automatically.
3. **First deploy failed:** *"The Output Directory 'public' is empty."* The project had been created without a framework, so Vercel treated it as a static site. The agent set the project's framework to Next.js through the Vercel API.
4. **Second deploy failed:** *"Vulnerable version of Next.js detected, please update immediately."* The app was set up with Next.js 15.5.4, which has a known security vulnerability. The agent upgraded to 15.5.28 (the latest 15.5 patch). The app still type-checks and builds.
5. **Third deploy succeeded:** https://logabook.vercel.app

## Checked on the live URL
- Visiting `/` while logged out redirects to `/login`.
- Submitting an empty sign-up form shows "Please enter an email and a password." This shows the server code and Supabase settings work in production.
- The agent didn't create an account on the live site. I'll sign up there with my real email.

## Also added
- `README.md` with what the app does, the live URL, the tools, and how to run it locally.
