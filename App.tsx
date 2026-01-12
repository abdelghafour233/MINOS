
import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Share2, Copy, Facebook, Link as LinkIcon, Camera, 
  Activity, Info, CheckCircle2, AlertTriangle, Plus,
  ChevronDown, Search, ArrowUpRight, Zap, Award, UploadCloud
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

  const STORAGE_KEY_PRODUCTS = 'ecom_products_v6';
  const STORAGE_KEY_ORDERS = 'ecom_orders_v6';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    setProducts(savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS);
    
    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    setOrders(savedOrders ? JSON.parse(savedOrders) : []);

    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnail' | 'gallery') => {
    const files = e.target.files;
    if (!files || !editingProduct) return;

    if (target === 'thumbnail') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, thumbnail: reader.result as string });
      };
      if (files[0]) {
        reader.readAsDataURL(files[0] as Blob);
      }
    } else {
      Array.from(files as FileList).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingProduct(prev => {
            if (!prev) return null;
            const currentGallery = prev.galleryImages || [];
            return { ...prev, galleryImages: [...currentGallery, reader.result as string] };
          });
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    if (!editingProduct) return;
    const updatedGallery = [...(editingProduct.galleryImages || [])];
    updatedGallery.splice(index, 1);
    setEditingProduct({ ...editingProduct, galleryImages: updatedGallery });
  };

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
    showToast('تم تحديث المتجر بنجاح');
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
    
    setCustomerInfo({
      fullName: '',
      phoneNumber: '',
      city: '',
      address: ''
    });
  };

  useEffect(() => {
    if (selectedProduct) {
      setActiveGalleryImage(selectedProduct.thumbnail);
    }
  }, [selectedProduct]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-bold text-sm text-center`}>
          {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle2 size={16}/>}
          {toast.message}
        </div>
      )}

      {/* Modern Sidebar / Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-t-0 md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10 pb-2">
        <div className="hidden md:flex flex-col items-center gap-2 mb-10">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20"><Zap size={24} fill="black" /></div>
        </div>
        <div className="flex md:flex-col gap-6 md:gap-10 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl md:rounded-2xl transition-all flex flex-col items-center gap-1 ${view === 'shop' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-emerald-500'}`}>
            <ShoppingBag size={22} />
            <span className="text-[10px] md:hidden font-bold">المتجر</span>
          </button>
          <button onClick={handleAdminClick} className={`p-3 rounded-xl md:rounded-2xl transition-all flex flex-col items-center gap-1 ${view === 'admin' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-emerald-500'}`}>
            <LayoutDashboard size={22} />
            <span className="text-[10px] md:hidden font-bold">الإدارة</span>
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500 hover:text-emerald-500 transition-all flex flex-col items-center gap-1">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            <span className="text-[10px] md:hidden font-bold">السمة</span>
          </button>
        </div>
        <div className="hidden md:block mt-auto"><div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500"><User size={20} /></div></div>
      </nav>

      <main className="md:pr-24 min-h-screen pb-24 md:pb-0">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            {/* Hero Section */}
            <section className="relative h-[300px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/70 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
              <div className="relative z-20 max-w-2xl space-y-4 md:space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-black uppercase tracking-widest"><Award size={12} /> جودة مضمونة</span>
                <h1 className="text-3xl md:text-7xl font-black leading-tight text-gradient">اكتشف الرقي في <br/> تسوقك المفضل</h1>
                <p className="text-slate-400 text-sm md:text-xl font-medium max-w-sm md:max-w-lg">أفضل المنتجات العالمية تصلك لباب منزلك في كافة أنحاء المغرب.</p>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg flex items-center gap-2 premium-btn">تسوق الآن <ArrowRight size={18} /></button>
              </div>
            </section>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-[11px] md:text-xs font-black transition-all ${activeTab === cat ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105' : 'glass-morphism text-slate-400 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid - 2 columns on mobile */}
            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
              {products.length === 0 ? (
                <div className="col-span-full py-40 text-center opacity-20"><ShoppingBag size={80} className="mx-auto mb-4" /><p className="text-xl md:text-2xl font-black">المتجر بانتظار منتجاتك الأولى...</p></div>
              ) : (
                (activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map((product, idx) => (
                  <div key={product.id} className="group product-card-glow glass-morphism rounded-3xl md:rounded-[2.5rem] overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="aspect-[4/5] overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img src={product.thumbnail} className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" alt={product.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050a18]/80 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-2 left-2 md:top-5 md:left-5 opacity-0 md:group-hover:opacity-100 transition-opacity">
                         <div className="bg-emerald-500 text-black p-2 md:p-3 rounded-lg md:rounded-2xl shadow-xl"><Eye size={16} /></div>
                      </div>
                    </div>
                    <div className="p-3 md:p-6 space-y-2 md:space-y-4 flex-1 flex flex-col">
                      <h3 className="font-black text-xs md:text-lg line-clamp-1">{product.title}</h3>
                      <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto gap-2">
                        <p className="text-lg md:text-2xl font-black text-emerald-500">{product.price} <span className="text-[10px] md:text-xs">DH</span></p>
                        <button onClick={() => setSelectedProduct(product)} className="w-full md:w-12 h-10 md:h-12 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-xl md:rounded-2xl flex items-center justify-center transition-all border border-white/5"><ShoppingCart size={18} className="md:size-5" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
              <div><h2 className="text-3xl md:text-4xl font-black text-gradient">إدارة المتجر</h2><p className="text-slate-500 font-bold text-sm">تحكم في منتجاتك وطلبياتك بسهولة</p></div>
              <div className="flex gap-2 glass-morphism p-1.5 rounded-2xl md:rounded-3xl w-full md:w-auto overflow-x-auto no-scrollbar">
                <button onClick={() => setAdminTab('orders')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>الطلبيات ({orders.length})</button>
                <button onClick={() => setAdminTab('products')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${adminTab === 'products' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>المنتجات ({products.length})</button>
                <button onClick={() => setAdminTab('settings')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><Settings size={18} /></button>
              </div>
            </header>

            {adminTab === 'products' && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة', galleryImages: [] }); setIsAddingProduct(true); }}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all group p-4"
                >
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors"><Plus size={24} /></div>
                  <span className="font-black text-xs">منتج جديد</span>
                </button>
                {products.map(p => (
                  <div key={p.id} className="glass-morphism rounded-3xl overflow-hidden group">
                    <div className="aspect-square relative">
                      <img src={p.thumbnail} className="w-full h-full object-cover" alt={p.title} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }} className="p-2.5 bg-white text-black rounded-lg"><Edit3 size={16} /></button>
                        <button onClick={() => { if(window.confirm('حذف؟')) setProducts(products.filter(pr => pr.id !== p.id)) }} className="p-2.5 bg-rose-500 text-white rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="p-3"><p className="font-black text-[10px] truncate">{p.title}</p><p className="text-emerald-500 font-bold text-xs">{p.price} DH</p></div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="space-y-3">
                {orders.length === 0 ? <div className="p-20 text-center glass-morphism rounded-3xl opacity-30 font-black">لا توجد طلبيات</div> : orders.map(order => (
                  <div key={order.orderId} className="glass-morphism p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0"><Package size={20} /></div>
                      <div>
                        <h4 className="font-black text-sm md:text-lg">{order.customer.fullName}</h4>
                        <p className="text-[10px] md:text-sm text-slate-500 font-bold">{order.productTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-4 border-t border-white/5 pt-3 md:border-0 md:pt-0">
                      <div className="text-right">
                        <p className="text-xs font-black">{order.customer.city}</p>
                        <p className="text-[10px] text-slate-500">{order.orderDate}</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Details Modal - Adjusted for Mobile */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full h-full md:h-auto md:max-w-6xl md:rounded-[3rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-3 md:p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors shadow-2xl"><X size={20} md:size={24} /></button>
             
             <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-slate-900 relative p-0 flex flex-col">
               <div className="flex-1 overflow-hidden">
                <img src={activeGalleryImage} className="w-full h-full object-cover transition-all duration-500" alt={selectedProduct.title} />
               </div>
               {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0) && (
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar pb-2">
                    {[selectedProduct.thumbnail, ...selectedProduct.galleryImages].map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveGalleryImage(img)}
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === img ? 'border-emerald-500 scale-105' : 'border-white/10 opacity-60'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
               )}
             </div>

             <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col overflow-y-auto no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-6 md:space-y-8 my-auto">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] md:text-xs font-black border border-emerald-500/20">{selectedProduct.category}</span>
                        <div className="flex items-center gap-1 text-amber-500 text-[11px] md:text-sm font-bold"><Star size={12} fill="currentColor" /> {selectedProduct.rating}</div>
                      </div>
                      <h2 className="text-2xl md:text-5xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <div className="max-h-[150px] overflow-y-auto pr-2 custom-scroll">
                        <p className="text-slate-400 text-sm md:text-lg leading-relaxed font-medium whitespace-pre-wrap">{selectedProduct.description}</p>
                      </div>
                    </div>

                    <div className="p-5 md:p-8 glass-morphism rounded-3xl md:rounded-[2.5rem] flex items-center justify-between border-white/5 shadow-2xl">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">السعر الحالي</p>
                        <p className="text-2xl md:text-5xl font-black text-emerald-500">{selectedProduct.price} <span className="text-base md:text-xl">DH</span></p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="flex items-center justify-end gap-1.5 text-slate-300 font-bold text-xs md:text-base"><Truck size={16} /> توصيل مجاني</p>
                        <p className="flex items-center justify-end gap-1.5 text-slate-300 font-bold text-xs md:text-base"><ShieldCheck size={16} /> ضمان الجودة</p>
                      </div>
                    </div>

                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl premium-btn shadow-2xl shadow-emerald-500/20 animate-buy-pulse">اشتري الآن - الدفع عند الاستلام</button>
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-10 my-auto">
                     <div className="flex items-center gap-3">
                       <button onClick={() => setIsCheckingOut(false)} className="p-2.5 rounded-lg bg-white/5 text-slate-400"><ChevronLeft size={20} /></button>
                       <h3 className="text-2xl md:text-3xl font-black text-gradient">إتمام الطلب</h3>
                     </div>
                     <div className="space-y-4 md:space-y-5">
                       <div className="space-y-1">
                          <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">الاسم بالكامل</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg outline-none focus:border-emerald-500 transition-colors" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">المدينة</label>
                          <select className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg outline-none focus:border-emerald-500 transition-colors appearance-none" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                            <option value="">اختر مدينتك</option>
                            {MOROCCAN_CITIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">رقم الهاتف</label>
                          <input type="tel" className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg outline-none focus:border-emerald-500 transition-colors text-ltr" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} />
                       </div>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl premium-btn flex items-center justify-center gap-2">تأكيد الطلب الآن <Check size={24} /></button>
                     <p className="text-center text-slate-500 font-bold text-xs md:text-sm">سيتم التواصل معك هاتفياً لتأكيد الطلب</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => setShowLoginModal(false)}></div>
          <form onSubmit={e => { e.preventDefault(); if(passwordInput === adminPassword) { setIsAdminAuthenticated(true); sessionStorage.setItem('admin_auth', 'true'); setShowLoginModal(false); setView('admin'); } else setLoginError(true); }} className="relative w-full max-w-sm glass-morphism p-8 md:p-10 rounded-3xl md:rounded-[3rem] border-white/10 space-y-6 md:space-y-8 animate-fade-in-up">
             <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={28} /></div>
                <h3 className="text-xl md:text-2xl font-black">دخول الإدارة</h3>
                <p className="text-slate-500 font-bold text-xs md:text-sm">أدخل كلمة المرور للمتابعة</p>
             </div>
             <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`w-full bg-white/5 border ${loginError ? 'border-rose-500' : 'border-white/10'} p-4 rounded-xl font-bold text-center text-xl outline-none focus:border-emerald-500 transition-colors pl-12`} 
                  value={passwordInput} 
                  onChange={e => setPasswordInput(e.target.value)} 
                  autoFocus 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 p-2">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
             </div>
             <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg premium-btn">دخول اللوحة</button>
          </form>
        </div>
      )}

      {/* Product Edit/Add Modal - Responsive */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => setEditingProduct(null)}></div>
          <div className="relative w-full max-w-5xl glass-morphism p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-white/10 max-h-[90vh] overflow-y-auto custom-scroll animate-fade-in-up">
             <div className="flex justify-between items-center mb-6 md:mb-10">
               <h3 className="text-xl md:text-3xl font-black text-gradient">{isAddingProduct ? 'منتج جديد' : 'تعديل المنتج'}</h3>
               <button onClick={() => setEditingProduct(null)} className="p-2 md:p-3 bg-white/5 rounded-full"><X size={18} /></button>
             </div>
             <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">عنوان المنتج</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 p-3.5 md:p-4 rounded-xl font-bold text-sm" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">السعر (DH)</label>
                      <input type="number" required className="w-full bg-white/5 border border-white/10 p-3.5 md:p-4 rounded-xl font-bold text-sm" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">التصنيف</label>
                      <select className="w-full bg-white/5 border border-white/10 p-3.5 md:p-4 rounded-xl font-bold text-xs" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})}>
                        {CATEGORIES.filter(c => c !== 'الكل').map(cat => <option key={cat} value={cat} className="text-black">{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">الوصف</label>
                    <textarea rows={4} required className="w-full bg-white/5 border border-white/10 p-3.5 md:p-4 rounded-xl font-bold text-xs" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-black text-slate-500 pr-3">الصورة الرئيسية</label>
                    <div onClick={() => document.getElementById('thumb-input')?.click()} className="aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500/50 transition-all">
                       {editingProduct.thumbnail ? <img src={editingProduct.thumbnail} className="w-full h-full object-cover" /> : <UploadCloud size={32} className="text-slate-600" />}
                    </div>
                    <input id="thumb-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-xl premium-btn flex items-center justify-center gap-2"><Save size={20} /> حفظ التغييرات</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Success Modal - Responsive */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050a18]/98 backdrop-blur-2xl" onClick={() => setActiveOrder(null)}></div>
          <div className="relative w-full max-w-lg glass-morphism p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-center border-emerald-500/20 animate-fade-in-up">
             <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-500 rounded-full flex items-center justify-center text-black mx-auto mb-6 md:mb-8 animate-bounce"><Check size={32} md:size={50} strokeWidth={4} /></div>
             <h3 className="text-2xl md:text-4xl font-black mb-3 text-gradient">تم استلام طلبك!</h3>
             <p className="text-slate-400 text-sm md:text-lg font-medium mb-8">رقم الطلب: <span className="text-emerald-500 font-black">{activeOrder.orderId}</span>. سنتصل بك قريباً.</p>
             <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl premium-btn">حسناً، فهمت</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
