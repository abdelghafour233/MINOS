
export type Platform = 'windows' | 'gaming' | 'software' | 'streaming' | 'vpn' | 'design';

export interface DigitalKeyProduct {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  description: string;
  platform: Platform;
  category: string;
  isAvailable: boolean;
  keyFormat: string; // e.g. XXXX-XXXX-XXXX
  rating: number;
  salesCount: number;
  deliveryTime: 'instant' | '1-24h';
}

export interface UserOrder {
  orderId: string;
  productId: string;
  productTitle: string;
  generatedKey: string;
  purchaseDate: string;
}
