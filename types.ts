
export type Category = 'electronics' | 'home' | 'cars';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  stock: number;
}

export interface Order {
  id: string;
  customerName: string;
  city: string;
  phone: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface TrackingConfig {
  facebookPixel: string;
  googleAnalytics: string;
  tiktokPixel: string;
  googleSheetsUrl: string;
  customHeaderJs: string;
  customFooterJs: string;
}

export interface DomainConfig {
  domainName: string;
  nameServers: string[];
}

export interface CartItem extends Product {
  quantity: number;
}
