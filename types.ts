
export type Platform = 'facebook' | 'tiktok' | 'instagram';
export type Country = 'MA' | 'SA' | 'AE' | 'KW' | 'EG';

export interface TrendingAd {
  id: string;
  title: string;
  thumbnail: string;
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
