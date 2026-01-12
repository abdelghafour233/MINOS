
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Share2, Copy, Facebook, Link as LinkIcon, Camera, 
  Activity, Info, CheckCircle2, AlertTriangle, Plus,
  ChevronDown, Search, ArrowUpRight, Zap, Award, UploadCloud, Download
} from 'lucide-react';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const adminPassword = 'admin'; 

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'settings'>('orders');
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>(''); 
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('الكل');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | ''}>({message: '', type: ''});
  
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [loginError, setLoginError] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  const STORAGE_KEY_PRODUCTS = 'ecom_products_v7';
  const STORAGE_KEY_ORDERS = 'ecom_orders_v7';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    // الأولوية دائماً لبيانات constants.tsx إذا لم يقم المستخدم بتعديل شيء محلياً
    // هذا يضمن أن الحملات الإعلانية ترى التعديلات الجديدة في الكود
    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    setProducts(savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS);
    
    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    setOrders(savedOrders ? JSON.parse(savedOrders) : []);

    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);
  }, []);

  const handleAdminClick = () => {
    if (isAdminAuthenticated) setView('admin');
    else setShowLoginModal(true);
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = isAddingProduct ? [editingProduct, ...products] : products.map(p => p.id === editingProduct.id ? editingProduct : p);
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    setEditingProduct(null);
    setIsAddingProduct(false);
    showToast('تم الحفظ محلياً. لتثبيته للجميع، انسخ الكود من الإعدادات.');
  };

  const copyProductsCode = () => {
    const code = `export const MOCK_PRODUCTS: StoreProduct[] = ${JSON.stringify(products, null, 2)};`;
    navigator.clipboard.writeText(code);
    showToast('تم نسخ كود المنتجات! ضعه في ملف constants.tsx');
  };

  const confirmOrder = () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !selectedProduct) {
      showToast('المرجو ملأ جميع الخانات المطلوبة', 'error');
      return;
    }
    
    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productPrice: selectedProduct.price,
      customer: { ...customerInfo },
      orderDate: new Date().toLocaleDateString('ar-MA'),
      status: 'pending'
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
    
    setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
  };

  useEffect(() => {
    if (selectedProduct) setActiveGalleryImage(selectedProduct.thumbnail);
  }, [selectedProduct]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-bold text-sm`}>
          {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle2 size={16}/>}
          {toast.message}
        </div>
      )}

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-t-0 md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10 pb-2">
        <div className="hidden md:flex flex-col items-center gap-2 mb-10"><div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg"><Zap size={24} fill="black" /></div></div>
        <div className="flex md:flex-col gap-6 md:gap-10 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${view === 'shop' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}><ShoppingBag size={22} /><span className="text-[10px] md:hidden font-bold">المتجر</span></button>
          <button onClick={handleAdminClick} className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${view === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}><LayoutDashboard size={22} /><span className="text-[10px] md:hidden font-bold">الإدارة</span></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500 flex flex-col items-center gap-1">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}<span className="text-[10px] md:hidden font-bold">السمة</span></button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen pb-24 md:pb-0">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <section className="relative h-[300px] md:h-[500px] rounded-[2rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/70 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
              <div className="relative z-20 max-w-2xl space-y-4 md:space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black"><Award size={12} /> جودة مضمونة</span>
                <h1 className="text-3xl md:text-7xl font-black leading-tight text-gradient">تكنولوجيا المستقبل <br/> بين يديك اليوم</h1>
                <p className="text-slate-400 text-sm md:text-xl font-medium max-w-sm">أفضل المنتجات المختارة بعناية لتناسب ذوقك الرفيع.</p>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-6 py-3 md:px-8 md:py-4 rounded-xl font-black text-sm md:text-lg flex items-center gap-2 premium-btn">استعرض المنتجات <ArrowRight size={18} /></button>
              </div>
            </section>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-[11px] font-black transition-all ${activeTab === cat ? 'bg-emerald-500 text-black shadow-lg scale-105' : 'glass-morphism text-slate-400'}`}>{cat}</button>
              ))}
            </div>

            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
              {(activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map((product, idx) => (
                <div key={product.id} className="group product-card-glow glass-morphism rounded-3xl overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="aspect-[4/5] overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.thumbnail} className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" alt={product.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a18]/80 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-3 md:p-6 space-y-2 flex-1 flex flex-col">
                    <h3 className="font-black text-xs md:text-lg line-clamp-1">{product.title}</h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto gap-2">
                      <p className="text-lg md:text-2xl font-black text-emerald-500">{product.price} <span className="text-[10px]">DH</span></p>
                      <button onClick={() => setSelectedProduct(product)} className="w-full md:w-12 h-10 md:h-12 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-xl flex items-center justify-center transition-all border border-white/5"><ShoppingCart size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <h2 className="text-3xl md:text-4xl font-black text-gradient">إدارة المتجر</h2>
                <p className="text-slate-500 font-bold text-sm">التعديلات هنا تُحفظ في متصفحك فقط</p>
              </div>
              <div className="flex gap-2 glass-morphism p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                <button onClick={() => setAdminTab('orders')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>الطلبيات ({orders.length})</button>
                <button onClick={() => setAdminTab('products')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>المنتجات ({products.length})</button>
                <button onClick={() => setAdminTab('settings')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><Settings size={18} /></button>
              </div>
            </header>

            {adminTab === 'settings' && (
              <div className="max-w-2xl mx-auto p-10 glass-morphism rounded-[3rem] text-center space-y-6">
                <div className="p-6 bg-emerald-500/10 text-emerald-500 rounded-3xl inline-block mb-4"><Download size={40} /></div>
                <h3 className="text-2xl font-black">نشر التعديلات للجميع</h3>
                <p className="text-slate-400 font-medium">إذا قمت بتغيير الصور أو الأسعار وتريد أن يراها كل زبنائك في الإعلانات، اضغط على الزر أسفله وانسخ الكود إلى ملف <code className="text-emerald-500">constants.tsx</code> في مشروعك.</p>
                <button onClick={copyProductsCode} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn flex items-center justify-center gap-3"><Copy size={20} /> نسخ كود البيانات الجديد</button>
              </div>
            )}

            {adminTab === 'products' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة', galleryImages: [] }); setIsAddingProduct(true); }}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all group"
                >
                  <Plus size={32} />
                  <span className="font-black text-xs">إضافة منتج</span>
                </button>
                {products.map(p => (
                  <div key={p.id} className="glass-morphism rounded-3xl overflow-hidden group relative">
                    <img src={p.thumbnail} className="w-full h-full object-cover aspect-square" alt={p.title} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }} className="p-2.5 bg-white text-black rounded-lg"><Edit3 size={16} /></button>
                      <button onClick={() => { if(window.confirm('حذف؟')) setProducts(products.filter(pr => pr.id !== p.id)) }} className="p-2.5 bg-rose-500 text-white rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {adminTab === 'orders' && (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.orderId} className="glass-morphism p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center"><Package size={18} /></div>
                      <div>
                        <h4 className="font-black text-sm">{order.customer.fullName}</h4>
                        <p className="text-[10px] text-slate-500">{order.productTitle}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-emerald-500">{order.productPrice} DH</p>
                      <p className="text-[9px] text-slate-500">{order.customer.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Details */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full h-full md:h-auto md:max-w-6xl md:rounded-[3rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-3 bg-black/40 rounded-full text-white shadow-2xl"><X size={20} /></button>
             <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-slate-900 relative">
                <img src={activeGalleryImage} className="w-full h-full object-cover" alt={selectedProduct.title} />
                {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0) && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar">
                    {[selectedProduct.thumbnail, ...selectedProduct.galleryImages].map((img, i) => (
                      <button key={i} onClick={() => setActiveGalleryImage(img)} className={`w-12 h-12 rounded-lg border-2 transition-all ${activeGalleryImage === img ? 'border-emerald-500 scale-105' : 'border-white/10 opacity-60'}`}><img src={img} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}
             </div>
             <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col overflow-y-auto no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-6 md:space-y-8 my-auto">
                    <div className="space-y-3">
                      <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black">{selectedProduct.category}</span>
                      <h2 className="text-2xl md:text-5xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <p className="text-slate-400 text-sm md:text-lg leading-relaxed font-medium whitespace-pre-wrap">{selectedProduct.description}</p>
                    </div>
                    <div className="p-5 md:p-8 glass-morphism rounded-3xl flex items-center justify-between">
                      <div><p className="text-[10px] font-black text-slate-500 uppercase">السعر</p><p className="text-3xl md:text-5xl font-black text-emerald-500">{selectedProduct.price} <span className="text-base">DH</span></p></div>
                      <div className="text-right text-xs md:text-base font-bold text-slate-300"><p className="flex items-center gap-1.5 justify-end"><Truck size={16} /> توصيل مجاني</p><p className="flex items-center gap-1.5 justify-end"><ShieldCheck size={16} /> جودة مضمونة</p></div>
                    </div>
                    {/* الزر المهتز والمتحرك */}
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-5 md:py-6 rounded-2xl font-black text-lg md:text-2xl premium-btn animate-buy-pulse shadow-2xl shadow-emerald-500/20">اشتري الآن - الدفع عند الاستلام</button>
                  </div>
                ) : (
                  <div className="space-y-8 my-auto">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-2.5 rounded-lg bg-white/5 text-slate-400"><ChevronLeft size={20} /></button><h3 className="text-2xl md:text-3xl font-black text-gradient">إتمام الطلب</h3></div>
                     <div className="space-y-4">
                       <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 pr-3">الاسم بالكامل</label><input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} /></div>
                       <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 pr-3">المدينة</label><select className