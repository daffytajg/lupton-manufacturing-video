// JSON-LD builders. Rule: unverified ([CONFIRM]) claims never reach structured data.
import { SITE_URL, org, processes, oneLiner, team } from '../data/site';
import type { Faq } from '../data/types';
import { plain, hasConfirm } from './rich';

const ORG_ID = `${SITE_URL}/#organization`;

export function orgSchema() {
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: org.name,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/img/logo-horizontal-dark.webp`,
    image: `${SITE_URL}/img/logo-horizontal-dark.webp`,
    slogan: org.tagline,
    description: oneLiner,
    foundingDate: String(org.founded),
    telephone: org.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.street,
      addressLocality: org.address.city,
      addressRegion: org.address.region,
      postalCode: org.address.postal,
      addressCountry: org.address.country,
    },
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'Mexico' },
    ],
    knowsAbout: processes,
    employee: team
      .filter((p) => p.leadership)
      .map((p) => ({ '@type': 'Person', name: p.name, jobTitle: p.role, ...(p.linkedin ? { sameAs: [p.linkedin] } : {}) })),
    potentialAction: {
      '@type': 'CommunicateAction',
      name: 'Request a quote',
      target: `${SITE_URL}/rfq/`,
    },
  };
}

export function websiteSchema() {
  return { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: org.name, publisher: { '@id': ORG_ID } };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.href}` })),
  };
}

export function webPageSchema(path: string, title: string, description: string) {
  return {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name: title,
    description: plain(description),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': ORG_ID },
    inLanguage: 'en-US',
  };
}

export function serviceSchema(path: string, name: string, lede: string[], serviceType: string) {
  return {
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name,
    serviceType,
    description: lede.filter((s) => !hasConfirm(s)).map(plain).join(' ') || plain(lede[0]),
    provider: { '@id': ORG_ID },
    areaServed: ['US', 'CA', 'MX'],
    url: `${SITE_URL}${path}`,
  };
}

export function faqSchema(faqs: Faq[]) {
  const ok = faqs.filter((f) => !hasConfirm(f.q) && !hasConfirm(f.a));
  if (!ok.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: ok.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
  };
}

export function articleSchema(path: string, headline: string, description: string, published: string, updated: string) {
  return {
    '@type': 'Article',
    '@id': `${SITE_URL}${path}#article`,
    headline,
    description: plain(description),
    datePublished: published,
    dateModified: updated,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: `${SITE_URL}${path}`,
  };
}

export function graph(...nodes: (object | null | undefined)[]) {
  return { '@context': 'https://schema.org', '@graph': [orgSchema(), websiteSchema(), ...nodes.filter(Boolean)] };
}
