<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`. Verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI-powered MVP: rules for every agent

A concept feature for a Groww-style SIP page (Part 5 of the Groww SIP brief). Read first: `GLOSSARY.md` (the words we use in code and copy), `docs/adr/0001` to `0007` (decisions not to undo), `TODO.md` (the task list; tick a task only when it is done). Do not edit `GLOSSARY.md` or the ADRs. If your work conflicts with them, stop and report it.

## Rules for every agent

1. **Never advice, never predictions**, in any language. No fund names as suggestions, no "keep going", "stop", "will recover", "will rise". The brief forbids fear, FOMO and urgency nudges too.
2. **Numbers come from code only** (ADR-0001). The AI gets a facts object and writes words; code checks every number in its reply.
3. **No em dashes** anywhere: code comments, UI copy, docs, commit messages. Use a comma, colon, full stop or brackets.
4. **Plain words.** Short sentences. Copy a first-timer understands.
5. **No personal data.** No login, name, phone, PAN or portfolio (ADR-0004). No Groww logo. A fixed strip on every screen says it is a concept made for a course project, not made by or linked to Groww, and not investment advice.
6. **Phone first.** It must look right at 390 px wide. On a wide screen, a Desktop/Phone switch shows it as a page or in a phone frame (the attempt-one device shell).
7. **Secrets:** `OPENAI_API_KEY` lives only in `.env.local` (git-ignored) and in Vercel. Never print it, log it or commit it.
8. **Git:** work on a branch per phase (`phase-1-data`, and so on). Commit under the repo's configured author only. **No `Co-Authored-By` or any AI attribution lines.** Do not push and do not deploy unless the task says so.
9. **Tests first** for logic (the `tdd` skill). Every task ends with `npm test` and `npm run build` passing.
10. **UI tools:** the `impeccable` skill for design passes. Watermelon UI components (free, Tailwind v4: https://ui.watermelon.sh, `llms.txt` at https://ui.watermelon.sh/llms.txt) where a component fits. Mobbin only if signed in.

Use the glossary words in code names and comments: `invested`, `value`, `setback`, `fundMove`, `marketMove`, `facts`, `instalment`, `replay`, `reason`. Do not use the words the glossary says to avoid (for example "dip", "crash", "principal", "balance", "benchmark" in user copy). Never use the name "Kyun?".

## Commands

```bash
npm install          # first time only
npm run dev          # http://localhost:3000
npm test             # Vitest, one run (unit tests use saved NAV fixtures, never the live network)
npm run build        # production build; must pass before every commit
npm run lint         # ESLint
```

Before a commit, check for em dashes (U+2014). This must print nothing:

```bash
grep -rn "$(printf '\342\200\224')" src docs AGENTS.md TODO.md
```

## Layout

- `src/lib/nav/`: the NAV client (fund search and NAV history from `https://api.mfapi.in`, cached 12 hours on the server).
- `src/lib/sip/`: SIP maths, setback finder, facts object, Indian-format helpers, the sample SIP.
- `docs/reference/`: hand checks, the sample SIP record, the approved mockup.

## Notes

- Unit tests read JSON fixtures saved from real mfapi responses (`src/**/__fixtures__/`). Do not call the network in a test.
- mfapi returns dates as `dd-mm-yyyy`, newest first, and NAVs as strings. The NAV client turns them into ISO dates (`yyyy-mm-dd`), oldest first, and numbers.
- If `npm install <package>` fails with `EALLOWSCRIPTS`, your user-level `.npmrc` has an `allow-scripts` line that npm rejects for project installs. Run the install with `NPM_CONFIG_USERCONFIG` pointing to an empty file. Do not edit the user's `.npmrc`.
