import type { APIRoute } from 'astro';
import { PROTOTYPE, SITE_URL } from '../data/site';

// Production policy: welcome search and AI answer engines explicitly. Named groups make the
// intent auditable and survive a future "block AI" toggle being flipped by mistake.
const production = `# luptons.com: search and AI answer engines are welcome.
User-agent: *
Allow: /
Disallow: /review/

User-agent: Googlebot
User-agent: Bingbot
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Allow: /
Disallow: /review/

Sitemap: ${SITE_URL}/sitemap-index.xml
# LLM-readable summary: ${SITE_URL}/llms.txt
`;

const prototype = `# PROTOTYPE BUILD: keep preview deployments out of every index.
User-agent: *
Disallow: /

# Production robots.txt (PUBLIC_PROTOTYPE=false) will be:
${production.split('\n').map((l) => (l ? `# ${l}` : '#')).join('\n')}
`;

export const GET: APIRoute = () => new Response(PROTOTYPE ? prototype : production, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
