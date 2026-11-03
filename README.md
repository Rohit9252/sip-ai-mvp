# sip-ai-mvp

A concept for a Groww-style SIP page, built for a product management graduation project. Not made by or linked to Groww. **Not investment advice.**

When a first-time investor's SIP value first falls below what they put in, a helper asks what they think happened (four taps), then shows what actually moved their money: their fund against the whole market (Nifty 50), in English, Hindi or Hinglish. It answers follow-up questions from their own numbers. Advice and prediction questions always get a fixed safe answer.

## How it works

- **Numbers from code, words from AI** (`docs/adr/0001`). Every number comes from AMFI NAVs (via mfapi.in), worked out in `src/lib/sip`. The AI (OpenAI gpt-4.1-mini) only writes words, and every reply is checked in code (`src/lib/guard`) before it is shown. A failed check shows the code's template instead.
- **Replay** (`docs/adr/0005`). The SIP is replayed month by month on real prices. The helper steps in at the first month-end in months 4 to 12 when the value is below what was put in.
- **No personal data** (`docs/adr/0004`). No login, name, phone or PAN.

Read `GLOSSARY.md`, `docs/adr/` and `TODO.md` before changing anything.

## Run it

```bash
npm install
cp .env.example .env.local   # then add OPENAI_API_KEY
npm run dev                  # http://localhost:3000
npm test                     # unit tests (Vitest)
npx playwright test          # end-to-end tests, phone and desktop
npm run build
```

## Deploy (Vercel)

1. Import the repo in Vercel (framework: Next.js, no build settings to change).
2. Add the environment variable `OPENAI_API_KEY` in the Vercel project settings. It is never in the repo.
3. In the project's **Analytics** tab, enable Web Analytics. The app already includes `@vercel/analytics` and sends anonymous events only (no questions, answers, funds or amounts).
