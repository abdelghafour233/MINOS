
import { TrendingAd, Country } from './types';

export const COUNTRY_LABELS: Record<Country | 'all', string> = {
  all: 'كل المناطق',
  MA: 'المغرب',
  SA: 'السعودية',
  AE: 'الإمارات',
  KW: 'الكويت',
  EG: 'مصر'
};

export const PLATFORM_LABELS = {
  all: 'كل المنصات',
  facebook: 'فيسبوك',
  tiktok: 'تيك توك',
  instagram: 'إنستغرام',
  snapchat: 'سناب شات',
  youcan: 'يوكان'
};

export const CATEGORIES = [
  'الكل',
  'البيت والمطبخ',
  'الصحة والجمال',
  'إكسسوارات السيارات',
  'إلكترونيات ذكية',
  'ألعاب وأطفال',
  'أدوات منزلية'
];

export const MOCK_TRENDS: TrendingAd[] = [
  {
    id: 'p1',
    title: 'مطحنة التوابل والقهوة الفولاذية العجيبة',
    thumbnail: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=600',
    price: 199,
    description: 'منتج رائج جداً في فيسبوك المغرب. يتميز بجودة عالية وسعر مناسب للـ COD. المنافسون يبيعونه بـ 249 درهم.',
    platform: 'facebook',
    country: 'MA',
    views: 450000,
    likes: 12000,
    shares: 3400,
    category: 'البيت والمطبخ',
    firstSeen: '2025-01-10',
    lastSeen: '2025-02-15',
    isWinning: true,
    sourceUrl: 'https://competitor-store.ma/product1'
  },
  {
    id: 'p2',
    title: 'مضخة غسيل السيارات اللاسلكية عالية الضغط',
    thumbnail: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=600',
    price: 349,
    description: 'ترند قوي في تيك توك المغرب. الطلب مرتفع جداً من أصحاب السيارات. سهلة التسويق باستخدام الفيديوهات.',
    platform: 'tiktok',
    country: 'MA',
    views: 890000,
    likes: 45000,
    shares: 8900,
    category: 'إكسسوارات السيارات',
    firstSeen: '2025-02-01',
    lastSeen: '2025-02-18',
    isWinning: true,
    sourceUrl: 'https://another-store.com/car-washer'
  },
  {
    id: 'p3',
    title: 'جهاز بخار الوجه المنزلي الاحترافي',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600',
    price: 299,
    description: 'ينتشر بسرعة على سناب شات المغرب كمنتج عناية شخصية. نسبة النقر على الإعلان عالية جداً لدى النساء.',
    platform: 'snapchat',
    country: 'MA',
    views: 320000,
    likes: 21000,
    shares: 4200,
    category: 'الصحة والجمال',
    firstSeen: '2025-02-10',
    lastSeen: '2025-02-20',
    isWinning: true,
    sourceUrl: 'https://beauty-ma.shop/steamer'
  }
];
