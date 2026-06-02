# Ryle documentation (Mintlify)

Public documentation for Ryle, built with [Mintlify](https://mintlify.com).

## Local preview

From the repo root:

```bash
pnpm docs:dev
```

Open [http://localhost:3333](http://localhost:3333). The Mintlify dev server uses port 3333 so it does not conflict with the Next.js app on 3000.

Optional: run `pnpm exec mint login` once to enable search and the assistant in local preview.

## Validate before deploy

```bash
pnpm docs:validate
pnpm docs:links
```

## Mintlify dashboard (deploy)

1. Create a project at [mintlify.com/start](https://mintlify.com/start).
2. Connect this repo: **GitHub** → `ryle-technologies/landing`.
3. Enable **monorepo** in Git Settings and set the documentation path to `/docs`.
4. Push to your deploy branch — Mintlify builds automatically.

## Public URL (`www.ryle.sh/docs`)

Docs are served on the marketing domain under `/docs` via Vercel rewrites to Mintlify. See [DEPLOYMENT.md](./DEPLOYMENT.md) for `DOCS_PROXY_ORIGIN`, Mintlify **Host at `/docs`**, and verification steps.

Wallet engineering docs stay in [sur-techs/exchange](https://github.com/sur-techs/exchange) under `docs/wallet/`.

## MCP in Cursor

Two Mintlify MCP servers work together:

| Server | URL | Purpose |
| --- | --- | --- |
| **Docs MCP** (read-only) | `https://mintlify.com/docs/mcp` | Search Mintlify platform docs while authoring (`user-mintlify` in Cursor) |
| **Admin MCP** (write) | `https://mcp.mintlify.com` | Edit pages, navigation, and `docs.json` via OAuth; changes land on a PR branch |

Add the admin MCP in Cursor: **Cmd+Shift+P** → **Open MCP settings** → add:

```json
{
  "mcpServers": {
    "mintlify-admin": {
      "url": "https://mcp.mintlify.com"
    }
  }
}
```

Complete OAuth when prompted. Use natural-language prompts like “check out a branch and add a FAQ page under Reference.”
