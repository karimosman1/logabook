# Prompt log — Logo and patterned background (stranger test fix)

## Prompt 1 (Claude Code, 2026-11-04)
> 2. the app right now looks a bit bland, it could use a logo for example to give it more life and perhaps a slightly more lively background with a pattern?

## What the agent built
- **A logo:**
  - The mark is an open book with a mustard bookmark ribbon on a rounded green square, using the PLAN.md colours.
  - The wordmark is "Logabook" in the serif font, with the "a" in green.
  - It's in the top bar of every page and on the login and sign-up cards.
- **A browser-tab icon** (`src/app/icon.svg`) using the same mark. It replaces the default Next.js favicon.
- **A livelier background:**
  - a faint repeating pattern of tiny open books and mustard dots;
  - a soft green and mustard glow at the top;
  - cards stay white, so text is as easy to read as before.
- **The top bar** now has a green stripe along the top. It stays visible when you scroll, with a slightly see-through background.

## How it was tested
- Checked on the login page in the browser: the logo, the pattern and the glow show, and the card text reads clearly.
- Type check and lint pass.

## Plan vs. reality notes
- **PLAN.md section 6 described colours and fonts but no logo or texture.** The "paper and ink" look ended up flat, and a stranger said so straight away.
