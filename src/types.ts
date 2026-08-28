export interface Project {
  id?: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel?: string;
  client: string;
  year: string;
  shortDescription?: string;
  description: string;
  objective?: string;
  process?: string;
  challenge?: string;
  creativeDirection?: string;
  results?: string;
  tools: string[];
  servicesProvided?: string[];
  thumbnail: string;
  hero: string;
  gallery: string[];
  shape?: 'wide' | 'tall';
  url?: string;
  featured?: boolean;
  published?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  published: boolean;
}

export interface PackageItem {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  deliveryTime: string;
}

export interface InquiryMessage {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  projectType: string;
  budget: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdminSettings {
  siteName: string;
  tagline: string;
  email: string;
  whatsappNumber: string;
  whatsappLabel: string;
  location: string;
  bio: string;
  ownerName: string;
}

export interface ServiceItem {
  iconName: 'fingerprint' | 'layers' | 'youtube' | 'shirt' | 'monitor' | 'printer';
  title: string;
  description: string;
}

export interface ProcessStep {
  n: string;
  title: string;
  text: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  initials?: string;
  quote: string;
  rating?: number;
  status?: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
}

export interface ToolItem {
  name: string;
  short: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}
