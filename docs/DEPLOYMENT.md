# Landing deployment (Vercel)

## New project

1. Create GitHub org **ryle-technologies** at https://github.com/organizations/plan (if not done).
2. Push this repo to `ryle-technologies/landing`.
3. In the **Ryle** Vercel team: **Add New → Project** → import `ryle-technologies/landing`.
4. Framework preset: **Next.js**. Build command: `pnpm build`. Install: `pnpm install`.

## Environment variables (landing project)

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ryle.sh` |
| `NEXT_PUBLIC_ALPHA_TEST_URL` | Wallet Vercel URL (e.g. `https://exchange-xxx.vercel.app`) — no custom domain on wallet yet |
| `GOOGLE_SITE_VERIFICATION` | Move from `exchange` project when cutover completes |

Preview deployments do not need `NEXT_PUBLIC_SITE_URL` — origin resolves from `VERCEL_URL`.

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
