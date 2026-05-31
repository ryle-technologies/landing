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

Partner integration docs live in [`docs/`](docs/) as a [Mintlify](https://mintlify.com) site.

```bash
pnpm docs:dev    # http://localhost:3333
pnpm docs:validate
```

See [`docs/README.md`](docs/README.md) for deploy (monorepo path `/docs`) and MCP setup.

## Deployment

Vercel project **`ryle-landing`** (personal scope preview: `https://ryle-landing.vercel.app`). Production domain target: **`www.ryle.sh`** on the **Ryle** team — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

**GitHub:** [`ryle-technologies/landing`](https://github.com/ryle-technologies/landing)

## Scripts

| Command       | Description        |
|---------------|--------------------|
| `pnpm dev`    | Dev server         |
| `pnpm build`  | Production build   |
| `pnpm lint`   | ESLint             |
| `pnpm test`   | Vitest unit tests  |
| `pnpm docs:dev` | Mintlify docs preview (port 3333) |
| `pnpm docs:validate` | Validate Mintlify build |
