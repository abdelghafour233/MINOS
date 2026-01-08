
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
  'ألعاب أطفال',
  'سيارات',
  'أدوات مطبخ'
];

export const MOCK_TRENDS: TrendingAd[] = [
  {
    id: '1',
    title: 'خلاط محمول لاسلكي فائق القوة',
    thumbnail: 'https://picsum.photos/seed/blender/400/500',
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
    title: 'مصباح ذكي متعدد الألوان بـ 16 مليون لون',
    thumbnail: 'https://picsum.photos/seed/light/400/500',
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
    title: 'منظم مكياج دوار 360 درجة',
    thumbnail: 'https://picsum.photos/seed/makeup/400/500',
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
    title: 'سماعات بلوتوث رياضية عازلة للضوضاء',
    thumbnail: 'https://picsum.photos/seed/earbuds/400/500',
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
    title: 'مجموعة أدوات تنظيف السيارة الاحترافية',
    thumbnail: 'https://picsum.photos/seed/carwash/400/500',
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
    title: 'وسادة رقبة مريحة للسفر الطويل',
    thumbnail: 'https://picsum.photos/seed/pillow/400/500',
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
