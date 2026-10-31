# Prompt log — PLAN.md

## Prompt 1 (Claude Code, 2026-10-31)
> i need your help in building an app for this assignment, while following the guidelines. the first step is to create a plan.md file. i want it to be imperfect because we'll need to write a section later on about plan vs reality. my idea for the app is a sort of tracker that helps me keep track of what books im reading as a library, with the covers of these books and the core info for each one (author, year of publication, etc.) they should appear based on what was the last one i read. when i click on it, it should show which page im at, and what previous notes have i added about this book. when i add a new entry, it can be for a new book i have started or continuing to read an existing book, i should be able to log which pages ive read, if there are any specific quotes i highlighted and whether i have any notes to add. i also want a calendar view when you open the app, to show on which days i have completed my 10 pages of reading, with a pattern or colors to show a day where i completed or missed my target. i also would like to add a section at the end which could recommend other books based on the ones i am reading (perhaps based on similar authors and genre? not sure).

## Agent questions and my answers
- Stack → **Next.js + Supabase + Vercel**
- 3 custom features → **Calendar + streak counter + recommendations** (covers become part of book CRUD)
- GitHub workflow → **Write the file only for now**; I review before the Issue/branch/PR.

## Result
The agent drafted PLAN.md with all 7 sections, 11 user stories (7 spine + log-a-session + 3 custom), a 5-table schema, and 2 Given/When/Then tests.

## Prompt 2 (Claude Code, 2026-10-31)
> can you change the name to Logabook, otherwise the plan is fine. ive created the repo https://github.com/karimosman1/logabook so let's get to work

- Renamed the app from the placeholder "Shelf Log" to **Logabook**.
- The GitHub repo was empty, so `main` was bootstrapped with one empty commit (no files) so a PR into `main` was possible. All content arrives through PRs.
