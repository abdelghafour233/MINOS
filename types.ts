
export type Category = 'أدوات منزلية' | 'إلكترونيات' | 'تجميل وعناية' | 'إكسسوارات' | 'موضة' | 'ألعاب وأطفال' | 'نظارات';

export interface StoreProduct {
  id: string;
  title: string;
  thumbnail: string;
  galleryImages?: string[]; // صور إضافية
  price: number;
  originalPrice?: number;
  description: string;
  category: Category;
  stockStatus: 'available' | 'low_stock' | 'out_of_stock';
  rating: number;
  reviewsCount: number;
  shippingTime: string;
}

export interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  city: string;

}

export interface StoreOrder {
  orderId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  customer: CustomerInfo;
  orderDate: string;
  status: 'pending' | 'shipped' | 'delivered';
}
