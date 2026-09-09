# Ryle — From "confidential assets SaaS" to financial infrastructure for the digital economy

**Type:** positioning + landing-page blueprint (document only, no code changes)
**Date:** 2 September 2026
**Inputs:** current `ryle-landing` site and docs hub; product-suite, pricing, Growie, Suntory and Estancia San Joaquín decks; Growie due-diligence and work proposal (Aug 2026); `ryle-app` shipped inventory (console, edge functions, contracts, ADRs); Nuek demo brief and artifacts; public material on Justoken (ex-Agrotoken).
**Status:** draft for team discussion. Section 9 lists the decisions that must be taken before copy goes live.

---

## 0. The one-page version

**What changed.** We built and sold Ryle as a hosted SaaS whose hero feature is confidentiality. The customers we actually talk to (Growie, Nuek, Suntory, Estancia, Justoken-type companies) are not buying "privacy". They are trying to become **financially digital**: issue their own assets, move money fast, put payments and cards in their own product, and do it on a stack they control. Privacy is a property they want the stack to have. It is not the reason they call.

**What they told us.** Their own cloud. Their own IP. Their own code. Growie already owns its AWS accounts and repos and wants fewer moving parts, not a new tenant on someone else's platform. Nuek wants the service *inside its own app* via APIs, not a standalone product. Suntory has patent-pending in-house tech and wants a layer that extends it, not a replacement. Justoken literally rebranded from selling tokens to "selling the factory". Every one of them is a company that wants to *own* its financial infrastructure.

**What we should become.** Not a SaaS vendor with tenants. A **financial-infrastructure company that deploys a modular stack into the client's environment and operates it alongside them.** The product is the stack (Issuance, Payments, Cards, Privacy, with Wallet and Console as surfaces). The traits are **Modular** (adopt one module, add the rest) and **Yours** (your cloud, your repo, your keys). The service is the forward-deployed team that gets it live. Hosting by Ryle remains an option, not the default identity.

**Proposed category line:** *Financial infrastructure for the digital economy.*
**Proposed hero:** *The financial stack your company owns.* — Issue assets, move money, run payments and cards onchain. Modular. Private by design. Deployed in your cloud.

**What the landing must stop doing:** leading with "confidential digital assets", using privacy vocabulary ~700 times across the site versus zero mentions of ownership or modules, and describing a hosted-only model in the pricing and brief.

**What must be true before we say it:** cards are a demo today; "your cloud" is not a supported deployment today (ADR-001/003/030 assume Ryle's Supabase project and multi-tenant RLS). Both need product and ADR decisions, covered in §8–9. The landing can be honest about maturity and still pitch the vision.

---

## 1. Evidence: what exists today

### 1.1 The landing page and docs hub say "privacy first"

| Item | Today |
|---|---|
| Title | *Ryle · Confidential Digital Assets for Companies* |
| Description | *Bring assets onchain without exposing sensitive activity — launch and operate confidential digital assets for enterprises.* |
| Hero H1 | *Launch digital assets, move value, and manage private operations with infrastructure built for enterprises, fintechs, and AI.* |
| Section H2 | *Digital assets are ready for the enterprise.* / *Ryle gives teams the infrastructure to build, launch, and operate confidential digital assets.* |
| Closing | *Instant by nature. Private by choice. Verifiable by design.* |
| Docs products | Issuance · Confidential payments · Accounts & wallets · Compliance & disclosure (all tagged "Soon") |
| Word counts (landing + docs) | privacy/confidential/private ≈ **691** · issuance ≈ 56 · payments ≈ 65 · infrastructure ≈ 32 · **ownership 0 · modules 0 · payment cards 0** |

The landing already contains the good bones of the new story (infrastructure, "without building the stack", APIs/SDK/MCP, EVM-ready) but subordinates all of them to confidentiality. The docs hub is a knowledge base about *confidential assets*, not about running a financial stack.

### 1.2 The decks already drifted toward "financial infrastructure" but kept the SaaS shape

- Product-suite deck header: **"Financial infrastructure"** on every slide; cover: *Operate digital assets without building the stack from scratch.* Four products: Blockchain Infrastructure, White Label Wallet, Confidentiality Onchain, Back Office. Confidentiality is product 03, not the hero.
- Pricing deck: **flat monthly SaaS** (Launch USD 6,500 · Distribute USD 8,500 · Private +USD 2,500), *"Hosted sandbox + live · cloud, ops, updates · no separate Ryle infra bill."* Forward Deployed Engineer at USD 120/h as an add-on.
- Commercial brief §8: *"partners do not provision or pay separate Ryle infrastructure."*
- Growie deck had to add a defensive slide: *"Full access, no lock-in — code and credentials on Growie's side, an exportable audit trail, and a documented exit path."* We were already answering the ownership objection, one slide at a time, inside a hosted model.
- Suntory deck is the only privacy-hero pitch and it is a *discovery* proposal for a company that already has its own program.

### 1.3 What the product actually is (ryle-app, September 2026)

| Pillar | Shipped substance | Evidence |
|---|---|---|
| **Privacy** | Strong. PrivateToken Phase 1 complete: Groth16 circuits, client-side proving, 1:1 bridge, API never returns balances. | ADR-013–019, `contracts/private-token`, `packages/private-token-sdk` |
| **Issuance** | Partial-to-strong. PublicToken (EIP-3009 gasless), PrivateToken, BYO-wrap path, deploy/mint/redeem/pause workers, reserves reconciliation. Production validation still runbook-driven. | ADR-006/007/015, `deploy-asset`, `mint-runner`, `redeem-runner`, BYO-wrap runbook |
| **Payments** | Partial. Gas relayer, EIP-3009 transfers, confidential transfers shipped; orchestration (mint/redeem/pause) in progress; no fiat rails, no PSP integration. | ADR-012/032, `relayer`, `private-token-transfers` |
| **Cards** | Demo only. `/hybrid-cards` console module runs on `mockData.ts`; no issuer/processor integration. | `apps/console/components/hybrid-cards` |
| **Modules** | Mixed. Backend is genuinely modular (`_shared/console/*`: assets, custody, allowlist, mint, redeem, reserves, disclosures, webhooks, wallet-config, wallet-signup…). Console nav today leads with **Cards, Remittances, Wallet** (demo modules) while Assets/Custody/Disclosures/Proofs are nav-disabled. | `apps/console/lib/nav/console-nav.ts` |
| **Code ownership** | Not offered. Private monorepo; SDK workspace-private (ADR-020); platform runs in Ryle's Supabase project (ADR-001) with multi-tenant RLS (ADR-003) and Edge-only backend (ADR-030); no self-host or source-license path documented. | `docs/adr/README.md`, `docs/PROVENANCE.md` |

Two things stand out. First, the console UI already reorganised itself around Nuek's language (Cards, Remittances, Wallet) — the product team felt the shift before marketing did. Second, the biggest gap between the new story and reality is not cards; it is **deployment and ownership**, which is architectural.

### 1.4 Who the customers are and what they wanted

| Client | Who | What they wanted | What it tells us |
|---|---|---|---|
| **Growie** | Real-estate tokenization platform, USD 4.3M administered, 61 paying investors, 4 tokenized projects, own AWS org (~USD 3.3k/mo) and ~40 infra repos built with Globant. | Ship faster; simpler stack without a rewrite; integrated payment rails (manual accreditation today; 643 KYC'd → 61 invested); key custody and contract-upgrade governance; keep production and contracts untouched. | They *are* a digital-asset company already and it hurts. They own everything and want fewer parts plus a team. Our Aug-2026 proposal to them was "modules integrated into your platform + FDE", not "become our tenant". That is the real product. |
| **Nuek** | B2B fintech orchestration platform for financial institutions (Argentina/Uruguay, Europe→LATAM corridor). | Wallet-first, **embedded via APIs inside partner apps**; remittances first, **hybrid fiat + stablecoin cards** second; console view of Nuek → banks → end users. *"No partner wants a standalone app."* | Payments and cards are the demand; wallet is the vehicle; the buyer is a company that resells to institutions and needs white-label-of-white-label. |
| **Suntory** | Global beverage group with in-house, patent-pending Web3 program (NFC authenticity, tokenized bottles, licensed custody). | Extend past collectibles: tokenized casks, distributor settlement, loyalty, provenance — without publishing economics; **not replace** anything. | Large corporates come with their own stack and want a *layer*. Privacy is the hook here, but the buy is "tokenized stock + settlement". |
| **Estancia San Joaquín** | Agri / real-estate estate operator. | Tokenize lots and a fideicomiso, distribute rents, community/loyalty token, crop traceability, investor wallet. | Real-asset operators want issuance + distribution + back office; privacy optional. Custom work (FDE) was part of the pitch. |
| **Justoken (ex-Agrotoken)** | Argentine RWA-infrastructure company; grain tokens (SOYA/CORA/WHEA) with Santander, Galicia, Bunge, Visa-via-Pomelo card; rebranded 2024 to "blockchain infrastructure as a service"; 2026 Enertoken with YPF Luz on XRPL. | (No primary material on disk.) Archetype: a company that went from *making tokens* to *selling the factory*, with a custom-build arm (Justoken Labs) that deploys "in weeks, not years". | Confirms the market shape: the winners in LATAM RWA sell **owned infrastructure + services**, not seats. Also confirms Visa-via-processor is how "cards" gets done. |

Cross-cutting: every real conversation involved **the client's existing systems and cloud**, a request for **speed with a team**, and **payments as the missing piece**. Not one was blocked on privacy.

---

## 2. The strategic reframe

### 2.1 From SaaS vendor to infrastructure company

| | Today (SaaS) | Proposed (infrastructure) |
|---|---|---|
| Unit of sale | Tenant on Ryle's platform, flat monthly bundle | A **stack** deployed for one company, licensed per module, operated with them |
| Where it runs | Ryle's Supabase + Vercel | **Client's cloud** by default; Ryle Cloud as the fast-start option |
| Who owns the code | Ryle | Client gets **source access / license** to the modules deployed for them; Ryle keeps the core and upstream |
| Who owns keys and data | Client (already true on-chain), Ryle for the database | Client for everything, including the database |
| Role of Ryle's people | Support tiers, optional FDE | **Forward-deployed team is part of the product**: discovery, deploy, operate, hand over |
| Hero property | Confidentiality | **Ownership + speed**; confidentiality is a built-in trait |
| Roadmap control | Ryle's | Shared: client can extend modules; Ryle ships upstream updates |

This is closer to how Growie was actually approached in August, how Nuek wants to consume it, and how Justoken sells. It is also the model that resolves the "kinda SaaS but not sure" discomfort: the company is a **stack + team**, and hosting is a delivery option.

### 2.2 The pitch in one sentence

> Ryle is the financial infrastructure companies use to become digital-native: a modular stack to issue assets, move money, and run payments and cards onchain — private by design, deployed in your cloud, and yours to own.

### 2.3 What we are *not* saying anymore

- "Confidential digital assets for companies" as the category. Confidentiality becomes a module and a trait.
- "Partners do not provision infrastructure." Replace with "runs where you run".
- "Technology provider, not custodian" as a headline. Keep it as a trust line; it is true and important, but it is a reassurance, not a promise.
- Enterprise-privacy problem statements (runway exposure, competitor intelligence) as the opening argument. They move into the Privacy module page.

---

## 3. Product architecture for the story

Six core items, organised as **four modules + two surfaces**, held together by **two traits**.

### 3.1 Modules (what you deploy)

| Module | Promise | Ships today | Gap to the promise |
|---|---|---|---|
| **Issuance** | Launch and operate your own assets: stablecoins, tokenized real assets, loyalty units, settlement tokens. Mint, redeem, pause, reconcile reserves, govern roles with your custody. | PublicToken, PrivateToken, BYO wrap, deploy handoff, mint/redeem/pause workers, reserves. | Production validation evidence (FR50); more chains than Base. |
| **Payments** | Move value instantly: internal transfers, B2B settlement, payouts, remittance corridors, gasless for end users, fiat on/off-ramps through partners. | Relayer, EIP-3009 gasless transfers, confidential transfers, operations/webhooks. | Fiat rails and PSP/exchange connectors (Growie's #1 pain; Nuek's stage 1); remittances console is demo. |
| **Cards** | Spend from your assets: hybrid fiat + stablecoin card programs issued under your brand with a partner issuer/processor. | Console prototype (programs, issuance, reconciliation UI). | An issuing partner (Pomelo-class) and the ledger integration. Honest label: *in design with partners*. |
| **Privacy** | Confidential balances and transfers on public chains with selective disclosure and proof of reserves — turn it on per asset. | Phase 1 complete; disclosure and proofs in progress. | Disclosure UX v2; EAS proofs nav-enabled. Strongest module we have; sell it as a trait of the stack, not the reason for it. |

### 3.2 Surfaces (how people use the modules)

- **Console** (back office): operations, treasury, compliance, roles, audit. Rename consistently — "Console", drop "Control Panel"/"Back Office" drift.
- **Wallet & Accounts**: white-label end-user wallet (embedded in the client's app or standalone), signup handoff, KYC gating, allowlists.
- **API · SDK · MCP**: the same operating model for engineers and AI agents.

### 3.3 Traits (why it is different)

- **Modular** — adopt one module, add the rest, integrate with what you already run. Growie keeps its contracts; Suntory keeps NFC and custody; Nuek keeps its orchestration.
- **Yours** — deployed in your cloud, in your repos, with your keys. Ryle operates it with you and hands over runbooks. No tenant lock-in, no exit negotiation.

---

## 4. Deployment models (the "how you run it" section the site has never had)

| Model | For whom | What it means | Status |
|---|---|---|---|
| **Ryle Cloud** | Pilots, teams without a platform team | Ryle hosts sandbox + live. Fastest start. Data export and exit path guaranteed. | Available today (current architecture). |
| **Your Cloud, Ryle-operated** | Companies with cloud accounts and compliance requirements (Growie, banks' partners) | Stack deployed into the client's AWS/GCP/Azure/Supabase org. Ryle runs it under an operating agreement; client holds admin. | **Requires new ADR** superseding ADR-001 (dedicated Ryle Supabase project) and ADR-030 assumptions; packaging of Edge functions + Postgres + console for per-client deploy. |
| **Owned** | Companies that treat financial infra as core IP (Justoken-class, Suntory-class) | Source license to deployed modules, client repo, client CI/CD. Ryle provides upstream updates, FDE capacity, and support. | Requires licensing decision (§9) and SDK publication path (ADR-020 currently workspace-private). |

Recommended default in copy: lead with **Your Cloud**, offer Ryle Cloud as the way to start in days, present Owned as the mature state. The pricing shape follows: per-module license + deployment/FDE engagement + optional managed operations + support retainer. Keep the current numbers as the Ryle Cloud tier until the new tiers are priced.

---

## 5. Landing page blueprint (copy draft)

Written for `ryle-landing`, English, same tone: declarative, short, no hype. Spanish variant later. Copy in *italics* is proposed final wording; bracketed notes are guidance.

### 5.1 Metadata

- **Title:** *Ryle · Financial infrastructure for the digital economy*
- **Description:** *Ryle gives companies a modular stack to issue assets, move money, and run payments and cards onchain — private by design, deployed in your cloud, yours to own.*
- **JSON-LD slogan:** *Modular. Private by design. Yours.*
- **Keywords (add):** financial infrastructure, tokenization platform, stablecoin issuance, onchain payments, card programs, white-label wallet, self-hosted, source license.

### 5.2 Nav

`δ Ryle` · **Stack** (anchor) · **How you run it** (anchor) · **Docs** · CTA **Talk to us** (Calendly).

### 5.3 Section A — Hero

- **Eyebrow:** *Financial infrastructure for the digital economy*
- **H1:** *The financial stack your company owns.*
- **Sub:** *Issue your own assets, move money instantly, and put payments and cards inside your product — on modular infrastructure that runs in your cloud and stays yours.*
- **CTAs:** *Talk to us* · *See the stack* (scroll)
- **Supporting line:** *Settles on public EVM networks* + chain logos (keep the marquee).

[Keep the island etching; it reads as "your own territory", which is now on-message.]

### 5.4 Section B — The shift

- **H2:** *Every company is becoming a financial company. Most are doing it on someone else's stack.*
- Three short columns:
  - *Building it yourself takes 18–24 months, a team you cannot hire, and a dozen vendors that do not share one model.*
  - *Renting it as SaaS gets you live, and leaves your money movement, your data, and your roadmap on another company's cloud.*
  - *Ryle is the third option: a modular financial stack you deploy in your environment, with our engineers alongside until it runs on its own.*

### 5.5 Section C — The stack (four module cards + two surface cards)

- **H2:** *One stack. Four modules. Start with the one that unblocks you.*
- **Issuance** — *Launch stablecoins, tokenized real assets, loyalty and settlement units. Mint, redeem, pause and reconcile reserves with your custody holding the keys.*
- **Payments** — *Move value in seconds: internal transfers, B2B settlement, payouts and cross-border corridors. Gasless for your users. Fiat rails through the partners you choose.*
- **Cards** — *Spend from your assets. Hybrid fiat and stablecoin card programs under your brand, with an issuing partner, reconciled in the same ledger.* [Label: *In design with partners*.]
- **Privacy** — *Confidential balances and transfers on public chains, with selective disclosure and proof of reserves. Turn it on per asset.*
- **Console** — *Operations, treasury, compliance and audit in one back office. Roles, policies, disclosures, exports.*
- **Wallet & Accounts** — *A white-label wallet embedded in your app or standalone. No seed phrases, no gas, KYC where you need it.*
- **Footer line:** *APIs, SDKs and MCP — the same operating model for your engineers and your AI agents.*

### 5.6 Section D — How you run it

- **H2:** *Runs where you run.*
- Three tiles: **Ryle Cloud** (*Live in days. Sandbox and production hosted by us, with guaranteed export and exit.*) · **Your Cloud** (*Deployed in your AWS, GCP or Azure. Your admin, your data, your compliance perimeter. We operate it with you.*) · **Owned** (*Source-licensed modules in your repositories, your CI/CD, upstream updates from Ryle.*)
- **Proof line:** *Non-custodial by design: Ryle never holds your assets, reserves or keys — on any model.*

### 5.7 Section E — Who it is for

- **H2:** *Built for companies that already decided to go digital.*
- Four archetypes (anonymised unless clients approve names):
  - *Tokenization platforms* — *Replace forty repositories and a manual back office with modules that fit your existing contracts.* (Growie)
  - *Fintechs and orchestrators* — *Offer wallets, remittances and cards to your institutional clients, inside their apps.* (Nuek)
  - *Brands and corporates* — *Extend an in-house Web3 program into tokenized inventory and confidential settlement without replacing it.* (Suntory)
  - *Real-asset operators* — *Tokenize land, energy or produce, distribute yields and give investors a wallet.* (Estancia, Justoken-class)

### 5.8 Section F — How we work

- **H2:** *Engineers deployed with you, not a ticket queue.*
- Four steps, reuse deck cadence: *Discovery (weeks 1–2)* → *Deploy (weeks 3–6: first module live in your environment)* → *Operate together (first months, runbook handover)* → *Scale (next module, next market)*.
- Line: *Forward-deployed engineering is part of the product, onsite anywhere.*

### 5.9 Section G — Trust

Short strip: *Public EVM settlement* · *Non-custodial* · *Immutable audit trail* · *Selective disclosure* · *Open standards (ERC-20, EIP-3009, EAS)* · *Sandbox = production*.

### 5.10 Section H — Close

- **H2:** *Own the rails your business runs on.*
- **Sub:** *Issue, move, spend. Modular. Private by design. Yours.*
- CTAs: *Talk to us* · *Read the docs*
- Footer marquee: replace *Instant · Private · Verifiable* with *Modular · Private · Yours* (keep "Verifiable" if the team is attached; it still holds).

### 5.11 Footer / docs taxonomy changes

| Today | Proposed |
|---|---|
| Knowledge Base: confidential-asset concepts | **Learn:** What financial infrastructure is · Why own your stack · Confidential assets (moved down) |
| Products: Issuance · Confidential payments · Accounts & wallets · Compliance & disclosure | **Stack:** Issuance · Payments · Cards · Privacy · Console · Wallet & Accounts |
| Build: Console · APIs · White-label wallet | **Build:** APIs & webhooks · SDK · MCP · White-label wallet · Deployment models |
| Use cases: treasury, stablecoins, supplier payments, B2B, AI agents, tokenization platforms | **Use cases:** Tokenization platforms · Fintechs & orchestrators · Brands & corporates · Real-asset operators · Treasury · AI agents |
| Compliance | Keep, add *Deployment & data residency* |

Remove the "Soon" tags on things that ship (Issuance, Console, APIs); keep honest labels on Cards.

---

## 6. Messaging rules

**Say**
- "Financial infrastructure", "stack", "modules", "your cloud", "yours", "issue / move / spend".
- "Private by design" as a trait. "Confidential" inside the Privacy module.
- "Deployed with you" for services. Name the FDE model; customers liked it.
- Concrete outcomes: *first module live in your environment in weeks*, *no separate infra bill on Ryle Cloud*, *your custody holds the keys*.

**Avoid**
- "Confidential digital assets" as the category or in the title.
- "Partners do not provision infrastructure" and any wording that implies hosted-only.
- "Control Panel" / "Back Office" / "Console" interchangeably — use **Console**.
- Percent claims (−75% / −60% / −90%) on the public site without a footnote; keep them in decks.
- Anything that presents Cards as live.

---

## 7. Objection handling (for the site FAQ and sales)

| Objection | Answer |
|---|---|
| *We want our own cloud.* | Default model. Stack deploys into your AWS/GCP/Azure; Ryle operates under an agreement, you hold admin. (After ADR decision, §9.) |
| *We want to own the code.* | Owned model: source license to the modules deployed for you, in your repos. Ryle keeps the core roadmap and ships upstream updates; you can extend. |
| *We already built a lot.* | Modules integrate with existing contracts, custody and systems. Growie's engagement kept every issued contract and investor untouched. |
| *Lock-in.* | Public chains, standard tokens, exportable data and audit trail, documented exit on every model, non-custodial always. |
| *You are small.* | Forward-deployed engineers, runbook handover, and a stack you can run without us. The risk of a small vendor is exactly what ownership removes. |
| *Is privacy required?* | No. It is a module. Turn it on per asset when the use case needs it. |

---

## 8. What the product must do to back the story

These are not landing tasks, but the landing cannot claim them without a plan.

1. **Per-client deployability.** Package console + Edge functions + migrations + relayer for deployment into a client-controlled Supabase/Postgres and cloud account. Conflicts with **ADR-001** (Ryle-owned Supabase project) and the multi-tenant default in **ADR-003**; touches **ADR-030**. Needs a superseding ADR ("single-tenant deployment profile") — not a verbal override.
2. **Source access.** Decide license shape (per-module source license vs. source-available core). **ADR-020** keeps the SDK workspace-private; publication or client-repo mirroring needs a decision.
3. **Payments rails.** Pick the first fiat/exchange connector and PSP pattern (Growie: payment gateway; Nuek: corridor partners). Remittances console moves from mock to a real orchestration spec.
4. **Cards partner.** Select an issuer/processor for the hybrid card (Pomelo-class in LATAM) or keep Cards labelled *in design*.
5. **Console nav.** Enable the Assets/Custody/Disclosures/Proofs journey by default and place Cards/Remittances behind honest "preview" labels, so demos match the site.
6. **Fix stale docs.** Root `README.md` and `docs/architecture/overview.md` still describe a P0 stub backend.

---

## 9. Decisions for the team

1. **Identity:** adopt "financial infrastructure for the digital economy" as category and "the financial stack your company owns" as hero? (Alternatives in §10.)
2. **Default model:** lead with *Your Cloud* (recommended) or keep *Ryle Cloud* as default and offer the others?
3. **Licensing:** are we willing to give source access to deployed modules? Under what terms (per-module, per-client, non-compete, upstream rights)?
4. **Cards:** public claim level — *in design with partners* vs. omit until a partner is signed.
5. **Privacy placement:** module + trait (recommended) vs. keep as a second headline.
6. **Client names:** may Growie / Nuek / Suntory / Estancia appear as archetypes only, logos, or case studies?
7. **Pricing surface:** show no prices on the landing (recommended), or publish the Ryle Cloud tier only?
8. **Language:** English-first landing with `es` variant for LATAM decks, as today?

---

## 10. Alternative hero lines (pick or blend)

- *The financial stack your company owns.* (recommended: ownership + product)
- *Become a financially digital company.* (mission; weaker product signal)
- *Issue. Move. Spend. On infrastructure you own.* (module-forward)
- *Financial infrastructure for the digital economy. Deployed in your cloud.* (category + differentiator)
- *Own the rails your business runs on.* (good close, too abstract as H1)

---

## 11. Suggested next steps

1. Team review of §2, §4 and §9 (one session). Record decisions in this file.
2. Draft superseding ADR for single-tenant/self-hosted deployment profile if decision 2 is *Your Cloud*.
3. Copy pass on §5 with the decisions applied; produce the `es` variant.
4. Update `product-commercial-brief.md`, product-suite and pricing decks to the four-module / three-model structure so decks and site say the same thing.
5. Rebuild docs hub taxonomy per §5.11 before the landing goes live (footer links must resolve).
6. Then, and only then, implement in `ryle-landing`.

---

## Appendix — sources consulted

- `ryle-landing`: `app/(marketing)/*`, `components/marketing/landing/*`, `lib/metadata.ts`, `lib/siteNav.ts`, `lib/structuredData.ts`, `docs/**/*.mdx`, `docs/docs.json`.
- Decks (branch `docs/ryle-product-suite-presentation`): `ryle-product-suite(.es).html`, `ryle-product-suite-estancia-san-joaquin.html`, `ryle-growie-proposal.html`, `ryle-pricing.html`, `product-commercial-brief.md`; `docs/presentations/ryle-suntory-proposal.html` on `main`.
- Growie (branch `cursor/growie-due-diligence-2565`): `docs/clients/growie/briefing-direccion-2026-08.md`, `propuesta-comercial-2026-08.md`, `problemas-infraestructura-2026-08.md`, `soluciones-infraestructura-2026-08.md`, `due-diligence-infraestructura-2026-08.md`.
- `ryle-app`: `docs/partner-platform-overview.md`, `docs/adr/README.md` and ADRs 001–034, `docs/ryle-console/backend/**`, `docs/private-token/README.md`, `apps/console/lib/nav/console-nav.ts`, `apps/console/components/{hybrid-cards,remittances,wallets}`, `supabase/functions/**`, `contracts/contracts/**`, `scripts/seed-nuek-demo.py`.
- Nuek: remittances/cards brief and demo artifacts (internal transcripts, Aug 2026); `private-wallet/lib/brand.ts`.
- Justoken: justoken.com, YPF Luz / Enertoken press release (Mar 2026), Newtopia portfolio page, LinkedIn company page.
