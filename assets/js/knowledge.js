/* ==========================================================================
   Trident Wealth Management Group — site knowledge base
   Single source of truth for navigation, team, services, insights and FAQs.
   Consumed by the site shell, the command palette and the Navigator assistant.
   ========================================================================== */
(function () {
  const IMG = 'https://www.trident-wealth.com/wp-content/uploads/';

  const icons = {
    trident: '<svg viewBox="0 0 52.45 97.45" aria-hidden="true"><path d="M29.22,48.64h11.61c1.03-11.74,2.03-23.26,3.15-36.06,3.6,4.2,6.43,7.51,8.47,9.9-1,2.69-2.09,4.37-2.17,6.1-.24,5.32,0,10.66-.12,15.99-.14,6.7-3.58,10.22-10.19,10.29-9.16.11-18.33.11-27.49,0-6.72-.08-10-3.49-10.1-10.28-.08-5.33.13-10.67-.11-15.99-.08-1.68-1.19-3.32-2.27-6.09,1.88-2.24,4.59-5.49,8.36-9.99,0,9.2,0,16.91,0,24.62,0,12.81.98,13.58,14.91,11.12,0-11.31.08-22.75-.14-34.18-.02-1.04-2-2.03-3.31-3.28,1.88-3.22,3.87-6.64,6.29-10.79,2.41,3.96,4.45,7.3,5.79,9.49-1.15,3.13-2.53,5.21-2.58,7.32-.23,10.46-.1,20.92-.1,31.82Z"/><path d="M29.33,97.45h-5.99v-29.5c-4.74-.31-9.57.32-10.35-6.03h26.24q-1.45,5.18-9.89,6.14v29.38Z"/></svg>',
    chain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    pipes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h6a3 3 0 0 1 3 3v7a3 3 0 0 0 3 3h6"/><path d="M3 4v6M21 17v6M8 7v3M12 13h3"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M6 16l4-6 4 3 5-8"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6l-5.5 9A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M8 15h8"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M4 21h16M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0zM4 7h16"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13M12 8c-2-4-6-3-6-1s3 1 6 1zm0 0c2-4 6-3 6-1s-3 1-6 1z"/></svg>'
  };

  const team = [
    {
      slug: 'peter-noto', name: 'Peter Noto, RICP®', short: 'Peter Noto', title: 'Co-Founder – Managing Director', initials: 'PN',
      img: IMG + '2024/08/peter-headshot-april-2026.jpg', years: '30+ years', tags: ['retirement income', 'multi-generational planning', 'RICP'],
      focus: 'Early in my career I realized I wanted to work with people in my community with whom I could have direct long term multi-generational relationships. I enjoy taking the time to really get to know them, their families and their long-term dreams and ambitions and working to become their trusted advisor. Now after over 30 years as a Financial Advisor, it’s very rewarding to work with them throughout their life and put strategies and plans in place to help them achieve their objectives.',
      background: 'After completing my Bachelor’s degree in Economics at Princeton University, I embarked on a rewarding career in the financial services industry. I joined Wheat First Union, a predecessor firm to Wells Fargo Advisors, where I quickly rose to a leadership position leading our business operations in the western NY area. Continuing my career development, I earned my Retirement Income Certified Professional® (RICP®) designation, which provides advanced knowledge on retirement income styles and planning strategies so I am able to help my clients achieve their vision of retirement.',
      away: 'I volunteer at several organizations including as a Board Member of the Aquinas Institute. Fitness and nutrition are a priority for me; as a cancer survivor I embrace a wellness approach to my life and exercise regularly, play sports, golf and travel with family and friends. Born and raised in the Rochester area, my wife and I have been married for over 30 years and have raised three children and now have a grandson.'
    },
    {
      slug: 'nicholas-lapenna', name: 'Nicholas LaPenna', short: 'Nicholas LaPenna', title: 'Co-Founder – Managing Director', initials: 'NL',
      img: IMG + '2025/09/nicholas-headshot.avif', years: '10+ years', tags: ['comprehensive planning', 'next-gen advisor', 'practice management'],
      focus: 'With over a decade of experience as a Financial Advisor, my number one priority is helping my clients build, manage, preserve, and transfer wealth using the four cornerstones of wealth management to help achieve financial independence. I pride myself on working collaboratively with my clients to develop comprehensive investment and planning strategies designed to help them meet their unique financial goals.',
      background: 'I graduated from college at age 20 and earned my degree in marketing from SUNY Brockport before beginning my career in the finance industry. Prior to joining Trident Wealth Management Group alongside my brother Dominick LaPenna and Peter Noto, I was a Vice President at Criterion Management, an executive search firm. In 2024, I was honored to be recognized by Forbes as one of the Top Next-Gen Wealth Advisors.* Throughout my career, I have been invited to speak at industry meetings and conferences on practice management and building strong client relationships.',
      away: 'I am a devoted husband to my wife Elaina and a proud dad to Juniper. We are also dog owners to two adorable pups, Finn and Brewster. I live and work in upstate New York, where I am an active member of the Rochester Rotary community. Outside of work, I enjoy playing sports, especially golf.'
    },
    {
      slug: 'paul-viel', name: 'Paul Viel', short: 'Paul Viel', title: 'Co-Founder – Director', initials: 'PV',
      img: IMG + '2024/08/AAA-Paul-Viel-headshot-jpg.webp', years: '47+ years', tags: ['options strategies', 'lifetime planning'],
      focus: 'With over 47 years of experience as a Financial Advisor I gain a tremendous amount of satisfaction working with people to put plans in place to help them address their investment needs throughout their lives and achieve their goal of pursuing their life passions.',
      background: 'I combine my years of wisdom and knowledge as a Financial Advisor, my extensive knowledge of options strategies, along with the experience of being a father and grandfather to help my clients achieve their goals. I began my career as a Financial Advisor at EF Hutton for over 20 years, then moved to Wells Fargo Advisors and its predecessor firms in 1995. I graduated from the New York Institute of Finance and hold FINRA registrations including the Series 7, 8, 63 and 65, and my insurance license.',
      away: 'My wife Cheryl and I have been married for over 52 years and have 3 grown children and 4 grandchildren. In my free time I enjoy hunting, wine making, fishing and gardening.'
    },
    {
      slug: 'mike-petix', name: 'Mike Petix', short: 'Mike Petix', title: 'Co-Founder – Director', initials: 'MP',
      img: IMG + '2025/09/petix-headshot.avif', years: '43+ years', tags: ['retirement planning', 'estate planning', 'business owners'],
      focus: 'With over 43 years of experience in the financial services industry, I have dedicated my career to working with individuals, families, and business owners to create comprehensive retirement and estate planning strategies. My goal is to help my clients achieve their financial goals and live their vision of the future.',
      background: 'I began my journey in financial services in 1980 and gained valuable expertise working with various firms, including predecessor firms to Wells Fargo Advisors. When working with my clients, I leverage my decades of experience to develop customized plans that instill confidence and address their unique financial needs.',
      away: 'I am proud to call Rochester, NY my lifelong home. My wife and I have raised two children and have four grandchildren. In my free time, I enjoy playing golf and exploring new destinations through travel. I am actively involved as a Board Member for the Boys and Girls Clubs of Rochester.'
    },
    {
      slug: 'dominick-lapenna', name: 'Dominick LaPenna', short: 'Dominick LaPenna', title: 'Co-Founder – Director', initials: 'DL',
      img: IMG + '2025/09/dom-headshot.avif', years: '', tags: ['customized planning', 'client education'],
      focus: 'With a strong belief in the importance of building meaningful relationships and earning the trust of clients, I am dedicated to helping guide them through financial decisions throughout their lives. I work closely with each individual and provide clear explanations of their financial options, empowering them to make informed choices for themselves and their loved ones.',
      background: 'My educational background includes a B.S. degree in Financial Economics from SUNY Binghamton. Beginning my career as an intern in branch operations at Wells Fargo Advisors during college, I joined the company full time after graduation and earned my securities registrations to become a Financial Advisor. Today, I hold the Series 7 and Series 66 registrations as well as insurance and annuities licenses.',
      away: 'I serve as a board member of Villa of Hope in Rochester, an organization that provides opportunities to underserved youth, and work with East House and Miracle Field. Away from the office, I enjoy hiking, playing sports, and following the Mets and Jets. My wife Molly and I live in Victor, NY, with our two young sons.'
    },
    {
      slug: 'peter-v-noto', name: 'Peter V Noto', short: 'Peter V Noto', title: 'Partner – Wealth Management Consultant', initials: 'PN',
      img: IMG + '2026/04/peter-jr-headshot.jpg', years: '10+ years', tags: ['institutional markets', 'prime brokerage', 'risk management'],
      focus: 'With over a decade of experience on the institutional side of the business working at Wall Street firms, my primary focus is helping clients navigate complex market landscapes to build, preserve, and transfer wealth. I leverage my background in fundamental analysis and prime brokerage to provide a sophisticated, institutional-grade approach to wealth management.',
      background: 'I graduated from Rutgers University in 2014 with a degree in Economics, where I was also a member of the Men’s Lacrosse team. I spent eight years at Credit Suisse within the Prime Brokerage department working closely with hedge funds, family offices, and ultra-high-net-worth individuals. Following that, I spent four years as a Trader at Hound Partners, a long/short fundamental equity fund — experience that gave me an “under the hood” understanding of equity markets and risk management that I now apply to individual wealth planning.',
      away: 'I am a devoted husband to my wife, Rachel, and a proud father to our sons, Nicholas and Noah. I am deeply passionate about fitness, health, and nutrition. In my free time I enjoy playing golf and squash, and I look forward to coaching youth sports as my children grow.'
    }
  ];

  const support = [
    { name: 'Sara Overslaugh', title: 'Client Service Associate', initials: 'SO', img: IMG + '2024/08/AAA-Overslaugh-headshot-glasses-jpg.webp' },
    { name: 'Julia LaPenna', title: 'Client Service Associate', initials: 'JL', img: IMG + '2025/09/julia-headshot.avif' },
    { name: 'Terry Majeski', title: 'Client Service Associate', initials: 'TM', img: '' }
  ];

  const pillars = [
    { id: 'strength', word: 'Strength', href: 'strength.html', icon: 'chain', tagline: 'A long-tenured team, across every market cycle.',
      body: 'Our team of advice providers and support staff brings a long tenured group of seasoned professionals together, who enjoy helping clients build, manage, and preserve their wealth. Our experience covers various economic and market cycles, enabling us to create and manage durable plans that adapt to change.' },
    { id: 'skill', word: 'Skill', href: 'skill.html', icon: 'gear', tagline: 'Accumulate, distribute and protect your wealth.',
      body: 'Comprehensive wealth management, retirement income specialists, hedging strategies designed to reduce portfolio volatility, and tax alpha strategies that aim to boost after-tax returns.' },
    { id: 'value', word: 'Value', href: 'value.html', icon: 'pipes', tagline: 'Transparent fees. Client first. Quality advice at a fair price.',
      body: 'We customize our engagement schedule to fit each client’s communication preferences, are upfront about fees, and strive to help clients reduce wealth management expenses so they keep a larger portion of their returns.' }
  ];

  const services = [
    { id: 'comprehensive', title: 'Comprehensive Wealth Management', sub: 'Offering a broad array of wealth management services', icon: 'scale',
      body: 'Our team of wealth specialists offer a suite of comprehensive wealth management services that help clients grow and preserve their wealth. Throughout each life stage, we carefully manage each client’s plan to provide the confidence needed to enjoy life today and the clarity needed for their future.',
      keywords: ['wealth management', 'planning', 'comprehensive', 'grow', 'preserve', 'life stage'] },
    { id: 'retirement-income', title: 'Retirement Income Specialists', sub: 'Helping to provide the income needed in retirement', icon: 'sun',
      body: 'Generating the income needed in retirement takes a different investment approach than accumulating and growing wealth. After the paychecks stop, a risk-managed strategy can help balance the risk of loss with the need to keep assets invested in order to outpace inflation.',
      keywords: ['retirement', 'income', 'paycheck', 'withdrawal', 'inflation', 'RICP'] },
    { id: 'hedging', title: 'Hedging Strategies', sub: 'Designed to reduce portfolio volatility and offset losses', icon: 'shield',
      body: 'Depending on a client’s situation, we may suggest employing strategic risk management techniques. Traditional hedging and/or “buffered” portfolios can help preserve portfolios from stock market volatility while still allowing for a capped participation for growth.',
      keywords: ['hedging', 'hedge', 'buffered', 'volatility', 'downside', 'risk management', 'options', 'protect'] },
    { id: 'tax-alpha', title: 'Tax Alpha Strategies', sub: 'Helping to boost after-tax returns', icon: 'chart',
      body: 'Tax alpha strategies aim to minimize the impact of taxes on investment returns of non-qualified assets. By using tax-loss harvesting and sophisticated buy/sell strategies, our team can potentially reduce tax liabilities and increase after-tax returns.',
      keywords: ['tax', 'taxes', 'tax-loss harvesting', 'after-tax', 'alpha', 'non-qualified', 'taxable'] }
  ];

  const valueProps = [
    { title: 'Transparency', sub: 'Helping clients make informed investment decisions', icon: 'eye',
      body: 'We understand the importance of transparency, which is why we are committed to being upfront about the fees associated with our services. Transparency helps to ensure there are no surprises along the way. It helps to build trust and demonstrate our commitment to open communication and fair practices.' },
    { title: 'Client First Approach', sub: 'Doing what is right for our clients — always', icon: 'heart',
      body: 'Our exceptional customer service helps us connect with clients and foster successful long-term relationships. We prioritize clients’ financial well-being above all else.' },
    { title: 'Delivering Value', sub: 'Quality advice at a fair price', icon: 'scale',
      body: 'We strive to help clients reduce their wealth management expenses, allowing them to keep a larger portion of their investment returns. Lower expenses can lead to higher net returns, as fees can erode investment performance. By minimizing unnecessary costs and optimizing investment strategies, we aim to provide better outcomes for our clients.' }
  ];

  const articles = [
    { slug: 'the-retirement-expenses-nobody-warns-you-about', title: 'The Retirement Expenses Nobody Warns You About', date: '2026-09-01', category: 'Retirement', readMin: 4,
      summary: 'Some of the expenses with the biggest impact on a retirement budget are the easiest to overlook — from home upkeep and adult children to travel, insurance and replacing everything you own.',
      takeaways: ['A paid-off house still needs a roof, HVAC and accessibility updates over a 25–30 year retirement.', 'Helping adult children and grandchildren rarely ends; decide in advance how much you can give without compromising your plan.', 'Build flexibility into the plan so an unexpected $15,000 expense doesn’t feel stressful.'],
      keywords: ['retirement', 'expenses', 'budget', 'healthcare', 'travel', 'insurance', 'home', 'children', 'flexibility', 'medicare'] },
    { slug: 'when-should-you-start-giving-your-kids-their-inheritance', title: 'When Should You Start Giving Your Kids Their Inheritance?', date: '2026-09-01', category: 'Family & Legacy', readMin: 4,
      summary: 'If you’re financially secure and expect to leave money to your children someday, moving part of that inheritance forward could let it help when it matters most — and let you see the impact.',
      takeaways: ['Children who inherit in their 60s may already be past the years when the money would have helped most.', 'Giving earlier lets you experience what your generosity makes possible.', 'Any gift should be weighed against your own retirement income, liquidity and long-term security, with tax and legal input.'],
      keywords: ['inheritance', 'gift', 'gifting', 'children', 'kids', 'estate', 'legacy', 'generosity', 'down payment'] },
    { slug: 'financial-values-that-grandparents-can-pass-along', title: 'Financial Values that Grandparents Can Pass Along', date: '2026-08-03', category: 'Family & Legacy', readMin: 3,
      summary: 'Grandparents pass along more than memories. Through shared experiences — fixing a bike, comparing products, co-managing a small account — you can hand down financial habits that last a lifetime.',
      takeaways: ['Lessons land best through shared experiences rather than speeches.', 'Teach the difference between price and value, and why not every trend is worth chasing.', 'A small custodial investment account, reviewed together, teaches patience and diversification.'],
      keywords: ['grandparents', 'grandchildren', 'values', 'kids', 'teach', 'custodial', 'family', 'generations'] },
    { slug: 'protecting-your-digital-assets', title: 'Protecting Your Digital Assets', date: '2026-08-03', category: 'Estate & Security', readMin: 3,
      summary: 'Estate plans often stop at real estate and investment accounts, but email, photos, crypto wallets, airline miles and social profiles need a plan too — or loved ones may never get access.',
      takeaways: ['Start with an inventory of every digital asset, from bank logins to photo libraries and reward points.', 'Use a password manager with a legacy or emergency contact rather than listing passwords in a will.', 'Ask your attorney to authorize a trusted person to manage digital accounts in your estate documents.'],
      keywords: ['digital assets', 'estate', 'password', 'crypto', 'cryptocurrency', 'legacy contact', 'photos', 'social media', 'executor'] },
    { slug: 'what-to-do-when-the-stock-market-drops', title: 'What to Do When the Stock Market Drops', date: '2026-07-02', category: 'Markets & Behavior', readMin: 3,
      summary: 'When markets fall, the instinct is to act. The data says reacting costs real wealth — and that the true value of an advisor shows up in the moments you want to do something.',
      takeaways: ['Investors who reacted to market conditions accumulated roughly 22% less wealth over 20 years than those who held (DALBAR).', 'Knowing the right answer isn’t enough; feeling like doing nothing is reckless is what derails plans.', 'The advisor’s job in a downturn is to help you hold to the plan when holding feels hardest.'],
      keywords: ['market', 'drop', 'crash', 'volatility', 'sell', 'panic', 'downturn', 'bear', 'correction', 'dalbar', 'behavior'] },
    { slug: 'the-trouble-with-the-word-retired', title: 'The Trouble With the Word “Retired”', date: '2026-07-02', category: 'Retirement', readMin: 3,
      summary: '“What do you do?” gets harder to answer after a career ends. The label you choose shapes how you spend your days — so try on a few.',
      takeaways: ['“Retired” can sound like a finish line and flatten decades of accomplishment.', 'Language shapes reality: calling yourself a writer or a volunteer suggests you’re in the middle of something.', 'There’s no rule that you have to pick one identity and stick with it.'],
      keywords: ['retired', 'retirement', 'identity', 'purpose', 'lifestyle', 'what do you do'] },
    { slug: 'trump-accounts-are-they-right-for-your-family', title: 'Trump Accounts: Are they right for your family?', date: '2026-07-02', category: 'Family & Legacy', readMin: 2, external: true, source: '&Partners',
      summary: 'A guide to the new child investment account: what Trump Accounts (530A IRAs) are, and how they compare to other popular accounts for children.',
      takeaways: ['Trump Accounts are a new type of child investment account, sometimes referred to as 530A IRAs.', 'The guide includes a comparison chart against other popular accounts for children.', 'Whether one fits depends on your family’s goals, timeline and existing accounts — a good conversation to have with your advisor.'],
      keywords: ['trump account', '530a', 'child', 'children', 'kids', '529', 'custodial', 'new account'] },
    { slug: 'prism-2026-second-half-outlook', title: 'Prism 2026 Second Half Outlook — Positioning portfolios for higher inflation', date: '2026-06-23', category: 'Markets & Outlook', readMin: 2, external: true, source: '&Partners',
      summary: 'Take a holistic approach to managing inflation, and other investment recommendations for the second half of 2026.',
      takeaways: ['A holistic approach to managing inflation across the whole portfolio, not one asset class.', 'Investment recommendations for the second half of 2026.', 'Outlook resources are general in nature; positioning should be tailored to your plan.'],
      keywords: ['outlook', 'inflation', '2026', 'second half', 'positioning', 'prism', 'economy', 'rates'] },
    { slug: 'rapid-response-spacex-ipo', title: 'Rapid Response: SpaceX IPO', date: '2026-06-11', category: 'Markets & Outlook', readMin: 2, external: true, source: '&Partners',
      summary: 'The largest IPO in history is here. Explore the key drivers, market dynamics, and investment implications of SpaceX’s debut.',
      takeaways: ['A rapid-response brief on the SpaceX IPO and its market dynamics.', 'Covers key drivers and investment implications of the debut.', 'IPOs can be volatile; participation should be considered in the context of a diversified plan.'],
      keywords: ['spacex', 'ipo', 'initial public offering', 'stock', 'debut', 'rapid response'] },
    { slug: 'protect-yourself-from-financial-fraud', title: 'Protect Yourself from Financial Fraud', date: '2026-06-09', category: 'Estate & Security', readMin: 2, external: true, source: '&Partners',
      summary: 'Scams are getting more sophisticated, but you can take steps to help protect yourself. Learn how to spot fraud and stay safe.',
      takeaways: ['Scams increasingly impersonate institutions, family members and even advisors.', 'Verify unexpected requests through a known phone number before acting.', 'Your advisor and custodian will never pressure you to move money urgently.'],
      keywords: ['fraud', 'scam', 'phishing', 'security', 'identity theft', 'protect', 'safe'] }
  ];

  const faqs = [
    { id: 'fees', q: 'How are you compensated and what are your fees?', tags: ['fee', 'fees', 'cost', 'compensation', 'charge', 'expensive', 'commission'],
      a: 'Transparency is one of our core values: we are committed to being upfront about the fees associated with our services so there are no surprises. Fees depend on the services and account types involved, so the clearest answer comes from a short conversation about your situation. We also actively work to reduce clients’ overall wealth management expenses so they keep more of their returns.' },
    { id: 'custodian', q: 'Where are my assets held?', tags: ['custodian', 'custody', 'fidelity', 'nfs', 'national financial', 'held', 'safe', 'assets held'],
      a: '&Partners has selected Fidelity Investments, through its broker-dealer National Financial Services LLC (NFS), as our primary custodian. Client assets are held at NFS, one of the longest-standing private financial services companies in the United States.' },
    { id: 'andpartners', q: 'What is &Partners?', tags: ['&partners', 'andpartners', 'and partners', 'broker', 'affiliated', 'platform'],
      a: 'Securities and investment advisory services are offered through &Partners, LLC, a broker-dealer and investment adviser registered with the U.S. Securities and Exchange Commission and a member of FINRA/SIPC. We are proud to be affiliated with &Partners, a wealth management platform offering advanced technology, a comprehensive investment platform and premium service.' },
    { id: 'become-client', q: 'How do I become a client?', tags: ['become a client', 'get started', 'start', 'new client', 'work with you', 'onboard', 'minimum', 'minimums'],
      a: 'It starts with a conversation. We’ll listen to what you’re trying to accomplish, walk through how we work, and be upfront about fees. If it’s a fit, we design a plan around your goals and manage it with you through every life stage. Call 585-833-7022 or use the contact page — and if you’d like, I can collect a few details right here to request an introduction.' },
    { id: 'location', q: 'Where are you located?', tags: ['location', 'office', 'address', 'where', 'pittsford', 'rochester', 'directions', 'visit'],
      a: 'Our office is at 40A Grove Street, Suite 200, Pittsford, NY 14534 — just outside Rochester. We meet in person or by telephone, whichever you prefer. Phone: 585-833-7022.' },
    { id: 'referral', q: 'Can you talk with a family member or friend?', tags: ['friend', 'family member', 'refer', 'referral', 'parents', 'someone i know', 'second opinion'],
      a: 'Absolutely. If a family member or friend has a question about their retirement plan and you think they could benefit from our approach, let us know. We are happy to meet with them — there’s no obligation.' },
    { id: 'ricp', q: 'What does RICP® mean?', tags: ['ricp', 'designation', 'certified', 'credential', 'retirement income certified'],
      a: 'RICP® stands for Retirement Income Certified Professional®. The curriculum provides advanced knowledge of retirement income styles and planning strategies — turning a lifetime of savings into a reliable income after the paychecks stop. Peter Noto holds the RICP® designation.' },
    { id: 'forbes', q: 'Tell me about the Forbes recognition.', tags: ['forbes', 'award', 'recognized', 'best-in-state', 'ranking', 'shook'],
      a: 'Trident Wealth Management Group was named a Forbes Best-In-State Wealth Management Team (New York) in 2024. The rating was presented in January 2024 using data gathered from March 2022 through March 2023 by SHOOK Research, LLC, which does not receive compensation from advisors or firms for placement. Investment performance is not a criterion, and the rating is not related to the quality of the investment advice.' },
    { id: 'trident', q: 'Why the trident?', tags: ['trident', 'logo', 'name', 'mark dick', 'founder', 'frogman', 'navy', 'history'],
      a: 'Our name and logo pay homage to our founder Mark Dick — a tribute to his military service as a Navy Frogman, the predecessor to today’s Navy SEALs. The trident also represents the power of three: Strength, Skill and Value. Mark inspired countless advisors across the industry and inspired our team to carry on his principles.' },
    { id: 'communication', q: 'How often will I hear from you?', tags: ['communication', 'meet', 'how often', 'reviews', 'check in', 'contact me', 'engagement'],
      a: 'We customize our engagement schedule to fit each client’s communication preferences, and we are available in person or by telephone to answer questions, listen to concerns, or make updates to the plan.' },
    { id: 'buffered', q: 'What are buffered or hedged portfolios?', tags: ['buffered', 'buffer', 'hedge', 'hedged', 'downside protection', 'options'],
      a: 'Depending on a client’s situation, we may suggest strategic risk management techniques. Traditional hedging and/or “buffered” portfolios can help preserve portfolios from stock market volatility while still allowing for capped participation in growth. Whether they fit depends on your goals, timeline and comfort with trade-offs.' },
    { id: 'tax', q: 'How do you help with taxes?', tags: ['tax', 'taxes', 'tax-loss', 'harvest', 'after-tax', 'tax alpha'],
      a: 'Our tax alpha strategies aim to minimize the impact of taxes on non-qualified (taxable) assets. Using tax-loss harvesting and disciplined buy/sell strategies, we work to potentially reduce tax liabilities and increase after-tax returns. We coordinate with your CPA; we do not provide tax or legal advice.' }
  ];

  const portals = [
    { id: 'wealthscape', name: 'Wealthscape Investor Portal', by: 'Fidelity / National Financial Services', href: 'https://www.mystreetscape.com/auth/andpartners/login',
      desc: 'Fidelity’s Wealthscape portal provides you access to your money and investment assets, with real-time activity updates.',
      features: ['Add or move money', 'Deposit checks (mobile app only)', 'Move money between your bank and brokerage accounts', 'Access investment and account statements', 'Access tax documents', 'Enroll in eDelivery and manage delivery preferences'],
      note: 'Wealthscape provides real time activity updates. First party standing instructions are needed to move money.' },
    { id: 'envestnet', name: 'Envestnet Investor Portal', by: 'Envestnet', href: 'https://client.envestnet.com/login?_channel=oberon',
      desc: 'Your advised account portal. Envestnet provides an aggregate overview of all of your advised assets and a big-picture view of your financial life.',
      features: ['Aggregate all external accounts', 'Comprehensive view of all advised accounts and performance', 'Securely review and share documents with your advisor (coming soon)', 'Access planning tools and documents (coming soon)'],
      note: 'The Envestnet Client Portal provides activity and position data as of the previous night’s close.' }
  ];

  const pages = [
    { title: 'Home', href: 'index.html', desc: 'Strength. Skill. Value.', icon: 'home', kind: 'Page' },
    { title: 'Strength — Our Team', href: 'strength.html', desc: 'Meet the advisors and the story behind the trident', icon: 'chain', kind: 'Page' },
    { title: 'Skill — What We Do', href: 'skill.html', desc: 'Wealth management, retirement income, hedging, tax alpha', icon: 'gear', kind: 'Page' },
    { title: 'Value — How We Work', href: 'value.html', desc: 'Transparency, client first, quality advice at a fair price', icon: 'pipes', kind: 'Page' },
    { title: 'Insights', href: 'insights.html', desc: 'Articles, outlooks and resources', icon: 'doc', kind: 'Page' },
    { title: 'Planning Lab', href: 'planning-lab.html', desc: 'Interactive retirement, scenario and Social Security tools', icon: 'flask', kind: 'Page' },
    { title: 'Client Login', href: 'client-login.html', desc: 'Wealthscape and Envestnet portals', icon: 'lock', kind: 'Page' },
    { title: 'Contact', href: 'contact.html', desc: '40A Grove Street, Pittsford NY · 585-833-7022', icon: 'pin', kind: 'Page' },
    { title: 'Disclosures', href: 'disclosures.html', desc: 'Regulatory information and site disclosures', icon: 'shield', kind: 'Page' }
  ];

  const firm = {
    name: 'Trident Wealth Management Group',
    short: 'Trident Wealth',
    tagline: 'Strength. Skill. Value.',
    phone: '585-833-7022',
    phoneHref: 'tel:585-833-7022',
    address: '40A Grove Street, Suite 200',
    city: 'Pittsford, NY 14534',
    mapLat: 43.0963, mapLon: -77.5160,
    linkedin: 'https://www.linkedin.com/company/trident-wealth-management-group/',
    brokercheck: 'https://brokercheck.finra.org',
    andpartners: 'https://andpartners.com/',
    andpartnersDisclosures: 'https://andpartners.com/disclosures/',
    finra: 'https://www.finra.org/', sipc: 'https://www.sipc.org/',
    founder: 'Mark Dick',
    founderImg: IMG + '2024/08/AAA-Mark-Dick-new-photo_640x640-jpg.webp',
    teamPhoto: IMG + '2025/09/team-photo-cropped-1024x683.avif',
    officePhoto: IMG + '2025/09/004A0904-1024x683.avif',
    legal: [
      'Securities and investment advisory services offered through &Partners, LLC, a broker-dealer and investment adviser registered with the U.S. Securities and Exchange Commission and member FINRA/SIPC.',
      '&Partners has selected Fidelity Investments (Fidelity) through its broker-dealer National Financial Services LLC (NFS) as our primary custodian. Fidelity Investments is one of the longest-standing private financial services companies in the United States. Fidelity utilizes NFS for the purposes of providing custody and clearing services.',
      'Registered Representatives are registered to conduct securities business and licensed to conduct insurance business in limited states. Response to, or contact with, residents of other states will only be made upon compliance with applicable licensing and registration requirements. The information in this website is for U.S. residents only and does not constitute an offer to sell, or a solicitation of an offer to purchase brokerage services to persons outside of the United States.',
      'This site is for information purposes and should not be construed as legal or tax advice and is not intended to replace the advice of a qualified attorney, financial or tax advisor or plan provider.'
    ],
    forbes: 'The Forbes Best-In-State Wealth Management Team (New York) rating was presented in January 2024 using data gathered from March 2022 through March 2023 by SHOOK Research, LLC, which does not receive compensation from the advisors or their firms in exchange for placement on a rating. It uses a rating algorithm that is based on a measure of each team’s best practices, client retention, industry experience, compliance records, firm nominations, assets under management and revenue generated for their firm. Investment performance is not a criterion. Self-completed survey was used for rating. This rating is not related to the quality of the investment advice and based solely on the disclosed criteria.'
  };

  window.TWM = { icons, team, support, pillars, services, valueProps, articles, faqs, portals, pages, firm };
})();
