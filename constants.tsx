
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
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4',
    price: 299,
    description: 'خلاط عصري يسهل حمله في الحقيبة الرياضية، بطارية تدوم طويلاً وشفرات من الفولاذ المقاوم للصدأ.',
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
    videoUrl: 'https://cdn.pixabay.com/video/2020/09/24/50865-462968846_tiny.mp4',
    price: 450,
    description: 'مصباح LED ذكي مع إمكانية التحكم في شدة الإضاءة وشحن هاتفك لاسلكياً في نفس الوقت.',
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
    videoUrl: 'https://cdn.pixabay.com/video/2022/10/24/136340-763407005_tiny.mp4',
    price: 180,
    description: 'وداعاً للفوضى مع هذا المنظم الأنيق الذي يتسع لجميع مستحضرات التجميل الخاصة بك.',
    platform: 'instagram',
    country: 'AE',
    views: 2300000,
    likes: 98000,
    shares: 4500,
    category: 'تجميل',
    firstSeen: '2024-05-10',
    lastSeen: '2024-05-16',
    isWinning: true
  }
];
