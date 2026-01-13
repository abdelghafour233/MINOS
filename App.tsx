
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Truck, Phone, User, Check, CheckCircle2,
  ArrowRight, Sparkles, LayoutDashboard, Lock, 
  AlertTriangle, Plus, Trash2, MessageSquare, Database
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, setDoc, deleteDoc, query, orderBy 
} from "firebase/firestore";

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES } from './constants';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "", // ضع مفاتيحك هنا لاحقاً
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

  // جلب البيانات (Firebase أو محلي)
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
      showMsg('المرجو إدخال جميع المعلومات', 'error');
      return;
    }

    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      productId: selectedProduct?.id || '',
      productTitle: selectedProduct?.title || '',
      productPrice: selectedProduct?.price || 0,
      customer: { ...customer, address: 'توصيل منزلي' },
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
      showMsg('حدث خطأ في إرسال الطلب', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    try {
      if (db) {
        await setDoc(doc(db, 'products', editingProd.id), editingProd);
      } else {
        const index = products.findIndex(p => p.id === editingProd.id);
        let updated;
        if (index > -1) {
          updated = products.map(p => p.id === editingProd.id ? editingProd : p);
        } else {
          updated = [editingProd, ...products];
        }
        setProducts(updated);
        localStorage.setItem('local_products', JSON.stringify(updated));
      }
      showMsg('تم حفظ المنتج بنجاح');
      setEditingProd(null);
    } catch (err) {
      showMsg('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  return (
    <div className={`min-h-screen ${selectedProduct || showLogin || editingProd ? 'modal-open' : ''}`}>
      
      {/* التنبيهات (Toasts) */}
      {toast.msg && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[9999] px-8 py-4 rounded-2xl shadow-2xl animate-fade-in ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} font-black text-white`}>
          <div className="flex items-center gap-3">
            {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* شريط التنقل (Navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-20 md:h-screen glass-morphism z-[1000] flex md:flex-col items-center justify-around md:py-12">
        <button onClick={() => setView('shop')} className={`p-4 rounded-2xl transition-all hover:scale-110 ${view === 'shop' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}><ShoppingBag size={24}/></button>
        <button onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} className={`p-4 rounded-2xl transition-all hover:scale-110 ${view === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}><LayoutDashboard size={24}/></button>
      </nav>

      <main className="md:pr-24 p-4 md:p-12 max-w-7xl mx-auto">
        {view === 'shop' ? (
          <div className="space-y-12 animate-fade-in">
            <header className="relative h-64 md:h-[400px] rounded-[3rem] overflow-hidden flex items-center px-8 md:px-20 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="relative z-20 space-y-6 text-right">
                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1 rounded-full text-xs font-black border border-emerald-500/20">متجر مغربي 100% 🇲🇦</span>
                <h1 className="text-4xl md:text-6xl font-black text-gradient leading-tight">الجودة المغربية <br/> بلمسة عصرية</h1>
                <button onClick={() => document.getElementById('products')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center gap-2">تسوق الآن <ArrowRight/></button>
              </div>
            </header>

            <div id="products" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass-morphism rounded-[2.5rem] overflow-hidden cursor-pointer group hover:border-emerald-500/30 transition-all border border-white/5">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6 text-right space-y-3">
                    <h3 className="font-bold text-sm md:text-base truncate">{p.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-500 font-black text-xl">{p.price} DH</p>
                      <button className="bg-white/5 p-2 rounded-xl group-hover:bg-emerald-500 group-hover:text-black transition-all"><Plus size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10 text-right animate-fade-in">
            <header className="flex justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                <div>
                  <h2 className="text-3xl font-black text-gradient">إدارة المتجر</h2>
                  <p className="text-xs text-slate-500 mt-1">{isConfigured ? 'المتجر مرتبط بـ Firebase' : 'وضع المعاينة المحلية'}</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setEditingProd({ id: 'P'+Date.now(), title: '', price: 0, description: '', thumbnail: '', category: 'أدوات منزلية', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة' })} className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2"><Plus size={16}/> إضافة منتج</button>
                   <button onClick={() => { setIsAdmin(false); setView('shop'); }} className="bg-rose-500/10 text-rose-500 px-6 py-3 rounded-xl font-black text-xs">خروج</button>
                </div>
            </header>
            
            <div className="grid gap-4">
              <h3 className="text-xl font-black px-2">أحدث الطلبيات ({orders.length})</h3>
              {orders.length === 0 ? (
                <div className="py-20 text-center glass-morphism rounded-[2.5rem] text-slate-500 font-bold border-2 border-dashed border-white/5">لا توجد طلبيات بعد</div>
              ) : (
                orders.map(o => (
                  <div key={o.orderId} className="glass-morphism p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-emerald-500/20 transition-all">
                    <div className="text-right flex-1">
                      <h4 className="font-black text-lg">{o.customer.name}</h4>
                      <p className="text-xs text-emerald-500 font-bold">{o.productTitle} • {o.productPrice} DH</p>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(o.orderDate).toLocaleString('ar-MA')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="font-black text-lg">{o.customer.phone}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{o.customer.city}</p>
                      </div>
                      <a href={`https://wa.me/212${o.customer.phone.replace(/^0/, '')}`} target="_blank" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all">
                        <MessageSquare size={20}/>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* مودال الدخول للأدمن */}
      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass-morphism p-12 rounded-[3rem] text-center space-y-8 border border-white/10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={40}/></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">لوحة التحكم</h3>
              <p className="text-xs text-slate-500">أدخل الرمز السري للمتابعة</p>
            </div>
            <input type="password" placeholder="••••" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-center text-3xl tracking-widest outline-none focus:border-emerald-500" value={pass} onChange={e => setPass(e.target.value)} />
            <button onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else showMsg('الرمز السري خاطئ', 'error'); }} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg shadow-lg">دخول</button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-xs font-bold hover:text-white">إلغاء</button>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل المنتج */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl glass-morphism rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-fade-in border border-white/10 max-h-[90vh]">
            <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-6 right-6 z-[4100] p-3 bg-black/50 rounded-full hover:bg-rose-500 transition-all"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 bg-slate-900/50 p-10 flex items-center justify-center">
              <img src={selectedProduct.thumbnail} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 text-right overflow-y-auto no-scrollbar flex flex-col">
              {!isCheckingOut ? (
                <div className="space-y-6 flex-1">
                  <span className="text-emerald-500 font-black text-[10px] tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">متوفر الآن</span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight">{selectedProduct.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                  
                  <div className="pt-8 border-t border-white/5 mt-auto space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-4xl font-black text-emerald-500">{selectedProduct.price} DH</p>
                      <div className="text-[10px] font-bold text-slate-500 flex flex-col items-end">
                        <span className="line-through opacity-50">{selectedProduct.price + 100} DH</span>
                        <span>توصيل مجاني 🚚</span>
                      </div>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/20">أطلب الآن - الدفع عند الاستلام</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">تأكيد الطلبية</h3>
                    <p className="text-xs text-slate-500">أدخل معلوماتك لنتصل بك ونوصل لك المنتج</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="الإسم الكامل" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-right outline-none focus:border-emerald-500" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    <input type="tel" placeholder="رقم الهاتف (06..)" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-left outline-none focus:border-emerald-500" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                    <select className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl font-bold text-right outline-none focus:border-emerald-500 appearance-none" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})}>
                      <option value="">اختر مدينتك</option>
                      {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={handleOrder} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/20">إرسال الطلب بنجاح</button>
                  <button onClick={() => setIsCheckingOut(false)} className="w-full text-slate-500 text-sm font-bold hover:text-white">العودة لوصف المنتج</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة نجاح الطلب */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[3rem] text-center space-y-8 animate-fade-in border border-emerald-500/20">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl shadow-emerald-500/30 animate-bounce"><Check size={54}/></div>
            <div className="space-y-3">
                <h3 className="text-3xl font-black">شكراً لثقتك!</h3>
                <p className="text-slate-400 font-medium text-lg">توصلنا بطلبك بنجاح. سنتصل بك قريباً لتأكيد التوصيل.</p>
            </div>
            <button onClick={() => setOrderSuccess(false)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-xl">حسناً، شكراً</button>
          </div>
        </div>
      )}

      {/* نافذة إضافة/تعديل منتج */}
      {editingProd && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-xl overflow-y-auto">
           <form onSubmit={handleSaveProduct} className="max-w-2xl w-full glass-morphism p-10 rounded-[3rem] space-y-6 text-right my-auto border border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gradient">بيانات المنتج</h3>
                <button type="button" onClick={() => setEditingProd(null)} className="text-rose-500"><X size={24}/></button>
              </div>
              <input type="text" placeholder="اسم المنتج" required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.title} onChange={e => setEditingProd({...editingProd, title: e.target.value})} />
              <input type="number" placeholder="السعر (DH)" required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.price} onChange={e => setEditingProd({...editingProd, price: Number(e.target.value)})} />
              <input type="text" placeholder="رابط صورة المنتج (URL)" required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none focus:border-emerald-500" value={editingProd.thumbnail} onChange={e => setEditingProd({...editingProd, thumbnail: e.target.value})} />
              <textarea placeholder="وصف المنتج..." required className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-right outline-none h-40 resize-none focus:border-emerald-500" value={editingProd.description} onChange={e => setEditingProd({...editingProd, description: e.target.value})} />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-lg">حفظ المنتج</button>
                <button type="button" onClick={() => setEditingProd(null)} className="px-8 bg-white/10 rounded-2xl font-bold">إلغاء</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default App;
