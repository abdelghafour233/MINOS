
import { StoreProduct } from './types';

/** 
 *  هذا هو الملف الرئيسي لبيانات المتجر. 
 *  لجعل التحديثات تصل لكل الهواتف والحواسيب، قم بنسخ الكود الذي تولده لوحة التحكم هنا.
 */

export const STORE_CONFIG = {
  pixelId: '', // معرف فيسبوك بيكسل
  testCode: '', // كود اختبار الأحداث
  storeName: 'Berrima Store',
  currency: 'DH',
  // إعدادات غوغل شيت
  sheetId: '',
  sheetName: 'Orders',
  sheetScriptUrl: '' // رابط Web App من Google Apps Script
};

export const MOROCCAN_CITIES: string[] = [
  'الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'طنجة', 'أكادير', 'مكناس', 'وجدة',
  'القنيطرة', 'تطوان', 'تمارة', 'سلا', 'آسفي', 'المحمدية', 'خريبكة', 'بني ملال',
  'الجديدة', 'الناظور', 'سطات', 'تازة', 'الخميسات', 'برشيد', 'كلميم', 'الرشيدية', 'تارودانت'
];

export const MOCK_PRODUCTS: StoreProduct[] = [];

export const CATEGORIES: string[] = [
  'الكل', 'نظارات', 'أدوات منزلية', 'إلكترونيات', 'تجميل وعناية', 'إكسسوارات', 'موضة'
];
