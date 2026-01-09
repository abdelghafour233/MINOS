
import { DigitalKeyProduct } from './types';

export const CATEGORIES = [
  'الكل',
  'أنظمة تشغيل',
  'ألعاب فيديو',
  'برامج تصميم',
  'اشتراكات بث',
  'أدوات حماية وVPN'
];

export const MOCK_PRODUCTS: DigitalKeyProduct[] = [
  {
    id: 'k1',
    title: 'Windows 11 Pro - Original License Key',
    thumbnail: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?q=80&w=600',
    price: 99,
    description: 'مفتاح تفعيل أصلي لنسخة ويندوز 11 برو. يدعم التحديثات الرسمية ومدى الحياة.',
    platform: 'windows',
    category: 'أنظمة تشغيل',
    isAvailable: true,
    keyFormat: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
    rating: 4.9,
    salesCount: 1250,
    // Fix: deliveryType does not exist in DigitalKeyProduct, use deliveryTime
    deliveryTime: 'instant'
  },
  {
    id: 'k2',
    title: 'Adobe Creative Cloud 1 Year',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600',
    price: 450,
    description: 'اشتراك كامل في حزمة أدوبي لمدة سنة على حسابك الشخصي.',
    platform: 'design',
    category: 'برامج تصميم',
    isAvailable: true,
    keyFormat: 'Redeem Code / Link',
    rating: 4.8,
    salesCount: 840,
    // Fix: deliveryType does not exist in DigitalKeyProduct, use deliveryTime
    deliveryTime: 'instant'
  },
  {
    id: 'k3',
    title: 'NordVPN 2-Year Plan Key',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600',
    price: 199,
    description: 'تصفح آمن وبدون حدود مع أفضل خدمة VPN في العالم.',
    platform: 'vpn',
    category: 'أدوات حماية وVPN',
    isAvailable: true,
    keyFormat: 'XXXX-XXXX-XXXX',
    rating: 4.7,
    salesCount: 2100,
    // Fix: deliveryType does not exist in DigitalKeyProduct, use deliveryTime
    deliveryTime: 'instant'
  }
];
