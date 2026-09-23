/**
 * Navigator — Claude-connected mode.
 *
 * Optional serverless endpoint (Vercel / Netlify-style Node function) that lets the
 * on-site Navigator assistant answer with Claude instead of its built-in engine.
 * Deploy it, set ANTHROPIC_API_KEY in the host's environment, then point every page's
 * <meta name="twm-ai-endpoint" content="/api/chat"> at it. The browser widget streams
 * the reply and falls back to on-site knowledge mode if the endpoint is unavailable.
 *
 * Request:  POST { messages: [{ role: 'user' | 'assistant', content: string }], context?: string, page?: string }
 * Response: text/event-stream with `data: {"delta": "..."}` chunks, then `data: [DONE]`
 */
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY (or an `ant auth login` profile)
const MODEL = 'claude-opus-5';

let knowledgePromise = null;
async function loadKnowledge() {
  if (!knowledgePromise) {
    knowledgePromise = (async () => {
      globalThis.window = globalThis; // knowledge.js is a browser IIFE that assigns window.TWM
      await import('../assets/js/knowledge.js');
      return globalThis.TWM;
    })();
  }
  return knowledgePromise;
}

function buildSystemPrompt(K) {
  const team = K.team.map((t) => `- ${t.name}, ${t.title}${t.years ? ` (${t.years})` : ''}. Focus: ${t.focus} Background: ${t.background}`).join('\n');
  const services = K.services.map((s) => `- ${s.title} — ${s.sub}. ${s.body}`).join('\n');
  const values = K.valueProps.map((v) => `- ${v.title} — ${v.sub}. ${v.body}`).join('\n');
  const articles = K.articles.map((a) => `- "${a.title}" (${a.category}, ${a.date}; /insights/${a.slug}.html): ${a.summary} Key takeaways: ${a.takeaways.join(' | ')}`).join('\n');
  const faqs = K.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');
  const portals = K.portals.map((p) => `- ${p.name} (${p.by}): ${p.desc} Features: ${p.features.join('; ')}. ${p.note}`).join('\n');
  return `You are Navigator, the AI concierge on the website of ${K.firm.name}, a wealth management team in ${K.firm.city.replace(/ \d+$/, '')} affiliated with &Partners, LLC.

Your job: warmly and concisely help visitors understand the firm, summarize its published insights, explain general financial-planning concepts, guide clients to the correct portal, and offer to arrange an introduction with an advisor. Keep replies short (usually under 120 words), in plain language, formatted with light markdown (bold, short bullet lists). Link to site pages with relative paths like /insights/<slug>.html, /strength.html, /skill.html, /value.html, /planning-lab.html, /client-login.html, /contact.html.

Hard rules:
- You are not a financial advisor. Never give personalized investment, tax, legal or insurance advice, never recommend specific securities, never predict markets, and never tell someone whether to buy, sell, or claim benefits at a given age. Explain the general considerations, then offer an introduction with an advisor.
- Do not invent facts about the firm, its fees, minimums, performance, or people. If something is not in your knowledge below, say you are not certain and offer to connect the visitor with the team at ${K.firm.phone}.
- Never request or store account numbers, passwords or Social Security numbers. If a visitor shares them, ask them not to.
- Any numbers you produce are hypothetical illustrations; say so.
- Registered representatives may only respond to residents of states where they are licensed; do not promise service in a specific state.
- If the visitor wants to talk to a person, collect their name, email, phone (optional), topic and best time, confirm, and tell them the team will follow up. Also give the office phone.

FIRM
Tagline: ${K.firm.tagline}. Office: ${K.firm.address}, ${K.firm.city}. Phone: ${K.firm.phone}. LinkedIn: ${K.firm.linkedin}. Founder: ${K.firm.founder} — the trident honors his service as a Navy Frogman and represents the power of three (Strength, Skill, Value). Forbes Best-In-State Wealth Management Team (New York) 2024 — always attach the disclosure that investment performance is not a criterion and the rating is not related to the quality of advice.

TEAM
${team}
Client service associates: ${K.support.map((s) => s.name).join(', ')}.

SERVICES (Skill)
${services}

VALUES (Value)
${values}

INSIGHTS LIBRARY
${articles}

FAQ
${faqs}

CLIENT PORTALS
${portals}

DISCLOSURES
${K.firm.legal.join(' ')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method Not Allowed'); }
  let body = req.body;
  if (typeof body === 'string' || !body) { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
  const messages = Array.isArray(body.messages) ? body.messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()).slice(-20) : [];
  if (!messages.length || messages[messages.length - 1].role !== 'user') { res.statusCode = 400; return res.end('messages[] must end with a user turn'); }

  const K = await loadKnowledge();
  const context = typeof body.context === 'string' && body.context ? `\n\nPAGE CONTEXT: the visitor is currently on ${body.page || 'the site'} (${body.context}).` : '';

  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024, // deliberately short: this is a chat widget reply
      output_config: { effort: 'low' }, // latency-sensitive chat route
      system: [
        { type: 'text', text: buildSystemPrompt(K), cache_control: { type: 'ephemeral' } }, // stable prefix, cached
        ...(context ? [{ type: 'text', text: context }] : [])
      ],
      messages
    });
    stream.on('text', (delta) => send({ delta }));
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') send({ delta: '\n\nI can’t help with that one, but a member of the team can — call ' + K.firm.phone + '.' });
    res.write('data: [DONE]\n\n');
  } catch (err) {
    let msg = 'Navigator is temporarily unavailable. Please call ' + K.firm.phone + '.';
    if (err instanceof Anthropic.RateLimitError) msg = 'Navigator is busy right now — please try again in a moment.';
    else if (err instanceof Anthropic.AuthenticationError) msg = 'Navigator is not configured on this deployment.';
    else if (err instanceof Anthropic.APIConnectionError) msg = 'Navigator could not reach its model. Please try again.';
    else if (err instanceof Anthropic.APIError) msg = `Navigator hit an error (${err.status}).`;
    send({ delta: msg });
    res.write('data: [DONE]\n\n');
  }
  res.end();
}
