import { NavLink, ProcessStep, Project, ServiceItem, SocialLink, StatItem, Testimonial, ToolItem } from '../types';

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
export const PORTRAIT_URL = '/assets/portrait-shen.jpg';
export const HERO_ABSTRACT_URL = '/assets/hero-abstract.jpg';

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
    categoryLabel: 'Brand & Social Media',
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
  },
  {
    slug: 'nifty-academy',
    title: 'Nifty Academy',
    category: 'UI/UX',
    categoryLabel: 'Education & Digital Design',
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
  },
  {
    slug: 'creative-brand-identity',
    title: 'Creative Brand Identity',
    category: 'Branding',
    categoryLabel: 'Branding',
    client: 'Studio Client',
    year: '2024',
    description: 'A monochrome identity system with a single electric accent, applied across stationery, signage and packaging.',
    objective: 'Give a young studio a mark with enough restraint to age well and enough character to stand out on a shelf.',
    process: 'Sketching, logo grid construction, then a full guideline document covering spacing, misuse, colour behaviour on dark and light surfaces, and print specification.',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    thumbnail: '/assets/work-identity.jpg',
    hero: '/assets/work-identity.jpg',
    gallery: ['/assets/work-identity.jpg', '/assets/work-campaign.jpg'],
    shape: 'wide',
  },
  {
    slug: 'youtube-thumbnail-collection',
    title: 'YouTube Thumbnail Collection',
    category: 'Thumbnails',
    categoryLabel: 'YouTube / Social Media',
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
  },
  {
    slug: 'modern-business-campaign',
    title: 'Modern Business Campaign',
    category: 'T Shirt',
    categoryLabel: 'T Shirt Design',
    client: 'Regional Retail Brand',
    year: '2024',
    description: 'A cross-channel advertising campaign built on bold type and gradient light, running across print posters and paid social.',
    objective: 'One campaign idea that survives every format, from a wall-mounted poster to a nine-second vertical video.',
    process: 'Concept development and key visual, then adaptation into a format matrix with locked type hierarchy so every placement stayed on-brand.',
    tools: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects'],
    thumbnail: '/assets/work-campaign.jpg',
    hero: '/assets/work-campaign.jpg',
    gallery: ['/assets/work-campaign.jpg', '/assets/work-identity.jpg'],
    shape: 'tall',
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
    name: 'Amara Silva',
    role: 'Founder, Lumen Studio',
    initials: 'AS',
    quote: 'The identity we got back was sharper than the brief we wrote. Every file was organised, documented and ready to hand to our developers the same day.',
  },
  {
    name: 'Dev Rajan',
    role: 'Content Creator, 180K subscribers',
    initials: 'DR',
    quote: 'Thumbnails stopped being the bottleneck. Click-through went up across the channel and the visual style finally feels like it belongs to one creator.',
  },
  {
    name: 'Chloe Whitfield',
    role: 'Marketing Lead, Northbound',
    initials: 'CW',
    quote: 'Fast, calm and genuinely strategic. Our campaign ran across print and paid social without a single layout falling apart.',
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
