
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ArrowRight, LayoutDashboard, Lock, 
  Plus, MessageSquare, Check, ShoppingCart, Star
} from 'lucide-react';

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES } from './constants';

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

  // تحميل الطلبيات من الذاكرة المحلية
  useEffect(() => {
    const saved = localStorage.getItem('berrima_orders');
    if (saved) setOrders(JSON.parse(saved));
    
    const savedProds = localStorage.getItem('berrima_products');
    if (savedProds) setProducts(JSON.parse(savedProds));
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOrder = () => {
    if (!form.name || !form.phone || !form.city) {
      notify('المرجو ملئ كل الخانات');
      return;
    }
    
    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      productId: selectedProduct?.id || '',
      productTitle: selectedProduct?.title || '',
      productPrice: selectedProduct?.price || 0,
      customer: { fullName: form.name, phoneNumber: form.phone, city: form.city, address: 'توصيل منزلي' },
      status: 'pending',
      orderDate: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('berrima_orders', JSON.stringify(updatedOrders));
    
    setSuccess(true);
    setIsCheckout(false);
    setSelectedProduct(null);
    setForm({ name: '', phone: '', city: '' });
  };

  return (
    <div className={`min-h-screen ${selectedProduct || showLogin ? 'no-scroll' : ''}`}>
      
      {/* التنبيهات */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-rose-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold animate-in">
          {toast}
        </div>
      )}

      {/* شريط التنقل السفلي/الجانبي */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-20 md:h-screen glass z-[1000] flex md:flex-col items-center justify-around md:justify-center md:gap-12 border-t md:border-t-0 md:border-l border-white/5">
        <button onClick={() => setView('shop')} className={`p-4 rounded-2xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-white'}`}><ShoppingBag size={24}/></button>
        <button onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} className={`p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-white'}`}><LayoutDashboard size={24}/></button>
      </nav>

      <main className="md:pr-24 p-4 md:p-12 max-w-7xl mx-auto pb-24 md:pb-12">
        {view === 'shop' ? (
          <div className="space-y-12 animate-in">
            {/* واجهة العرض الرئيسية */}
            <header className="relative h-64 md:h-96 rounded-[2.5rem] overflow-hidden flex items-center px-8 md:px-20 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="relative z-20 space-y-4 text-right">
                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1 rounded-full text-xs font-black border border-emerald-500/20">متجر بريمة المغربي 🇲🇦</span>
                <h1 className="text-4xl md:text-6xl font-black text-grad">الجودة التي <br/> تستحقها</h1>
                <button onClick={() => document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-400 transition-all">اكتشف الآن <ArrowRight size={20}/></button>
              </div>
            </header>

            {/* شبكة المنتجات */}
            <div id="grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 pt-8">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass rounded-[2rem] overflow-hidden cursor-pointer group hover:border-emerald-500/30 transition-all border border-white/5">
                  <div className="aspect-square overflow-hidden">
                    <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-5 text-right space-y-2">
                    <h3 className="font-bold text-sm md:text-base truncate text-slate-200">{p.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-500 font-black text-xl">{p.price} <span className="text-[10px]">DH</span></p>
                      <button className="bg-white/5 p-2 rounded-xl text-slate-400 group-hover:bg-emerald-500 group-hover:text-black transition-all"><Plus size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* لوحة التحكم للمسؤول */
          <div className="space-y-8 animate-in text-right">
            <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/5">
              <h2 className="text-2xl font-black text-grad">إدارة الطلبيات</h2>
              <button onClick={() => { setIsAdmin(false); setView('shop'); }} className="text-rose-500 font-bold hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all">تسجيل الخروج</button>
            </div>
            
            <div className="grid gap-4">
              <h3 className="font-bold text-xl px-2 flex items-center gap-2">آخر الطلبيات <span className="bg-emerald-500 text-black text-xs px-2 py-1 rounded-full">{orders.length}</span></h3>
              {orders.length === 0 ? (
                <div className="py-24 text-center glass rounded-[2.5rem] text-slate-500 font-bold border-2 border-dashed border-white/5">لا توجد طلبيات بعد</div>
              ) : (
                orders.map(o => (
                  <div key={o.orderId} className="glass p-6 rounded-[1.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-emerald-500/20 transition-all">
                    <div className="text-right flex-1">
                      <h4 className="font-black text-lg">{o.customer.fullName}</h4>
                      <p className="text-emerald-400 text-sm font-bold">{o.productTitle} — {o.productPrice} DH</p>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(o.orderDate).toLocaleString('ar-MA')}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-left">
                        <p className="font-bold text-lg">{o.customer.phoneNumber}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{o.customer.city}</p>
                      </div>
                      <a href={`https://wa.me/212${o.customer.phoneNumber.replace(/^0/, '')}`} target="_blank" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-lg"><MessageSquare size={24}/></a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* نافذة تسجيل الدخول */}
      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass p-10 rounded-[3rem] text-center space-y-8 border border-white/10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={40}/></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">لوحة التحكم</h3>
              <p className="text-xs text-slate-500 font-medium">أدخل كلمة السر للمتابعة</p>
            </div>
            <input type="password" placeholder="••••" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center text-3xl font-bold tracking-widest outline-none focus:border-emerald-500 transition-all" value={pass} onChange={e => setPass(e.target.value)} />
            <button onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else notify('كلمة السر خاطئة'); }} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20">دخول آمن</button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-sm font-bold hover:text-white transition-all">إلغاء</button>
          </div>
        </div>
      )}

      {/* نافذة المنتج والطلب */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isCheckout && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-in border border-white/10 max-h-[92vh]">
            <button onClick={() => { setSelectedProduct(null); setIsCheckout(false); }} className="absolute top-6 right-6 z-50 p-3 bg-black/50 rounded-full hover:bg-rose-500 transition-all text-white"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 bg-slate-900/50 flex items-center justify-center p-12">
              <img src={selectedProduct.thumbnail} className="max-h-64 md:max-h-full object-contain drop-shadow-2xl" />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-14 text-right overflow-y-auto no-scrollbar flex flex-col">
              {!isCheckout ? (
                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <span className="text-emerald-500 font-black text-[10px] tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">متوفر الآن</span>
                    <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">{selectedProduct.title}</h2>
                    <div className="flex justify-end gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor"/>)}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">{selectedProduct.description}</p>
                  <div className="pt-8 border-t border-white/5 mt-auto">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <p className="text-4xl font-black text-white">{selectedProduct.price} DH</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-1">توصيل مجاني بالمغرب 🚛</p>
                      </div>
                      <div className="text-slate-500 line-through font-bold text-lg">{selectedProduct.price + 100} DH</div>
                    </div>
                    <button onClick={() => setIsCheckout(true)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all">أطلب الآن — الدفع عند الاستلام</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-4">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white">إتمام الطلب</h3>
                    <p className="text-sm text-slate-500 font-medium">أدخل معلوماتك لنتصل بك ونوصل لك المنتج</p>
                  </div>
                  <div className="space-y-5">
                    <input type="text" placeholder="الإسم الكامل" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-right outline-none focus:border-emerald-500 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input type="tel" placeholder="رقم الهاتف (06..)" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-left outline-none focus:border-emerald-500 transition-all" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    <select className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl font-bold text-right outline-none appearance-none focus:border-emerald-500" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                      <option value="">اختر مدينتك</option>
                      {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pt-6 space-y-4">
                    <button onClick={handleOrder} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-400 transition-all">تأكيد الطلبية بنجاح</button>
                    <button onClick={() => setIsCheckout(false)} className="w-full text-slate-500 text-sm font-bold hover:text-white transition-all">العودة لوصف المنتج</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة النجاح */}
      {success && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
          <div className="max-w-md w-full glass p-14 rounded-[4rem] text-center space-y-10 animate-fade-in border border-emerald-500/20 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={54} strokeWidth={4}/></div>
            <div className="space-y-4">
                <h3 className="text-4xl font-black text-white">طلبك وصل!</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً لثقتك. سنتصل بك خلال أقل من 24 ساعة لتأكيد عنوان التوصيل.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="w-full bg-emerald-500 text-black py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-emerald-400">حسناً، شكراً</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
