import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ArrowRight, LayoutDashboard, Lock, 
  MessageSquare, Check, ShoppingCart, Star, Trash2
} from 'lucide-react';

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [products] = useState<StoreProduct[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [toast, setToast] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pass, setPass] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', city: '' });
  const [success, setSuccess] = useState(false);

  // تحميل الطلبات من ذاكرة المتصفح
  useEffect(() => {
    const saved = localStorage.getItem('berrima_orders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOrder = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.city) {
      notify('المرجو ملئ كل الخانات');
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
    const updated = orders.filter(o => o.orderId !== id);
    setOrders(updated);
    localStorage.setItem('berrima_orders', JSON.stringify(updated));
    notify('تم حذف الطلب');
  };

  return (
    <div className={`min-h-screen ${selectedProduct || showLogin ? 'no-scroll' : ''}`}>
      
      {/* تنبيه */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl font-bold animate-in">
          {toast}
        </div>
      )}

      {/* الملاحة السفلى */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-20 h-16 md:h-screen glass z-[1000] flex md:flex-col items-center justify-around md:justify-center md:gap-8 border-t md:border-t-0 md:border-l border-white/10">
        <button onClick={() => setView('shop')} className={`p-3 rounded-xl ${view === 'shop' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><ShoppingBag size={24}/></button>
        <button onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} className={`p-3 rounded-xl ${view === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><LayoutDashboard size={24}/></button>
      </nav>

      <main className="md:pr-20 p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
        {view === 'shop' ? (
          <div className="space-y-8 animate-in">
            <header className="relative h-48 md:h-64 rounded-3xl overflow-hidden flex items-center px-6 md:px-12 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=1500" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Hero" />
              <div className="relative z-20 space-y-2 text-right">
                <h1 className="text-3xl md:text-5xl font-black text-grad">متجر بريمة المغربي</h1>
                <p className="text-slate-400 font-bold">جودة عالية وتوصيل سريع 🇲🇦</p>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all border border-white/5">
                  <div className="aspect-square bg-slate-900"><img src={p.thumbnail} className="w-full h-full object-cover" alt={p.title} /></div>
                  <div className="p-4 text-right space-y-2">
                    <h3 className="font-bold text-xs md:text-sm truncate text-slate-200">{p.title}</h3>
                    <p className="text-emerald-500 font-black text-lg">{p.price} DH</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in text-right">
            <div className="flex justify-between items-center glass p-6 rounded-3xl">
              <h2 className="text-xl font-black">إدارة الطلبات ({orders.length})</h2>
              <button onClick={() => { setIsAdmin(false); setView('shop'); }} className="text-rose-500 font-bold text-sm">خروج</button>
            </div>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-bold">لا توجد طلبات</div>
              ) : (
                orders.map(o => (
                  <div key={o.orderId} className="glass p-5 rounded-2xl flex justify-between items-center border border-white/5">
                    <div className="text-right">
                      <h4 className="font-bold text-white">{o.customer.fullName}</h4>
                      <p className="text-emerald-400 text-sm">{o.productTitle} - {o.productPrice} DH</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/212${o.customer.phoneNumber.replace(/^0/, '')}`} target="_blank" className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><MessageSquare size={20}/></a>
                      <button onClick={() => deleteOrder(o.orderId)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* تسجيل الدخول */}
      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95">
          <div className="max-w-xs w-full glass p-8 rounded-3xl text-center space-y-6">
            <h3 className="text-xl font-black">دخول المسؤول</h3>
            <input 
              type="password" 
              placeholder="••••" 
              className="input-field text-center text-2xl tracking-widest" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
            <button 
              onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else notify('خطأ'); }} 
              className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black"
            >دخول</button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {/* المنتج والطلب */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => !isCheckout && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row animate-in max-h-[90vh]">
            <button onClick={() => { setSelectedProduct(null); setIsCheckout(false); }} className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 bg-slate-900/50 flex items-center justify-center p-8">
              {/* Fix: Replaced 'p.title' with 'selectedProduct.title' to resolve 'Cannot find name p' error */}
              <img src={selectedProduct.thumbnail} className="max-h-48 md:max-h-full object-contain" alt={selectedProduct.title} />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-10 text-right overflow-y-auto bg-[#0a1228]">
              {!isCheckout ? (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-black text-white">{selectedProduct.title}</h2>
                  <div className="flex justify-end gap-1 text-amber-500"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedProduct.description}</p>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-3xl font-black text-emerald-500 mb-4">{selectedProduct.price} DH</p>
                    <button onClick={() => setIsCheckout(true)} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg">أطلب الآن</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in">
                  <h3 className="text-2xl font-black text-white">معلومات التوصيل</h3>
                  <div className="space-y-4 text-right">
                    <div>
                      <label>الإسم الكامل</label>
                      <input type="text" placeholder="الإسم الكامل" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <label>رقم الهاتف</label>
                      <input type="tel" placeholder="06XXXXXXXX" className="input-field" style={{textAlign: 'left'}} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                    <div>
                      <label>المدينة</label>
                      <select className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                        <option value="">اختر المدينة</option>
                        {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handleOrder} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg shadow-xl">تأكيد الطلب</button>
                  <button onClick={() => setIsCheckout(false)} className="w-full text-slate-500 text-sm">رجوع</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نجاح الطلب */}
      {success && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/95">
          <div className="max-w-md w-full glass p-10 rounded-[3rem] text-center space-y-6 border border-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={40} strokeWidth={4}/></div>
            <h3 className="text-3xl font-black text-white">تم الطلب بنجاح!</h3>
            <p className="text-slate-400 font-bold">سنتصل بك قريباً لتأكيد طلبيتك.</p>
            <button onClick={() => setSuccess(false)} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black">حسناً</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
