# Notion Ops

The day-to-day working surface lives in Notion. This file is the reference that connects the repo (voice + prompts) to the live databases, and documents the cadence and the LinkedIn monitoring workflow.

## Live Notion links

- **Ryle Content Ops** (parent page): https://www.notion.so/37236e1bc77a81cca809e68062d436b6
- **Content** (the pipeline DB): https://www.notion.so/e91660d3121b41d2b5455a3da6ca2f17
- **People & Accounts** (clients / voices / engagement targets): https://www.notion.so/c7189c045da94c3e9fc4fea6436b5fcf

## Content DB

One row per post or draft. Properties:

- **Title** — short internal label.
- **Category** — Thesis / Use-case / Founder note / Market commentary / Product education.
- **Source** — Granola meeting / Docs / Own note / News reaction.
- **Status** — Idea → Draft → Approved → Scheduled → Posted (nothing reaches Approved without your sign-off).
- **Channel** — LinkedIn (Other reserved for later).
- **Raw insight** — the anonymized seed.
- **Angle** — the one-line claim.
- **Draft** — the post text.
- **Post date** — when it goes out.
- **Related person** — relation to People & Accounts (e.g. the meeting source or an engagement target).
- **Outcome** — "Did this start a relevant conversation with a target persona?" The metric that matters.
- **Learning** — what to repeat or stop.

Views: **Pipeline** (board grouped by Status), **Calendar** (by Post date), and the default table. Seeded with three example rows — replace or delete once you have real content.

## People & Accounts DB

One row per potential client or relevant voice. Properties: Name, Org, Persona, Relationship stage, LinkedIn URL, Source, Dossier notes, Last touch, Next action. View: **By persona** (board) plus the default table. Seeded with three example personas — replace with real targets.

This DB does double duty: client intelligence (store dossier output here) and your LinkedIn monitoring target list.

## Granola MCP (Cursor)

Granola is configured in your global Cursor MCP config (`~/.cursor/mcp.json`) at `https://mcp.granola.ai/mcp`, same pattern as Notion.

**First-time setup (you do this once):**

1. Restart Cursor (or reload MCP servers in **Settings → Tools & MCP**).
2. Find **granola** in the MCP list — it should prompt for OAuth. Sign in with the **same email** as Granola app → Settings.
3. Confirm: ask in chat, *"Which Granola account am I signed in with?"*

**Plan limits:** Free = last 30 days of notes only, no transcripts. Business+ = full history + `get_meeting_transcript`. Enterprise may need an admin to enable MCP in the workspace.

**Chained workflow (Granola + Notion MCP in one chat):**

After a meeting, paste or say:

> List my meetings from the last 3 days. For [meeting title], get the transcript (or notes). Run `content-ops/prompts/meeting-to-content.md` with `content-ops/messaging-spine.md`. Show drafts only — do not file in Notion until I approve. After I approve, create rows in the Notion Content database as Status = Draft, Source = Granola meeting.

You still approve every draft before it lands in Notion or LinkedIn.

## Cadence

- **After each meeting:** use Granola MCP to pull the transcript (or notes), run `prompts/meeting-to-content.md`, then file approved drafts in Content (`Status = Draft`, `Source = Granola meeting`, anonymized Raw insight). Put follow-up questions on the relevant People row. Keep INTERNAL-ONLY learnings out of Notion.
- **Daily (~20 min):** the LinkedIn engagement loop (below).
- **Friday (~20 min):** run `prompts/weekly-review.md` over the week's Content rows + engagement, set next week's thesis post and plan.

## LinkedIn monitoring workflow (manual + Sales Navigator)

LinkedIn has no real monitoring API, so this is deliberate and manual — which is also what keeps it on-voice.

1. **Build target lists in Sales Navigator** for each persona (stablecoin issuers, banks/FIs, RWA/tokenization, treasuries, payments, infra, VCs). Enable alerts (posts, job changes, company news). Sales Nav is both your monitoring tool and your client-intelligence source.
2. **Maintain a ~20-30 person "must-engage" set** — mirror them into the People & Accounts DB and turn on LinkedIn post notifications for them.
3. **Daily scan:** review alerts/feed, pick 3-5 posts worth engaging, log them against the relevant People row, run `prompts/engagement.md` for comment angles, then write each comment in your own words and post it.
4. **Before meetings:** run `prompts/dossier.md` on the account and save the brief to its People row.

## Guardrails

- Nothing publishes automatically. Approved is a human decision.
- No links or pitches in comments.
- Raw transcripts and client identities never leave the anonymization step in `meeting-to-content`.
