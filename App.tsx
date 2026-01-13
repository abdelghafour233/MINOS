
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Truck, Phone, User, Check, 
  ArrowRight, Sparkles, LayoutDashboard, Lock, 
  AlertTriangle, Plus, Trash2, MessageSquare, ShoppingCart
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES } from './constants';

// Firebase Config Placeholder
const firebaseConfig = { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" };
const isConfigured = firebaseConfig.apiKey !== "";
let db: any = null;
if (isConfigured) {
  try { db = getFirestore(initializeApp(firebaseConfig)); } catch (e) {}
}

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [products, setProducts] = useState<StoreProduct[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [toast, setToast] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pass, setPass] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', city: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!db) {
      const savedOrders = localStorage.getItem('berrima_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      return;
    }
    const unsub = onSnapshot(query(collection(db, 'orders'), orderBy('orderDate', 'desc')), (s) => {
      setOrders(s.docs.map(d => ({ ...d.data(), orderId: d.id } as StoreOrder)));
    });
    return () => unsub();
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const submitOrder = async () => {
    if (!form.name || !form.phone || !form.city) return notify('المرجو ملئ كل الخانات');
    
    const orderData: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).toUpperCase().substr(2, 6),
      productId: selectedProduct?.id || '',
      productTitle: selectedProduct?.title || '',
      productPrice: selectedProduct?.price || 0,
      customer: { fullName: form.name, phoneNumber: form.phone, city: form.city, address: 'توصيل منزلي' },
      status: 'pending',
      orderDate: new Date().toISOString()
    };

    try {
      if (db) {
        await addDoc(collection(db, 'orders'), orderData);
      } else {
        const newOrders = [orderData, ...orders];
        setOrders(newOrders);
        localStorage.setItem('berrima_orders', JSON.stringify(newOrders));
      }
      setSuccess(true);
      setIsCheckout(false);
      setSelectedProduct(null);
    } catch (e) {
      notify('خطأ في الاتصال');
    }
  };

  return (
    <div className={`min-h-screen ${selectedProduct || showLogin ? 'no-scroll' : ''}`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-rose-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold animate-in">
          {toast}
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-20 md:h-screen glass z-[1000] flex md:flex-col items-center justify-around md:justify-center md:gap-12">
        <button onClick={() => setView('shop')} className={`p-4 rounded-2xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}><ShoppingBag size={24}/></button>
        <button onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} className={`p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}><LayoutDashboard size={24}/></button>
      </nav>

      <main className="md:pr-24 p-6 md:p-12 max-w-7xl mx-auto">
        {view === 'shop' ? (
          <div className="space-y-12 animate-in">
            {/* Hero */}
            <header className="relative h-64 md:h-96 rounded-[3rem] overflow-hidden flex items-center px-8 md:px-20 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="relative z-20 space-y-4 text-right">
                <h1 className="text-4xl md:text-6xl font-black text-grad">متجر بريمة <br/> عالم من الجودة</h1>
                <button onClick={() => document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black flex items-center gap-2">تسوق الآن <ArrowRight/></button>
              </div>
            </header>

            {/* Products */}
            <div id="grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass rounded-[2rem] overflow-hidden cursor-pointer group hover:border-emerald-500/30 transition-all border border-white/5">
                  <img src={p.thumbnail} className="aspect-square object-cover w-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="p-5 text-right space-y-2">
                    <h3 className="font-bold text-sm truncate">{p.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-500 font-black text-lg">{p.price} DH</p>
                      <button className="bg-white/5 p-2 rounded-lg"><Plus size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Admin View */
          <div className="space-y-8 animate-in text-right">
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl">
              <h2 className="text-2xl font-black text-grad">لوحة التحكم</h2>
              <button onClick={() => { setIsAdmin(false); setView('shop'); }} className="text-rose-500 font-bold">خروج</button>
            </div>
            
            <div className="grid gap-4">
              <h3 className="font-bold text-xl">الطلبيات ({orders.length})</h3>
              {orders.map(o => (
                <div key={o.orderId} className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-lg">{o.customer.fullName}</p>
                    <p className="text-emerald-500 text-sm font-bold">{o.productTitle} - {o.productPrice} DH</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-bold">{o.customer.phoneNumber}</p>
                      <p className="text-xs text-slate-500 uppercase">{o.customer.city}</p>
                    </div>
                    <a href={`https://wa.me/212${o.customer.phoneNumber.replace(/^0/, '')}`} target="_blank" className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl"><MessageSquare/></a>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center py-20 text-slate-500 font-bold">لا توجد طلبيات حالياً</p>}
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass p-10 rounded-[2.5rem] text-center space-y-6">
            <Lock className="mx-auto text-emerald-500" size={48}/>
            <h3 className="text-xl font-black">تسجيل الدخول</h3>
            <input type="password" placeholder="كلمة السر" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center outline-none focus:border-emerald-500" value={pass} onChange={e => setPass(e.target.value)} />
            <button onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else notify('خطأ'); }} className="w-full bg-emerald-500 text-black py-3 rounded-xl font-black">دخول</button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {/* Product & Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isCheckout && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-in border border-white/10 max-h-[90vh]">
            <button onClick={() => { setSelectedProduct(null); setIsCheckout(false); }} className="absolute top-6 right-6 z-50 p-2 bg-black/50 rounded-full"><X/></button>
            
            <div className="w-full md:w-1/2 bg-slate-900/50 flex items-center justify-center p-8">
              <img src={selectedProduct.thumbnail} className="max-h-64 md:max-h-full object-contain" />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 text-right overflow-y-auto">
              {!isCheckout ? (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-4xl font-black leading-tight">{selectedProduct.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-4xl font-black text-emerald-500 mb-6">{selectedProduct.price} DH</p>
                    <button onClick={() => setIsCheckout(true)} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-xl shadow-lg">أطلب الآن (الدفع عند الاستلام)</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-4">
                  <h3 className="text-2xl font-black">معلومات التوصيل</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="الإسم الكامل" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-right outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input type="tel" placeholder="رقم الهاتف" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-left outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    <select className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-right outline-none appearance-none" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                      <option value="">اختر المدينة</option>
                      {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={submitOrder} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-xl">تأكيد الطلب</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="max-w-sm w-full glass p-12 rounded-[3rem] text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={40}/></div>
            <h3 className="text-2xl font-black">شكراً لك!</h3>
            <p className="text-slate-400">توصلنا بطلبك بنجاح، سنتصل بك قريباً لتأكيد الإرسال.</p>
            <button onClick={() => setSuccess(false)} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black">حسناً</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
