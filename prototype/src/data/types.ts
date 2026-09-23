// Inline rich text used in every data string:
//   **bold**, [link text](/path/), and [CONFIRM] or [CONFIRM: note]
// [CONFIRM] renders as a yellow review chip and is collected on /review/confirm/.

export type Faq = { q: string; a: string };
export type Spec = { label: string; value: string };
export type Stat = { value: string; label: string };
export type Card = { title: string; text: string; href?: string };
export type Table = { caption: string; head: string[]; rows: string[][] };

export type Capability = {
  slug: string;
  parent?: string; // sub-pages, e.g. metal-stamping/short-run
  name: string;
  short: string; // card blurb, one sentence
  icon: string;
  title: string; // <title>, ≤ 60 chars where possible
  description: string; // meta description, ≤ 160 chars
  h1: string;
  lede: [string, string]; // the first two sentences answer the buyer's question
  image: string;
  imageAlt: string;
  stats?: Stat[];
  routes: Card[]; // processes / routes offered
  compare?: Table;
  specs: Spec[];
  send: string[];
  proof?: string[]; // resource slugs
  faqs: Faq[];
  industries: string[];
  combos?: string[]; // "industry/slug"
  children?: string[]; // sub-page slugs
  legacy: string[]; // live URLs this page replaces (301 map)
};

export type Industry = {
  slug: string;
  name: string;
  short: string;
  title: string;
  description: string;
  h1: string;
  lede: [string, string];
  image: string;
  imageAlt: string;
  parts: string[];
  problems: Card[];
  capabilities: { slug: string; text: string }[];
  requirements: string[];
  faqs: Faq[];
  combos: string[];
  proof?: string[];
  legacy: string[];
};

export type Combo = {
  industry: string;
  capability: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  lede: [string, string];
  image: string;
  imageAlt: string;
  parts: string[];
  specs: Spec[];
  requirements: string[];
  send: string[];
  faqs: Faq[];
  proof?: string[];
  legacy: string[];
};

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; table: Table }
  | { type: 'callout'; text: string }
  | { type: 'facts'; items: Spec[] };

export type Resource = {
  slug: string;
  kind: 'Guide' | 'Case study';
  title: string;
  description: string;
  h1: string;
  lede: [string, string];
  published: string;
  updated: string;
  image?: string;
  imageAlt?: string;
  body: Block[];
  faqs?: Faq[];
  capabilities: string[];
  industries: string[];
  legacy: string[];
};
