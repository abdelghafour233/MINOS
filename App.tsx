
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ChevronLeft, ChevronDown,
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, Sun, Moon,
  CheckCircle2, AlertTriangle, Plus, RefreshCw, Terminal, Copy
} from 'lucide-react';
import { StoreProduct, StoreOrder } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES } from './constants';

const adminPassword = 'admin'; 

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products'>('orders');
  
  const [products, setProducts] = useState<StoreProduct[]>(() => {
    const saved = localStorage.getItem('local_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });
  
  const [orders, setOrders] = useState<StoreOrder[]>(() => {
    const saved = localStorage.getItem('local_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | ''}>({message: '', type: ''});
  
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [customerInfo, setCustomerInfo] = useState({ fullName: '', phoneNumber: '', city: '' });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  useEffect(() => {
    localStorage.setItem('local_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('local_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setIsAdminAuthenticated(true);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 5000);
  };

  const confirmOrder = () => {
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
      orderDate: new Date().toLocaleDateString('ar-MA')
    };
    
    setOrders([newOrder, ...orders]);
    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
    setCustomerInfo({ fullName: '', phoneNumber: '', city: '' });
    showToast('تم تسجيل طلبك محلياً بنجاح');
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const index = products.findIndex(p => p.id === editingProduct.id);
    if (index > -1) {
      const updatedProducts = [...products];
      updatedProducts[index] = editingProduct;
      setProducts(updatedProducts);
    } else {
      setProducts([editingProduct, ...products]);
    }
    
    showToast('تم حفظ المنتج في الذاكرة المحلية');
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (!window.confirm('هل تريد حذف المنتج؟')) return;
    setProducts(products.filter(p => p.id !== id));
    showToast('تم حذف المنتج');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 pb-20 md:pb-0`}>
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-black text-sm max-w-[90vw] text-center`}>
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
            <header className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/70 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-xl space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest"><Sparkles size={14} /> بضاعة مغربية مختارة</span>
                <h1 className="text-3xl md:text-5xl font-black text-gradient leading-tight">فخامة التسوق <br/> بين يديك</h1>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-lg premium-btn flex items-center gap-2">تسوق الآن <ArrowRight size={22} /></button>
              </div>
            </header>

            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pt-6">
              {products.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Package size={64} className="mx-auto text-slate-700" />
                  <p className="text-slate-500 font-bold">المتجر فارغ حالياً.</p>
                </div>
              ) : products.map((product) => (
                <div key={product.id} className="group glass-morphism rounded-[2rem] overflow-hidden flex flex-col border border-white/5 product-card-glow">
                  <div className="aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <h3 className="font-black text-sm md:text-base line-clamp-1">{product.title}</h3>
                    <p className="text-xl md:text-2xl font-black text-emerald-500">{product.price} DH</p>
                    <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 py-3 rounded-xl border border-white/10 font-black text-xs hover:bg-emerald-500 hover:text-black transition-all">اطلب الآن</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-12 max-w-6xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-black text-gradient">إدارة المتجر</h2>
              
              <div className="flex gap-2 glass-morphism p-2 rounded-2xl border border-white/5">
                <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl text-xs font-black ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>الطلبات</button>
                <button onClick={() => setAdminTab('products')} className={`px-5 py-2.5 rounded-xl text-xs font-black ${adminTab === 'products' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>المنتجات</button>
                <button onClick={() => { setIsAdminAuthenticated(false); sessionStorage.removeItem('admin_auth'); setView('shop'); }} className="px-5 py-2.5 rounded-xl text-xs font-black text-rose-500">خروج</button>
              </div>
            </header>

            {adminTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                   <h3 className="font-black text-lg">سجل الطلبات ({orders.length})</h3>
                   <button onClick={() => { setOrders([]); localStorage.removeItem('local_orders'); showToast('تم مسح السجل'); }} className="text-xs text-rose-500 font-bold border border-rose-500/20 px-3 py-1 rounded-lg">مسح الكل</button>
                </div>
                {orders.length === 0 ? <div className="py-20 text-center text-slate-500 font-bold">لا توجد طلبيات مسجلة</div> : orders.map((order, i) => (
                  <div key={i} className="glass-morphism p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center font-black">#</div>
                      <div>
                        <h4 className="font-black text-lg md:text-xl">{order.customer.fullName}</h4>
                        <p className="text-sm text-slate-500 font-bold">{order.customer.phoneNumber} - {order.customer.city}</p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-xs font-black text-emerald-500 mb-2">{order.productTitle}</p>
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">{order.orderDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'products' && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <button onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'أدوات منزلية', description: '', thumbnail: '', galleryImages: [], stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة' }); }} className="aspect-square glass-morphism rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                    <Plus size={40}/>
                    <span className="font-black text-xs mt-2">إضافة منتج</span>
                 </button>
                 {products.map(p => (
                   <div key={p.id} className="glass-morphism rounded-[2rem] overflow-hidden border border-white/5 group">
                      <img src={p.thumbnail} className="aspect-square object-cover" />
                      <div className="p-4 space-y-3">
                        <h4 className="font-black text-xs truncate">{p.title}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="flex-1 bg-white/5 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-500 hover:text-black">تعديل</button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}
      </main>

      {/* مودال تعديل المنتج */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#050a18]/95 backdrop-blur-xl">
          <form onSubmit={saveProduct} className="max-w-3xl w-full glass-morphism p-8 md:p-12 rounded-[3rem] space-y-6 overflow-y-auto max-h-[90vh] border border-white/5 no-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black text-gradient">إدارة بيانات المنتج</h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="p-2 bg-white/5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase px-1">اسم المنتج *</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase px-1">السعر (DH) *</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase px-1">رابط الصورة الرئيسية *</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm text-ltr" value={editingProduct.thumbnail} onChange={e => setEditingProduct({...editingProduct, thumbnail: e.target.value})} /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">الفئة</label>
                <div className="relative">
                  <select className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl font-bold text-sm appearance-none outline-none focus:border-emerald-500" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}>
                    {CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase px-1">وصف المنتج</label><textarea required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm h-32" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase px-1">صور المعرض (رابط في كل سطر)</label><textarea className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-xs h-32 text-ltr" value={editingProduct.galleryImages?.join('\n')} onChange={e => setEditingProduct({...editingProduct, galleryImages: e.target.value.split('\n').filter(url => url.trim() !== '')})} /></div>
            <div className="flex gap-4 pt-6"><button type="submit" className="flex-1 bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/10">حفظ المنتج</button></div>
          </form>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-xl glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5 shadow-2xl">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-2 bg-black/40 rounded-full text-white hover:bg-rose-500"><X size={18} /></button>
             <div className="w-full md:w-[40%] h-[20vh] md:h-auto bg-slate-950/40 flex items-center justify-center p-8"><img src={selectedProduct.thumbnail} className="max-w-full max-h-full object-contain drop-shadow-2xl" /></div>
             <div className="w-full md:w-[60%] p-6 md:p-10 flex flex-col border-t md:border-t-0 md:border-r border-white/5 overflow-y-auto max-h-[70vh] md:max-h-full no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-3"><h2 className="text-xl md:text-3xl font-black text-gradient">{selectedProduct.title}</h2><p className="text-slate-400 text-[11px] md:text-sm leading-relaxed whitespace-pre-line">{selectedProduct.description}</p></div>
                    <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between"><p className="text-3xl md:text-4xl font-black text-emerald-500">{selectedProduct.price} DH</p><p className="text-emerald-500 font-black text-[10px] flex items-center gap-1"><Truck size={14}/> توصيل مجاني</p></div>
                      <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-2xl font-black text-lg animate-buy-pulse">أطلب الآن - الدفع عند الاستلام</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col h-full">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><ChevronLeft size={20}/></button><h3 className="text-xl font-black text-gradient">بيانات الطلب</h3></div>
                     <div className="space-y-5 flex-1">
                       <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><User size={12}/> الإسم بالكامل *</label><input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-sm focus:border-emerald-500 outline-none" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="أحمد العبدلاوي" /></div>
                       <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Phone size={12}/> رقم الهاتف *</label><input type="tel" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-sm text-left focus:border-emerald-500 outline-none" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06 XX XX XX XX" /></div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><MapPin size={12}/> المدينة *</label>
                         <div className="relative">
                           <select className="w-full bg-slate-900/80 border border-white/20 p-4 rounded-xl font-bold text-sm appearance-none outline-none focus:border-emerald-500 transition-all text-white" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                             <option value="" className="bg-slate-900 text-slate-400">اختر مدينتك</option>
                             {MOROCCAN_CITIES.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                           </select>
                           <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                         </div>
                       </div>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-2xl font-black text-lg premium-btn mt-4 shadow-xl">تأكيد الطلب</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 md:p-12 rounded-[3rem] text-center space-y-8 animate-fade-in-up border border-emerald-500/20">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={54} /></div>
            <h3 className="text-3xl font-black text-gradient">تم تسجيل طلبك!</h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً لثقتك، سنتصل بك قريباً.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg shadow-xl">إغلاق</button>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass-morphism p-10 rounded-[3rem] space-y-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20"><Lock size={40}/></div>
            <input type="password" placeholder="الرمز السري" className="w-full bg-white/5 border border-white/10 p-5 rounded-xl font-bold text-center text-3xl tracking-widest" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('الرمز خاطئ', 'error')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg">دخول</button>
            <button onClick={() => setShowLoginModal(false)} className="text-slate-500 text-xs font-bold">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
