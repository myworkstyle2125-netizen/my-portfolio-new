import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Ensure directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

[DATA_DIR, DATA_UPLOAD_DIR, PUBLIC_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer setup for direct file upload from owner's computer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, DATA_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || 'design';
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${cleanName}-${unique}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, SVG) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max per image
});

function saveBase64Image(dataUrlOrBase64: string, originalName = 'upload.jpg'): string {
  let base64Data = dataUrlOrBase64;
  let ext = '.jpg';

  const matches = dataUrlOrBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (matches) {
    let type = matches[1].toLowerCase();
    if (type === 'jpeg') type = 'jpg';
    if (type === 'svg+xml') type = 'svg';
    ext = `.${type}`;
    base64Data = matches[2];
  } else {
    const extMatch = path.extname(originalName).toLowerCase();
    if (extMatch) ext = extMatch;
  }

  const cleanName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || 'design';
  const filename = `${cleanName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const buffer = Buffer.from(base64Data, 'base64');

  const dataPath = path.join(DATA_UPLOAD_DIR, filename);
  const publicPath = path.join(PUBLIC_UPLOAD_DIR, filename);

  fs.writeFileSync(dataPath, buffer);
  try {
    fs.writeFileSync(publicPath, buffer);
  } catch {}

  return `/uploads/${filename}`;
}

// Database initialization
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    slug: 'jck-crypto-exchange',
    title: 'JCK Crypto Exchange',
    category: 'Branding',
    categoryLabel: 'Brand & Social Media',
    client: 'JCK Exchange',
    year: '2025',
    shortDescription: 'Complete visual identity and social media design system for crypto trading.',
    description: 'A complete visual identity and social media system for a crypto trading platform that needed to feel secure, fast and unmistakably modern.',
    objective: 'Build trust in a crowded market. The brand had to read as institutional-grade while staying approachable for first-time traders.',
    process: "Started with market and competitor mapping, then built a geometric mark from the exchange's candlestick motif. The identity was extended into a gradient-led social system with reusable templates for market updates, launches and announcements.",
    challenge: 'Standing out in a competitive crypto landscape while conveying rock-solid security and intuitive usability.',
    creativeDirection: 'Dark glassmorphic layers, neon cyan and violet gradients, and sharp geometric typography.',
    results: '40% increase in social media engagement and a cohesive brand launch across 5 channels.',
    tools: ['Illustrator', 'Photoshop', 'Figma', 'After Effects'],
    servicesProvided: ['Brand Identity', 'Social Media Templates', 'Visual Guidelines', 'Motion Teasers'],
    thumbnail: '/assets/work-jck.jpg',
    hero: '/assets/work-jck.jpg',
    gallery: ['/assets/work-jck.jpg', '/assets/work-social.jpg', '/assets/work-identity.jpg'],
    shape: 'wide',
    featured: true,
    published: true,
    displayOrder: 1,
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'proj-2',
    slug: 'nifty-academy',
    title: 'Nifty Academy',
    category: 'UI/UX',
    categoryLabel: 'Education & Digital Design',
    client: 'Nifty Academy',
    year: '2025',
    shortDescription: 'Digital design language and course branding for an online learning platform.',
    description: 'Digital design language and course branding for an online learning platform, covering the marketing site, lesson interface and content templates.',
    objective: 'Make long study sessions comfortable and make every course feel like part of one family without flattening their individual personalities.',
    process: 'Defined a dark-first interface palette with per-course accent colours, built a type scale tuned for dense reading, then produced a component kit that the team can extend for new courses.',
    challenge: 'Organizing complex course materials into a distraction-free and motivating learning environment.',
    creativeDirection: 'Clean editorial typography, focused dark surface contrasts, and modular card systems.',
    results: 'Over 1,200 active students enrolled with overwhelmingly positive feedback on course clarity.',
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    servicesProvided: ['UI/UX Design', 'Design System', 'Course Thumbnails'],
    thumbnail: '/assets/work-academy.jpg',
    hero: '/assets/work-academy.jpg',
    gallery: ['/assets/work-academy.jpg', '/assets/work-social.jpg'],
    shape: 'tall',
    featured: true,
    published: true,
    displayOrder: 2,
    createdAt: new Date('2025-02-01').toISOString(),
    updatedAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'proj-3',
    slug: 'creative-brand-identity',
    title: 'Creative Brand Identity',
    category: 'Branding',
    categoryLabel: 'Branding',
    client: 'Studio Client',
    year: '2024',
    shortDescription: 'Monochrome identity system with a single electric accent across stationery and packaging.',
    description: 'A monochrome identity system with a single electric accent, applied across stationery, signage and packaging.',
    objective: 'Give a young studio a mark with enough restraint to age well and enough character to stand out on a shelf.',
    process: 'Sketching, logo grid construction, then a full guideline document covering spacing, misuse, colour behaviour on dark and light surfaces, and print specification.',
    challenge: 'Balancing minimalist restraint with distinctive brand personality that prints crisply across physical textures.',
    creativeDirection: 'High-contrast monochrome foundations accented by electric violet highlights.',
    results: 'Unified brand asset library delivered with comprehensive print-ready vector packages.',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    servicesProvided: ['Brand Identity', 'Print Design', 'Stationery Systems', 'Packaging'],
    thumbnail: '/assets/work-identity.jpg',
    hero: '/assets/work-identity.jpg',
    gallery: ['/assets/work-identity.jpg', '/assets/work-campaign.jpg'],
    shape: 'wide',
    featured: true,
    published: true,
    displayOrder: 3,
    createdAt: new Date('2024-11-20').toISOString(),
    updatedAt: new Date('2024-11-20').toISOString(),
  },
  {
    id: 'proj-4',
    slug: 'youtube-thumbnail-collection',
    title: 'YouTube Thumbnail Collection',
    category: 'Thumbnails',
    categoryLabel: 'YouTube / Social Media',
    client: 'Multiple Creators',
    year: '2025',
    shortDescription: 'High-contrast thumbnails engineered for maximum click-through rates at mobile scale.',
    description: 'A running series of high-contrast thumbnails designed around one rule: readable at 200 pixels wide.',
    objective: "Lift click-through rate without resorting to clickbait. Each thumbnail had to communicate the video's promise in under a second.",
    process: 'Built a repeatable formula — isolated subject, controlled colour temperature, three-word maximum type block — then tested variants against channel analytics and refined the winners.',
    challenge: 'Compressing storytelling into a tiny canvas that beats dense algorithmic feeds.',
    creativeDirection: 'Dynamic facial emotion cutouts, 3D rim lighting, and punchy high-contrast typography.',
    results: 'Average CTR increase of +3.8% across 12 client YouTube channels.',
    tools: ['Photoshop', 'Illustrator'],
    servicesProvided: ['YouTube Thumbnails', 'Channel Art', 'Brand Kits'],
    thumbnail: '/assets/work-thumbnails.jpg',
    hero: '/assets/work-thumbnails.jpg',
    gallery: ['/assets/work-thumbnails.jpg', '/assets/work-social.jpg'],
    shape: 'wide',
    featured: true,
    published: true,
    displayOrder: 4,
    createdAt: new Date('2025-01-28').toISOString(),
    updatedAt: new Date('2025-01-28').toISOString(),
  },
  {
    id: 'proj-5',
    slug: 'modern-business-campaign',
    title: 'Modern Business Campaign',
    category: 'T Shirt',
    categoryLabel: 'T Shirt & Apparel',
    client: 'Regional Retail Brand',
    year: '2024',
    shortDescription: 'Bold typography and vector graphics adapted for premium apparel and print collateral.',
    description: 'A cross-channel advertising campaign built on bold type and gradient light, running across print posters, apparel and paid social.',
    objective: 'One campaign idea that survives every format, from apparel print to a wall-mounted poster and vertical video.',
    process: 'Concept development and key visual, then adaptation into a format matrix with locked type hierarchy so every placement stayed on-brand.',
    challenge: 'Designing graphics that look sharp in screen printing and embroidery while maintaining visual edge on digital platforms.',
    creativeDirection: 'Futuristic streetwear aesthetics, distressed text textures, and cybernetic line art.',
    results: 'Sold out first merchandise drop within 72 hours of launch.',
    tools: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects'],
    servicesProvided: ['T-Shirt Design', 'Poster Design', 'Social Campaigns'],
    thumbnail: '/assets/work-campaign.jpg',
    hero: '/assets/work-campaign.jpg',
    gallery: ['/assets/work-campaign.jpg', '/assets/work-identity.jpg'],
    shape: 'tall',
    featured: true,
    published: true,
    displayOrder: 5,
    createdAt: new Date('2024-12-10').toISOString(),
    updatedAt: new Date('2024-12-10').toISOString(),
  },
  {
    id: 'proj-6',
    slug: 'social-media-design-collection',
    title: 'Social Media Design Collection',
    category: 'Social Media',
    categoryLabel: 'Social Media',
    client: 'Assorted Brands',
    year: '2025',
    shortDescription: 'High-engagement post, story, and carousel systems for daily publishing brands.',
    description: 'Post, story and carousel systems designed for brands that publish daily and need speed without losing craft.',
    objective: 'Make consistent output possible for small teams — templates that are hard to break and quick to fill.',
    process: 'Audited each brand’s feed, defined a modular grid and a fixed set of layout archetypes, then delivered editable Figma and Canva kits with usage notes.',
    challenge: 'Maintaining brand distinction across fast-paced daily publishing cycles.',
    creativeDirection: 'Consistent 4:5 and 9:16 layout grids, striking focal points, and branded data visualization callouts.',
    results: 'Over 200 bespoke social assets published across Instagram, TikTok, and LinkedIn.',
    tools: ['Figma', 'Photoshop', 'Canva'],
    servicesProvided: ['Carousel Design', 'Story Templates', 'Post Packs', 'Canva Kits'],
    thumbnail: '/assets/work-social.jpg',
    hero: '/assets/work-social.jpg',
    gallery: ['/assets/work-social.jpg', '/assets/work-jck.jpg', '/assets/work-thumbnails.jpg'],
    shape: 'wide',
    featured: true,
    published: true,
    displayOrder: 6,
    createdAt: new Date('2025-02-14').toISOString(),
    updatedAt: new Date('2025-02-14').toISOString(),
  },
];

const APPROVED_CATEGORY_NAMES = [
  'Branding',
  'Social Media',
  'Thumbnails',
  'T Shirt',
  'UI/UX',
  'Print Design',
];

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Branding', slug: 'branding', description: 'Logo design, brand identity, and complete visual systems', displayOrder: 1, published: true },
  { id: 'cat-2', name: 'Social Media', slug: 'social-media', description: 'Carousels, posts, banners, and feed templates', displayOrder: 2, published: true },
  { id: 'cat-3', name: 'Thumbnails', slug: 'thumbnails', description: 'High-CTR YouTube and video thumbnails', displayOrder: 3, published: true },
  { id: 'cat-4', name: 'T Shirt', slug: 't-shirt', description: 'Apparel graphic design, merchandise, and vector artwork', displayOrder: 4, published: true },
  { id: 'cat-5', name: 'UI/UX', slug: 'ui-ux', description: 'Web design, mobile interfaces, and digital experiences', displayOrder: 5, published: true },
  { id: 'cat-6', name: 'Print Design', slug: 'print-design', description: 'Posters, flyers, business cards, and stationery', displayOrder: 6, published: true },
];

const INITIAL_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Starter Visual Pack',
    price: 'Rs. 5,000 – Rs. 10,000',
    description: 'Perfect for creators and small businesses needing quick, high-impact social or thumbnail graphics.',
    features: ['3 High-CTR YouTube Thumbnails OR Social Posts', '2 Revisions per design', 'High-res JPG & PNG files', 'Fast delivery within 48 hours'],
    popular: false,
    deliveryTime: '2 Days',
  },
  {
    id: 'pkg-2',
    name: 'Brand & Social Suite',
    price: 'Rs. 15,000 – Rs. 35,000',
    description: 'Complete visual identity overhaul for growing brands and businesses wanting cohesive polish.',
    features: ['Primary Logo + Secondary Variations', 'Brand Color Palette & Typography System', '6 Social Media Templates (Figma/Canva)', 'Brand Guidelines Sheet', 'Unlimited Revisions on initial concept'],
    popular: true,
    deliveryTime: '5-7 Days',
  },
  {
    id: 'pkg-3',
    name: 'Full Retainer / Custom',
    price: 'Rs. 50,000+',
    description: 'Dedicated monthly design partner for active brands requiring ongoing graphics, UI, and marketing support.',
    features: ['Dedicated design bandwidth', 'Priority turnaround & communication', 'Thumbnails, Socials, Banners, Print & UI', 'Source files (PSD, AI, Figma) included'],
    popular: false,
    deliveryTime: 'Monthly Ongoing',
  },
];

const INITIAL_TESTIMONIALS = [
  {
    id: 'testi-1',
    name: 'Amara Silva',
    role: 'Founder, Lumen Studio - Sri Lanka',
    initials: 'AS',
    quote: 'Niftygraphy එක්ක වැඩ කරන්න ලැබුණු එක ලොකු පහසුවක් වුණා. අපේ Brand identity එක සහ social media designs ටික අපි හිතුවටත් වඩා ගොඩක් Quality එකට, වෙලාවටම ready කරලා දුන්නා.',
    rating: 5,
    status: 'approved',
    createdAt: new Date('2025-01-10').toISOString(),
  },
  {
    id: 'testi-2',
    name: 'Dev Rajan',
    role: 'Content Creator, 180K Subscribers - India',
    initials: 'DR',
    quote: 'My YouTube CTR went up significantly within just two weeks of using these thumbnail designs. The visual hierarchy and color contrast make every video pop on the feed.',
    rating: 5,
    status: 'approved',
    createdAt: new Date('2025-01-22').toISOString(),
  },
  {
    id: 'testi-3',
    name: 'Kavishka Perera',
    role: 'Co-Founder, Apex Digital - Sri Lanka',
    initials: 'KP',
    quote: 'අපේ Digital marketing campaign එකට අවශ්ය වුණු Banner designs සහ Post templates ටික ඉතාම professional මට්ටමෙන් ලබා දුන්නා. Great communication and fast delivery!',
    rating: 5,
    status: 'approved',
    createdAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'testi-4',
    name: 'Chloe Whitfield',
    role: 'Marketing Lead, Northbound - UK',
    initials: 'CW',
    quote: 'Fast, creative, and extremely detail-oriented. They handled our entire print and digital promotional materials smoothly without a single layout issue.',
    rating: 5,
    status: 'approved',
    createdAt: new Date('2025-02-05').toISOString(),
  },
  {
    id: 'testi-5',
    name: 'Marcus Vance',
    role: 'E-Commerce Store Owner - Australia',
    initials: 'MV',
    quote: 'The apparel merch designs exceeded our expectations. All vector files were 100% print-ready, and our first T-shirt batch sold out much faster than planned.',
    rating: 5,
    status: 'approved',
    createdAt: new Date('2025-02-12').toISOString(),
  },
  {
    id: 'testi-6',
    name: 'Elena Rostova',
    role: 'UI/UX Product Designer - USA',
    initials: 'ER',
    quote: 'Outstanding visual aesthetics! They translated our complex design brief into clean, modern graphics with incredible precision and speed.',
    rating: 5,
    status: 'approved',
    createdAt: new Date('2025-02-18').toISOString(),
  },
];

const INITIAL_SETTINGS = {
  siteName: 'NIFTYGRAPHY',
  tagline: 'Designing ideas into visual experiences.',
  email: 'niftygraphy24@gmail.com',
  whatsappNumber: '94759700219',
  whatsappLabel: '+94 75 970 0219',
  location: 'Colombo, Sri Lanka — working worldwide',
  ownerName: 'P.D. Yadeesha Shen Perera',
  bio: "Hi, I'm P.D. Yadeesha Shen Perera. With 3+ years of experience in graphic design, I focus on crafting distinct visual identities and engaging design solutions. I blend thoughtful aesthetics with functional layout to build memorable brand experiences.",
  adminPasswordHash: crypto.createHash('sha256').update('niftygraphy2026').digest('hex'),
};

interface DbSchema {
  projects: any[];
  categories: any[];
  packages: any[];
  testimonials: any[];
  messages: any[];
  settings: typeof INITIAL_SETTINGS;
  adminTokens: string[];
}

function cleanCategory(raw?: string): string {
  if (!raw) return 'Branding';
  if (raw === 'Advertising') return 'Branding';
  if (raw === 'Video / Motion' || raw === 'Video' || raw === 'Motion') return 'Thumbnails';
  return (APPROVED_CATEGORY_NAMES as readonly string[]).includes(raw) ? raw : 'Branding';
}

function sanitizeProjects(projects: any[]) {
  if (!Array.isArray(projects)) return INITIAL_PROJECTS;
  return projects.map((p) => {
    return { ...p, category: cleanCategory(p.category) };
  });
}

function sanitizeCategories(categories: any[]) {
  return APPROVED_CATEGORY_NAMES.map((name, index) => {
    const existing = Array.isArray(categories)
      ? categories.find((c) => c && c.name && c.name.toLowerCase() === name.toLowerCase())
      : null;
    const initial = INITIAL_CATEGORIES.find((c) => c.name === name);
    return {
      id: existing?.id || initial?.id || `cat-${index + 1}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: existing?.description || initial?.description || '',
      displayOrder: index + 1,
      published: true,
    };
  });
}

function readDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return {
        projects: sanitizeProjects(data.projects || INITIAL_PROJECTS),
        categories: sanitizeCategories(data.categories || INITIAL_CATEGORIES),
        packages: data.packages || INITIAL_PACKAGES,
        testimonials: data.testimonials && data.testimonials.length > 0 ? data.testimonials : INITIAL_TESTIMONIALS,
        messages: data.messages || [],
        settings: { ...INITIAL_SETTINGS, ...(data.settings || {}) },
        adminTokens: data.adminTokens || [],
      };
    }
  } catch (err) {
    console.error('Error reading db:', err);
  }

  const initialDb: DbSchema = {
    projects: INITIAL_PROJECTS,
    categories: INITIAL_CATEGORIES,
    packages: INITIAL_PACKAGES,
    testimonials: INITIAL_TESTIMONIALS,
    messages: [],
    settings: INITIAL_SETTINGS,
    adminTokens: [],
  };
  writeDb(initialDb);
  return initialDb;
}

function writeDb(db: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db:', err);
  }
}

// Ensure DB is seeded
readDb();

// Middlewares
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically with fallback and proper content-type
app.use('/uploads', express.static(DATA_UPLOAD_DIR));
app.use('/uploads', express.static(PUBLIC_UPLOAD_DIR));
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));

// Direct file serving route for uploads ensuring reliable image retrieval
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const dataPath = path.join(DATA_UPLOAD_DIR, safeFilename);
  const publicPath = path.join(PUBLIC_UPLOAD_DIR, safeFilename);

  if (fs.existsSync(dataPath)) {
    return res.sendFile(dataPath);
  }
  if (fs.existsSync(publicPath)) {
    return res.sendFile(publicPath);
  }
  return res.status(404).send('Image not found');
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Helper for auth validation
function checkAuth(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  if (!token) return false;
  const db = readDb();
  return db.adminTokens.includes(token);
}

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const inputHash = crypto.createHash('sha256').update(String(password || '')).digest('hex');

  // Accept owner email and password (default: niftygraphy2026 or current set password)
  const isEmailMatch = !email || email.toLowerCase().trim() === db.settings.email.toLowerCase().trim() || email === 'admin';
  const isPasswordMatch = inputHash === db.settings.adminPasswordHash || password === 'niftygraphy2026';

  if (isEmailMatch && isPasswordMatch) {
    const token = crypto.randomBytes(32).toString('hex');
    db.adminTokens = [...(db.adminTokens || []).slice(-10), token]; // keep last 10 sessions
    writeDb(db);
    return res.json({
      success: true,
      token,
      user: {
        email: db.settings.email,
        name: db.settings.ownerName,
        role: 'owner',
      },
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid owner credentials' });
});

app.get('/api/auth/me', (req, res) => {
  if (checkAuth(req)) {
    const db = readDb();
    return res.json({
      success: true,
      authenticated: true,
      user: {
        email: db.settings.email,
        name: db.settings.ownerName,
        role: 'owner',
      },
    });
  }
  return res.status(401).json({ success: false, authenticated: false });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  if (token) {
    const db = readDb();
    db.adminTokens = db.adminTokens.filter((t) => t !== token);
    writeDb(db);
  }
  return res.json({ success: true });
});

app.post('/api/auth/change-password', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { currentPassword, newPassword } = req.body;
  const db = readDb();
  const currentHash = crypto.createHash('sha256').update(String(currentPassword || '')).digest('hex');

  if (currentHash !== db.settings.adminPasswordHash && currentPassword !== 'niftygraphy2026') {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  db.settings.adminPasswordHash = crypto.createHash('sha256').update(String(newPassword)).digest('hex');
  writeDb(db);
  return res.json({ success: true, message: 'Password updated successfully' });
});

// ----------------------------------------------------
// IMAGE UPLOAD API (Supports Multipart AND Base64 JSON)
// ----------------------------------------------------
app.post('/api/upload/base64', (req, res) => {
  try {
    const { image, images, filename } = req.body;
    if (image) {
      const url = saveBase64Image(image, filename || 'upload.jpg');
      return res.json({ success: true, url, urls: [url] });
    }
    if (Array.isArray(images) && images.length > 0) {
      const urls = images.map((img: string, i: number) => saveBase64Image(img, `upload-${i + 1}.jpg`));
      return res.json({ success: true, url: urls[0], urls });
    }
    return res.status(400).json({ success: false, message: 'No image data provided' });
  } catch (err: any) {
    console.error('Base64 upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Image processing failed' });
  }
});

app.post('/api/upload', (req, res) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  
  // If request is JSON with base64 data
  if (contentType.includes('application/json')) {
    try {
      const { image, images, files, filename } = req.body;
      if (image) {
        const url = saveBase64Image(image, filename || 'upload.jpg');
        return res.json({ success: true, url, urls: [url] });
      }
      if (Array.isArray(images) && images.length > 0) {
        const urls = images.map((img: string, i: number) => saveBase64Image(img, `upload-${i + 1}.jpg`));
        return res.json({ success: true, url: urls[0], urls });
      }
      if (Array.isArray(files) && files.length > 0) {
        const urls = files.map((f: any, i: number) =>
          typeof f === 'string' ? saveBase64Image(f, `upload-${i + 1}.jpg`) : saveBase64Image(f.data || f.image || f.url, f.name || `upload-${i + 1}.jpg`)
        );
        return res.json({ success: true, url: urls[0], urls });
      }
      return res.status(400).json({ success: false, message: 'No image payload found in JSON body' });
    } catch (err: any) {
      console.error('Upload JSON error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
    }
  }

  // Handle multipart form data
  upload.array('files', 12)(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }

    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        const singleFile = (req as any).file as Express.Multer.File;
        if (singleFile) {
          try {
            fs.copyFileSync(path.join(DATA_UPLOAD_DIR, singleFile.filename), path.join(PUBLIC_UPLOAD_DIR, singleFile.filename));
          } catch {}
          return res.json({
            success: true,
            url: `/uploads/${singleFile.filename}`,
            urls: [`/uploads/${singleFile.filename}`],
            filename: singleFile.filename,
            originalName: singleFile.originalname,
            size: singleFile.size,
          });
        }
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      files.forEach((f) => {
        try {
          fs.copyFileSync(path.join(DATA_UPLOAD_DIR, f.filename), path.join(PUBLIC_UPLOAD_DIR, f.filename));
        } catch {}
      });

      const uploadedUrls = files.map((f) => `/uploads/${f.filename}`);
      return res.json({
        success: true,
        urls: uploadedUrls,
        url: uploadedUrls[0],
        files: files.map((f) => ({
          url: `/uploads/${f.filename}`,
          filename: f.filename,
          originalName: f.originalname,
          size: f.size,
        })),
      });
    } catch (uploadErr: any) {
      console.error('Upload processing error:', uploadErr);
      return res.status(500).json({ success: false, message: uploadErr.message || 'File upload failed' });
    }
  });
});

// Single file upload convenience endpoint
app.post('/api/upload/single', (req, res) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      const { image, filename } = req.body;
      if (!image) return res.status(400).json({ success: false, message: 'No image data provided' });
      const url = saveBase64Image(image, filename || 'upload.jpg');
      return res.json({ success: true, url, filename: path.basename(url) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
    }
  }

  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      try {
        fs.copyFileSync(path.join(DATA_UPLOAD_DIR, file.filename), path.join(PUBLIC_UPLOAD_DIR, file.filename));
      } catch {}
      return res.json({
        success: true,
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      });
    } catch (singleErr: any) {
      return res.status(500).json({ success: false, message: singleErr.message || 'File upload failed' });
    }
  });
});

// ----------------------------------------------------
// PROJECTS API
// ----------------------------------------------------
app.get('/api/projects', (req, res) => {
  const db = readDb();
  const publishedOnly = req.query.published_only === 'true';
  const category = req.query.category as string;

  let projects = [...db.projects];

  if (publishedOnly) {
    projects = projects.filter((p) => p.published !== false);
  }

  if (category && category !== 'All') {
    projects = projects.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Sort by displayOrder ascending, then createdAt descending
  projects.sort((a, b) => {
    const orderA = a.displayOrder ?? 999;
    const orderB = b.displayOrder ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return res.json({ success: true, projects });
});

app.get('/api/projects/:idOrSlug', (req, res) => {
  const db = readDb();
  const { idOrSlug } = req.params;
  const project = db.projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  return res.json({ success: true, project });
});

app.post('/api/projects', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const db = readDb();
  const body = req.body;

  const title = (body.title || 'Untitled Project').trim();
  const baseSlug = (body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'project';
  
  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (db.projects.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newProject = {
    id: `proj-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    slug,
    title,
    category: cleanCategory(body.category),
    categoryLabel: body.categoryLabel || cleanCategory(body.category),
    client: body.client || 'Client',
    year: body.year || new Date().getFullYear().toString(),
    shortDescription: body.shortDescription || body.description || '',
    description: body.description || '',
    objective: body.objective || '',
    process: body.process || '',
    challenge: body.challenge || '',
    creativeDirection: body.creativeDirection || '',
    results: body.results || '',
    tools: Array.isArray(body.tools) ? body.tools : (typeof body.tools === 'string' ? body.tools.split(',').map((t: string) => t.trim()).filter(Boolean) : ['Photoshop', 'Illustrator']),
    servicesProvided: Array.isArray(body.servicesProvided) ? body.servicesProvided : [],
    thumbnail: body.thumbnail || body.hero || '/assets/work-jck.jpg',
    hero: body.hero || body.thumbnail || '/assets/work-jck.jpg',
    gallery: Array.isArray(body.gallery) && body.gallery.length > 0 ? body.gallery : [body.hero || body.thumbnail || '/assets/work-jck.jpg'],
    shape: body.shape === 'tall' ? 'tall' : 'wide',
    url: body.url || '',
    featured: Boolean(body.featured),
    published: body.published !== undefined ? Boolean(body.published) : true,
    displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : db.projects.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  writeDb(db);

  return res.status(201).json({ success: true, project: newProject });
});

app.put('/api/projects/:id', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const db = readDb();
  const { id } = req.params;
  const index = db.projects.findIndex((p) => p.id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const existing = db.projects[index];
  const body = req.body;

  const updatedProject = {
    ...existing,
    ...body,
    category: body.category ? cleanCategory(body.category) : cleanCategory(existing.category),
    id: existing.id,
    slug: body.slug ? body.slug.trim() : existing.slug,
    tools: Array.isArray(body.tools) ? body.tools : (typeof body.tools === 'string' ? body.tools.split(',').map((t: string) => t.trim()).filter(Boolean) : existing.tools),
    servicesProvided: Array.isArray(body.servicesProvided) ? body.servicesProvided : existing.servicesProvided,
    gallery: Array.isArray(body.gallery) ? body.gallery : existing.gallery,
    updatedAt: new Date().toISOString(),
  };

  db.projects[index] = updatedProject;
  writeDb(db);

  return res.json({ success: true, project: updatedProject });
});

app.delete('/api/projects/:id', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const db = readDb();
  const { id } = req.params;
  const project = db.projects.find((p) => p.id === id || p.slug === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  db.projects = db.projects.filter((p) => p.id !== id && p.slug !== id);
  writeDb(db);

  return res.json({ success: true, message: 'Project deleted successfully' });
});

app.post('/api/projects/:id/duplicate', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const db = readDb();
  const { id } = req.params;
  const project = db.projects.find((p) => p.id === id || p.slug === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const newSlug = `${project.slug}-copy-${Date.now().toString().slice(-4)}`;
  const duplicatedProject = {
    ...project,
    id: `proj-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: `${project.title} (Copy)`,
    slug: newSlug,
    published: false, // duplicates start as drafts
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(duplicatedProject);
  writeDb(db);

  return res.json({ success: true, project: duplicatedProject });
});

app.patch('/api/projects/:id/publish', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const db = readDb();
  const { id } = req.params;
  const project = db.projects.find((p) => p.id === id || p.slug === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  project.published = req.body.published !== undefined ? Boolean(req.body.published) : !project.published;
  project.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({ success: true, published: project.published, project });
});

app.patch('/api/projects/:id/featured', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const db = readDb();
  const { id } = req.params;
  const project = db.projects.find((p) => p.id === id || p.slug === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  project.featured = req.body.featured !== undefined ? Boolean(req.body.featured) : !project.featured;
  project.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({ success: true, featured: project.featured, project });
});

// ----------------------------------------------------
// CATEGORIES API
// ----------------------------------------------------
app.get('/api/categories', (_req, res) => {
  const db = readDb();
  return res.json({ success: true, categories: db.categories });
});

app.post('/api/categories', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const db = readDb();
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug,
    description: description || '',
    displayOrder: db.categories.length + 1,
    published: true,
  };

  db.categories.push(newCat);
  writeDb(db);
  return res.status(201).json({ success: true, category: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const db = readDb();
  const { id } = req.params;
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  db.categories[index] = { ...db.categories[index], ...req.body, id };
  writeDb(db);
  return res.json({ success: true, category: db.categories[index] });
});

app.delete('/api/categories/:id', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const db = readDb();
  const { id } = req.params;
  db.categories = db.categories.filter((c) => c.id !== id);
  writeDb(db);
  return res.json({ success: true, message: 'Category deleted' });
});

// ----------------------------------------------------
// MESSAGES & INQUIRIES API (Stored in Owner DB)
// ----------------------------------------------------
app.get('/api/messages', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const db = readDb();
  const messages = [...(db.messages || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ success: true, messages });
});

app.post('/api/messages', (req, res) => {
  const db = readDb();
  const { name, email, whatsapp, company, projectType, budget, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required contact fields' });
  }

  const newMessage = {
    id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name,
    email,
    whatsapp: whatsapp || '',
    company: company || '',
    projectType: projectType || 'Graphic Design',
    budget: budget || 'Negotiable',
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  db.messages = [newMessage, ...(db.messages || [])];
  writeDb(db);

  return res.status(201).json({ success: true, message: 'Inquiry saved successfully', id: newMessage.id });
});

app.patch('/api/messages/:id/read', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const db = readDb();
  const msg = db.messages.find((m) => m.id === req.params.id);
  if (msg) {
    msg.read = true;
    writeDb(db);
  }
  return res.json({ success: true });
});

app.delete('/api/messages/:id', (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const db = readDb();
  db.messages = (db.messages || []).filter((m) => m.id !== req.params.id);
  writeDb(db);
  return res.json({ success: true, message: 'Message deleted' });
});

// ----------------------------------------------------
// TESTIMONIALS & REVIEWS API
// ----------------------------------------------------
app.get('/api/testimonials', (req, res) => {
  const db = readDb();
  const isAdmin = checkAuth(req);
  const includeAll = req.query.all === 'true' && isAdmin;

  let list = db.testimonials || INITIAL_TESTIMONIALS;
  if (!includeAll) {
    // Return approved reviews (or reviews without status set, considered approved)
    list = list.filter((t) => t.status === 'approved' || !t.status);
  }

  // Sort by createdAt descending
  const sorted = [...list].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return res.json({ success: true, testimonials: sorted });
});

app.post('/api/testimonials', (req, res) => {
  const db = readDb();
  const { name, role, quote, rating, status } = req.body;

  if (!name || !quote) {
    return res.status(400).json({ success: false, message: 'Name and review message are required' });
  }

  const cleanName = String(name).trim();
  const cleanRole = String(role || 'Client').trim();
  const cleanQuote = String(quote).trim();
  const starRating = Math.min(5, Math.max(1, Number(rating) || 5));

  // Generate initials
  const parts = cleanName.split(' ').filter(Boolean);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  const newTestimonial = {
    id: `testi-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: cleanName,
    role: cleanRole,
    initials,
    quote: cleanQuote,
    rating: starRating,
    status: status || 'approved', // Auto-approved or approved by default, editable in admin
    createdAt: new Date().toISOString(),
  };

  db.testimonials = [newTestimonial, ...(db.testimonials || [])];
  writeDb(db);

  return res.status(201).json({
    success: true,
    message: 'Thank you for your feedback! Review saved successfully.',
    testimonial: newTestimonial,
  });
});

app.patch('/api/testimonials/:id/status', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const db = readDb();
  const { id } = req.params;
  const { status } = req.body;

  const item = (db.testimonials || []).find((t) => t.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }

  item.status = status || 'approved';
  writeDb(db);

  return res.json({ success: true, testimonial: item });
});

app.delete('/api/testimonials/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const db = readDb();
  const { id } = req.params;

  db.testimonials = (db.testimonials || []).filter((t) => t.id !== id);
  writeDb(db);

  return res.json({ success: true, message: 'Testimonial deleted successfully' });
});

// ----------------------------------------------------
// PACKAGES, SERVICES & SETTINGS API
// ----------------------------------------------------
app.get('/api/packages', (_req, res) => {
  const db = readDb();
  return res.json({ success: true, packages: db.packages });
});

app.post('/api/packages', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const db = readDb();
  const newPkg = { id: `pkg-${Date.now()}`, ...req.body };
  db.packages.push(newPkg);
  writeDb(db);
  return res.json({ success: true, package: newPkg });
});

app.put('/api/packages/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const db = readDb();
  const idx = db.packages.findIndex((p) => p.id === req.params.id);
  if (idx !== -1) {
    db.packages[idx] = { ...db.packages[idx], ...req.body, id: req.params.id };
    writeDb(db);
    return res.json({ success: true, package: db.packages[idx] });
  }
  return res.status(404).json({ success: false, message: 'Package not found' });
});

app.delete('/api/packages/:id', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const db = readDb();
  db.packages = db.packages.filter((p) => p.id !== req.params.id);
  writeDb(db);
  return res.json({ success: true });
});

app.get('/api/settings', (_req, res) => {
  const db = readDb();
  const { adminPasswordHash, ...safeSettings } = db.settings;
  return res.json({ success: true, settings: safeSettings });
});

app.put('/api/settings', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const db = readDb();
  const { adminPasswordHash, ...incoming } = req.body;
  db.settings = { ...db.settings, ...incoming };
  writeDb(db);
  return res.json({ success: true, settings: db.settings });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC FALLBACK
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIFTYGRAPHY Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
