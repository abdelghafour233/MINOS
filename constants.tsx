
import { StoreProduct } from './types';

export const CATEGORIES: string[] = [
  'الكل',
  'أدوات منزلية',
  'إلكترونيات',
  'تجميل وعناية',
  'إكسسوارات',
  'موضة'
];

export const MOCK_PRODUCTS: StoreProduct[] = [
  {
    id: 'p1',
    title: 'المطحنة الكهربائية العجيبة 2 في 1',
    thumbnail: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600',
    price: 249,
    originalPrice: 399,
    description: 'مطحنة قوية ومتعددة الاستخدامات للقهوة والتوابل. جودة عالية وتصميم عصري يناسب مطبخك المغربي.',
    category: 'أدوات منزلية',
    stockStatus: 'available',
    rating: 4.8,
    reviewsCount: 156,
    shippingTime: '24-48 ساعة'
  },
  {
    id: 'p2',
    title: 'ساعة ذكية SmartWatch Ultra S8',
    thumbnail: 'https://images.unsplash.com/photo-1544117518-33230596230f?q=80&w=600',
    price: 350,
    originalPrice: 599,
    description: 'أحدث الساعات الذكية مع شاشة AMOLED ودعم المكالمات والاشعارات بالعربية. مقاومة للماء.',
    category: 'إلكترونيات',
    stockStatus: 'low_stock',
    rating: 4.9,
    reviewsCount: 342,
    shippingTime: '24-72 ساعة'
  },
  {
    id: 'p3',
    title: 'جهاز مساج الرقبة والكتفين الاحترافي',
    thumbnail: 'https://images.unsplash.com/photo-1544117518-33230596230f?q=80&w=600', // Placeholder
    price: 199,
    originalPrice: 299,
    description: 'تخلص من آلام الرقبة والظهر مع هذا الجهاز المتطور. مثالي للاسترخاء بعد يوم عمل طويل.',
    category: 'تجميل وعناية',
    stockStatus: 'available',
    rating: 4.7,
    reviewsCount: 89,
    shippingTime: '24-48 ساعة'
  }
];
