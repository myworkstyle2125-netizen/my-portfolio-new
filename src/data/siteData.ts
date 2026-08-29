import { Category, NavLink, ProcessStep, Project, ServiceItem, SocialLink, StatItem, Testimonial, ToolItem } from '../types';

export const SITE_CONFIG = {
  name: 'NIFTYGRAPHY',
  tagline: 'Designing ideas into visual experiences.',
  email: 'niftygraphy24@gmail.com',
  whatsapp: {
    label: '+94 75 970 0219',
    href: 'https://wa.me/94759700219',
    number: '94759700219',
  },
  location: 'Colombo, Sri Lanka — working worldwide',
  web3formsAccessKey: 'ea68176f-c38c-48ab-942b-889a09b8bdc8',
  socials: [
    { label: 'WhatsApp', href: 'https://wa.me/94759700219' },
    { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029VanZieE8KMqhmpZM3t3i' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61555615503916' },
    { label: 'Instagram', href: 'https://www.instagram.com/nifty__graphy/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@niftygraphy' },
    { label: 'YouTube', href: 'https://youtube.com/@niftygraphy' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/p-d-yadeesha-shen-perera-624b1b349' },
  ] as SocialLink[],
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Works', href: '#works' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ] as NavLink[],
};

export const LOGO_URL = '/assets/niftygraphy-logo.jpg';
export const PORTRAIT_URL = 'https://i.imgur.com/R7RzgEg.jpg';
export const HERO_ABSTRACT_URL = '/assets/hero-abstract.jpg';

export const ABOUT_SLIDES = [
  {
    url: 'https://i.imgur.com/TANZYbs.jpeg',
    alt: "Creator's Vision - The Art of Creation",
    caption: "The Art of Creation",
    subtitle: "Creative Direction & Production",
  },
  {
    url: 'https://i.imgur.com/R7RzgEg.jpg',
    alt: "P.D. Yadeesha Shen Perera - Studio Portrait",
    caption: "Shen Perera",
    subtitle: "Independent Graphic Designer",
  },
  {
    url: 'https://i.imgur.com/Zg3eby0.jpg',
    alt: "Focus and Determination - Niftygraphy",
    caption: "The Silent Craft",
    subtitle: "Precision & Visual Identity",
  },
  {
    url: 'https://i.imgur.com/fhVm1r2.jpg',
    alt: "Violet Glitch & Motion Aesthetic Portrait",
    caption: "Creative Velocity",
    subtitle: "Modern Motion & Glitch Aesthetics",
  },
];

export const STATS: StatItem[] = [
  { value: '150+', label: 'Projects Completed' },
  { value: '60+', label: 'Happy Clients' },
  { value: '3+', label: 'Years Experience' },
  { value: '15+', label: 'Creative Services' },
];

export const SKILLS_LIST = [
  'Adobe Photoshop',
  'Adobe Illustrator',
  'Adobe Premiere Pro',
  'Adobe After Effects',
  'Figma',
  'Canva',
  'Branding',
  'Social Media Design',
  'Thumbnail Design',
  'UI Design',
];

export const APPROVED_PROJECT_CATEGORIES = [
  'Branding',
  'Social Media',
  'Thumbnails',
  'T Shirt',
  'UI/UX',
  'Print Design',
] as const;

export const APPROVED_CATEGORY_ITEMS: Category[] = [
  { id: 'cat-1', name: 'Branding', slug: 'branding', description: 'Logo design, brand identity, and complete visual systems', displayOrder: 1, published: true },
  { id: 'cat-2', name: 'Social Media', slug: 'social-media', description: 'Carousels, posts, banners, and feed templates', displayOrder: 2, published: true },
  { id: 'cat-3', name: 'Thumbnails', slug: 'thumbnails', description: 'High-CTR YouTube and video thumbnails', displayOrder: 3, published: true },
  { id: 'cat-4', name: 'T Shirt', slug: 't-shirt', description: 'Apparel graphic design, merchandise, and vector artwork', displayOrder: 4, published: true },
  { id: 'cat-5', name: 'UI/UX', slug: 'ui-ux', description: 'Web design, mobile interfaces, and digital experiences', displayOrder: 5, published: true },
  { id: 'cat-6', name: 'Print Design', slug: 'print-design', description: 'Posters, flyers, business cards, and stationery', displayOrder: 6, published: true },
];

export const CATEGORIES = [
  'All',
  'Branding',
  'Social Media',
  'Thumbnails',
  'T Shirt',
  'UI/UX',
  'Print Design',
];

export const PORTFOLIO_PROJECTS: Project[] = [
  {
    slug: 'jck-crypto-exchange',
    title: 'JCK Crypto Exchange',
    category: 'Branding',
    categoryLabel: 'Brand & Identity',
    client: 'JCK Exchange',
    year: '2025',
    description: 'A complete visual identity and social media system for a crypto trading platform that needed to feel secure, fast and unmistakably modern.',
    objective: 'Build trust in a crowded market. The brand had to read as institutional-grade while staying approachable for first-time traders.',
    process: "Started with market and competitor mapping, then built a geometric mark from the exchange's candlestick motif. The identity was extended into a gradient-led social system with reusable templates for market updates, launches and announcements.",
    tools: ['Illustrator', 'Photoshop', 'Figma', 'After Effects'],
    thumbnail: '/assets/work-jck.jpg',
    hero: '/assets/work-jck.jpg',
    gallery: ['/assets/work-jck.jpg', '/assets/work-social.jpg', '/assets/work-identity.jpg'],
    shape: 'wide',
    featured: true,
  },
  {
    slug: 'nifty-academy',
    title: 'Nifty Academy Platform',
    category: 'UI/UX',
    categoryLabel: 'UI/UX & Web Design',
    client: 'Nifty Academy',
    year: '2025',
    description: 'Digital design language and course branding for an online learning platform, covering the marketing site, lesson interface and content templates.',
    objective: 'Make long study sessions comfortable and make every course feel like part of one family without flattening their individual personalities.',
    process: 'Defined a dark-first interface palette with per-course accent colours, built a type scale tuned for dense reading, then produced a component kit that the team can extend for new courses.',
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    thumbnail: '/assets/work-academy.jpg',
    hero: '/assets/work-academy.jpg',
    gallery: ['/assets/work-academy.jpg', '/assets/work-social.jpg'],
    shape: 'tall',
    featured: true,
  },
  {
    slug: 'creative-brand-identity',
    title: 'Creative Brand Identity',
    category: 'Branding',
    categoryLabel: 'Branding',
    client: 'Studio Noir',
    year: '2024',
    description: 'A monochrome identity system with a single electric accent, applied across stationery, signage and packaging.',
    objective: 'Give a young studio a mark with enough restraint to age well and enough character to stand out on a shelf.',
    process: 'Sketching, logo grid construction, then a full guideline document covering spacing, misuse, colour behaviour on dark and light surfaces, and print specification.',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    thumbnail: '/assets/work-identity.jpg',
    hero: '/assets/work-identity.jpg',
    gallery: ['/assets/work-identity.jpg', '/assets/work-campaign.jpg'],
    shape: 'wide',
    featured: true,
  },
  {
    slug: 'youtube-thumbnail-collection',
    title: 'YouTube Thumbnail Collection',
    category: 'Thumbnails',
    categoryLabel: 'Thumbnails',
    client: 'Multiple Creators',
    year: '2025',
    description: 'A running series of high-contrast thumbnails designed around one rule: readable at 200 pixels wide.',
    objective: "Lift click-through rate without resorting to clickbait. Each thumbnail had to communicate the video's promise in under a second.",
    process: 'Built a repeatable formula — isolated subject, controlled colour temperature, three-word maximum type block — then tested variants against channel analytics and refined the winners.',
    tools: ['Photoshop', 'Illustrator'],
    thumbnail: '/assets/work-thumbnails.jpg',
    hero: '/assets/work-thumbnails.jpg',
    gallery: ['/assets/work-thumbnails.jpg', '/assets/work-social.jpg'],
    shape: 'wide',
    featured: true,
  },
  {
    slug: 'modern-business-campaign',
    title: 'Modern Business Campaign',
    category: 'T Shirt',
    categoryLabel: 'T Shirt & Apparel',
    client: 'Regional Retail Brand',
    year: '2024',
    description: 'A cross-channel advertising campaign built on bold type and gradient light, running across print posters, apparel and paid social.',
    objective: 'One campaign idea that survives every format, from apparel print to a wall-mounted poster and vertical video.',
    process: 'Concept development and key visual, then adaptation into a format matrix with locked type hierarchy so every placement stayed on-brand.',
    tools: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects'],
    thumbnail: '/assets/work-campaign.jpg',
    hero: '/assets/work-campaign.jpg',
    gallery: ['/assets/work-campaign.jpg', '/assets/work-identity.jpg'],
    shape: 'tall',
    featured: true,
  },
  {
    slug: 'social-media-design-collection',
    title: 'Social Media Design Collection',
    category: 'Social Media',
    categoryLabel: 'Social Media',
    client: 'Assorted Brands',
    year: '2025',
    description: 'Post, story and carousel systems designed for brands that publish daily and need speed without losing craft.',
    objective: 'Make consistent output possible for small teams — templates that are hard to break and quick to fill.',
    process: 'Audited each brand’s feed, defined a modular grid and a fixed set of layout archetypes, then delivered editable Figma and Canva kits with usage notes.',
    tools: ['Figma', 'Photoshop', 'Canva'],
    thumbnail: '/assets/work-social.jpg',
    hero: '/assets/work-social.jpg',
    gallery: ['/assets/work-social.jpg', '/assets/work-jck.jpg', '/assets/work-thumbnails.jpg'],
    shape: 'wide',
    featured: true,
  },
];

export const SERVICES: ServiceItem[] = [
  {
    iconName: 'fingerprint',
    title: 'Brand Identity',
    description: 'Building memorable brands through creative logos, visual identities, and consistent design systems.',
  },
  {
    iconName: 'layers',
    title: 'Social Media Design',
    description: 'Creating eye-catching social media visuals that capture attention and keep your brand engaging.',
  },
  {
    iconName: 'youtube',
    title: 'YouTube Thumbnails',
    description: 'Designing high-impact thumbnails that grab attention, increase clicks, and make your content stand out.',
  },
  {
    iconName: 'shirt',
    title: 'T-Shirt Design',
    description: 'Creating bold and creative T-shirt designs for brands, events, teams, and personal collections.',
  },
  {
    iconName: 'monitor',
    title: 'UI/UX Design',
    description: 'Designing clean and modern interfaces focused on usability, visual appeal, and seamless experiences.',
  },
  {
    iconName: 'printer',
    title: 'Print Design',
    description: 'Crafting professional posters, flyers, brochures, business cards, and other print materials.',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  { n: '01', title: 'Discover', text: 'Understand the brand, audience and objective.' },
  { n: '02', title: 'Research', text: 'Explore references, competitors, trends and visual directions.' },
  { n: '03', title: 'Concept', text: 'Develop creative concepts and visual directions.' },
  { n: '04', title: 'Design', text: 'Transform the concept into polished visual assets.' },
  { n: '05', title: 'Refine', text: 'Review, improve and perfect every detail.' },
  { n: '06', title: 'Deliver', text: 'Provide final professional assets ready for use.' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    name: 'Amara Silva',
    role: 'Founder, Lumen Studio - Sri Lanka',
    initials: 'AS',
    quote: 'Niftygraphy එක්ක වැඩ කරන්න ලැබුණු එක ලොකු පහසුවක් වුණා. අපේ Brand identity එක සහ social media designs ටික අපි හිතුවටත් වඩා ගොඩක් Quality එකට, වෙලාවටම ready කරලා දුන්නා.',
    rating: 5,
    status: 'approved',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'testi-2',
    name: 'Dev Rajan',
    role: 'Content Creator, 180K Subscribers - India',
    initials: 'DR',
    quote: 'My YouTube CTR went up significantly within just two weeks of using these thumbnail designs. The visual hierarchy and color contrast make every video pop on the feed.',
    rating: 5,
    status: 'approved',
    createdAt: '2025-01-22T12:00:00.000Z',
  },
  {
    id: 'testi-3',
    name: 'Kavishka Perera',
    role: 'Co-Founder, Apex Digital - Sri Lanka',
    initials: 'KP',
    quote: 'අපේ Digital marketing campaign එකට අවශ්ය වුණු Banner designs සහ Post templates ටික ඉතාම professional මට්ටමෙන් ලබා දුන්නා. Great communication and fast delivery!',
    rating: 5,
    status: 'approved',
    createdAt: '2025-02-01T09:30:00.000Z',
  },
  {
    id: 'testi-4',
    name: 'Chloe Whitfield',
    role: 'Marketing Lead, Northbound - UK',
    initials: 'CW',
    quote: 'Fast, creative, and extremely detail-oriented. They handled our entire print and digital promotional materials smoothly without a single layout issue.',
    rating: 5,
    status: 'approved',
    createdAt: '2025-02-05T14:15:00.000Z',
  },
  {
    id: 'testi-5',
    name: 'Marcus Vance',
    role: 'E-Commerce Store Owner - Australia',
    initials: 'MV',
    quote: 'The apparel merch designs exceeded our expectations. All vector files were 100% print-ready, and our first T-shirt batch sold out much faster than planned.',
    rating: 5,
    status: 'approved',
    createdAt: '2025-02-12T11:00:00.000Z',
  },
  {
    id: 'testi-6',
    name: 'Elena Rostova',
    role: 'UI/UX Product Designer - USA',
    initials: 'ER',
    quote: 'Outstanding visual aesthetics! They translated our complex design brief into clean, modern graphics with incredible precision and speed.',
    rating: 5,
    status: 'approved',
    createdAt: '2025-02-18T16:45:00.000Z',
  },
];

export const TOOLKIT: ToolItem[] = [
  { name: 'Adobe Photoshop', short: 'Ps' },
  { name: 'Adobe Illustrator', short: 'Ai' },
  { name: 'Adobe Premiere Pro', short: 'Pr' },
  { name: 'Adobe After Effects', short: 'Ae' },
  { name: 'Figma', short: 'Fg' },
  { name: 'Canva', short: 'Cv' },
];

export const PROJECT_TYPES = [
  'Thumbnail Design',
  'Flyer & Poster Design',
  'Business Card & Stationaries',
  'Social Media Banners & Posts',
  'Logo & Brand Identity',
  'Graphic Design (Other)',
];

export const BUDGET_RANGES = [
  'Rs. 800 – Rs. 2,500',
  'Rs. 2,500 – Rs. 5,000',
  'Rs. 5,000 – Rs. 10,000',
  'Rs. 10,000 – Rs. 25,000',
  'Rs. 25,000+',
  'Custom / Negotiable',
];
