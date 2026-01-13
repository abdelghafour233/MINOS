
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ArrowRight, LayoutDashboard, Lock, 
  Plus, MessageSquare, Check, ShoppingCart, Star, Trash2
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

  // تحميل البيانات من الذاكرة المحلية
  useEffect(() => {
    const savedOrders = localStorage.getItem('berrima_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOrder = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.city) {
      notify('المرجو ملئ كل الخانات بشكل صحيح');
      return;
    }
    
    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      productId: selectedProduct?.id || '',
      productTitle: selectedProduct?.title || '',
      productPrice: selectedProduct?.price || 0,
      customer: { 
        fullName: form.name, 
        phoneNumber: form.phone, 
        city: form.city, 
        address: 'توصيل منزلي' 
      },
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

  const deleteOrder = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    const updated = orders.filter(o => o.orderId !== id);
    setOrders(updated);
    localStorage.setItem('berrima_orders', JSON.stringify(updated));
    notify('تم حذف الطلب بنجاح');
  };

  return (
    <div className={`min-h-screen ${selectedProduct || showLogin ? 'no-scroll' : ''}`}>
      
      {/* التنبيهات المنبثقة */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold animate-in">
          {toast}
        </div>
      )}

      {/* شريط التنقل (Navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-20 md:h-screen glass z-[1000] flex md:flex-col items-center justify-around md:justify-center md:gap-12 border-t md:border-t-0 md:border-l border-white/10">
        <button 
          onClick={() => setView('shop')} 
          className={`p-4 rounded-2xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
        >
          <ShoppingBag size={24}/>
        </button>
        <button 
          onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} 
          className={`p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
        >
          <LayoutDashboard size={24}/>
        </button>
      </nav>

      <main className="md:pr-24 p-4 md:p-12 max-w-7xl mx-auto pb-24 md:pb-12">
        {view === 'shop' ? (
          <div className="space-y-12 animate-in">
            {/* واجهة المتجر الرئيسية */}
            <header className="relative h-64 md:h-96 rounded-[2.5rem] overflow-hidden flex items-center px-8 md:px-20 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hero" />
              <div className="relative z-20 space-y-4 text-right">
                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1 rounded-full text-xs font-black border border-emerald-500/20">متجر بريمة المغربي الأصيل 🇲🇦</span>
                <h1 className="text-4xl md:text-6xl font-black text-grad leading-tight">منتجات مختارة <br/> بعناية فائقة</h1>
                <button onClick={() => document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-all">تصفح الآن <ArrowRight size={20}/></button>
              </div>
            </header>

            {/* عرض المنتجات */}
            <div id="grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 pt-8">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass rounded-[2rem] overflow-hidden cursor-pointer group hover:border-emerald-500/30 transition-all border border-white/10">
                  <div className="aspect-square overflow-hidden bg-slate-900">
                    <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                  </div>
                  <div className="p-5 text-right space-y-2">
                    <h3 className="font-bold text-sm md:text-base truncate text-slate-200">{p.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-500 font-black text-xl">{p.price} <span className="text-[10px]">DH</span></p>
                      <div className="bg-white/5 p-2 rounded-xl text-emerald-500"><ShoppingCart size={18}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* لوحة التحكم (Admin Dashboard) */
          <div className="space-y-8 animate-in text-right">
            <div className="flex justify-between items-center glass p-8 rounded-[2rem]">
              <h2 className="text-2xl font-black text-grad">لوحة إدارة الطلبات</h2>
              <button onClick={() => { setIsAdmin(false); setView('shop'); }} className="bg-rose-500/10 text-rose-500 font-bold px-6 py-3 rounded-xl hover:bg-rose-500 hover:text-white transition-all">خروج</button>
            </div>
            
            <div className="grid gap-6">
              <h3 className="font-bold text-xl px-2">جميع الطلبيات ({orders.length})</h3>
              
              {orders.length === 0 ? (
                <div className="py-24 text-center glass rounded-[2.5rem] text-slate-500 font-bold border-2 border-dashed border-white/10">لا توجد أي طلبات حالياً</div>
              ) : (
                orders.map(o => (
                  <div key={o.orderId} className="glass p-6 rounded-[1.8rem] flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5 hover:border-emerald-500/20 transition-all group">
                    <div className="text-right flex-1 space-y-1">
                      <h4 className="font-black text-lg text-white">{o.customer.fullName}</h4>
                      <p className="text-emerald-400 text-sm font-bold">{o.productTitle} — {o.productPrice} DH</p>
                      <p className="text-[10px] text-slate-500">{new Date(o.orderDate).toLocaleString('ar-MA')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left ml-4">
                        <p className="font-bold text-lg text-white">{o.customer.phoneNumber}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{o.customer.city}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`https://wa.me/212${o.customer.phoneNumber.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-lg"><MessageSquare size={22}/></a>
                        <button onClick={() => deleteOrder(o.orderId)} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={22}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* تسجيل دخول المسؤول */}
      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass p-10 rounded-[3rem] text-center space-y-8 border border-white/20">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={40}/></div>
            <h3 className="text-2xl font-black">الدخول للمسؤول</h3>
            <input 
              type="password" 
              placeholder="••••" 
              className="w-full p-5 rounded-2xl text-center text-3xl font-bold tracking-widest outline-none" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
            <button 
              onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else notify('كلمة السر خاطئة'); }} 
              className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg"
            >
              دخول
            </button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-sm font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {/* نافذة عرض المنتج وإتمام الطلب */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isCheckout && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-in border border-white/20 max-h-[95vh]">
            <button onClick={() => { setSelectedProduct(null); setIsCheckout(false); }} className="absolute top-6 right-6 z-50 p-3 bg-black/50 rounded-full hover:bg-rose-500 transition-all text-white"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 bg-slate-900/50 flex items-center justify-center p-12">
              <img src={selectedProduct.thumbnail} className="max-h-64 md:max-h-full object-contain drop-shadow-2xl" alt={selectedProduct.title} />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-14 text-right overflow-y-auto bg-[#0a1228]">
              {!isCheckout ? (
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">{selectedProduct.title}</h2>
                  <div className="flex justify-end gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor"/>)}
                  </div>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <p className="text-4xl font-black text-emerald-500">{selectedProduct.price} DH</p>
                        <p className="text-[10px] text-white/50 font-bold mt-1 uppercase">توصيل مجاني 🚛</p>
                      </div>
                      <div className="text-slate-500 line-through font-bold text-lg">{selectedProduct.price + 100} DH</div>
                    </div>
                    <button onClick={() => setIsCheckout(true)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl hover:bg-emerald-400 transition-all">أطلب الآن</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-4 animate-in">
                  <h3 className="text-3xl font-black text-white">معلوماتك للتوصيل</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 mr-1">الإسم الكامل</label>
                      <input type="text" placeholder="مثال: أحمد العلمي" className="w-full p-4 font-bold text-right" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 mr-1">رقم الهاتف</label>
                      <input type="tel" placeholder="06XXXXXXXX" className="w-full p-4 font-bold text-left" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2 mr-1">المدينة</label>
                      <select className="w-full p-4 font-bold text-right" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                        <option value="">اختر مدينتك</option>
                        {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-6 space-y-4">
                    <button onClick={handleOrder} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-400">تأكيد الطلب</button>
                    <button onClick={() => setIsCheckout(false)} className="w-full text-slate-500 text-sm font-bold">رجوع</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة النجاح */}
      {success && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
          <div className="max-w-md w-full glass p-14 rounded-[4rem] text-center space-y-10 border border-emerald-500/30">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={54} strokeWidth={4}/></div>
            <div className="space-y-4">
                <h3 className="text-4xl font-black text-white">تم استلام طلبك!</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">سنتصل بك قريباً لتأكيد الإرسال. شكراً لثقتك بمتجر بريمة.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="w-full bg-emerald-500 text-black py-5 rounded-3xl font-black text-xl">حسناً</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
