# Messaging Spine

The single source of truth for Ryle's content voice and arguments. Every prompt in `content-ops/prompts/` references this file. When the product positioning changes, update this file first — everything downstream inherits from it.

Derived from the live docs: `docs/what-are-confidential-digital-assets.mdx`, `docs/problems/*`, `docs/concepts/selective-disclosure.mdx`, `docs/compliance/*`.

---

## One-line category

Ryle is **confidential digital asset infrastructure**: the platform companies use to issue, manage, and operate onchain assets whose balances and transactions stay private while remaining verifiable.

Ryle is a technology provider, not a custodian. It never holds or controls assets, reserves, or wallet keys.

## The operating principle (say this often, in these words)

**Confidential by default, visible by choice, auditable always.**

This is the spine of the spine. Most posts are a restatement of one of its three clauses:
- *Confidential by default* — privacy is the starting state, not an add-on.
- *Visible by choice* — disclosure is a deliberate, scoped, logged choice.
- *Auditable always* — confidentiality never means unaccountable.

---

## The core arguments (the recurring drum)

These are the points worth repeating for years. Most content is one of these, applied to a new situation.

1. **Public chains expose business activity by default.** Every balance and transfer is in plaintext on a permanent, world-readable ledger. Anyone with a block explorer can trace treasury size, counterparties, and history.
2. **Pseudonymity is not privacy.** Chain-analysis clusters addresses and links them to real entities. Address rotation is fragile and gets re-linked. The problem has to be solved at the protocol level.
3. **Enterprises don't reject blockchain because they hate transparency.** They reject it because full transparency breaks commercial confidentiality — payroll, vendor terms, treasury size, customer flows.
4. **Full transparency over-shares; full anonymity fails compliance.** Privacy coins can't prove specific activity to a regulator on demand. The usable middle is selective disclosure.
5. **Confidentiality and compliance are not opposites.** Private by default, provable when required. Disclosures are scoped, time-bounded, and recorded in an audit log.
6. **The enterprise question is never "how fast does it settle."** It is "who can see what." Settlement speed is table stakes; controllable visibility is the unlock.
7. **Programmability without confidentiality is incomplete.** Enterprises want programmable assets. They do not want public business activity. You need both.

---

## Differentiation (what we are NOT)

- **vs public/transparent tokens (ERC-20):** they publish every balance and transfer in plaintext. We encrypt amounts and parties while keeping transactions verifiable.
- **vs privacy coins:** they aim for blanket anonymity and can't satisfy an auditor. We target regulated businesses: private by default, but controllable, auditable, disclosable by policy.
- **vs private/permissioned chains:** they wall off into a separate network and lose public-chain reach. We keep public-chain settlement and add confidentiality on top.
- **vs DIY / permissioned standards (e.g. ERC-3643):** we are managed infrastructure — teams work in business concepts (assets, accounts, policies, disclosures) instead of cryptography.

---

## Selective disclosure (the proof that confidential != hidden)

The ability to reveal specific onchain activity to a chosen party — auditor, regulator, counterparty — without making it public. Scoped, time-bounded, and logged. Examples:
- A stablecoin issuer proves reserves and supply to an auditor without revealing individual holder balances.
- A treasury team proves a single inter-entity transfer to a regulator without exposing the rest of the ledger.
- A B2B payer shares proof of one settlement with a counterparty while keeping all other vendor relationships private.

---

## What Ryle enables and how it works (the technical surface)

This is the material to lead with: what Ryle enables, framed as capability and commercial outcome — not implementation. Keep it concept-level.

- **Confidential assets on public chains.** Balances and amounts are encrypted, but transactions stay verifiable — supply adds up, nothing can be double-spent — without exposing who holds what or how much. Works on public chains today.
- **The hard cryptography is handled for you.** It runs on zero-knowledge proofs underneath, but teams work in familiar terms — assets, accounts, policies, disclosures — through simple APIs. No cryptography expertise required to ship.
- **Three ways to use it:** APIs to build it into your stack, a Console to run issuance/payments/accounts/disclosure, and a white-label Vault to put confidential wallets and transfers under your own brand.
- **Confidential operations:** issue, transfer, and redeem assets privately by default — no sensitive trail left on the public ledger.
- **Flexible integration, you keep control:** run a confidential asset whether you control it directly (you keep your own custody, Ryle connects to it — never custodial), mirror one you don't control, or lock and represent an existing asset. Pick what fits.
- **Selective disclosure on your terms:** prove total supply without revealing individual holders, prove a single transfer without opening the whole ledger, share exactly what an auditor or counterparty needs — scoped, time-bounded, and logged.
- **Non-custodial by design:** Ryle never holds your assets, reserves, or keys.

---

## Audience personas (who we are talking to)

We are writing for executives at companies already operating on-chain. They understand blockchain concepts and the business of it — they don't need convincing that it works, and they don't need protocol internals. They need to understand what confidential assets let them do, why it matters commercially, and how Ryle gets them there safely and fast.

Primary (decision-makers at on-chain companies):
- **Stablecoin issuer leadership** — founders/CEOs/heads of product weighing how to issue and operate without exposing balances, flows, and reserves.
- **Tokenization / RWA platform execs** — leaders who need confidential issuance and selective disclosure as a product capability, not a research project.
- **Blockchain & infra company founders** — execs who understand custody, trust, and integration at a concept level and care about what stays non-custodial.
- **Heads of product / strategy** at the above — translating blockchain capability into commercial outcomes.

Secondary (write so they still follow, but not the primary reader):
- **Crypto/fintech VCs** — category framing and why this is the next infrastructure layer.
- **Regulated FIs / treasuries** — when a thread touches compliance, reserves, or disclosure.

## Use-case surface (concrete hooks)

Treasury, stablecoins, supplier payments, B2B settlement, AI agents (policy-bound wallets), tokenization platforms. Each maps to a docs page under `docs/use-cases/`.

---

## Voice

Ryle's founder voice is written peer-to-peer for executives at blockchain companies — founders, CEOs, heads of product and strategy. They understand blockchain concepts (tokens, custody, stablecoins, tokenization, on-chain settlement) and they understand finance and product. They are not engineers. Talk about the technology and what it enables at the level of capability and commercial outcome — not implementation internals. Assume the concepts; skip the protocol jargon.

- **Peer-to-peer with operators** — talk to founders and execs at blockchain/stablecoin/tokenization companies as an equal: not down to a newcomer, not into the weeds with an engineer.
- **Conceptually fluent, not jargon-heavy** — comfortable with blockchain and finance concepts; never reaches for deep protocol terms (relayers, circuits, proving systems) to sound smart.
- **Sharp** — one clear point per post, stated plainly.
- **Founder-led** — first person, opinionated, grounded in what we're building and the conversations we're having.
- **Capability- and outcome-forward** — lead with what teams can do (issue, operate, integrate, disclose) and why it matters commercially, not with how the cryptography works.
- **Slightly provocative** — willing to make a pointed claim, never hype.

Structural habits:
- Lead with the capability or the claim, not the windup.
- Get specific fast, but at concept level: encrypted balances, selective disclosure, custody you keep — not implementation detail.
- Contrast structure still works: "X is solved. Y is where the hard part actually is."
- End on the point, not a call-to-action or emoji.
- One idea per post. If there are two ideas, that's two posts.

## Banned words and moves

Never use:
- "revolutionizing", "the future of finance", "game-changer", "disrupt", "next-gen", "paradigm shift"
- "unlock the power of", "seamlessly", "cutting-edge", "leverage" (as a verb)
- hype adjectives stacked together ("powerful, scalable, secure...")
- emoji-as-bullets, hashtag spam, "gm", "wagmi", "ser", crypto-native in-group slang
- vague grandiosity with no concrete enterprise referent

Avoid:
- 101 explanations (what a blockchain is, why public ledgers are transparent, why privacy matters) — the reader already knows
- deep protocol jargon (relayers, circuits, proving systems, opcodes) — the reader is an exec, not an engineer; talk concepts and outcomes
- vague hand-waving where a concrete capability is more credible ("we make it private" → say what: encrypted balances, selective disclosure, non-custodial)
- hedging the main claim into mush
- threads that could have been one post
- "we" announcements with no insight ("excited to share...")

Note: the reader understands blockchain and finance but isn't writing code. Be concept-fluent and specific about capability — never reach for implementation jargon to sound smart, and never use "gm/wagmi/ser" slang or hype.

## Litmus test

Before anything ships, it must pass:
1. Would this start a relevant conversation with a founder/exec at a stablecoin, tokenization, or blockchain company? (If not, cut it.)
2. Does it respect that the reader knows blockchain concepts but isn't an engineer? (No 101, no deep jargon.)
3. Is there exactly one clear point, and is it specific about capability and outcome?
4. Could a competitor have posted the identical thing? (If yes, it's too generic — sharpen with a real capability or a real conversation.)
5. Does it sound like a founder talking to a peer, or like a brand account?
