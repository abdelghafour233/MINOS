
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ChevronLeft, ChevronDown,
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, Sun, Moon,
  CheckCircle2, AlertTriangle, Plus, RefreshCw, Terminal, Copy,
  ImagePlus, UploadCloud, ImageIcon, Filter, Clock, CheckCircle,
  Eye, EyeOff, Download, MessageSquare, ExternalLink, Database, Cloud, HelpCircle,
  Wand2
} from 'lucide-react';

// استيراد مكتبات Firebase الأساسية من CDN متوافق مع ESM
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, onSnapshot, 
  doc, setDoc, deleteDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES } from './constants';

// ============================================================
// ⚠️ هـام جـداً: ضـع معـلومـاتك هـنا بـعد نـسخهـا مـن Firebase ⚠️
// ============================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",     
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"              
};
// ============================================================

const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db: any = null;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("خطأ في تشغيل Firebase:", error);
  }
}

const adminPassword = 'admin'; 

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products'>('orders');
  
  const [products, setProducts] = useState<StoreProduct[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);
  const [isInitializing, setIsInitializing] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | ''}>({message: '', type: ''});
  
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [customerInfo, setCustomerInfo] = useState({ fullName: '', phoneNumber: '', city: '' });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب المنتجات في الوقت الحقيقي
  useEffect(() => {
    if (!db) { setIsLoading(false); return; }
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StoreProduct));
      if (prods.length > 0) {
        setProducts(prods);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // جلب الطلبيات في الوقت الحقيقي
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ ...doc.data(), orderId: doc.id } as StoreOrder));
      setOrders(ords);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setIsAdminAuthenticated(true);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 5000);
  };

  // دالة تهيئة قاعدة البيانات تلقائياً
  const initializeDatabase = async () => {
    if (!db) {
        showToast('يجب وضع مفاتيح Firebase أولاً في الكود', 'error');
        return;
    }
    setIsInitializing(true);
    try {
        for (const product of MOCK_PRODUCTS) {
            await setDoc(doc(db, 'products', product.id), product);
        }
        showToast('تم تهيئة المتجر ورفع المنتجات بنجاح!');
    } catch (e) {
        showToast('فشل التهيئة: تأكد من وضع Test Mode في Firebase', 'error');
    } finally {
        setIsInitializing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditingProduct({ ...editingProduct, thumbnail: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmOrder = async () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city) {
      showToast('المرجو ملأ المعلومات الأساسية', 'error'); return;
    }

    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      productId: selectedProduct?.id || '',
      productTitle: selectedProduct?.title || '',
      productPrice: selectedProduct?.price || 0,
      customer: { ...customerInfo, address: 'طلب سريع' },
      status: 'pending',
      orderDate: new Date().toISOString()
    };
    
    if (db) {
      try {
        await addDoc(collection(db, 'orders'), newOrder);
        setActiveOrder(newOrder);
        setIsCheckingOut(false);
        setSelectedProduct(null);
        setCustomerInfo({ fullName: '', phoneNumber: '', city: '' });
        showToast('تم تسجيل طلبك بنجاح');
      } catch (e) {
        showToast('خطأ في إرسال الطلب للسيرفر', 'error');
      }
    } else {
      setOrders([newOrder, ...orders]);
      setActiveOrder(newOrder);
      showToast('تم الحفظ محلياً (Firebase غير مفعل)');
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (db) {
      try {
        const productRef = doc(db, 'products', editingProduct.id);
        await setDoc(productRef, editingProduct);
        showToast('تم الحفظ في السيرفر بنجاح');
        setEditingProduct(null);
      } catch (e) {
        showToast('فشل في الوصول للسيرفر', 'error');
      }
    } else {
      const index = products.findIndex(p => p.id === editingProduct.id);
      if (index > -1) {
        const updated = [...products];
        updated[index] = editingProduct;
        setProducts(updated);
      } else {
        setProducts([editingProduct, ...products]);
      }
      showToast('تم الحفظ في المتصفح');
      setEditingProduct(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('هل تريد حذف المنتج نهائياً من السيرفر؟')) return;
    if (db) {
      try {
        await deleteDoc(doc(db, 'products', id));
        showToast('تم الحذف من السيرفر');
      } catch (e) {
        showToast('فشل الحذف', 'error');
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
      showToast('تم الحذف محلياً');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 pb-20 md:pb-0 font-['Tajawal']`}>
      
      {/* واجهة المساعد التعليمي */}
      {!isFirebaseConfigured && view === 'admin' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#050a18]/98">
          <div className="max-w-2xl w-full glass-morphism p-10 rounded-[3rem] border border-emerald-500/20 text-right space-y-6">
            <div className="flex items-center gap-4 text-emerald-500">
               <HelpCircle size={40} />
               <h2 className="text-3xl font-black">خطوات ربط المتجر بالسيرفر</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p className="font-bold">أنت الآن في وضع "المعاينة". لكي يرى الزوار منتجاتك، اتبع التالي:</p>
              <div className="space-y-3 pr-4 border-r-2 border-emerald-500/30">
                <div className="flex gap-3">
                  <span className="bg-emerald-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">1</span>
                  <p>اذهب لـ <a href="https://console.firebase.google.com/" target="_blank" className="text-emerald-500 underline">Firebase Console</a> وأنشئ مشروعاً.</p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-emerald-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">2</span>
                  <p>اختر <b>Firestore Database</b> ثم <b>Create Database</b> واجعلها في وضع <b>Test Mode</b>.</p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-emerald-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">3</span>
                  <p>من <b>Project Settings</b>، انسخ الـ <b>Config</b> والصقه في ملف <code>App.tsx</code>.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsAdminAuthenticated(true)} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg">أريد تجربة لوحة التحكم أولاً</button>
          </div>
        </div>
      )}

      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-black text-sm max-w-[90vw] text-center`}>
          {toast.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}
          <span>{toast.message}</span>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10">
        <div className="flex md:flex-col gap-8 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><ShoppingBag size={22} /></button>
          <button onClick={() => isAdminAuthenticated ? setView('admin') : setShowLoginModal(true)} className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><LayoutDashboard size={22} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
            <header className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up shadow-2xl border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/70 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-xl space-y-6 text-right">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest"><Sparkles size={14} /> متجرك المغربي السحابي</span>
                <h1 className="text-3xl md:text-5xl font-black text-gradient leading-tight">منتجات مختارة <br/> بجودة استثنائية</h1>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-lg premium-btn flex items-center gap-2">تسوق الآن <ArrowRight size={22} /></button>
              </div>
            </header>

            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <RefreshCw size={48} className="animate-spin text-emerald-500" />
                <p className="font-black text-slate-500">جاري الاتصال بالسيرفر...</p>
              </div>
            ) : (
              <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pt-6">
                {products.map((product) => (
                  <div key={product.id} className="group glass-morphism rounded-[2rem] overflow-hidden flex flex-col border border-white/5 product-card-glow">
                    <div className="aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img src={product.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col text-right">
                      <h3 className="font-black text-sm md:text-base line-clamp-1">{product.title}</h3>
                      <p className="text-xl md:text-2xl font-black text-emerald-500">{product.price} DH</p>
                      <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 py-3 rounded-xl border border-white/10 font-black text-xs hover:bg-emerald-500 hover:text-black transition-all">اطلب الآن</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 md:p-12 max-w-6xl mx-auto space-y-10 animate-fade-in-up text-right">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-gradient">إدارة المتجر</h2>
                  {isFirebaseConfigured ? <Cloud size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-amber-500"/>}
                </div>
                <p className="text-xs text-slate-500 font-bold">{isFirebaseConfigured ? 'المتجر متصل بالسيرفر بنجاح' : 'أنت في وضع المعاينة المحلية'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400'}`}>الطلبات ({orders.length})</button>
                <button onClick={() => setAdminTab('products')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400'}`}>المنتجات ({products.length})</button>
              </div>
            </header>

            {adminTab === 'products' && (
              <div className="space-y-8">
                {/* قسم التهيئة السريعة إذا كانت القائمة فارغة */}
                {products.length === 1 && isFirebaseConfigured && (
                    <div className="p-10 glass-morphism rounded-[3rem] border-2 border-emerald-500/20 text-center space-y-4">
                        <Wand2 size={48} className="mx-auto text-emerald-500 animate-pulse" />
                        <h3 className="text-xl font-black">تهيئة قاعدة البيانات</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto">يبدو أن السيرفر فارغ. اضغط الزر بالأسفل لإنشاء الـ Collections ورفع المنتجات التجريبية تلقائياً.</p>
                        <button 
                            disabled={isInitializing}
                            onClick={initializeDatabase} 
                            className="bg-emerald-500 text-black px-10 py-4 rounded-2xl font-black flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {isInitializing ? <RefreshCw className="animate-spin" /> : <Database />}
                            {isInitializing ? 'جاري التهيئة...' : 'تهيئة المتجر الآن'}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <button onClick={() => setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'أدوات منزلية', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة' })} className="aspect-square glass-morphism rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all group">
                        <Plus size={40} className="group-hover:scale-110 transition-transform" />
                        <span className="font-black text-xs mt-2">إضافة منتج</span>
                    </button>
                    {products.map(p => (
                    <div key={p.id} className="glass-morphism rounded-[2.5rem] overflow-hidden border border-white/5 group relative">
                        <img src={p.thumbnail} className="aspect-square object-cover" />
                        <div className="p-5 space-y-3">
                            <h4 className="font-black text-xs truncate">{p.title}</h4>
                            <div className="flex gap-2">
                            <button onClick={() => setEditingProduct(p)} className="flex-1 bg-white/5 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-500 hover:text-black">تعديل</button>
                            <button onClick={() => deleteProduct(p.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 font-bold glass-morphism rounded-[2rem]">لا توجد طلبيات بعد</div>
                ) : (
                  orders.map(order => (
                    <div key={order.orderId} className="glass-morphism p-6 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-right flex-1">
                        <h4 className="font-black text-lg">{order.customer.fullName}</h4>
                        <p className="text-xs text-emerald-500 font-bold">{order.productTitle} - {order.productPrice} DH</p>
                        <p className="text-[10px] text-slate-500">{new Date(order.orderDate).toLocaleString('ar-MA')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                           <p className="text-sm font-black text-ltr">{order.customer.phoneNumber}</p>
                           <p className="text-[10px] text-slate-400 font-bold">{order.customer.city}</p>
                        </div>
                        <button onClick={() => window.open(`https://wa.me/212${order.customer.phoneNumber.substring(1)}`, '_blank')} className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-xl shadow-emerald-500/5">
                          <MessageSquare size={20}/>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* مودال تعديل المنتج */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#050a18]/95 backdrop-blur-xl">
          <form onSubmit={saveProduct} className="max-w-4xl w-full glass-morphism p-8 md:p-12 rounded-[3rem] space-y-6 overflow-y-auto max-h-[90vh] border border-white/5 text-right no-scrollbar">
            <h3 className="text-2xl font-black text-gradient">بيانات المنتج</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input type="text" required placeholder="اسم المنتج" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-right outline-none focus:border-emerald-500" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                <input type="number" required placeholder="السعر" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-right outline-none focus:border-emerald-500" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                <textarea required placeholder="الوصف" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold h-40 text-right outline-none focus:border-emerald-500" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white/5 hover:border-emerald-500 transition-all">
                {editingProduct.thumbnail ? <img src={editingProduct.thumbnail} className="w-full h-full object-cover" /> : <UploadCloud size={48} className="text-slate-500" />}
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20">حفظ في السيرفر</button>
              <button type="button" onClick={() => setEditingProduct(null)} className="px-8 bg-white/5 border border-white/10 rounded-2xl font-black">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* مودال الدخول */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass-morphism p-10 rounded-[3rem] space-y-8 text-center border border-white/5">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={40}/></div>
            <input type="password" placeholder="الرمز السري" className="w-full bg-white/5 border border-white/10 p-5 rounded-xl font-bold text-center text-3xl tracking-widest outline-none focus:border-emerald-500 transition-all" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('الرمز خاطئ', 'error')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg premium-btn">دخول</button>
            <button onClick={() => setShowLoginModal(false)} className="text-slate-500 text-xs font-bold hover:text-white transition-colors">إغلاق</button>
          </div>
        </div>
      )}

      {/* مودال عرض المنتج والشراء */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-xl glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5 text-right">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-2 bg-black/40 rounded-full text-white hover:bg-rose-500 transition-all"><X size={18} /></button>
             <div className="w-full md:w-[40%] h-[25vh] md:h-auto p-8 flex items-center justify-center bg-slate-950/40"><img src={selectedProduct.thumbnail} className="max-w-full max-h-full object-contain drop-shadow-2xl" /></div>
             <div className="w-full md:w-[60%] p-6 md:p-10 flex flex-col overflow-y-auto max-h-[65vh] md:max-h-full no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <h2 className="text-xl md:text-3xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                    <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <p className="text-3xl font-black text-emerald-500">{selectedProduct.price} DH</p>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><Truck size={14}/> توصيل مجاني</span>
                      </div>
                      <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg animate-buy-pulse">أطلب الآن - الدفع عند الاستلام</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col h-full">
                     <h3 className="text-xl font-black text-gradient">تأكيد الطلبية</h3>
                     <div className="space-y-4">
                       <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-right outline-none focus:border-emerald-500" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="الإسم الكامل" />
                       <input type="tel" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-left outline-none focus:border-emerald-500" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06 XX XX XX XX" />
                       <select className="w-full bg-slate-900 border border-white/20 p-4 rounded-xl font-bold text-right outline-none focus:border-emerald-500" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                          <option value="">اختر مدينتك</option>
                          {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/20 mt-4">إرسال الطلب</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 rounded-[3rem] text-center space-y-8 animate-fade-in-up border border-emerald-500/20">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={54} /></div>
            <h3 className="text-3xl font-black text-gradient">شكراً لثقتك!</h3>
            <p className="text-slate-400 font-medium text-lg">لقد توصلنا بطلبك وسنتصل بك قريباً لتأكيده.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
