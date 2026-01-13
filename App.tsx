
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ShoppingBag, Truck, Phone, User, Check, CheckCircle2,
  ArrowRight, Sparkles, LayoutDashboard, Lock, 
  AlertTriangle, Plus, Trash2, MessageSquare, Database, ShoppingCart
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, setDoc, deleteDoc, query, orderBy 
} from "firebase/firestore";

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES } from './constants';

// إعدادات Firebase - يجب ملؤها من Firebase Console (Project Settings)
const firebaseConfig = {
  apiKey: "", 
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const isConfigured = firebaseConfig.apiKey !== "";

let db: any = null;
if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) { console.error("Firebase Error:", e); }
}

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [products, setProducts] = useState<StoreProduct[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pass, setPass] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', city: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [editingProd, setEditingProd] = useState<StoreProduct | null>(null);

  // جلب البيانات مع نظام التبديل التلقائي بين السحابة والمحلي
  useEffect(() => {
    if (!db) {
      const p = localStorage.getItem('local_products');
      if (p) setProducts(JSON.parse(p));
      const o = localStorage.getItem('local_orders');
      if (o) setOrders(JSON.parse(o));
      return;
    }

    const unsubP = onSnapshot(collection(db, 'products'), (s) => {
      const data = s.docs.map(d => ({ ...d.data(), id: d.id } as StoreProduct));
      if (data.length > 0) setProducts(data);
    });

    const unsubO = onSnapshot(query(collection(db, 'orders'), orderBy('orderDate', 'desc')), (s) => {
      setOrders(s.docs.map(d => ({ ...d.data(), orderId: d.id } as StoreOrder)));
    });

    return () => { unsubP(); unsubO(); };
  }, []);

  const showMsg = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const handleOrder = async () => {
    if (!customer.name || !customer.phone || !customer.city) {
      showMsg('المرجو إدخال جميع المعلومات المطلوبة', 'error');
      return;
    }

    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      productId: selectedProduct?.id || '',
      productTitle: selectedProduct?.title || '',
      productPrice: selectedProduct?.price || 0,
      customer: { 
        fullName: customer.name, 
        phoneNumber: customer.phone, 
        city: customer.city, 
        address: 'توصيل منزلي' 
      },
      status: 'pending',
      orderDate: new Date().toISOString()
    };

    try {
      if (db) {
        await addDoc(collection(db, 'orders'), newOrder);
      } else {
        const updated = [newOrder, ...orders];
        setOrders(updated);
        localStorage.setItem('local_orders', JSON.stringify(updated));
      }
      setOrderSuccess(true);
      setIsCheckingOut(false);
      setSelectedProduct(null);
    } catch (err) {
      showMsg('حدث خطأ فني، حاول مرة أخرى', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    try {
      if (db) {
        await setDoc(doc(db, 'products', editingProd.id), editingProd);
      } else {
        const updated = [editingProd, ...products.filter(p => p.id !== editingProd.id)];
        setProducts(updated);
        localStorage.setItem('local_products', JSON.stringify(updated));
      }
      showMsg('تم حفظ المنتج بنجاح');
      setEditingProd(null);
    } catch (err) {
      showMsg('فشل الحفظ، تأكد من الإعدادات', 'error');
    }
  };

  return (
    <div className={`min-h-screen bg-[#050a18] text-slate-100 ${selectedProduct || showLogin || editingProd ? 'modal-open' : ''}`}>
      
      {/* Toast Notifications */}
      {toast.msg && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[9999] px-8 py-4 rounded-2xl shadow-2xl animate-fade-in ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} font-bold flex items-center gap-3 border border-white/10`}>
          {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Side/Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-20 md:h-screen glass-morphism z-[1000] flex md:flex-col items-center justify-around md:justify-center md:gap-10 border-t md:border-t-0 md:border-l border-white/5">
        <button onClick={() => setView('shop')} className={`p-4 rounded-2xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:text-white'}`}><ShoppingBag size={24}/></button>
        <button onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} className={`p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:text-white'}`}><LayoutDashboard size={24}/></button>
      </nav>

      <main className="md:pr-24 p-4 md:p-12 max-w-7xl mx-auto">
        {view === 'shop' ? (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <header className="relative h-72 md:h-[450px] rounded-[3.5rem] overflow-hidden flex items-center px-10 md:px-24 border border-white/5 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#050a18]/40 to-[#050a18] z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" />
              <div className="relative z-20 space-y-6 text-right max-w-xl">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20">
                  <Sparkles size={14}/>
                  <span>تخفيضات تصل لـ 50% بمناسبة الافتتاح</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-gradient leading-[1.1]">تسوق بذكاء، <br/> تميز بالأفضل</h1>
                <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed hidden md:block">نقدم لك أرقى المنتجات العالمية بأفضل الأسعار في السوق المغربي، مع ضمان الجودة وتوصيل سريع لباب منزلك.</p>
                <button onClick={() => document.getElementById('store-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-12 py-4 rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 transition-transform">اكتشف المنتجات <ArrowRight size={20}/></button>
              </div>
            </header>

            {/* Products Grid */}
            <div id="store-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 pt-10">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="product-card glass-morphism rounded-[2.8rem] overflow-hidden cursor-pointer transition-all duration-300 group border border-white/5">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img src={p.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">جديد</div>
                  </div>
                  <div className="p-7 text-right space-y-3">
                    <h3 className="font-bold text-sm md:text-base truncate text-slate-200 group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-white font-black text-2xl">{p.price} <span className="text-emerald-500 text-sm">DH</span></p>
                      <button className="bg-white/5 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-lg"><ShoppingCart size={20}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="space-y-10 text-right animate-fade-in">
            <header className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/5">
                <div>
                  <h2 className="text-3xl font-black text-gradient">إدارة المتجر</h2>
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                    <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className="text-slate-500">{isConfigured ? 'البيانات متصلة بالسحابة (Firebase)' : 'وضع المعاينة (تخزين محلي)'}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setEditingProd({ id: 'P'+Date.now(), title: '', price: 0, description: '', thumbnail: '', category: 'أدوات منزلية', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة' })} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20"><Plus size={18}/> إضافة منتج جديد</button>
                   <button onClick={() => { setIsAdmin(false); setView('shop'); }} className="bg-rose-500/10 text-rose-500 px-8 py-4 rounded-2xl font-black text-sm border border-rose-500/20">تسجيل الخروج</button>
                </div>
            </header>
            
            <div className="space-y-6">
              <h3 className="text-xl font-black px-4 flex items-center gap-3"><Database className="text-emerald-500"/> الطلبيات المستلمة ({orders.length})</h3>
              {orders.length === 0 ? (
                <div className="py-24 text-center glass-morphism rounded-[3rem] text-slate-500 font-bold border-2 border-dashed border-white/5">لا توجد طلبيات مسجلة في النظام حالياً</div>
              ) : (
                <div className="grid gap-4">
                  {orders.map(o => (
                    <div key={o.orderId} className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-emerald-500/30 transition-all group">
                      <div className="text-right flex-1 space-y-1">
                        <h4 className="font-black text-xl text-white">{o.customer.fullName}</h4>
                        <p className="text-sm text-emerald-500 font-bold">{o.productTitle} — {o.productPrice} DH</p>
                        <p className="text-[10px] text-slate-500 font-medium">{new Date(o.orderDate).toLocaleString('ar-MA')}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-left">
                          <p className="font-black text-xl text-white tracking-wide">{o.customer.phoneNumber}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase">{o.customer.city}</p>
                        </div>
                        <a href={`https://wa.me/212${o.customer.phoneNumber.replace(/^0/, '')}`} target="_blank" className="p-5 bg-emerald-500/10 text-emerald-500 rounded-3xl hover:bg-emerald-500 hover:text-black transition-all shadow-xl">
                          <MessageSquare size={24}/>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[3.5rem] text-center space-y-10 border border-white/10 shadow-[0_0_100px_rgba(16,185,129,0.1)]">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={48}/></div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black">الدخول للمسؤولين</h3>
              <p className="text-sm text-slate-500">أدخل كلمة السر الخاصة بلوحة التحكم</p>
            </div>
            <input type="password" placeholder="••••" autoFocus className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold text-center text-4xl tracking-[1rem] outline-none focus:border-emerald-500 transition-all" value={pass} onChange={e => setPass(e.target.value)} onKeyPress={e => e.key === 'Enter' && (pass === 'admin' ? (setIsAdmin(true), setShowLogin(false), setView('admin'), setPass('')) : showMsg('كلمة السر خاطئة', 'error'))} />
            <button onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else showMsg('كلمة السر خاطئة', 'error'); }} className="w-full bg-emerald-500 text-black py-5 rounded-3xl font-black text-xl shadow-2xl shadow-emerald-500/30">دخول آمن</button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-xs font-bold hover:text-white uppercase tracking-widest">إلغاء العملية</button>
          </div>
        </div>
      )}

      {/* Product Detail / Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-5xl glass-morphism rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row animate-fade-in border border-white/10 max-h-[92vh] shadow-2xl">
            <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-8 right-8 z-[4100] p-4 bg-black/50 rounded-full hover:bg-rose-500 transition-all text-white"><X size={24}/></button>
            
            <div className="w-full md:w-1/2 bg-[#0a0f1e] p-12 flex items-center justify-center relative">
              <img src={selectedProduct.thumbnail} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
              <div className="absolute bottom-8 left-8 flex gap-2">
                <span className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black border border-white/10">{selectedProduct.category}</span>
              </div>
            </div>

            <div className="w-full md:w-1/2 p-10 md:p-16 text-right overflow-y-auto no-scrollbar flex flex-col">
              {!isCheckingOut ? (
                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <span className="text-emerald-500 font-black text-[12px] tracking-[0.2em] uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">متوفر في المخزون</span>
                    <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">{selectedProduct.title}</h2>
                    <div className="flex items-center justify-end gap-2 text-amber-500">
                      <span className="text-sm font-black">{selectedProduct.rating}</span>
                      <div className="flex">{[...Array(5)].map((_,i) => <Sparkles key={i} size={14} fill={i < Math.floor(selectedProduct.rating) ? 'currentColor' : 'none'}/>)}</div>
                      <span className="text-slate-500 text-xs font-medium mr-2">({selectedProduct.reviewsCount} تقييم)</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium">{selectedProduct.description}</p>
                  
                  <div className="pt-10 border-t border-white/5 mt-auto space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">سعر العرض</p>
                        <p className="text-5xl font-black text-white">{selectedProduct.price} <span className="text-emerald-500 text-2xl">DH</span></p>
                      </div>
                      <div className="text-left space-y-1">
                        <span className="block line-through text-slate-600 font-bold text-lg">{selectedProduct.price + 149} DH</span>
                        <span className="block text-emerald-500 text-xs font-black">توصيل مجاني لجميع المدن 🚛</span>
                      </div>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-6 rounded-3xl font-black text-2xl shadow-[0_20px_40px_rgba(16,185,129,0.2)] active:scale-95 transition-all">أطلب الآن — الدفع عند الاستلام</button>
                    <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">ضمان استرجاع الأموال خلال 7 أيام</p>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <div className="space-y-10 py-4">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white">إتمام الطلبية</h3>
                    <p className="text-sm text-slate-500">المرجو إدخال معلوماتك الصحيحة لضمان وصول المنتج</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2">الإسم الكامل</label>
                      <input type="text" placeholder="مثال: محمد العلوي" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-right outline-none focus:border-emerald-500 transition-colors" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2">رقم الهاتف</label>
                      <input type="tel" placeholder="06 XX XX XX XX" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-left outline-none focus:border-emerald-500 transition-colors" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 mr-2">المدينة</label>
                      <select className="w-full bg-[#0a0f1e] border border-white/10 p-5 rounded-2xl font-bold text-right outline-none focus:border-emerald-500 transition-colors appearance-none" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})}>
                        <option value="">اختر مدينتك من القائمة</option>
                        {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-6 space-y-4">
                    <button onClick={handleOrder} className="w-full bg-emerald-500 text-black py-6 rounded-3xl font-black text-2xl shadow-2xl active:scale-95 transition-all">تأكيد الطلب بنجاح</button>
                    <button onClick={() => setIsCheckingOut(false)} className="w-full text-slate-500 text-sm font-bold hover:text-white transition-colors">العودة لوصف المنتج</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
          <div className="max-w-md w-full glass-morphism p-14 rounded-[4rem] text-center space-y-10 animate-fade-in border border-emerald-500/20 shadow-[0_0_150px_rgba(16,185,129,0.15)]">
            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl shadow-emerald-500/40 animate-bounce"><Check size={64} strokeWidth={3}/></div>
            <div className="space-y-4">
                <h3 className="text-4xl font-black text-white">طلبك وصل!</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً لثقتك في متجرنا. سنتصل بك خلال أقل من 24 ساعة لتأكيد عنوان التوصيل.</p>
            </div>
            <button onClick={() => setOrderSuccess(false)} className="w-full bg-emerald-500 text-black py-6 rounded-3xl font-black text-xl shadow-xl">حسناً، فهمت</button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {editingProd && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl overflow-y-auto">
           <form onSubmit={handleSaveProduct} className="max-w-2xl w-full glass-morphism p-12 rounded-[3.5rem] space-y-8 text-right my-auto border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="text-3xl font-black text-gradient">إضافة منتج جديد</h3>
                <button type="button" onClick={() => setEditingProd(null)} className="text-slate-500 hover:text-rose-500 transition-colors"><X size={28}/></button>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-500 mr-2">عنوان المنتج</label>
                   <input type="text" placeholder="مثال: سماعات رأس بلوتوث" required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.title} onChange={e => setEditingProd({...editingProd, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">السعر (DH)</label>
                    <input type="number" placeholder="299" required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.price} onChange={e => setEditingProd({...editingProd, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">التصنيف</label>
                    <select className="w-full bg-[#0a0f1e] p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.category} onChange={e => setEditingProd({...editingProd, category: e.target.value as any})}>
                      <option value="أدوات منزلية">أدوات منزلية</option>
                      <option value="إلكترونيات">إلكترونيات</option>
                      <option value="تجميل وعناية">تجميل وعناية</option>
                      <option value="نظارات">نظارات</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-500 mr-2">رابط الصورة (URL)</label>
                   <input type="text" placeholder="https://..." required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.thumbnail} onChange={e => setEditingProd({...editingProd, thumbnail: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-500 mr-2">وصف المنتج</label>
                   <textarea placeholder="اكتب تفاصيل المنتج ومميزاته هنا..." required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none h-44 resize-none focus:border-emerald-500 font-medium" value={editingProd.description} onChange={e => setEditingProd({...editingProd, description: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-emerald-500 text-black py-5 rounded-3xl font-black text-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all">حفظ المنتج في النظام</button>
                <button type="button" onClick={() => setEditingProd(null)} className="px-10 bg-white/5 rounded-3xl font-bold text-slate-400 hover:text-white transition-colors">إلغاء</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default App;
