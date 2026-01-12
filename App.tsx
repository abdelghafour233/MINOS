
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Share2, Copy, Facebook, Link as LinkIcon, Camera, 
  Activity, Info, CheckCircle2, AlertTriangle, Plus,
  ChevronDown, Search, ArrowUpRight, Zap, Award, UploadCloud, Download,
  ImagePlus, HelpCircle, RefreshCcw
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    showToast('تم الحفظ في متصفحك. الآن قم بنسخ الكود من الإعدادات لتثبيته للجميع.');
  };

  const copyProductsCode = () => {
    const code = `export const MOCK_PRODUCTS: StoreProduct[] = ${JSON.stringify(products, null, 2)};`;
    navigator.clipboard.writeText(code);
    showToast('تم نسخ الكود! الآن قم بلصقه في ملف constants.tsx');
  };

  const resetToDefault = () => {
    if (window.confirm('هل تريد حقاً مسح تعديلاتك والعودة لبيانات الكود الأصلية؟')) {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      setProducts(MOCK_PRODUCTS);
      showToast('تمت العودة للبيانات الأصلية');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      try {
        const base64 = await fileToBase64(file as File);
        setEditingProduct({ ...editingProduct, thumbnail: base64 });
        showToast('تم تحميل صورة الغلاف');
      } catch (err) {
        showToast('فشل تحميل الصورة', 'error');
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && editingProduct) {
      try {
        const base64Promises = Array.from(files).map(file => fileToBase64(file as File));
        const base64s = await Promise.all(base64Promises);
        setEditingProduct({ 
          ...editingProduct, 
          galleryImages: [...(editingProduct.galleryImages || []), ...base64s] 
        });
        showToast(`تم إضافة ${files.length} صور`);
      } catch (err) {
        showToast('فشل تحميل الصور', 'error');
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    if (editingProduct && editingProduct.galleryImages) {
      const updatedGallery = editingProduct.galleryImages.filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, galleryImages: updatedGallery });
    }
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
                <div className="flex items-center gap-2 justify-center md:justify-start text-emerald-500/80 font-bold text-[10px] mt-1">
                  <Activity size={12} />
                  <span>لوحة التحكم تعمل محلياً على هذا الجهاز</span>
                </div>
              </div>
              <div className="flex gap-2 glass-morphism p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                <button onClick={() => setAdminTab('orders')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><Package size={16}/> الطلبيات ({orders.length})</button>
                <button onClick={() => setAdminTab('products')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${adminTab === 'products' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><ShoppingCart size={16}/> المنتجات ({products.length})</button>
                <button onClick={() => setAdminTab('settings')} className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}><Settings size={18} /></button>
              </div>
            </header>

            {adminTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="glass-morphism p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5">
                   <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="p-6 bg-emerald-500 text-black rounded-3xl shadow-xl shadow-emerald-500/20"><RefreshCcw size={40} className="animate-spin-slow" /></div>
                      <div className="text-center md:text-right space-y-3">
                         <h3 className="text-2xl font-black text-emerald-500">لماذا لا تظهر التغييرات للجميع؟</h3>
                         <p className="text-slate-300 font-medium leading-relaxed">
                            أي تعديل تقوم به الآن يُحفظ في **ذاكرة متصفحك فقط**. لكي يرى الزبائن في فيسبوك صورك وأسعارك الجديدة، يجب عليك نسخ "الكود البرمجي" الجديد ووضعه في ملف <code className="text-white bg-white/10 px-2 py-0.5 rounded">constants.tsx</code>.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-morphism p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500"><Download size={24} /><h4 className="text-xl font-black">1. نسخ البيانات</h4></div>
                      <p className="text-slate-400 text-sm font-medium">سيقوم هذا الزر بتحويل كل منتجاتك الحالية وصورك إلى كود جاهز للاستخدام في المشروع.</p>
                    </div>
                    <button onClick={copyProductsCode} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"><Copy size={20} /> نسخ كود البيانات الجديد</button>
                  </div>

                  <div className="glass-morphism p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between border border-rose-500/10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-rose-500"><AlertTriangle size={24} /><h4 className="text-xl font-black">إعادة تعيين</h4></div>
                      <p className="text-slate-400 text-sm font-medium">سيقوم هذا الزر بمسح كل تعديلاتك المحلية والعودة إلى المنتجات الأصلية الموجودة في ملف الكود.</p>
                    </div>
                    <button onClick={resetToDefault} className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 py-5 rounded-2xl font-black text-lg hover:bg-rose-500 hover:text-white transition-all">مسح التعديلات المحلية</button>
                  </div>
                </div>

                <div className="glass-morphism p-8 rounded-[2.5rem] space-y-4">
                   <div className="flex items-center gap-2 text-slate-300 font-black"><HelpCircle size={20}/> <span>الخطوات النهائية للنشر:</span></div>
                   <ol className="list-decimal list-inside space-y-3 text-slate-400 text-sm font-medium pr-2">
                     <li>قم بتعديل المنتج، الصور، والأسعار كما تريد في صفحة "المنتجات".</li>
                     <li>تأكد أن شكل الموقع أعجبك (عبر صفحة المتجر).</li>
                     <li>اضغط على زر <span className="text-emerald-500">"نسخ كود البيانات الجديد"</span> أعلاه.</li>
                     <li>اذهب لملف <span className="text-white">constants.tsx</span> وامسح محتوى <code className="text-white bg-white/5 px-1">MOCK_PRODUCTS</code> القديم وضع الكود الجديد مكانه.</li>
                     <li>الآن التغيير سيظهر لكل زائر يضغط على إعلانك في فيسبوك.</li>
                   </ol>
                </div>
              </div>
            )}

            {adminTab === 'products' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة', galleryImages: [] }); setIsAddingProduct(true); }}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all group bg-white/5"
                >
                  <PlusCircle size={32} />
                  <span className="font-black text-xs">إضافة منتج جديد</span>
                </button>
                {products.map(p => (
                  <div key={p.id} className="glass-morphism rounded-3xl overflow-hidden group relative">
                    <img src={p.thumbnail} className="w-full h-full object-cover aspect-square" alt={p.title} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }} className="p-3 bg-emerald-500 text-black rounded-xl font-bold flex items-center gap-2"><Edit3 size={18} /> تعديل</button>
                      <button onClick={() => { if(window.confirm('هل أنت متأكد من الحذف؟')) { const up = products.filter(pr => pr.id !== p.id); setProducts(up); localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(up)); showToast('تم الحذف بنجاح'); } }} className="p-3 bg-rose-500 text-white rounded-xl"><Trash2 size={18} /></button>
                    </div>
                    <div className="absolute bottom-3 right-3 left-3 p-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
                      <p className="text-[10px] font-black line-clamp-1">{p.title}</p>
                      <p className="text-xs font-black text-emerald-500">{p.price} DH</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.length > 0 ? orders.map(order => (
                  <div key={order.orderId} className="glass-morphism p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner"><Package size={24} /></div>
                      <div>
                        <h4 className="font-black text-lg">{order.customer.fullName}</h4>
                        <div className="flex items-center gap-3 text-slate-500 text-xs font-bold mt-1">
                           <span className="flex items-center gap-1"><Phone size={12}/> {order.customer.phoneNumber}</span>
                           <span className="flex items-center gap-1"><MapPin size={12}/> {order.customer.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:text-left gap-10 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                      <div className="text-right md:text-left">
                        <p className="text-xs text-slate-500 font-bold mb-1">المنتج المطلوب</p>
                        <p className="font-black text-emerald-500">{order.productTitle} - {order.productPrice} DH</p>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black mb-2">قيد المراجعة</span>
                         <span className="text-[10px] text-slate-500 font-bold">{order.orderDate}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-32 glass-morphism rounded-[3rem] space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600"><ShoppingBag size={40}/></div>
                    <p className="text-slate-500 font-black text-xl">لا توجد أي طلبيات حتى الآن</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Details & Checkout */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full h-full md:h-auto md:max-w-6xl md:rounded-[3rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-3 bg-black/40 rounded-full text-white shadow-2xl"><X size={20} /></button>
             <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-slate-900 relative">
                <img src={activeGalleryImage} className="w-full h-full object-cover" alt={selectedProduct.title} />
                {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0) && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar pb-2">
                    <button onClick={() => setActiveGalleryImage(selectedProduct.thumbnail)} className={`w-14 h-14 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === selectedProduct.thumbnail ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20' : 'border-white/10 opacity-60'}`}><img src={selectedProduct.thumbnail} className="w-full h-full object-cover" /></button>
                    {selectedProduct.galleryImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveGalleryImage(img)} className={`w-14 h-14 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === img ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20' : 'border-white/10 opacity-60'}`}><img src={img} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}
             </div>
             <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col overflow-y-auto no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-6 md:space-y-8 my-auto">
                    <div className="space-y-3">
                      <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedProduct.category}</span>
                      <h2 className="text-3xl md:text-5xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <p className="text-slate-400 text-sm md:text-lg leading-relaxed font-medium whitespace-pre-wrap">{selectedProduct.description}</p>
                    </div>
                    <div className="p-6 md:p-8 glass-morphism rounded-3xl flex items-center justify-between border border-white/5">
                      <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">السعر النهائي</p><p className="text-4xl md:text-5xl font-black text-emerald-500">{selectedProduct.price} <span className="text-base">DH</span></p></div>
                      <div className="text-right text-xs md:text-sm font-bold text-slate-300 space-y-1.5"><p className="flex items-center gap-1.5 justify-end text-emerald-500"><Truck size={16} /> توصيل مجاني وسريع</p><p className="flex items-center gap-1.5 justify-end"><ShieldCheck size={16} /> الدفع عند المعاينة</p></div>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-5 md:py-6 rounded-2xl font-black text-lg md:text-2xl animate-buy-pulse premium-btn shadow-2xl shadow-emerald-500/20">أطلب الآن - الدفع عند الاستلام</button>
                  </div>
                ) : (
                  <div className="space-y-8 my-auto">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all"><ChevronLeft size={20} /></button><h3 className="text-2xl md:text-3xl font-black text-gradient">أدخل معلوماتك للطلب</h3></div>
                     <div className="space-y-4">
                       <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-500 pr-3">الإسم الكامل</label><input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-white focus:border-emerald-500 focus:bg-emerald-500/5 outline-none transition-all" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="مثلاً: محمد المغربي" /></div>
                       <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-500 pr-3">المدينة</label>
                       <div className="relative">
                        <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-white appearance-none focus:border-emerald-500 focus:bg-emerald-500/5 outline-none transition-all" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                          <option value="" className="bg-[#050a18]">إختر مدينتك</option>
                          {MOROCCAN_CITIES.map(city => <option key={city} value={city} className="bg-[#050a18]">{city}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                       </div></div>
                       <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-500 pr-3">رقم الهاتف</label><input type="tel" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-left text-white focus:border-emerald-500 focus:bg-emerald-500/5 outline-none transition-all" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06 XX XX XX XX" /></div>
                       <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-500 pr-3">العنوان (اختياري)</label><textarea className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold h-24 text-white focus:border-emerald-500 focus:bg-emerald-500/5 outline-none transition-all" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="الحي، رقم المنزل..." /></div>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn shadow-xl shadow-emerald-500/20">تأكيد الطلب بنجاح</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 rounded-[3rem] space-y-8 border border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-gradient">دخول الإدارة</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">كلمة المرور (admin)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={`w-full bg-white/5 border ${loginError ? 'border-rose-500' : 'border-white/10'} p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all`}
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }}
                    onKeyDown={(e) => { 
                      if(e.key === 'Enter') {
                        if (passwordInput === adminPassword) {
                          setIsAdminAuthenticated(true);
                          sessionStorage.setItem('admin_auth', 'true');
                          setShowLoginModal(false);
                          setView('admin');
                          setPasswordInput('');
                        } else { setLoginError(true); }
                      }
                    }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {loginError && <p className="text-rose-500 text-xs font-bold mt-2">عذراً، كلمة المرور غير صحيحة.</p>}
              </div>
              <button 
                onClick={() => {
                  if (passwordInput === adminPassword) {
                    setIsAdminAuthenticated(true);
                    sessionStorage.setItem('admin_auth', 'true');
                    setShowLoginModal(false);
                    setView('admin');
                    setPasswordInput('');
                  } else {
                    setLoginError(true);
                  }
                }} 
                className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn"
              >
                تأكيد الدخول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-5xl w-full glass-morphism p-6 md:p-12 rounded-[3.5rem] space-y-8 overflow-y-auto max-h-[95vh] no-scrollbar border border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-gradient">{isAddingProduct ? 'إضافة منتج جديد' : 'تعديل تفاصيل المنتج'}</h3>
              <button onClick={() => setEditingProduct(null)} className="p-2 bg-white/5 rounded-full hover:bg-rose-500/20 hover:text-rose-500 transition-all"><X /></button>
            </div>
            <form onSubmit={saveProduct} className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-1.5"><label className="text-xs font-black text-slate-500">عنوان المنتج</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-xs font-black text-slate-500">السعر المعروض (DH)</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500">الصورة الرئيسية (الغلاف)</label>
                  <div className="relative group aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 transition-all hover:border-emerald-500/50 bg-white/5">
                    {editingProduct.thumbnail ? (
                      <>
                        <img src={editingProduct.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-black p-4 rounded-2xl font-black flex items-center gap-2"><Camera size={20}/> تغيير الصورة</button>
                        </div>
                      </>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-500 hover:text-emerald-500 transition-all">
                        <UploadCloud size={40}/>
                        <span className="text-xs font-black">إضغط هنا لإختيار صورة المنتج</span>
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleThumbnailUpload} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5"><label className="text-xs font-black text-slate-500">وصف المنتج (مميزاته وكيفية استخدامه)</label><textarea required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold h-40 focus:border-emerald-500 outline-none transition-all leading-relaxed" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="أكتب وصفاً بيعياً مقنعاً هنا..." /></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center pr-1">
                    <label className="text-xs font-black text-slate-500">معرض الصور (صور إضافية)</label>
                    <button type="button" onClick={() => galleryInputRef.current?.click()} className="text-emerald-500 flex items-center gap-1.5 text-[11px] font-black hover:underline transition-all"><ImagePlus size={16}/> إضافة صور أخرى</button>
                    <input type="file" ref={galleryInputRef} hidden multiple accept="image/*" onChange={handleGalleryUpload} />
                  </div>
                  <div className="grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 min-h-[100px]">
                    {editingProduct.galleryImages?.length ? editingProduct.galleryImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-lg">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><Trash2 size={16}/></button>
                      </div>
                    )) : <div className="col-span-4 flex items-center justify-center text-slate-600 text-[10px] font-bold py-4">لا توجد صور إضافية بعد</div>}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"><Save size={22}/> حفظ التعديلات</button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-8 bg-white/5 text-slate-400 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">إلغاء</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Order Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 rounded-[3.5rem] text-center space-y-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl shadow-emerald-500/50 animate-bounce"><Check size={48} /></div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-gradient">تم إرسال طلبك!</h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً جزيلاً لثقتك بمتجرنا. سيتصل بك فريقنا قريباً جداً لتأكيد العنوان وموعد التسليم.</p>
            </div>
            <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
              <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">رقم تتبع الطلبية</p>
              <p className="text-3xl font-black text-emerald-500 tracking-widest">{activeOrder.orderId}</p>
            </div>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn shadow-lg">العودة للتسوق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
