
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
    title: 'خلاط محمول لاسلكي فائق القوة للرياضيين',
    thumbnail: 'https://images.unsplash.com/photo-1570222020676-969231783ae8?auto=format&fit=crop&q=80&w=600',
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
    title: 'مصباح مكتبي ذكي مريح للعين مع شاحن لاسلكي',
    thumbnail: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=600',
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
    title: 'منظم مكياج أكريليك فاخر بتصميم عصري',
    thumbnail: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600',
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
    title: 'سماعات رأس لاسلكية بخاصية إلغاء الضوضاء',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
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
    title: 'مكنسة سيارة محمولة بقوة شفط جبارة',
    thumbnail: 'https://images.unsplash.com/photo-1563131237-7290aa62f7d7?auto=format&fit=crop&q=80&w=600',
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
    title: 'وسادة رقبة طبية للسفر لمسافات طويلة',
    thumbnail: 'https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&q=80&w=600',
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
