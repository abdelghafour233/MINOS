
import { TrendingAd, Country } from './types';

export const COUNTRY_LABELS: Record<Country | 'all', string> = {
  all: 'كل الدول',
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
  instagram: 'إنستغرام'
};

export const CATEGORIES = [
  'الكل',
  'إلكترونيات',
  'منزل',
  'تجميل',
  'أدوات مطبخ',
  'سيارات'
];

export const MOCK_TRENDS: TrendingAd[] = [
  {
    id: '1',
    title: 'خلاط محمول لاسلكي فائق القوة',
    thumbnail: 'https://loremflickr.com/400/500/blender,portable',
    platform: 'tiktok',
    country: 'SA',
    views: 1200000,
    likes: 45000,
    shares: 1200,
    category: 'أدوات مطبخ',
    firstSeen: '2024-05-01',
    lastSeen: '2024-05-15',
    isWinning: true
  },
  {
    id: '2',
    title: 'مصباح ذكي متعدد الألوان لغرف النوم',
    thumbnail: 'https://loremflickr.com/400/500/smart,lamp,rgb',
    platform: 'facebook',
    country: 'MA',
    views: 850000,
    likes: 12000,
    shares: 800,
    category: 'منزل',
    firstSeen: '2024-04-20',
    lastSeen: '2024-05-10',
    isWinning: false
  },
  {
    id: '3',
    title: 'منظم مكياج دوار احترافي',
    thumbnail: 'https://loremflickr.com/400/500/makeup,organizer',
    platform: 'instagram',
    country: 'AE',
    views: 2300000,
    likes: 98000,
    shares: 4500,
    category: 'تجميل',
    firstSeen: '2024-05-10',
    lastSeen: '2024-05-16',
    isWinning: true
  },
  {
    id: '4',
    title: 'سماعات بلوتوث رياضية حديثة',
    thumbnail: 'https://loremflickr.com/400/500/earbuds,wireless',
    platform: 'tiktok',
    country: 'KW',
    views: 500000,
    likes: 15000,
    shares: 200,
    category: 'إلكترونيات',
    firstSeen: '2024-05-05',
    lastSeen: '2024-05-14',
    isWinning: false
  },
  {
    id: '5',
    title: 'مكنسة سيارة محمولة قوية',
    thumbnail: 'https://loremflickr.com/400/500/car,vacuum',
    platform: 'facebook',
    country: 'MA',
    views: 320000,
    likes: 8000,
    shares: 150,
    category: 'سيارات',
    firstSeen: '2024-05-12',
    lastSeen: '2024-05-16',
    isWinning: false
  },
  {
    id: '6',
    title: 'وسادة رقبة طبية مريحة',
    thumbnail: 'https://loremflickr.com/400/500/neck,pillow,travel',
    platform: 'instagram',
    country: 'SA',
    views: 940000,
    likes: 32000,
    shares: 900,
    category: 'منزل',
    firstSeen: '2024-04-15',
    lastSeen: '2024-05-16',
    isWinning: true
  }
];
