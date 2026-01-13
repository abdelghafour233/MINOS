
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ArrowRight, LayoutDashboard, Lock, 
  MessageSquare, Check, ShoppingCart, Star, Trash2, Phone
} from 'lucide-react';

import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

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
      notify('المرجو ملئ جميع المعلومات المطلوبة');
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
    if (!window.confirm('هل تريد فعلاً حذف هذا الطلب؟')) return;
    const updated = orders.filter(o => o.orderId !== id);
    setOrders(updated);
    localStorage.setItem('berrima_orders', JSON.stringify(updated));
    notify('تم حذف الطلب بنجاح');
  };

  return (
    <div className={`min-h-screen ${selectedProduct || showLogin ? 'no-scroll' : ''}`}>
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold animate-in border border-white/20">
          {toast}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-18 md:h-screen glass z-[1000] flex md:flex-col items-center justify-around md:justify-center md:gap-10 border-t md:border-t-0 md:border-l border-white/10">
        <button 
          onClick={() => setView('shop')} 
          className={`p-4 rounded-2xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <ShoppingBag size={24}/>
        </button>
        <button 
          onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} 
          className={`p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <LayoutDashboard size={24}/>
        </button>
      </nav>

      <main className="md:pr-24 p-4 md:p-10 max-w-7xl mx-auto pb-28 md:pb-10">
        {view === 'shop' ? (
          <div className="space-y-12 animate-in">
            <header className="relative h-56 md:h-80 rounded-[2.5rem] overflow-hidden flex items-center px-8 md:px-16 border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=1500" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" 
                alt="Berrima Store Hero" 
              />
              <div className="relative z-20 space-y-4 text-right">
                <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20 tracking-widest uppercase">المغرب 🇲🇦</span>
                <h1 className="text-4xl md:text-6xl font-black text-grad leading-tight">بريمة ستور<br/>جودة تستحقها</h1>
                <p className="text-slate-400 font-bold max-w-md">أفضل المنتجات العصرية بين يديك مع خدمة توصيل سريعة ومجانية.</p>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass rounded-[2rem] overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all border border-white/10 group">
                  <div className="aspect-square bg-slate-900 overflow-hidden relative">
                    <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                  </div>
                  <div className="p-5 text-right space-y-3">
                    <h3 className="font-bold text-sm md:text-base truncate text-slate-100">{p.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-500 font-black text-xl">{p.price} <span className="text-[10px]">{STORE_CONFIG.currency}</span></p>
                      <div className="bg-white/5 p-2 rounded-xl text-emerald-500 transition-colors"><ShoppingCart size={18}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in text-right">
            <div className="flex justify-between items-center glass p-8 rounded-[2.5rem]">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-grad">إدارة الطلبات</h2>
                <p className="text-xs text-slate-500 font-bold">لديك {orders.length} طلبية حالية</p>
              </div>
              <button 
                onClick={() => { setIsAdmin(false); setView('shop'); }} 
                className="bg-rose-500/10 text-rose-500 font-black px-6 py-3 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              >
                تسجيل الخروج
              </button>
            </div>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-24 text-center glass rounded-[2.5rem] text-slate-500 font-bold border-2 border-dashed border-white/10">لا توجد طلبات حالياً</div>
              ) : (
                orders.map(o => (
                  <div key={o.orderId} className="glass p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5 hover:border-emerald-500/20 transition-all">
                    <div className="text-right flex-1 space-y-1">
                      <h4 className="font-black text-lg text-white">{o.customer.fullName}</h4>
                      <p className="text-emerald-400 text-sm font-bold">{o.productTitle} — {o.productPrice} {STORE_CONFIG.currency}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left ml-4">
                        <p className="font-bold text-lg text-white">{o.customer.phoneNumber}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{o.customer.city}</p>
                      </div>
                      <div className="flex gap-3">
                        <a href={`https://wa.me/212${o.customer.phoneNumber.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-lg border border-emerald-500/20"><MessageSquare size={20}/></a>
                        <button onClick={() => deleteOrder(o.orderId)} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass p-10 rounded-[3rem] text-center space-y-8 border border-white/20 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={40}/></div>
            <h3 className="text-2xl font-black">الدخول للوحة التحكم</h3>
            <input 
              type="password" 
              placeholder="••••" 
              className="input-field text-center text-3xl tracking-widest font-black" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
            <button 
              onClick={() => { if(pass === 'admin') { setIsAdmin(true); setShowLogin(false); setView('admin'); setPass(''); } else notify('كلمة السر خاطئة'); }} 
              className="w-full bg-emerald-500 text-black py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20"
            >دخول</button>
            <button onClick={() => setShowLogin(false)} className="text-slate-500 text-sm font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => !isCheckout && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-5xl glass rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-in border border-white/20 max-h-[92vh]">
            <button onClick={() => { setSelectedProduct(null); setIsCheckout(false); }} className="absolute top-6 right-6 z-50 p-3 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-all border border-white/10"><X size={20}/></button>
            <div className="w-full md:w-1/2 bg-slate-900/50 flex items-center justify-center p-12 overflow-hidden"><img src={selectedProduct.thumbnail} className="max-h-64 md:max-h-full object-contain drop-shadow-2xl" alt={selectedProduct.title} /></div>
            <div className="w-full md:w-1/2 p-8 md:p-14 text-right overflow-y-auto no-scrollbar bg-slate-950/80">
              {!isCheckout ? (
                <div className="space-y-8 flex flex-col h-full">
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">{selectedProduct.title}</h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">{selectedProduct.description}</p>
                  <div className="pt-8 border-t border-white/10">
                    <p className="text-4xl md:text-5xl font-black text-white mb-8">{selectedProduct.price} <span className="text-sm font-black text-emerald-500">{STORE_CONFIG.currency}</span></p>
                    <button onClick={() => setIsCheckout(true)} className="w-full bg-emerald-500 text-black py-5.5 rounded-2xl font-black text-xl shadow-2xl hover:bg-emerald-400 transition-all">أطلب الآن</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-4 animate-in">
                  <h3 className="text-3xl font-black text-white">إكمال الطلب</h3>
                  <div className="space-y-6">
                    <div><label>الإسم الكامل</label><input type="text" placeholder="يونس العلمي" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                    <div><label>رقم الهاتف</label><input type="tel" placeholder="06XXXXXXXX" className="input-field" style={{textAlign: 'left'}} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                    <div><label>المدينة</label><select className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})}><option value="">اختر المدينة</option>{MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                  <div className="pt-6 space-y-4">
                    <button onClick={handleOrder} className="w-full bg-emerald-500 text-black py-5.5 rounded-2xl font-black text-xl">تأكيد الطلب</button>
                    <button onClick={() => setIsCheckout(false)} className="w-full text-slate-500 text-sm font-bold">رجوع</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl">
          <div className="max-w-md w-full glass p-14 rounded-[4rem] text-center space-y-10 border border-emerald-500/30">
            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={56} strokeWidth={4}/></div>
            <h3 className="text-4xl font-black text-white">تم استلام طلبك!</h3>
            <p className="text-slate-400 font-bold text-lg">سنتصل بك قريباً لتأكيد طلبك.</p>
            <button onClick={() => setSuccess(false)} className="w-full bg-emerald-500 text-black py-5.5 rounded-[2rem] font-black text-xl">حسناً</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
