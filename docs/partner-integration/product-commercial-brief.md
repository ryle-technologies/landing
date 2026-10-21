# Ryle.sh — Product & Commercial Brief

**Confidential digital asset infrastructure for regulated business on public chains.**

*Audience: product, commercial, partnerships, and executive stakeholders. Companion to the Partner Integration Technical Brief.*

---

## 1. What Ryle is

Ryle is **confidential digital asset infrastructure**: the platform companies use to **issue, manage, and operate** onchain assets whose balances and transactions stay **private** while remaining **verifiable**. Partners work in business terms — assets, accounts, policies, mints, redemptions, disclosures — not in zero-knowledge proofs or chain plumbing. Operators run programs from a **Console**, engineers integrate through **APIs and webhooks**, and end users can interact through an optional **white-label wallet**.

Ryle is a **technology provider, not a custodian**: it never holds assets, reserves, or wallet keys. Partners connect the custody and identity they already use; Ryle binds those to the asset program and manages confidentiality, policy, audit, and operations on top. Settlement stays on **public, EVM-compatible chains** (Ethereum, Polygon, Base, and others) — privacy comes from **what is visible on the ledger**, not from a walled-off private network.

| Commercial shape | In plain language |
| --- | --- |
| **New confidential asset** | Launch a net-new token with encrypted balances from day one. |
| **Confidential layer on your asset** | Add privacy to something you already issue (stablecoin, fund token). |
| **Confidentiality on a third-party asset** | Offer private settlement on an asset you support but don't issue. |

---

## 2. The problem we solve

Public blockchains are built for **radical transparency**: every balance and transfer is permanent and world-readable. A strength for open networks; a **liability for business**. With a normal onchain token, competitors and the public can infer:

- **Treasury size and movement** — runway, revenue timing, distress.
- **Counterparty relationships** — suppliers, customers, payroll, partners.
- **Competitive intelligence** — payment cadence and new relationships before they're announced.
- **Holder surveillance** — for stablecoins and tokenized products, every balance and payment is trackable.

Pseudonymity is not privacy: chain analysis routinely links addresses to entities and reconstructs full transaction graphs. Enterprises **cannot** publish this activity — yet still want **programmable settlement, public-chain reach, and auditability**. Ryle closes that gap: **public-chain settlement without public financial exposure.**

---

## 3. What Ryle does well

**Confidentiality businesses can use.** Balances, amounts, and counterparties are **encrypted onchain**. The network still verifies every transfer is valid (no double-spends, supply conserved) via **zero-knowledge proofs**, without revealing who paid whom or how much. Visibility is a deliberate choice.

**Compliance without going fully public** — built on *confidential by default, visible by policy, auditable always*:

- **Selective disclosure** — scoped, time-bounded, logged views for auditors, regulators, counterparties.
- **Immutable audit log** — every privileged action attributed and exportable.
- **Policy & KYC** — who may hold or transact, caps, pauses, allowlists.
- **Proof of reserves** — prove backing and supply without exposing holder balances.

**Speed to market.** Going live feels closer to **integrating a payments processor** than building a blockchain product; most teams reach a working sandbox integration in **days, not weeks**. Cryptography, proof generation, gas sponsorship, and network coordination stay on **Ryle's side**. Console actions, API calls, and webhook events share one **audit trail and resource model**, and partners keep the **liquidity, interoperability, and neutrality** of public EVM chains.

| Capability | Value |
| --- | --- |
| **Issuance** | Launch, mint, redeem, supply and reserve reconciliation. |
| **Confidential payments** | Private transfers between accounts with policy limits. |
| **Accounts & wallets** | Participant identities, embedded end-user wallets, no seed-phrase UX. |
| **Compliance & disclosure** | Disclosures, audit export, reserve proof, KYC hooks. |

A few common questions: each transaction carries a **ZK proof** of validity (the network verifies without seeing amounts); auditors can always be granted a **scoped, logged disclosure**; end users **don't manage gas** (Ryle's relayer sponsors fees under policy); **embedded wallets** are provisioned per user, with keys held by the wallet provider — not Ryle or the partner; and reserves live with the partner's **custody connection**, which Ryle reconciles against confidential supply but does not hold.

---

## 4. Who we serve

| Segment | Why Ryle matters |
| --- | --- |
| **Stablecoin issuers** | Holder balances and B2B payments stay private; reserves still provable to supervisors. |
| **Banks & payment companies** | Customer flows without public ledger exposure; disclosure on inquiry. |
| **Corporate treasuries** | Inter-entity moves and reserves onchain without broadcasting structure or size. |
| **Tokenization platforms** | Cap tables, holder lists, redemptions private; supply and backing still auditable. |
| **Marketplaces & B2B / consortium operators** | Settlement rails where participant economics aren't a free intelligence feed. |
| **AI agent & automation products** | Policy-bound wallets and transfers without exposing strategy onchain. |

**Buying signal:** the organization wants **onchain settlement** but is blocked because **transparency is unacceptable** — legally, competitively, or commercially — and it needs **auditability and regulatory answers, not anonymity.**

---

## 5. Product surfaces & use cases

All three surfaces share the same data model and audit log. **Sandbox and live** are identical in capability with isolated keys and data; promotion follows a guided checklist (KYB, team, reserves, webhooks).

| Surface | Who uses it | Role |
| --- | --- | --- |
| **Console** | Ops, treasury, compliance, leadership | Day-to-day control: assets, mint/redeem, policies, disclosures, permissions, export. No engineering for core ops. |
| **APIs & webhooks** | Engineering | Embed issuance, payments, and compliance into existing products; async outcomes via signed webhooks. |
| **White-label wallet** (optional) | End customers | Branded in-app holds and transfers; configured from Console. |

| Use case | Outcome Ryle enables |
| --- | --- |
| **Confidential stablecoins** | Private holder activity; provable reserves and supply |
| **Treasury** | No public reserve or flow exposure; internal audit trail |
| **Supplier payments** | Confidential transfers with policy controls |
| **B2B settlement** | Private per-flow settlement; reconcilable network health |
| **Tokenization platforms** | Private cap table and redemptions; disclosable to regulators |
| **AI agents** | Policy-bound activity without strategic leakage |

---

## 6. Compliance: private by default, visible by policy

Privacy and compliance are not opposites for confidential digital assets — they fail to coexist only under **blanket anonymity** (privacy coins) or **full transparency** (standard tokens). End-user **balances** and **transaction graphs** are never returned to any API caller; **aggregate health** (supply, reserves, bucketed counts) is available for operations and proof; **disclosure access is itself logged**.

| Obligation | How Ryle supports it |
| --- | --- |
| Audit of supply, reserves, balances (aggregate) | Selective disclosure + reconciliation |
| Inquiry into specific activity | Scoped disclosure of relevant accounts/transactions |
| Recordkeeping and supervision | Immutable, attributed, exportable audit log |
| KYC / AML participation control | Per-asset policy and configurable KYC providers |
| Reserve / backing reporting | Proof of reserves without holder exposure |

Framework mapping (MiCA, FATF Travel Rule, AML/KYC, data protection) is documented for compliance teams. Operator roles (Owner, Admin, Operator, Compliance, Auditor, Viewer) scope who can act vs review, consistently across Console and API. **Ryle does not provide legal advice** — issuers and counsel determine jurisdictional fit.

---

## 7. How we compare

| vs | Their model | Ryle |
| --- | --- | --- |
| **Transparent tokens (ERC-20)** | Balances, amounts, counterparties public forever | Encrypted values; selective disclosure |
| **Privacy coins** | Blanket anonymity, no issuer control | Private by default, provable on demand; policy, audit, KYC |
| **Private / permissioned chains** | Privacy via closed membership; limited liquidity | Encrypted state on public chains; full EVM reach, managed |
| **DIY confidential contracts** | Specialist team, long build; you own crypto + compliance | Days in sandbox; disclosure, audit, policy included |
| **Permissioned standards (e.g. ERC-3643)** | Control *who* may hold; balances still public | Adds *value* confidentiality + disclosure — often complementary |

---

## 8. What you bring vs what Ryle provides

| Partner typically provides | Ryle provides |
| --- | --- |
| Business model, brand, customer relationships | Confidential asset infrastructure (Console, API, optional wallet) |
| Legal/regulatory program and counsel | Confidentiality, disclosure, audit, policy, reconciliation primitives |
| Custody connection for reserves/treasury | Binding asset to custody; mint/redeem reconciliation — **not** holding keys |
| KYC/AML program (or provider choice) | Per-asset KYC configuration and gating |
| Identity (Google OAuth default; IdP federation available) | Bridge to embedded per-user wallets |
| Webhook endpoints and product integration | Signed events, retries, delivery logs, schemas |
| — | **Hosted sandbox and live** — cloud, ops, and platform updates included in the platform fee; partners do not provision or pay separate Ryle infrastructure |

**Non-goals for partner teams:** building ZK circuits, managing seed phrases, selecting RPCs in app code, sponsoring gas in product, or acting as custodian through Ryle.

---

## 9. What working with Ryle looks like

1. **Discover** — align on use case, regulatory posture, and asset shape (new / layer / third-party).
2. **Sandbox** — provision keys, configure one asset and webhooks, exercise mint / redeem / transfer / disclosure.
3. **Operational readiness** — team roles, custody binding, KYC policy, reserve reconciliation, webhook hardening.
4. **Live promotion** — guided checklist: KYB, signers, reserves, production endpoints.
5. **Scale** — optional white-label wallet, additional assets, expanded policies and disclosures.

Stakeholders typically involved: **Product** (journeys, policy rules), **Commercial** (pricing, SLAs, positioning), **Compliance / Legal** (disclosure, KYC, jurisdiction), **Treasury / Ops** (mint/redeem, reconciliation), and **Engineering** (API + webhook integration).

---

## 10. Support & services

Platform subscription includes **standard support**. Partners who need a response SLA and reserved engineering capacity can add a **Priority retainer**. Beyond the platform, optional **Services** cover a **Forward Deployed Engineer** (can be sent **onsite anywhere in the world**) and **Custom Software Services** for scoped builds, available on demand or via prepaid hour packs.

| Tier | What you get | Commercial shape |
| --- | --- | --- |
| **Standard** (included) | Docs and onboarding path; shared support channel during business hours; platform bug fixes and product updates; sandbox help through live promotion | Included in monthly platform fee |
| **Priority** (optional) | Corrective and preventative L3-style coverage; response SLA of **8 business hours**; up to **40 hours/mo** technical dedication at **USD 70/hr**; named technical contact | **USD 2.800/mo** (40h × USD 70) · minimum 3 months (aligns with contract term) |
| **Forward Deployed Engineer** | A Ryle engineer who can be sent **onsite anywhere in the world** for discovery, integration, go-live, and evolutives | **USD 120/hr** · prepaid packs: 40h (−10%), 100h (−15%) |
| **Custom Software Services** | Scoped builds beyond standard platform surfaces: custom integrations, branded UX and workflow extensions, data/ops/migration tooling | **USD 120/hr** or scoped quote · prepaid packs available |

Standard support is enough for day-to-day Console and API operations. Priority reserves availability after go-live; Services (FDE or custom software) are pulled when you need capacity in the build — none are required to use the platform.

> **Elevator pitch:** Ryle lets regulated businesses use public blockchains without exposing their financial activity. We provide the infrastructure to issue and operate confidential digital assets — private balances and payments, provable reserves, and disclosures to auditors on demand — through a Console and APIs, while partners keep their brand, custody, and compliance program.

---

*Ryle is confidential digital asset infrastructure. We are not a custodian, bank, or law firm. Product configuration and legal fit are determined by the issuer and its advisors. Companion: Partner Integration Technical Brief · [Ryle documentation](https://docs.ryle.sh).*
