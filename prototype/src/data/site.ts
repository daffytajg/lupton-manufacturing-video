// Company facts. Every value here is published on luptons.com today unless it carries [CONFIRM].
// These strings feed visible copy, JSON-LD and llms.txt, so keep them identical everywhere.

export const SITE_URL = 'https://luptons.com';

// Prototype mode: noindex every page + show the review banner and [CONFIRM] chips.
// Flip to false only for a production build after every [CONFIRM] is resolved.
export const PROTOTYPE = import.meta.env.PUBLIC_PROTOTYPE !== 'false';

export const org = {
  name: 'Lupton Associates',
  legalName: 'Lupton Associates, Inc.', // [CONFIRM] legal entity name as registered
  tagline: 'Servicing the working world since 1969.',
  founded: 1969,
  phone: '(585) 393-4999',
  phoneE164: '+15853934999',
  email: null as string | null, // [CONFIRM] shared inbox; live site hides it behind Cloudflare obfuscation
  address: {
    street: '343 N. Main Street, Suite 201',
    city: 'Canandaigua',
    region: 'NY',
    postal: '14424',
    country: 'US',
  },
  geo: { lat: 42.8923, lng: -77.2786 }, // [CONFIRM] approximate, from street address
  territory: ['United States', 'Canada', 'Mexico'],
  bookingUrl: 'https://outlook.office.com/book/LuptonAssociates@luptons.com/',
  linkedin: 'https://www.linkedin.com/company/lupton-associates/', // [CONFIRM] company page URL
  responsePromise: 'one business day',
};

export const oneLiner =
  'Lupton Associates helps OEM engineering and sourcing teams get custom metal, plastic, cable and electronic parts made. We review the drawing, match it to a manufacturer whose process, certifications and capacity fit the part and the volume, and get you a quote from that shop.';

export const processes = [
  'Short run metal stamping',
  'Progressive die stamping',
  'Sheet metal fabrication',
  'Laser cutting',
  'CNC punching',
  'Press brake forming',
  'MIG / TIG / robotic welding',
  '5-axis CNC machining',
  'Swiss turning',
  'Creep feed grinding',
  'Wire EDM',
  'Brazing',
  'Cold plates',
  'Die casting',
  'Graphite casting',
  'Investment casting',
  'Sand casting',
  'Aluminum extrusion',
  'Injection molding',
  'Gas assist molding',
  'Structural foam',
  'RIM',
  'Rotational molding',
  'Thermoforming',
  'Wire harnesses',
  'Cable assemblies',
  'Overmolding',
  'PCB assembly',
  'Box build',
  'Microelectronics',
  'Powder coat',
  'E-coat',
];

export const nav = [
  { label: 'Capabilities', href: '/capabilities/' },
  { label: 'Industries', href: '/industries/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'About', href: '/about/' },
];

export type Person = {
  name: string;
  role: string;
  since?: number;
  territory?: string;
  bio: string;
  photo: string; // file in src/assets/img/team
  linkedin?: string;
  leadership?: boolean;
};

// Source: luptons.com/about-us/ (crawled 2026-09-23). Bios tightened, facts unchanged.
export const team: Person[] = [
  {
    name: 'Alan Lupton II',
    role: 'President',
    bio: "Alan leads Lupton Associates' sales, marketing and business development. He started at Lupton covering New England accounts, then took on strategic accounts, program management and nationwide business development.",
    photo: 'alan-lupton-ii',
    linkedin: 'https://www.linkedin.com/in/alan-lupton-458a6b1',
    leadership: true,
  },
  {
    name: 'Joe Guadagnino',
    role: 'VP, Operations & Sales',
    bio: 'Joe brings more than 20 years of leadership in technology, telecommunications and infrastructure. Before Lupton he was CEO of MISS DIG 811, leading more than 350 employees, and ran global cloud-infrastructure operations teams across 12 regions at Google.',
    photo: 'joe-guadagnino',
    linkedin: 'https://www.linkedin.com/in/jguad22',
    leadership: true,
  },
  { name: 'Mary Smith', role: 'Human Resources & Accounting', since: 2015, bio: 'Licensed CPA with public accounting and telecommunications finance experience.', photo: 'mary-smith' },
  { name: 'Tammy Hall', role: 'Office Manager', since: 1989, bio: 'Runs accounting and bookkeeping and has supported the sales organization for more than three decades.', photo: 'tammy-hall', linkedin: 'https://www.linkedin.com/in/tammy-hall-79113612' },
  { name: 'Aeriana Brentlinger', role: 'Marketing Manager & Inside Sales', since: 2025, bio: 'Digital marketing, content strategy, social media and brand development.', photo: 'aeriana-brentlinger', linkedin: 'https://www.linkedin.com/in/aeriana-brentlinger-8a9271204' },
  { name: 'Phil Priolo', role: 'Business Development Support', since: 2022, bio: 'Engineering management, operations, continuous improvement, machinery, testing, assembly and startups.', photo: 'phil-priolo' },
  { name: 'Eddy Beauregard', role: 'Business Development', territory: 'Southeast', bio: 'Finance and analytics background; BS in Finance and MBA from Bentley University.', photo: 'eddy-beauregard', linkedin: 'https://www.linkedin.com/in/edward-beauregard-jr' },
  { name: 'Greg Johnson', role: 'Business Development', territory: 'Eastern PA, DE, MD, DC, NJ', since: 1997, bio: 'Deep account knowledge across the Mid-Atlantic.', photo: 'greg-johnson' },
  { name: 'Luke Hinkle', role: 'Business Development', territory: 'Mid-Atlantic & Ohio Valley', since: 2020, bio: 'Aviation-sales background; new and existing business across the Mid-Atlantic.', photo: 'luke-hinkle', linkedin: 'https://www.linkedin.com/in/luke-hinkle-ba5816116' },
  { name: 'CJ Roberts', role: 'Business Development', territory: 'New York', since: 2023, bio: 'Account-executive and inside-sales background; customer development across New York.', photo: 'cj-roberts' },
  { name: 'Chris Dunham', role: 'Business Development', territory: 'New England', since: 1995, bio: 'Program development and manufacturing solutions for military, medical, optical and technology applications.', photo: 'chris-dunham' },
  { name: 'Greg Hebert', role: 'Business Development', territory: 'New England', since: 2017, bio: 'Executive sales and operations experience; strategic accounts across the Northeast.', photo: 'greg-hebert', linkedin: 'https://www.linkedin.com/in/greg-hebert-3a4b508' },
  { name: 'John Walker', role: 'Business Development', territory: 'Carolinas & Georgia', since: 1998, bio: 'Technical-support and outside-sales background.', photo: 'john-walker', linkedin: 'https://www.linkedin.com/in/john-walker-a9aa57b' },
  { name: 'Mike Laney', role: 'Business Development', territory: 'Southeast', since: 2009, bio: '25+ years in manufacturing and sales: metal fabrication, CNC machinery, automation.', photo: 'mike-laney', linkedin: 'https://www.linkedin.com/in/mike-laney-26abb63' },
  { name: 'Jennings Harley', role: 'Business Development', territory: 'FL, TN, KY, Carolinas, GA', since: 2012, bio: 'Account management and business-to-business sales.', photo: 'jennings-harley', linkedin: 'https://www.linkedin.com/in/jennings-harley-063b0a2b' },
  { name: 'Bobby Ramirez', role: 'Business Development', territory: 'Western U.S. & Northern Mexico', since: 2021, bio: 'Industrial hardware and branch development; bilingual.', photo: 'bobby-ramirez', linkedin: 'https://www.linkedin.com/in/bobbyramirez0704' },
  { name: 'Kailee Lupton', role: 'Business Development', territory: 'Western & Pacific States', since: 2026, bio: 'Account management; communication, media, sales and business development.', photo: 'kailee-lupton', linkedin: 'https://www.linkedin.com/in/kaileelupton' },
];
