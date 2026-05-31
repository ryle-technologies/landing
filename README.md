# Ryle landing

Public marketing site for [Ryle](https://www.ryle.sh) — confidential digital assets for companies.

This repo lives under the **ryle-technologies** GitHub org. The wallet app remains in [sur-techs/exchange](https://github.com/sur-techs/exchange).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Geist fonts, Motion

## Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

Partner integration briefs (markdown only, no docs site yet):

- [`docs/partner-integration-brief.md`](docs/partner-integration-brief.md) — executive overview
- [`docs/partner-integration-overview.md`](docs/partner-integration-overview.md) — product / ops
- [`docs/partner-integration-technical-brief.md`](docs/partner-integration-technical-brief.md) — engineering

## Deployment

Vercel project in the **Ryle** team, production domain **`www.ryle.sh`**.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for env vars and domain cutover from `sur-techs/exchange`.

## Scripts

| Command       | Description        |
|---------------|--------------------|
| `pnpm dev`    | Dev server         |
| `pnpm build`  | Production build   |
| `pnpm lint`   | ESLint             |
| `pnpm test`   | Vitest unit tests  |
