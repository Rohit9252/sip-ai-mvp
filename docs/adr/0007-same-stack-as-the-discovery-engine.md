# Same stack as the discovery engine

The MVP uses the stack already working in the discovery engine: Next.js with React and TypeScript, Tailwind, zod to check every AI reply, the OpenAI API (gpt-4.1-mini) for the words, and Vercel for hosting. With a week to the deadline, a setup whose deploys, keys and patterns already work beats any gain from a new one.

## Considered options

- A separate Python backend for the AI part. Rejected: two deploys and two languages for one small app.
- A no-code workflow tool. Rejected: it cannot hold the number check, the safe answer rules and the eval gate in code we control.
