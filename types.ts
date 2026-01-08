
export type Platform = 'facebook' | 'tiktok' | 'instagram';
export type Country = 'MA' | 'SA' | 'AE' | 'KW' | 'EG';

export interface TrendingAd {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  price: number;
  description?: string;
  platform: Platform;
  country: Country;
  views: number;
  likes: number;
  shares: number;
  category: string;
  firstSeen: string;
  lastSeen: string;
  isWinning: boolean;
}

export interface FilterState {
  search: string;
  platform: Platform | 'all';
  country: Country | 'all';
  category: string;
  sortBy: 'views' | 'date' | 'likes';
}

export interface Order {
  id: string;
  customerName: string;
  city: string;
  phone: string;
  productId: string;
  productTitle: string;
  amount: number;
  date: string;
  status: 'pending' | 'shipped' | 'delivered';
}

export interface PixelConfig {
  facebook?: string;
  google?: string;
  tiktok?: string;
}
