
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'آيفون 15 برو ماكس 256 جيجابايت',
    price: 14500,
    category: 'electronics',
    image: 'https://picsum.photos/seed/iphone/600/600',
    description: 'أحدث هاتف من آبل مع كاميرا احترافية ومعالج جبار.',
    stock: 10
  },
  {
    id: '2',
    name: 'طقم جلوس عصري - 3 قطع',
    price: 8900,
    category: 'home',
    image: 'https://picsum.photos/seed/sofa/600/600',
    description: 'أريكة مريحة جداً بتصميم عصري يناسب غرف المعيشة الحديثة.',
    stock: 5
  },
  {
    id: '3',
    name: 'سيارة دفع رباعي فاخرة 2024',
    price: 450000,
    category: 'cars',
    image: 'https://picsum.photos/seed/car/600/600',
    description: 'سيارة عائلية قوية مع أحدث تقنيات السلامة والرفاهية.',
    stock: 2
  },
  {
    id: '4',
    name: 'ماكينة قهوة أوتوماتيكية',
    price: 3200,
    category: 'home',
    image: 'https://picsum.photos/seed/coffee/600/600',
    description: 'استمتع بأفضل مذاق للقهوة في منزلك بضغطة زر واحدة.',
    stock: 15
  },
  {
    id: '5',
    name: 'ساعة ذكية رياضية',
    price: 1800,
    category: 'electronics',
    image: 'https://picsum.photos/seed/watch/600/600',
    description: 'تتبع نشاطك البدني ونبضات القلب بدقة عالية.',
    stock: 20
  }
];

export const CATEGORIES_LABELS = {
  electronics: 'إلكترونيات',
  home: 'منزل وديكور',
  cars: 'سيارات'
};
