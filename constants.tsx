
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
  instagram: 'إنستغرام'
};

export const CATEGORIES = [
  'الكل',
  'اشتراكات',
  'ألعاب',
  'برامج',
  'دورات تدريبية',
  'بطاقات هدايا',
  'خدمات رقمية'
];

export const MOCK_TRENDS: TrendingAd[] = [
  {
    id: 'd1',
    title: 'اشتراك Canva Pro - سنة كاملة برابط خاص',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4',
    price: 99,
    description: 'احصل على كافة مميزات كانفا برو على حسابك الشخصي. تصاميم غير محدودة، إزالة الخلفية، وآلاف الخطوط العربية والأجنبية.',
    platform: 'instagram',
    country: 'MA',
    views: 450000,
    likes: 12000,
    shares: 800,
    category: 'برامج',
    firstSeen: '2024-10-01',
    lastSeen: '2024-12-15',
    isWinning: true
  },
  {
    id: 'd2',
    title: 'دورة احتراف التجارة الإلكترونية في المغرب (E-com Local)',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://cdn.pixabay.com/video/2020/09/24/50865-462968846_tiny.mp4',
    price: 499,
    description: 'تعلم استراتيجيات البيع المحلي في المغرب من الصفر. اختيار المنتج، إعلانات فيسبوك، وإدارة فريق التوصيل.',
    platform: 'facebook',
    country: 'MA',
    views: 890000,
    likes: 35000,
    shares: 2400,
    category: 'دورات تدريبية',
    firstSeen: '2024-11-20',
    lastSeen: '2025-01-10',
    isWinning: true
  },
  {
    id: 'd3',
    title: 'كتاب "عقلية المليونير" - نسخة إلكترونية PDF',
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://cdn.pixabay.com/video/2022/10/24/136340-763407005_tiny.mp4',
    price: 45,
    description: 'أفضل الكتب مبيعاً في تطوير الذات متاح الآن للقراءة على هاتفك أو حاسوبك بجودة عالية.',
    platform: 'tiktok',
    country: 'SA',
    views: 1200000,
    likes: 98000,
    shares: 4500,
    category: 'خدمات رقمية',
    firstSeen: '2024-12-10',
    lastSeen: '2024-12-25',
    isWinning: false
  }
];
