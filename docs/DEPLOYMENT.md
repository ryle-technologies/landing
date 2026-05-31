# Landing deployment (Vercel)

## Status

| Item | State |
|------|--------|
| Repo | [`ryle-technologies/landing`](https://github.com/ryle-technologies/landing) |
| Preview deploy | `https://ryle-landing.vercel.app` (personal Vercel scope) |
| Production domain | **`www.ryle.sh`** — move from `sur-techs/exchange` project (Ryle team admin) |

## New project (Ryle team — requires admin)

1. In the **Ryle** Vercel team: **Add New → Project** → import `ryle-technologies/landing`.
2. Framework preset: **Next.js**. Build command: `pnpm build`. Install: `pnpm install`.

## Environment variables (landing project)

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ryle.sh` |
| `NEXT_PUBLIC_ALPHA_TEST_URL` | Wallet Vercel URL (e.g. `https://exchange-xxx.vercel.app`) — no custom domain on wallet yet |
| `DOCS_PROXY_ORIGIN` | `https://ryle.mintlify.dev` (Mintlify subdomain for `/docs` rewrites) |
| `GOOGLE_SITE_VERIFICATION` | Move from `exchange` project when cutover completes |

Preview deployments do not need `NEXT_PUBLIC_SITE_URL` — origin resolves from `VERCEL_URL`.

## Docs at `www.ryle.sh/docs` (Mintlify subpath)

The marketing site proxies `/docs` and `/docs/*` to Mintlify via `next.config.ts` rewrites. Set `DOCS_PROXY_ORIGIN` on the **landing** Vercel project (production and preview).

### Mintlify (dashboard or Admin MCP)

1. [Mintlify project](https://app.mintlify.com/ryle/ryle) → **Custom domain** → enable **Host at `/docs`**.
2. Add `www.ryle.sh` (and optionally `ryle.sh` if apex DNS allows Mintlify hostname verification).
3. Complete any Cloudflare custom-hostname TXT records shown in the dashboard until status is **active**.

### Vercel

Rewrites are already in `next.config.ts`:

```ts
{ source: "/docs", destination: `${docsOrigin}/docs` }
{ source: "/docs/:path*", destination: `${docsOrigin}/docs/:path*` }
```

Marketing CSP headers are scoped to exclude `/docs` so proxied Mintlify assets load correctly.

### Verify after Mintlify deploys content

- `https://www.ryle.sh/docs` — docs home
- `https://www.ryle.sh/docs/llms.txt` — LLM index (or root `/llms.txt` per Mintlify routing)
- `https://www.ryle.sh/docs/sitemap.xml`

Until Mintlify Git is connected to `ryle-technologies/landing` (`/docs` path), `/docs` may return Mintlify 404 even when the proxy is configured correctly.

## Domain cutover (www.ryle.sh)

Do **add-then-remove** in the same Vercel team to minimize downtime:

1. **Landing project** → Settings → Domains → add `ryle.sh` and `www.ryle.sh`. Set apex → redirect to `www`.
2. Wait for SSL / DNS valid on the landing project.
3. **exchange project** → Settings → Domains → remove `ryle.sh` and `www.ryle.sh`.
4. Update `NEXT_PUBLIC_ALPHA_TEST_URL` on landing to the wallet’s default `*.vercel.app` URL.
5. Update wallet `NEXT_PUBLIC_SITE_URL` to its new default Vercel URL (see exchange `docs/wallet/setup/deployment.md`).

## Wallet project (sur-techs/exchange)

After cutover:

1. Remove custom domains from the **exchange** Vercel project.
2. Set `NEXT_PUBLIC_SITE_URL` to the default deployment URL.
3. Add that URL to **Supabase Auth**, **Privy**, and **Google OAuth** redirect allowlists.
4. Remove `GOOGLE_SITE_VERIFICATION` from exchange (it belongs on landing).
