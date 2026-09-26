/**
 * Single source of truth for the website's copy and company details.
 * Edit this file to update text, services or contact information — the
 * components render everything from here.
 */

export const company = {
  name: 'Direct Tax Solutions Ltd',
  shortName: 'Direct Tax Solutions',
  number: '13431046',
  jurisdiction: 'England & Wales',
  /** Professional designation shown beside the company name. */
  designation: 'Chartered Certified Accountants (ACCA)',
  director: 'Nisar Aziz',
  email: 'info@directtaxsolutions.co.uk',
  phone: {
    display: '07508 411889',
    e164: '+447508411889',
  },
  address: {
    street: '64 Prince Regent Lane',
    locality: 'London',
    postcode: 'E13 8QQ',
    country: 'GB',
  },
  url: 'https://directtaxsolutions.co.uk',
} as const;

export const links = {
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${company.address.street}, ${company.address.locality} ${company.address.postcode}`,
  )}`,
  email: `mailto:${company.email}`,
  phone: `tel:${company.phone.e164}`,
  whatsapp: `https://wa.me/${company.phone.e164.replace('+', '')}`,
  companiesHouse: `https://find-and-update.company-information.service.gov.uk/company/${company.number}`,
} as const;

export const formEndpoint = `https://formsubmit.co/${company.email}`;
export const formAjaxEndpoint = `https://formsubmit.co/ajax/${company.email}`;

export const seo = {
  title: 'Direct Tax Solutions Ltd | Chartered Certified Accountants (ACCA) & Tax Advisors in London',
  description:
    'London Chartered Certified Accountants (ACCA), tax advisors and business mentors. Accounting, VAT, Making Tax Digital, payroll, company formation and tax services for small and medium sized businesses.',
} as const;

export const nav = [
  { label: 'Home', href: '/#home', id: 'home' },
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'Services', href: '/#services', id: 'services' },
  { label: 'Contact', href: '/#contact', id: 'contact' },
] as const;

/** Two-digit section number matching the menu order (Home 01, About 02, …). */
export function sectionNumber(id: (typeof nav)[number]['id']): string {
  return String(nav.findIndex((item) => item.id === id) + 1).padStart(2, '0');
}

export const hero = {
  eyebrow: 'Welcome to Direct Tax Solutions Ltd',
  // The title is split so the accent words can be styled differently.
  title: [
    { text: 'Committed to helping you reach the' },
    { text: 'right accounting solution', accent: true },
  ],
  lead: 'Providing expert chartered certified accountancy guidance and support to small and medium sized businesses.',
  audiences: ['New business start-ups', 'Established organisations', 'Rapidly growing concerns'],
} as const;

export const about = {
  heading: {
    before: 'An emerging chartered certified accountancy firm with',
    highlight: 'several years of experience',
  },
  /** Revealed word by word on scroll; `key` segments are emphasised. */
  statement: [
    { text: 'Direct Tax Solutions Ltd is a firm of' },
    { text: `${company.designation}, tax advisors and business mentors.`, key: true },
    { text: 'We have been supporting the growth of businesses just like yours.' },
  ],
  intro:
    'Whether you are a new business start-up, an established organisation or a rapidly growing concern, we have developed a broad portfolio of cost-effective services that can be',
  introHighlight: 'tailored to your specific circumstances.',
  audiences: [
    { icon: 'startup', title: 'New business start-ups' },
    { icon: 'established', title: 'Established organisations' },
    { icon: 'growth', title: 'Rapidly growing concerns' },
  ],
  features: [
    {
      visual: 'ledger',
      title: 'Financial accounting',
      text: 'Preparation of final and statutory accounts for sole traders, partnerships, limited liability partnerships and limited companies. Filing of the final accounts and returns to Companies House.',
    },
    {
      visual: 'forecast',
      title: 'Budgeting and forecasting',
      text: 'Preparing forecasts and budgets for business start-ups. Constant periodic review of the budget and forecasts for fundraising and management purposes.',
    },
    {
      visual: 'variance',
      title: 'Management accounting',
      text: 'Monthly, quarterly or yearly preparation of management accounts. Preparation of variances for the various costs for effective control. Analysis of the variances for management.',
    },
  ],
  vision: {
    label: 'Our vision',
    statement: { before: 'In-depth accounting insight and', accent: 'substantial industry experience.' },
    promise: 'Committed to helping you reach the right accounting solution.',
  },
} as const;

/** Client types named across the original copy, shown in the scrolling ribbon. */
export const clientTypes = [
  [
    'Sole traders',
    'Partnerships',
    'Limited liability partnerships',
    'Limited companies',
    'Contractors & subcontractors',
  ],
  [
    'New business start-ups',
    'Established organisations',
    'Rapidly growing concerns',
    'Entrepreneurs',
    'Intermediaries',
  ],
] as const;

export type ServiceIcon =
  | 'formation'
  | 'vat'
  | 'payroll'
  | 'personal-tax'
  | 'corporation-tax'
  | 'business-tax';

export const services: ReadonlyArray<{
  icon: ServiceIcon;
  title: string;
  /** Used to pre-fill the contact form when a visitor clicks “Enquire”. */
  topic: string;
  text: string;
}> = [
  {
    icon: 'formation',
    title: 'Company formation',
    topic: 'company formation',
    text: 'We offer you support and guidance in forming your own company, every step of the way. You can rest assured that you are in safe hands. Whether you are an intermediary representing a group of clients or an entrepreneur setting up for the first time, you can expect from us an unrivalled quality of service.',
  },
  {
    icon: 'vat',
    title: 'VAT',
    topic: 'VAT',
    text: 'Prepare and provide excellent VAT services to clients. Advise on and apply the suitable VAT scheme for clients’ businesses. Compute the correct VAT due using the right scheme. Submit the approved, completed VAT return online on behalf of clients.',
  },
  {
    icon: 'payroll',
    title: 'Payroll and PAYE',
    topic: 'payroll and PAYE',
    text: 'All PAYE and payroll matters. Preparation of weekly or monthly payslips for employees and directors. Preparation of pay and deduction statements for subcontractors. Preparation of CIS monthly and annual returns for contractors and their online submission to HMRC.',
  },
  {
    icon: 'personal-tax',
    title: 'Personal income tax',
    topic: 'personal income tax',
    text: 'Prepare clients’ self-assessment returns and submit them online. Assist and advise clients on various personal tax matters, including tax investigations, enquiries and interventions. Tax refunds and repayment claims for clients, including subcontractors’ tax repayment claims. Represent clients in dispute resolution with HM Revenue and Customs. Tribunal representation and case handling.',
  },
  {
    icon: 'corporation-tax',
    title: 'Corporation tax',
    topic: 'corporation tax',
    text: 'General advice and assistance in complying with the company’s corporation tax matters. Assist in computing the correct amount of corporation tax liabilities and setting off the right amount of deductions for the company for the year, including CIS set-offs. Filing the corporation tax returns online for the company, including joint filing with Companies House.',
  },
  {
    icon: 'business-tax',
    title: 'Business income tax',
    topic: 'business income tax',
    text: 'Assist clients in their business tax compliance. Compute the business tax liabilities and file the business tax returns online. Assist and advise client businesses on various tax issues, including tax investigations, enquiries and interventions. Represent the business in all matters of taxation, including representation at tribunals.',
  },
];

/**
 * Making Tax Digital panel in the services section.
 * Keep the rollout dates in line with HMRC's published timetable.
 */
export const mtd = {
  label: 'Making Tax Digital',
  heading: { before: 'Ready for', accent: 'Making Tax Digital' },
  intro:
    'HMRC’s Making Tax Digital (MTD) rules require businesses to keep digital records and send their updates and returns to HMRC through compatible software. We get you set up, keep your records in order and handle the submissions for you — whether you are self-employed or VAT-registered.',
  topic: 'Making Tax Digital',
  groups: [
    {
      icon: 'user',
      title: 'Self-employed',
      scheme: 'MTD for Income Tax',
      points: [
        'Check whether and when MTD for Income Tax applies to you',
        'Choose and set up HMRC-recognised software',
        'Keep digital records of your income and expenses',
        'Send your quarterly updates and file your tax return on time',
      ],
    },
    {
      icon: 'receipt',
      title: 'VAT-registered businesses',
      scheme: 'MTD for VAT',
      points: [
        'Sign up for MTD for VAT and connect compatible software',
        'Keep digital VAT records, including bridging from spreadsheets',
        'Prepare, check and file your VAT returns online',
        'Keep on top of deadlines to avoid late-submission penalties',
      ],
    },
  ],
  timeline: [
    { date: '2022-04-01', label: 'April 2022', scheme: 'VAT', text: 'All VAT-registered businesses' },
    { date: '2026-04-06', label: 'April 2026', scheme: 'Income Tax', text: 'Qualifying income over £50,000' },
    { date: '2027-04-06', label: 'April 2027', scheme: 'Income Tax', text: 'Qualifying income over £30,000' },
    { date: '2028-04-06', label: 'April 2028', scheme: 'Income Tax', text: 'Qualifying income over £20,000' },
  ],
  note: 'Qualifying income is your total income from self-employment and property, before expenses.',
} as const;

export const contact = {
  heading: { before: 'Get in touch with our', accent: 'office' },
  formTitle: 'Drop us a line',
} as const;
