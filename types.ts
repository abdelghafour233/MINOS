
export type Platform = 'facebook' | 'tiktok' | 'instagram' | 'aliexpress' | 'snapchat' | 'youcan';
export type Country = 'MA' | 'SA' | 'AE' | 'KW' | 'EG';

export interface TrendingAd {
  id: string;
  title: string;
  thumbnail: string;
  additionalImage?: string; 
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
  sourceUrl?: string;
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
  syncedToSheets: boolean;
}

export interface IntegrationConfig {
  apifyToken?: string;
  apifyActorId?: string;
  zapierWebhookUrl?: string;
  googleSheetUrl?: string;
  facebookPixel?: string;
  googlePixel?: string;
  tiktokPixel?: string;
}
