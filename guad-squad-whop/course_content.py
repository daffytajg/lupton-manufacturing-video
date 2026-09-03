"""Course content for "How to Start With AI Agents" (Guad Squad).

Edit the text here and re-run whop_setup.py. The script matches chapters and
lessons by title, so renaming a title creates a new one instead of updating.
"""

SITE = "https://guadsquadai.com"

PRODUCT = {
    "route": "start-with-agents",
    "title": "How to Start With AI Agents",
    "headline": "Ship your first working AI agent in 30 days. No engineering team required.",
    "description": (
        "A practical, no-fluff starter course from Guad Squad for business owners, "
        "operators, and sales people who want AI agents doing real work for them.\n\n"
        "What you get:\n"
        "- 5 modules, 15 lessons, written to be finished in a weekend and applied in a month\n"
        "- A step-by-step build of your first agent (an inbox triage agent), with both a no-code path and a code path\n"
        "- Templates: agent job description, test set, weekly review checklist, 30-day plan\n"
        "- The five agents worth building next, ranked by payoff\n"
        "- Access to the Guad Squad community forum\n\n"
        "Finish the course and you will know exactly which agent to build, how to build it safely, "
        "and how to measure whether it is paying for itself."
    ),
    "custom_cta": "get_access",
    "plan": {
        "title": "Lifetime access",
        "description": "One-time payment. Lifetime access to the course, all future updates, and the Guad Squad community.",
        "price_usd": 47.00,
        "custom_fields": [
            {
                "field_type": "text",
                "name": "What is the #1 task you want an AI agent to take off your plate?",
                "placeholder": "e.g. following up with leads, sorting my inbox, drafting proposals",
                "required": True,
                "order": 1,
            },
            {
                "field_type": "text",
                "name": "Company or website (optional)",
                "placeholder": "acme.com",
                "required": False,
                "order": 2,
            },
        ],
    },
}

EXPERIENCE_NAME = "Start With Agents Course"

COURSE = {
    "title": "How to Start With AI Agents",
    "tagline": "From zero to a working agent in 30 days",
    "require_completing_lessons_in_order": False,
    "certificate_after_completion_enabled": True,
}

CHAPTERS = [
    {
        "title": "Module 1: Start Here",
        "lessons": [
            {
                "title": "Welcome and how to use this course",
                "content": """# Welcome

You are here because you want AI agents doing real work in your business, and you are tired of demos that never turn into anything.

This course is built by [Guad Squad]({site}), an AI automation agency. We build agents for companies every week. Everything in here is what we actually do with clients, stripped down so you can do it yourself.

## What you will have at the end

- A clear definition of what an agent is and is not, so you stop buying the wrong things
- Your first working agent (we build an inbox triage agent together in Module 3)
- A test set and a weekly review habit so the agent stays useful after launch
- A ranked list of the next five agents worth building
- A 30-day plan you can start on Monday

## How to use it

1. Read Modules 1 and 2 in one sitting. They are short and they set the vocabulary.
2. Block two hours for Module 3 and actually build the agent. Reading it does nothing.
3. Come back to Modules 4 and 5 after your first agent has run for a week.

Every lesson ends with a **Do this now** box. Do it before moving on.

## A promise and a warning

The promise: you do not need to code. There is a no-code path for every step.

The warning: agents are not magic. The ones that work are boring, narrow, and well supervised. If you want fireworks, this is the wrong course. If you want something that runs at 6am and saves you an hour a day, keep going.

> **Do this now:** Write down one task you do every day that involves reading text and making a small decision. Keep it handy. That is probably your first agent.
""",
            },
            {
                "title": "What an AI agent actually is",
                "content": """# What an AI agent actually is

The word "agent" is used for everything right now. Here is the definition we use with clients.

**An agent is a language model that runs in a loop: it has a goal, it can use tools, and it decides what to do next based on what it sees.**

That is it. Three parts:

| Part | What it means | Example |
|---|---|---|
| Goal | A job description in plain language | "Sort new emails by whether they need a reply today." |
| Tools | Things it can do besides write text | Read inbox, label an email, look up a customer in the CRM |
| Loop | It looks at the result of each action and picks the next one | Reads email, checks CRM, decides label, moves on |

## What an agent is not

- **A chatbot.** A chatbot answers when you type. An agent works when something happens (a new email, a form submission, 6am).
- **An automation.** Zapier and n8n flows follow a fixed path. An agent decides the path. The best setups use both: automation for the plumbing, an agent for the judgment calls.
- **A replacement for a process you do not have.** If you cannot write down how you do the task, an agent cannot do it either. Fix the process first.

## The mental model that keeps you out of trouble

Treat an agent like a **new remote hire on their first week**:

- Give them one job, written down
- Give them access to only what that job needs
- Check their work daily at first, then weekly
- Expect them to be fast and mostly right, not perfect

Every mistake we see people make comes from treating the agent like either a genius or a toy. It is neither. It is a capable junior employee that never sleeps and never learns unless you update its instructions.

> **Do this now:** Take the task from Lesson 1. Fill in the three parts: What is the goal? What tools would a human need? What decision gets made on each item?
""",
            },
            {
                "title": "Your starter toolkit and what it costs",
                "content": """# Your starter toolkit

You need four things. All of them have free or cheap tiers. Set them up now so Module 3 is just building.

## 1. A language model

This is the brain. We recommend **Claude** (claude.ai and the Anthropic API) for business tasks because it follows long instructions well and is careful with actions. ChatGPT or Gemini also work.

- Get a paid consumer plan (about $20/month) for testing prompts by hand
- Get an API key from the provider's console for the agent itself. Add $10 of credit. A well-built agent on a small task costs pennies per run.

## 2. An automation tool (the no-code path)

This is the plumbing that triggers the agent and connects it to your apps.

- **n8n** (self-hosted free, or cloud from about $20/month). Our default. Has native AI agent nodes.
- **Make** or **Zapier** work too if you already use them.

## 3. A place to keep data

Agents need somewhere to read from and write to.

- **Google Sheets** or **Airtable** for logs, test sets, and simple records
- Your existing CRM if it has an API or a Zapier/n8n connector

## 4. A scratch folder

One folder (Google Drive, Notion, or a local folder) that holds:

- `agent-job-description.md` (you will write this in Module 3)
- `test-set.csv`
- `weekly-review.md`

## What it costs to run

For a typical first agent (a few hundred items a day, short text):

| Item | Monthly |
|---|---|
| Model API usage | $5 to $30 |
| Automation tool | $0 to $25 |
| Data storage | $0 |
| **Total** | **Under $60** |

If someone quotes you thousands a month to *run* a simple agent, they are charging for something else.

## The code path (optional)

If you or someone on your team writes code, the Anthropic **Claude Agent SDK** lets you build the same thing in Python or TypeScript with tools and permissions built in. Module 3 includes a short code example. You do not need it to finish the course.

> **Do this now:** Create the API key, the automation account, and the scratch folder. Put the three empty files in the folder.
""",
            },
        ],
    },
    {
        "title": "Module 2: Foundations",
        "lessons": [
            {
                "title": "Instructions: the job description is the product",
                "content": """# Instructions: the job description is the product

Ninety percent of the quality of an agent comes from its instructions. Not the model, not the tool, not the framework. The instructions.

## The three layers

1. **System prompt.** Who the agent is, what job it has, what it must never do. Written once, changed rarely.
2. **Task input.** The thing it is working on right now (the email, the form, the record).
3. **Reference material.** Your pricing sheet, your FAQ, your tone examples. Attached or retrieved as needed.

Keep them separate. When something goes wrong you want to know which layer to fix.

## The job description template

Copy this into `agent-job-description.md` and fill it in. It becomes your system prompt.

```
ROLE
You are the [job title] for [company]. Your only job is [one sentence].

INPUT
You will receive [what exactly]. 

OUTPUT
Respond with [exact format: JSON fields, a label, a draft, etc.].

RULES
- Always ...
- Never ...
- If you are not at least [80]% sure, output "NEEDS_HUMAN" and say why.

EXAMPLES
Input: ...
Output: ...
(give 3 to 5 real examples, including one edge case)
```

## Rules that always belong in there

- **A way to say "I don't know."** The single biggest quality improvement. An agent that escalates is trustworthy. An agent that guesses is a liability.
- **An exact output format.** Free text is hard to plug into the next step. Ask for a label, a JSON object, or a fixed template.
- **What it must never do.** Never send money, never delete, never promise a delivery date, never quote a price that is not on the sheet.

## Write it like an SOP, not a wish

Bad: "Be helpful and sort my emails intelligently."

Good: "Label each email URGENT if it is from a customer with an open order and mentions a delay, damage, or cancellation. Label REPLY if it asks a direct question. Label FYI for everything else. Output only the label."

The second one can be tested. The first one cannot.

> **Do this now:** Draft the ROLE, INPUT, and OUTPUT sections for your task. Leave RULES and EXAMPLES for Module 3.
""",
            },
            {
                "title": "Tools: how agents take action",
                "content": """# Tools: how agents take action

A model on its own can only produce text. Tools are how it reads your inbox, updates your CRM, or checks a price. This lesson is about which tools to give it and how.

## How a tool works

1. You describe the tool to the model: name, what it does, what inputs it takes.
2. The model, mid-task, says "call `lookup_customer` with `email=jane@acme.com`".
3. Your automation runs that call and hands the result back.
4. The model keeps going with the new information.

The model never touches your systems directly. Your automation does, and it only exposes what you allow.

## Three ways to give an agent tools

| Approach | Where you see it | Good for |
|---|---|---|
| Built-in connectors | n8n AI Agent node, Zapier AI, Make | Fastest start, no code |
| Function calling / tool use | Anthropic API, Claude Agent SDK | Custom tools, full control |
| MCP servers | Claude Desktop, Claude Code, many apps | Reusable, shareable tool packs (Gmail, Notion, HubSpot, and hundreds more) |

MCP (Model Context Protocol) is worth knowing about. It is an open standard: a company publishes an "MCP server" for their product and any agent that speaks MCP can use it. Most major SaaS tools now have one.

## Tool design rules

- **Fewer tools, better described.** Three well-named tools beat fifteen vague ones. The model picks tools by reading their descriptions.
- **Read tools first, write tools later.** Start your agent read-only. Let it *recommend* labels or drafts for a week. Then let it act.
- **Separate dangerous actions.** "Draft reply" and "send reply" should be different tools. You can allow one and not the other.
- **Return useful errors.** If a lookup fails, tell the model why ("no customer with that email"). It will handle it. A blank result makes it guess.

## What your first agent needs

For the inbox triage agent in Module 3:

- `get_new_emails` (read)
- `lookup_customer` (read, hits your CRM or a sheet)
- `apply_label` (write, low risk)
- `create_draft` (write, low risk because nothing is sent)

Notice there is no `send_email`. That stays with you until you trust it.

> **Do this now:** List the tools your task needs. Mark each one read or write. Cross out any write tool that could cost money or embarrass you if wrong. Those come later.
""",
            },
            {
                "title": "Memory and context: what the agent knows",
                "content": """# Memory and context: what the agent knows

People are surprised by two things: how much an agent can take in at once, and how completely it forgets between runs. Plan for both.

## The context window

Everything the model can "see" on one run is its context: the system prompt, the task input, tool results, and reference material. Modern models hold hundreds of pages. That is plenty for almost any business task, as long as you are deliberate about what goes in.

Rules of thumb:

- Put the **most important instructions at the top** of the system prompt.
- Attach **only the reference material the task needs**. A 200-page manual for a 2-line question dilutes attention and costs money.
- If a task needs a lot of reference material, use **retrieval**: store documents somewhere searchable and give the agent a `search_docs` tool. It pulls what it needs.

## Nothing persists unless you make it

Each run starts blank. The agent does not remember yesterday's emails or the customer it looked up an hour ago. This is a feature: no drift, no surprises.

When you *do* need memory, store it yourself:

| Need | Store it in |
|---|---|
| "We already replied to this thread" | A column in your log sheet the agent checks first |
| Customer preferences | Your CRM, fetched with a lookup tool |
| Past decisions the agent made | A log the agent can search |
| Corrections you have made | The EXAMPLES section of the job description |

That last one is the real "learning" mechanism. When the agent gets something wrong, you add the case to the examples. Next run it gets it right. The agent does not learn; your instructions do.

## Keep a log from day one

Every run, write a row: timestamp, input summary, decision, confidence, tool calls made. This is your memory, your audit trail, and your test set for later. A Google Sheet is fine.

> **Do this now:** Decide where your agent's log will live and create it with those five columns.
""",
            },
            {
                "title": "Guardrails: permissions, budgets, and humans in the loop",
                "content": """# Guardrails: permissions, budgets, and humans in the loop

An agent that can act can also act wrong. Guardrails are how you make that boring instead of expensive. Set them up before the first run, not after the first incident.

## 1. Least privilege

Give the agent its own credentials, scoped to only what it needs.

- A dedicated email account or a delegated mailbox, not your personal login
- A CRM API key with read access and write access to only the fields it updates
- No admin, no billing, no delete permissions, ever, for a first agent

If a credential leaks or the agent misbehaves, the blast radius is one mailbox and one label.

## 2. Human in the loop, by tier

Sort actions into three tiers and treat them differently.

| Tier | Examples | Policy |
|---|---|---|
| Green | Label, tag, log, draft | Agent does it, you review weekly |
| Yellow | Send a reply, update a record, create a task for someone | Agent proposes, you approve with one click (daily batch) |
| Red | Refund, quote a price, commit to a date, contact a new prospect | Human only. Agent prepares the brief. |

Start with everything in Green. Promote actions to agent-controlled one at a time, after the log shows they are consistently right.

## 3. The escalation path

Your job description already has "if unsure, output NEEDS_HUMAN". Make sure that path leads somewhere: a label, a Slack channel, a daily digest email. Escalations that nobody reads train you to ignore the agent.

## 4. Budgets and rate limits

- Set a **monthly spend cap** on your model API key. Every provider offers this.
- Set a **max runs per hour** in your automation tool. A loop bug at 2am should cost dollars, not thousands.
- Set a **max steps per run** (10 to 20 tool calls). If the agent has not finished by then, it stops and escalates.

## 5. A kill switch

One toggle that turns the agent off. In n8n it is the workflow's active switch. Know where it is. Tell whoever covers for you where it is.

## 6. Data you should not send

Do not put payment card numbers, passwords, or health records into a prompt unless you have checked your provider's data terms and your own obligations. For most business inboxes this is not an issue, but decide on purpose.

> **Do this now:** Write your three tiers for your task. Put every write action in Yellow or Red for the first two weeks.
""",
            },
        ],
    },
    {
        "title": "Module 3: Build Your First Agent",
        "lessons": [
            {
                "title": "Pick the right first job",
                "content": """# Pick the right first job

The single best predictor of whether your first agent survives is the job you pick. Most failed agent projects picked a job that was too big, too vague, or too risky.

## The scorecard

Rate your candidate task on each line, 1 (no) to 5 (yes):

| Criteria | Why it matters |
|---|---|
| **Repetitive.** Happens 10+ times a week | Enough volume to be worth it and to test with |
| **Text-heavy.** Input and output are mostly words | Models are great at text, weaker at pixels and physical things |
| **Written down.** You could explain the rule to a temp in 15 minutes | If you cannot write the rule, the model cannot follow it |
| **Low stakes per item.** A wrong answer is annoying, not costly | Lets you run it without approval gates |
| **Measurable.** You can tell right from wrong afterwards | You need a score to know if it is working |

Anything scoring 20 or more is a great first agent. Anything under 15 is a second or third agent.

## Jobs that score well

- Triage an inbox or a form queue into a few buckets
- Draft first-reply emails to common questions
- Summarize each call transcript into three bullets and a next step
- Extract fields from PDFs or emails into a sheet (order numbers, dates, amounts)
- Tag and route support tickets
- Turn a long update into a short one for a different audience

## Jobs that score badly as a first agent

- "Handle my sales pipeline" (too big, not written down)
- Anything that sends money or signs a contract (stakes)
- Anything that needs to browse ten websites and reconcile them (long, brittle)
- Anything where you would not accept a 90% accuracy rate on day one

## Our pick for this course: inbox triage

We will build an agent that reads new email, looks the sender up, and labels each message URGENT, REPLY, or FYI, with a draft reply for the REPLY ones. It scores 24 out of 25 for almost every business, and it saves 30 to 60 minutes a day for anyone with a busy inbox.

If your own task scores 20+, build that instead and follow the same steps.

> **Do this now:** Score your task. If it is under 20, pick inbox triage for the course and save yours for Module 4.
""",
            },
            {
                "title": "Write the agent's job description",
                "content": """# Write the agent's job description

This lesson produces the finished system prompt for the inbox triage agent. Copy it, edit the bracketed parts, save it as `agent-job-description.md`.

## The finished job description

```
ROLE
You are the inbox triage assistant for [Company]. Your only job is to
classify each incoming email and, where appropriate, draft a short reply.
You never send anything.

INPUT
You receive one email at a time: sender, subject, body, and a
customer_lookup result (may be empty).

OUTPUT
Return exactly this JSON:
{
  "label": "URGENT" | "REPLY" | "FYI" | "NEEDS_HUMAN",
  "reason": "<one sentence>",
  "draft": "<reply text, or empty string>"
}

LABEL RULES
- URGENT: sender is an existing customer (customer_lookup is not empty)
  AND the email mentions a delay, damage, cancellation, refund, or a
  deadline within 2 business days.
- REPLY: the email asks [Company] a direct question that can be
  answered from the FAQ below, or asks to schedule a call.
- FYI: newsletters, receipts, automated notifications, internal CCs,
  and anything with no question and no problem.
- NEEDS_HUMAN: anything else, or any time you are less than 80% sure.

DRAFT RULES
- Only write a draft for REPLY.
- Under 120 words. Plain, direct, friendly. No "I hope this email finds you well."
- Sign as [Your name], [Company].
- Never quote a price, promise a date, or make a commitment that is not
  in the FAQ below. If the answer is not in the FAQ, label NEEDS_HUMAN.

FAQ
- Hours: [..]
- Pricing page: [..]
- Booking link: [..]
- Shipping / delivery: [..]
- Refund policy: [..]

EXAMPLES
Input: from a known customer, "Our order was supposed to be here Monday and it's Wednesday."
Output: {"label":"URGENT","reason":"Existing customer reporting a delay","draft":""}

Input: from unknown sender, "Do you offer a monthly plan?"
Output: {"label":"REPLY","reason":"Direct pricing question covered by FAQ","draft":"Hi ... yes, we offer monthly plans. You can see the options here: [pricing page]. Happy to jump on a quick call if useful: [booking link]. [Your name], [Company]"}

Input: "Your invoice #4432 has been paid."
Output: {"label":"FYI","reason":"Automated receipt","draft":""}

Input: from unknown sender, "We'd like to place a bulk order of 500 units, what's your best price?"
Output: {"label":"NEEDS_HUMAN","reason":"Pricing request not covered by FAQ, high value","draft":""}
```

## Why it is shaped this way

- **JSON output** so the automation can branch on `label` without parsing prose.
- **NEEDS_HUMAN as a first-class label**, not an afterthought.
- **The FAQ lives inside the prompt** for now. When it grows past a page, move it to a document and give the agent a search tool (Module 2, Lesson 3).
- **Examples include the edge case** (the bulk order) because that is exactly the one that goes wrong.

## Test it by hand first

Before wiring anything up, paste the job description into Claude (or your model of choice) as the first message, then paste five real emails one at a time. If it gets four out of five right, move on. If not, fix the rules, not the examples.

> **Do this now:** Fill in the brackets and the FAQ. Hand-test with five real emails. Note which ones it got wrong.
""",
            },
            {
                "title": "Wire it up (no-code and code paths)",
                "content": """# Wire it up

Two paths. Pick one. Both produce the same agent.

## Path A: no-code with n8n (about 45 minutes)

Build this workflow:

1. **Trigger: Gmail (or Outlook) "On new email."** Poll every 5 minutes. Filter to the inbox, unread only.
2. **Google Sheets: lookup row.** Sheet = your customer list (or CRM node if you have one). Match on sender email. Output goes into a field called `customer_lookup`. Empty is fine.
3. **AI Agent node.**
   - Model: your Claude (Anthropic) credential
   - System message: paste `agent-job-description.md`
   - User message: `Sender: {{sender}} / Subject: {{subject}} / Body: {{body}} / customer_lookup: {{customer_lookup}}`
   - Require JSON output (turn on the structured output option, or add a "Parse JSON" step after)
4. **Switch node on `label`.**
   - URGENT → Gmail "Add label: URGENT" → Slack/Email notification to you
   - REPLY → Gmail "Add label: REPLY" → Gmail "Create draft" with `draft` as body (reply in thread)
   - FYI → Gmail "Add label: FYI" and mark as read
   - NEEDS_HUMAN → Gmail "Add label: NEEDS_HUMAN"
5. **Google Sheets: append row to the log.** Timestamp, sender, subject, label, reason. Every branch feeds this.

Set the workflow's error handling to "continue and log" so one bad email does not stop the queue. Activate it. That is the whole agent.

## Path B: code with the Claude Agent SDK (for developers)

The same agent in about 40 lines of Python. The SDK handles the tool loop, permissions, and retries.

```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
SYSTEM = open("agent-job-description.md").read()

tools = [
    {"name": "lookup_customer", "description": "Look up a customer by email. Returns {} if none.",
     "input_schema": {"type": "object", "properties": {"email": {"type": "string"}}, "required": ["email"]}},
    {"name": "apply_label", "description": "Apply a Gmail label to the current email.",
     "input_schema": {"type": "object", "properties": {"label": {"type": "string"}}, "required": ["label"]}},
    {"name": "create_draft", "description": "Create a reply draft (never sends).",
     "input_schema": {"type": "object", "properties": {"body": {"type": "string"}}, "required": ["body"]}},
]

def run_tool(name, args):
    # wire these to your mail + CRM clients
    ...

def triage(email):
    messages = [{"role": "user", "content": f"Sender: {email['from']}\nSubject: {email['subject']}\n\n{email['body']}"}]
    for _ in range(10):  # max steps guardrail
        r = client.messages.create(model="claude-sonnet-5", max_tokens=1024,
                                   system=SYSTEM, tools=tools, messages=messages)
        messages.append({"role": "assistant", "content": r.content})
        if r.stop_reason != "tool_use":
            return r.content[0].text  # the JSON decision
        results = [{"type": "tool_result", "tool_use_id": b.id, "content": str(run_tool(b.name, b.input))}
                   for b in r.content if b.type == "tool_use"]
        messages.append({"role": "user", "content": results})
    return '{"label":"NEEDS_HUMAN","reason":"step limit","draft":""}'
```

Run it from a cron job or a small server every five minutes. Log every decision to a sheet or a table, same as Path A.

## Either path: first run checklist

- The agent's mail credential is a dedicated or delegated account, not your personal login
- Spend cap set on the API key
- Log sheet receiving rows
- `send_email` does not exist anywhere in the workflow

> **Do this now:** Build it. Run it on your last 20 emails (most tools let you backfill). Look at the log.
""",
            },
            {
                "title": "Test it like a new hire",
                "content": """# Test it like a new hire

You would not let a new hire loose on customers after one good afternoon. Same here. Testing is what turns a demo into an asset, and it takes about an hour.

## Build a test set

Pull **20 real emails** from the last month. Aim for:

- 5 that should be URGENT
- 5 that should be REPLY
- 5 that should be FYI
- 5 that should be NEEDS_HUMAN (weird ones, bulk quotes, angry ones, ones missing information)

Put them in `test-set.csv` with columns: `id, sender, subject, body, expected_label, notes`. The expected label is your answer, decided before you see what the agent says.

## Run and score

Run the agent on all 20. For each one record the agent's label next to your expected label. Score:

- **Exact match** = 1 point
- **Agent said NEEDS_HUMAN when you had a real label** = half a point (it was cautious, not wrong)
- **Agent gave a confident wrong label** = 0 points, and flag it

Target for launch: **16 out of 20 or better, with zero confident-wrong URGENT misses.** Missing an urgent customer email is the one failure that matters.

## Fix in the right order

When it misses:

1. **Is the rule ambiguous?** Most misses are. Rewrite the rule so a temp could apply it.
2. **Is it a genuinely new case?** Add it to EXAMPLES in the job description.
3. **Is the input missing something?** Maybe `customer_lookup` came back empty because the CRM had a different email. Fix the lookup, not the prompt.
4. **Only then** consider a different model or a longer prompt.

Do not fix by adding "be more careful". That sentence has never fixed anything.

## Re-run after every change

Change one thing, re-run all 20, re-score. Keep the scores in a row at the bottom of the sheet with the date. When the score goes down, you know exactly which change did it.

## Read the drafts

For the REPLY set, read every draft. Score each one: would you send this with at most one word changed? You want 4 out of 5. Common fixes: shorter, drop the pleasantries, add the booking link.

> **Do this now:** Build the 20-email test set and score the first run. Do not launch below 16.
""",
            },
            {
                "title": "Ship it and keep it honest",
                "content": """# Ship it and keep it honest

Launching is easy. Keeping the agent useful three months later is where most people fail. This is the operating routine.

## Week 1: shadow mode

The agent labels and drafts, you still do the work as before. Every evening spend five minutes in the log:

- Did anything land in URGENT that was not?
- Did anything urgent land in FYI? (this is the one that matters)
- Would you have sent the drafts?

Correct the job description as you go. Expect to change it three or four times this week.

## Week 2: trust the green tier

Stop re-doing the labels. Work from the agent's buckets. Keep reading every draft before sending. Still check the log nightly.

## Week 3 and on: weekly review

Create `weekly-review.md` and fill it in every Friday. Ten minutes.

```
Week of: ___
Emails processed: ___
Label distribution: URGENT __ / REPLY __ / FYI __ / NEEDS_HUMAN __
Misses I noticed: ___
Drafts sent unchanged: __ of __
Changes made to the job description: ___
NEEDS_HUMAN rate trend: up / flat / down
Cost this week: $___
```

Two signals to watch:

- **NEEDS_HUMAN rate climbing** means your business is changing faster than the instructions. Update the FAQ.
- **NEEDS_HUMAN rate at zero** means the agent has stopped escalating. That is worse. Check the misses.

## Promote actions carefully

After two clean weeks you can move one Yellow action to agent-controlled. A good first one: auto-send the draft for a single narrow category (for example, "booking link requests"). Add the rule, test on the 20, run a week, review. One at a time.

## When it breaks

It will. A tool changes its API, a credential expires, the model provider has a bad hour. Your log will show a gap or a spike of NEEDS_HUMAN. Turn it off, fix it, re-run the test set, turn it on. This is a ten-minute job when you have the log and the test set, and a bad day when you do not.

## Tell your team

Whoever else touches that inbox needs to know: what the labels mean, that drafts are drafts, and where the kill switch is. One paragraph in your team chat is enough.

> **Do this now:** Put the Friday review in your calendar, recurring. Post the one-paragraph note to your team.
""",
            },
        ],
    },
    {
        "title": "Module 4: Level Up",
        "lessons": [
            {
                "title": "The next five agents worth building",
                "content": """# The next five agents worth building

Once the inbox agent has run clean for a month, you have the skills and the habits. These are the five we build most for clients, ranked by how fast they pay back. Each follows the exact Module 3 process.

## 1. Lead follow-up drafter

**Trigger:** a new lead hits your form, CRM, or inbox.
**Does:** looks up the company, checks what they asked for, drafts a personal first reply, creates a task for the owner to send it within the hour.
**Payoff:** speed-to-lead is the single biggest lever in most sales funnels. Going from hours to minutes routinely doubles reply rates.
**Guardrail:** drafts only, for the first month. Never quotes.

## 2. Meeting prep brief

**Trigger:** a calendar event with an external attendee, 30 minutes before.
**Does:** pulls the last emails and CRM notes with that contact, their company's recent news, open deals, and writes a half-page brief with three suggested questions.
**Payoff:** every meeting starts informed. Sales reps love this one most.
**Guardrail:** read-only. Nothing to break.

## 3. Call and meeting summarizer

**Trigger:** a new transcript from your call recorder.
**Does:** three-bullet summary, decisions, action items with owners, and a draft follow-up email. Logs to CRM.
**Payoff:** follow-ups actually get sent, and your CRM finally has notes in it.
**Guardrail:** action items are proposed, not assigned, until reviewed.

## 4. Proposal and quote first draft

**Trigger:** a deal moves to "proposal" stage.
**Does:** fills your proposal template from the CRM record and call notes, pulls pricing from the approved sheet, flags any item that is not on the sheet.
**Payoff:** proposals go out same day instead of next week.
**Guardrail:** this one stays Red for pricing. It fills numbers from the sheet only and marks anything else NEEDS_HUMAN.

## 5. Content repurposer

**Trigger:** you publish something long (a video, a post, a webinar transcript).
**Does:** writes five short posts, an email, and a one-paragraph summary in your voice, from your examples.
**Payoff:** consistent output with no extra writing time.
**Guardrail:** drafts into a queue you approve. Never auto-posts.

## Picking between them

Score each with the Module 3 scorecard for *your* business. Then ask one more question: **which one has a number attached?** Faster lead replies, more proposals sent, more meetings with notes. Build the one whose number you can show your partner or your boss in 30 days.

> **Do this now:** Score all five. Circle the top one. Put "job description draft" for it in next week's calendar.
""",
            },
            {
                "title": "Mistakes that kill agent projects",
                "content": """# Mistakes that kill agent projects

We get called in to rescue a lot of stalled agent projects. They almost all died of one of these.

## 1. Starting with the big one

"Let's automate the whole sales process." Six weeks later there is a diagram and nothing running. Start with one narrow job that works end to end. Breadth comes from adding agents, not from making one agent do everything.

## 2. No written process

If three people on your team do the task three different ways, the agent will do it a fourth way. Write the rule down first. Agree on it. Then automate it.

## 3. No test set

Without 20 scored examples you are guessing about whether a change helped. Every "the agent got worse" complaint we hear comes from a team with no test set.

## 4. Skipping shadow mode

Turning on write actions on day one. One bad week of auto-sent emails ends the project politically, even if the fix is a one-line rule.

## 5. Letting it guess

An agent with no NEEDS_HUMAN option will always produce an answer. Confident and wrong is the worst combination. Escalation is not a weakness, it is the feature that lets you trust the rest.

## 6. Nobody owns it

Agents drift as the business changes. If no one is doing the Friday review, in three months the FAQ is stale, the NEEDS_HUMAN pile is ignored, and someone quietly turns it off. Name an owner. Ten minutes a week.

## 7. Building on the wrong layer

Trying to make the model do plumbing (poll the inbox, retry failures, parse dates) or trying to make the automation tool make judgment calls with a pile of if-statements. Automation for plumbing, model for judgment. Both, not either.

## 8. Chasing the newest tool

A new framework every month. The job description, the test set, and the weekly review are portable. The framework is not. Get those three right and you can swap tools in an afternoon.

## 9. Ignoring cost until the invoice

A loop bug or an over-stuffed prompt can 100x your bill. Spend caps and step limits (Module 2, Lesson 4) take five minutes to set. Set them.

## 10. Measuring nothing

If you cannot say "this saves X hours a week" or "this got Y more replies" by day 30, the project will be first on the chopping block. The next lesson is about fixing that.

> **Do this now:** Honestly check your current project against all ten. Fix the ones you are guilty of this week.
""",
            },
            {
                "title": "Measuring ROI so it survives budget season",
                "content": """# Measuring ROI so it survives budget season

An agent that saves an hour a day and cannot prove it will get cut. One that saves 20 minutes and can prove it will get a budget. Measure from day one.

## Three numbers, that is all

### 1. Time saved

Before launch, time yourself doing the task by hand for three days. Write the average per item and items per day.

After two weeks of the agent, time the remaining human work (reviewing, sending drafts, handling NEEDS_HUMAN).

```
Time saved per week = (before per item - after per item) x items per week
```

For inbox triage this is usually 3 to 6 hours a week per person. Multiply by a loaded hourly cost. That is the headline number.

### 2. Speed

Pick the one latency that matters: time to first reply for a lead, time to label an urgent email, time from call end to CRM notes. Measure it before and after. Speed improvements are often worth more than time saved, because they change outcomes (more replies, fewer escalations), not just cost.

### 3. Cost to run

From your API dashboard and your automation tool's invoice. Add the owner's review time (ten minutes a week). Be honest. It will still be small.

## The one-line summary

Put this in your weekly review and in any update to a partner or boss:

> "The triage agent handled 412 emails this week, saved about 4.5 hours, cut urgent-email response time from 3 hours to 20 minutes, and cost $18 to run."

That sentence, repeated for eight weeks, is how you get approval for agents two through five.

## What not to measure yet

- Accuracy percentages beyond the test set score. Nobody outside the project cares.
- "Productivity." Too vague. Hours and minutes only.
- Revenue attribution for a triage agent. Save that for the lead follow-up agent, where it is real.

## Keep the log honest

The log sheet from Module 2 gives you items per week and label counts for free. Add one column, `minutes_human`, filled in during review. Now the whole ROI calculation is a pivot table.

> **Do this now:** Do the three-day baseline timing this week if you have not. Without the before number there is no ROI story.
""",
            },
        ],
    },
    {
        "title": "Module 5: Your Next 30 Days",
        "lessons": [
            {
                "title": "The 30-day plan",
                "content": """# The 30-day plan

Everything in this course, as a checklist. Print it or copy it into your scratch folder. Check things off.

## Week 1: Foundations and job description

- [ ] Accounts set up: model API key with a spend cap, automation tool, log sheet, scratch folder (M1 L3)
- [ ] Task scored 20+ on the scorecard, or inbox triage chosen (M3 L1)
- [ ] Three-day baseline timing done by hand (M4 L3)
- [ ] `agent-job-description.md` written with ROLE, INPUT, OUTPUT, RULES, FAQ, EXAMPLES (M3 L2)
- [ ] Hand-tested on 5 real emails in a chat window, 4 of 5 correct

## Week 2: Build and test

- [ ] Workflow built (n8n or code), read tools plus label and draft only (M3 L3)
- [ ] Dedicated credential, no send permission, kill switch located (M2 L4)
- [ ] 20-email test set built with expected labels (M3 L4)
- [ ] Scored 16 of 20 or better, zero confident-wrong URGENT misses
- [ ] Log sheet receiving a row per email

## Week 3: Shadow mode

- [ ] Agent running on live email, you still doing the work
- [ ] Nightly five-minute log check
- [ ] Job description updated at least twice from real misses
- [ ] Team told what the labels mean and where the kill switch is

## Week 4: Trust and measure

- [ ] Working from the agent's buckets, reading drafts before sending
- [ ] First Friday review completed and saved (M3 L5)
- [ ] ROI one-liner written: emails handled, hours saved, speed change, cost (M4 L3)
- [ ] Next agent picked and scored (M4 L1)

## Day 30

Send yourself (or your partner, or your boss) the ROI one-liner. That is the finish line for this course.

## If you get stuck

The most common stuck points and where to look:

| Stuck on | Lesson |
|---|---|
| Agent labels everything NEEDS_HUMAN | Rules too vague, M3 L2; threshold too high, lower to 70% |
| Agent never says NEEDS_HUMAN | Missing edge-case examples, M3 L4 |
| Drafts sound robotic | Add 3 of your own sent emails as tone examples, M3 L2 |
| Lookup always empty | Email mismatch between inbox and CRM, M2 L3 |
| Costs higher than expected | Prompt too long or a loop, M2 L4 |

> **Do this now:** Copy this checklist into your folder and date the first item.
""",
            },
            {
                "title": "Want it built for you? Work with Guad Squad",
                "content": """# Want it built for you? Work with Guad Squad

You now know more about building agents than most of the people selling them. If you would rather have it done, or you want the next five agents running this quarter instead of this year, that is what we do.

## What Guad Squad does

[Guad Squad]({site}) is an AI automation agency. We design, build, and run agents for businesses that want the outcome without building an internal AI team.

Typical engagements:

- **Agent build.** One agent, from job description to shadow mode to handoff, with the test set and the review routine included. Usually two to three weeks.
- **Agent stack.** The five agents from Module 4, sequenced and connected to your CRM, inbox, and calendar. Usually one quarter.
- **Run and improve.** We own the Friday review, the FAQ updates, and the promotions from Yellow to Green, and report the ROI one-liner to you monthly.

Everything we build follows the exact process in this course: written rules, a test set, least privilege, shadow mode, weekly review. You will always be able to see the log and change the job description yourself.

## Is it a fit?

Good fit:

- You have a real inbox, pipeline, or queue with volume
- Someone on your side can spend 30 minutes a week reviewing
- You want numbers, not demos

Not a fit yet:

- The process is not written down and nobody agrees on it. Do Module 3 Lesson 2 first. It is free and it will save you money with us or anyone else.

## Next step

Go to **[{site}]({site})** and book a call. Bring your scorecard and your job description draft if you have one. We will tell you honestly whether you should build it yourself (you probably can, now) or have us do it.

Either way, thank you for taking the course. Post your first ROI one-liner in the community forum. We read every one.

**Joe Guadagnino**
Guad Squad
""",
            },
        ],
    },
]


def render(text: str) -> str:
    return text.replace("{site}", SITE)
