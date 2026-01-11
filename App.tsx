import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, PackagePlus, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Upload, Plus as PlusIcon, RefreshCw, Link as LinkIcon, Share2, Copy, 
  Target, Facebook, Code, FileCode, KeyRound, Images, Camera
} from 'lucide-react';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const DEFAULT_ADMIN_PASSWORD = 'admin'; 
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=500&auto=format&fit=crop';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'settings' | 'export'>('orders');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('الكل');
  
  const [pixelId, setPixelId] = useState<string>(STORE_CONFIG.pixelId);
  const [testEventCode, setTestEventCode] = useState<string>(STORE_CONFIG.testCode);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [loginError, setLoginError] = useState(false);

  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [currentPassChange, setCurrentPassChange] = useState('');
  const [newPassChange, setNewPassChange] = useState('');
  const [confirmPassChange, setConfirmPassChange] = useState('');
  const [passChangeMessage, setPassChangeMessage] = useState({ text: '', type: '' });

  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  const STORAGE_KEY_PRODUCTS = 'ecom_products_final_v5';
  const STORAGE_KEY_ORDERS = 'ecom_orders_final_v5';
  const STORAGE_KEY_PIXEL = 'ecom_pixel_settings_v5';
  const STORAGE_KEY_PASS = 'ecom_admin_pass_v5';

  const trackPixelEvent = (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).fbq && pixelId) {
      if (testEventCode) {
        (window as any).fbq('track', eventName, data, { eventID: testEventCode });
      } else {
        (window as any).fbq('track', eventName, data);
      }
    }
  };

  useEffect(() => {
    if (pixelId && typeof window !== 'undefined') {
      const f = window as any;
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      const t = document.createElement('script');
      t.async = !0; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s = document.getElementsByTagName('script')[0];
      s.parentNode?.insertBefore(t, s);
      f.fbq('init', pixelId);
      f.fbq('track', 'PageView');
    }
  }, [pixelId]);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);

    const savedPass = localStorage.getItem(STORAGE_KEY_PASS);
    if (savedPass) setAdminPassword(savedPass);

    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    let initialProducts = MOCK_PRODUCTS;
    if (savedProducts) {
      try {
        initialProducts = JSON.parse(savedProducts);
      } catch (e) {
        initialProducts = MOCK_PRODUCTS;
      }
      setProducts(initialProducts);
    } else {
      setProducts(MOCK_PRODUCTS);
    }

    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    }

    const savedPixel = localStorage.getItem(STORAGE_KEY_PIXEL);
    if (savedPixel) {
      // Fix: cast result of JSON.parse to allow safe property access on line 180
      const p = JSON.parse(savedPixel) as { id?: string; testCode?: string };
      setPixelId(p.id || STORE_CONFIG.pixelId);
      setTestEventCode(p.testCode || STORE_CONFIG.testCode);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('p');
    if (productId) {
      const product = initialProducts.find(p => p.id === productId);
      if (product) setSelectedProduct(product);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedProduct) {
      url.searchParams.set('p', selectedProduct.id);
      setActiveGalleryImage(selectedProduct.thumbnail);
      trackPixelEvent('ViewContent', {
        content_name: selectedProduct.title,
        content_category: selectedProduct.category,
        content_ids: [selectedProduct.id],
        content_type: 'product',
        value: selectedProduct.price,
        currency: 'MAD'
      });
    } else {
      url.searchParams.delete('p');
    }
    window.history.pushState({}, '', url.toString());
  }, [selectedProduct]);

  const generateConstantsCode = () => {
    const productsStr = JSON.stringify(products, null, 2);
    const configStr = JSON.stringify({ pixelId, testCode: testEventCode, storeName: 'Berrima Store', currency: 'DH' }, null, 2);
    
    return `import { StoreProduct } from './types';\n\nexport const STORE_CONFIG = ${configStr};\n\nexport const MOROCCAN_CITIES = ${JSON.stringify(MOROCCAN_CITIES, null, 2)};\n\nexport const MOCK_PRODUCTS: StoreProduct[] = ${productsStr};\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};`;
  };

  const copyToClipboard = (text: string, message: string = "تم النسخ بنجاح!") => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || !editingProduct) return;

    // Fix: Cast to File[] to ensure each 'file' is recognized as a Blob for readAsDataURL
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isGallery) {
          setEditingProduct(prev => {
            if (!prev) return null;
            const currentGallery = prev.galleryImages || [];
            return { ...prev, galleryImages: [...currentGallery, base64String] };
          });
        } else {
          setEditingProduct(prev => {
            if (!prev) return null;
            return { ...prev, thumbnail: base64String };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const removeGalleryImage = (index: number) => {
    if (!editingProduct || !editingProduct.galleryImages) return;
    const updatedGallery = editingProduct.galleryImages.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, galleryImages: updatedGallery });
  };

  const saveProductChanges = () => {
    if (!editingProduct) return;
    if (!editingProduct.title || !editingProduct.price || !editingProduct.thumbnail) {
      alert("يرجى ملء البيانات الأساسية (الاسم، السعر، والصورة الرئيسية).");
      return;
    }
    const updated = products.find(p => p.id === editingProduct.id)
      ? products.map(p => p.id === editingProduct.id ? editingProduct : p)
      : [...products, editingProduct];
    
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    setEditingProduct(null);
  };

  const savePixelSettings = () => {
    localStorage.setItem(STORAGE_KEY_PIXEL, JSON.stringify({ id: pixelId, testCode: testEventCode }));
    alert("تم حفظ الإعدادات محلياً. لتفعيلها للجميع، استخدم تبويب 'تحديث المتجر للكل'.");
  };

  const handlePasswordChange = () => {
    if (currentPassChange !== adminPassword) {
      setPassChangeMessage({ text: 'كلمة المرور الحالية غير صحيحة', type: 'error' });
      return;
    }
    if (newPassChange.length < 4) {
      setPassChangeMessage({ text: 'كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل', type: 'error' });
      return;
    }
    if (newPassChange !== confirmPassChange) {
      setPassChangeMessage({ text: 'كلمة المرور الجديدة غير متطابقة', type: 'error' });
      return;
    }

    setAdminPassword(newPassChange);
    localStorage.setItem(STORAGE_KEY_PASS, newPassChange);
    setPassChangeMessage({ text: 'تم تغيير كلمة المرور بنجاح!', type: 'success' });
    setCurrentPassChange('');
    setNewPassChange('');
    setConfirmPassChange('');
    setTimeout(() => setPassChangeMessage({ text: '', type: '' }), 3000);
  };

  const confirmOrder = () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city) {
      alert("يرجى إكمال البيانات.");
      return;
    }
    if (!selectedProduct) return;

    const newOrder: StoreOrder = {
      orderId: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productPrice: selectedProduct.price,
      customer: { ...customerInfo },
      orderDate: new Date().toLocaleString('ar-MA'),
      status: 'pending'
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    
    trackPixelEvent('Purchase', {
      content_name: selectedProduct.title,
      content_ids: [selectedProduct.id],
      value: selectedProduct.price,
      currency: 'MAD'
    });

    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
  };

  const handleAdminClick = () => isAdminAuthenticated ? setView(view === 'admin' ? 'shop' : 'admin') : setShowLoginModal(true);

  const bgMain = theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50';
  const bgSidebar = theme === 'dark' ? 'bg-[#070b1d]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const borderLight = theme === 'dark' ? 'border-emerald-500/10' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} flex font-['Tajawal'] overflow-hidden`}>
      <aside className={`w-20 md:w-80 ${bgSidebar} border-l ${borderLight} flex flex-col h-screen z-50 transition-all shadow-2xl`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20"><Sparkles size={24} /></div>
          <div className="hidden md:block"><h1 className="text-2xl font-black uppercase">Berrima</h1><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">berrima.store</p></div>
        </div>
        <nav className="flex-1 px-4 mt-10 space-y-4">
          <button onClick={() => setView('shop')} className={`w-full flex items-center justify-center md:justify-start gap-5 px-5 py-5 rounded-[2rem] transition-all ${view === 'shop' ? 'bg-emerald-500/10 text-emerald-500' : `${textSecondary} hover:text-emerald-500`}`}><ShoppingBag size={24} /><span className="hidden md:block text-lg font-bold">المتجر</span></button>
          <button onClick={handleAdminClick} className={`w-full flex items-center justify-center md:justify-start gap-5 px-5 py-5 rounded-[2rem] transition-all ${view === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : `${textSecondary} hover:text-emerald-500`}`}>{isAdminAuthenticated ? <LayoutDashboard size={24} /> : <Lock size={24} />}<span className="hidden md:block text-lg font-bold">لوحة التحكم</span></button>
        </nav>
        {isAdminAuthenticated && (
          <div className="p-8 hidden md:block">
            <button onClick={() => { setIsAdminAuthenticated(false); setView('shop'); sessionStorage.removeItem('admin_auth'); }} className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all border border-rose-500/20 font-black text-sm"><LogOut size={18} /> تسجيل الخروج</button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`px-10 py-8 flex items-center justify-between z-40 ${bgCard} border-b ${borderLight} shadow-sm`}>
           <h2 className="text-2xl font-black uppercase tracking-tighter">{view === 'admin' ? 'الإدارة' : ''}</h2>
           <div className="flex items-center gap-4">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-4 rounded-2xl border ${borderLight} flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-emerald-600 text-black' : 'bg-white text-slate-400'}`}>{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          {view === 'shop' ? (
            <div className="space-y-12">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-4 rounded-[1.8rem] whitespace-nowrap text-sm font-black transition-all ${activeTab === cat ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' : `${bgCard} ${textSecondary} border ${borderLight} hover:text-emerald-500`}`}>{cat}</button>)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
                {(activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map(product => (
                  <div key={product.id} className={`group relative ${bgCard} rounded-[2.8rem] border ${borderLight} overflow-hidden transition-all duration-500 hover:border-emerald-500/30 hover:-translate-y-2 flex flex-col h-full shadow-xl`}>
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-8 right-8 left-8"><h4 className="text-xl font-black text-white leading-tight">{product.title}</h4></div>
                    </div>
                    <div className="p-8 flex items-center justify-between mt-auto">
                      <span className="text-2xl font-black text-emerald-600">{product.price} DH</span>
                      <button onClick={() => setSelectedProduct(product)} className="bg-emerald-600 text-black p-4 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all"><ShoppingCart size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-10 pb-32 max-w-7xl mx-auto">
              <div className={`${bgCard} p-8 rounded-[3rem] border ${borderLight} flex flex-wrap gap-4 items-center justify-between`}>
                 <div className="flex flex-wrap gap-3">
                    <button onClick={() => setAdminTab('orders')} className={`px-6 py-4 rounded-2xl font-black text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>الطلبيات ({orders.length})</button>
                    <button onClick={() => setAdminTab('products')} className={`px-6 py-4 rounded-2xl font-black text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>المنتجات ({products.length})</button>
                    <button onClick={() => setAdminTab('settings')} className={`px-6 py-4 rounded-2xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>الإعدادات</button>
                    <button onClick={() => setAdminTab('export')} className={`px-6 py-4 rounded-[2rem] font-black text-xs transition-all bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black flex items-center gap-2 ${adminTab === 'export' ? 'ring-2 ring-amber-500' : ''}`}><FileCode size={16} /> تحديث المتجر للكل</button>
                 </div>
                 {adminTab === 'products' && <button onClick={() => setEditingProduct({ id: 'p' + Date.now(), title: '', thumbnail: '', price: 0, description: '', category: 'نظارات', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24-48 ساعة', galleryImages: [] })} className="bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2"><PlusIcon size={16} /> إضافة منتج</button>}
              </div>

              {adminTab === 'orders' && (
                <div className="grid gap-6">
                  {orders.length === 0 ? (
                    <div className="p-20 text-center opacity-30">لا توجد طلبيات بعد.</div>
                  ) : orders.map(order => (
                    <div key={order.orderId} className={`${bgCard} border ${borderLight} p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group shadow-lg`}>
                      <div className="flex items-center gap-6"><div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><User size={24} /></div><div><h4 className="text-lg font-black">{order.customer.fullName}</h4><p className={`text-xs ${textSecondary} font-bold`}>{order.productTitle}</p></div></div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        <div><p className={`text-[10px] ${textSecondary} font-black uppercase mb-1`}>المدينة</p><p className="text-sm font-bold">{order.customer.city}</p></div>
                        <div><p className={`text-[10px] ${textSecondary} font-black uppercase mb-1`}>الهاتف</p><p className="text-sm font-bold text-emerald-500">{order.customer.phoneNumber}</p></div>
                        <button onClick={() => { setOrders(orders.filter(o => o.orderId !== order.orderId)); localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders.filter(o => o.orderId !== order.orderId))); }} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {products.map(p => (
                    <div key={p.id} className={`${bgCard} border ${borderLight} p-6 rounded-[3rem] flex gap-6 shadow-md`}>
                      <img src={p.thumbnail} className="w-24 h-24 object-cover rounded-2xl" />
                      <div className="flex-1 space-y-3">
                        <h4 className="text-lg font-black">{p.title}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold text-xs border ${borderLight} hover:bg-emerald-600 hover:text-black transition-all">تعديل</button>
                          <button onClick={() => { setProducts(products.filter(item => item.id !== p.id)); localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products.filter(item => item.id !== p.id))); }} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'settings' && (
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`${bgCard} p-10 rounded-[3rem] border ${borderLight} shadow-2xl h-fit`}>
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Facebook className="text-[#1877F2]" /> فيسبوك بيكسل</h3>
                    <div className="space-y-6">
                      <div className="space-y-2"><label className={`text-[10px] font-black ${textSecondary} px-4`}>Pixel ID</label><input type="text" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none`} value={pixelId} onChange={(e) => setPixelId(e.target.value)} /></div>
                      <div className="space-y-2"><label className={`text-[10px] font-black ${textSecondary} px-4`}>Test Event Code</label><input type="text" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none`} value={testEventCode} onChange={(e) => setTestEventCode(e.target.value)} /></div>
                      <button onClick={savePixelSettings} className="w-full bg-[#1877F2] text-white py-6 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all">حفظ الإعدادات</button>
                    </div>
                  </div>

                  <div className={`${bgCard} p-10 rounded-[3rem] border ${borderLight} shadow-2xl h-fit`}>
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><KeyRound className="text-amber-500" /> تغيير كلمة المرور</h3>
                    <div className="space-y-6">
                      {passChangeMessage.text && (
                        <div className={`p-4 rounded-xl text-center text-sm font-bold ${passChangeMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                          {passChangeMessage.text}
                        </div>
                      )}
                      <div className="space-y-2"><label className={`text-[10px] font-black ${textSecondary} px-4`}>كلمة المرور الحالية</label><input type="password" placeholder="••••••••" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none`} value={currentPassChange} onChange={(e) => setCurrentPassChange(e.target.value)} /></div>
                      <div className="space-y-2"><label className={`text-[10px] font-black ${textSecondary} px-4`}>كلمة المرور الجديدة</label><input type="password" placeholder="كلمة مرور جديدة" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none`} value={newPassChange} onChange={(e) => setNewPassChange(e.target.value)} /></div>
                      <div className="space-y-2"><label className={`text-[10px] font-black ${textSecondary} px-4`}>تأكيد كلمة المرور</label><input type="password" placeholder="تأكيد الكلمة الجديدة" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none`} value={confirmPassChange} onChange={(e) => setConfirmPassChange(e.target.value)} /></div>
                      <button onClick={handlePasswordChange} className="w-full bg-amber-500 text-black py-6 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all">تحديث كلمة المرور</button>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'export' && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                   <div className={`${bgCard} p-12 rounded-[3.5rem] border-2 border-amber-500/30 shadow-2xl relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-500"><Code size={120} /></div>
                      <h3 className="text-3xl font-black mb-4">تحديث المتجر للكل 🌍</h3>
                      <p className={`text-sm ${textSecondary} font-bold mb-10 leading-relaxed`}>
                        لكي تظهر التحديثات (المنتجات الجديدة والبيكسل) لجميع الزوار على هواتفهم وحواسيبهم، قم بنسخ الكود أدناه واستبدال محتوى ملف <code className="text-amber-500">constants.tsx</code> في مشروعك بهذا الكود تماماً.
                      </p>
                      <div className={`relative ${theme === 'dark' ? 'bg-black/40' : 'bg-slate-100'} rounded-3xl p-8 border ${borderLight}`}>
                         <pre className="text-[10px] text-ltr font-mono overflow-x-auto h-60 opacity-60 no-scrollbar">
                           {generateConstantsCode()}
                         </pre>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-all backdrop-blur-[2px]">
                            <button onClick={() => copyToClipboard(generateConstantsCode(), "تم نسخ كود الملف بنجاح! ضعه الآن في ملف constants.tsx")} className="bg-amber-500 text-black px-10 py-5 rounded-[2rem] font-black shadow-2xl flex items-center gap-3 transform hover:scale-105 transition-all"><Copy size={24} /> نسخ الكود بالكامل</button>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowLoginModal(false)} />
          <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === adminPassword) { setIsAdminAuthenticated(true); sessionStorage.setItem('admin_auth', 'true'); setShowLoginModal(false); setView('admin'); setPasswordInput(''); } else setLoginError(true); }} className={`${bgCard} w-full max-w-md rounded-[3.5rem] p-12 relative border ${borderLight} shadow-2xl`}>
             <h3 className="text-3xl font-black text-center mb-10">دخول المسؤول</h3>
             <div className="space-y-6">
                <div className="relative"><input type={showPassword ? "text" : "password"} placeholder="كلمة المرور" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${loginError ? 'border-rose-500' : borderLight} p-6 rounded-[2rem] ${textPrimary} font-bold outline-none pr-16`} value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }} autoFocus /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button></div>
                <button type="submit" className="w-full bg-emerald-600 text-black py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-500 shadow-xl transition-all">دخول</button>
             </div>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setEditingProduct(null)} />
          <div className={`${bgCard} w-full max-w-5xl rounded-[3.5rem] p-10 relative border ${borderLight} overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl`}>
             <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Edit3 className="text-emerald-500" /> إضافة/تعديل منتج</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="space-y-1"><label className={`text-[10px] font-black ${textSecondary} px-4`}>اسم المنتج</label><input type="text" value={editingProduct.title} onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold`} /></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className={`text-[10px] font-black ${textSecondary} px-4`}>السعر (DH)</label><input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold`} /></div>
                      <div className="space-y-1"><label className={`text-[10px] font-black ${textSecondary} px-4`}>التصنيف</label><select value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value as Category})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold`}>{CATEGORIES.filter(c => c !== 'الكل').map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                   </div>
                   <div className="space-y-1"><label className={`text-[10px] font-black ${textSecondary} px-4`}>الوصف</label><textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-6 rounded-3xl ${textPrimary} font-bold min-h-[120px]`} /></div>
                </div>
                
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className={`text-[10px] font-black ${textSecondary} uppercase px-4`}>الصورة الرئيسية</label>
                      <div 
                        onClick={() => mainImageInputRef.current?.click()}
                        className={`aspect-video rounded-[2.5rem] border-2 border-dashed ${borderLight} flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-500/50 relative overflow-hidden group ${editingProduct.thumbnail ? 'bg-black/40' : 'bg-black/10'}`}
                      >
                         {editingProduct.thumbnail ? (
                           <>
                             <img src={editingProduct.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={32} className="text-emerald-500 mb-2" />
                                <span className="text-xs font-black">تغيير الصورة</span>
                             </div>
                           </>
                         ) : (
                           <div className="flex flex-col items-center">
                              <Camera size={48} className="text-slate-600 mb-4" />
                              <span className="text-xs font-black text-slate-500">انقر لتحميل الصورة الرئيسية</span>
                           </div>
                         )}
                         <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className={`text-[10px] font-black ${textSecondary} uppercase px-4`}>صور المعرض الإضافية</label>
                      <div className="grid grid-cols-4 gap-4">
                         {(editingProduct.galleryImages || []).map((img, idx) => (
                           <div key={idx} className="aspect-square rounded-2xl border ${borderLight} relative group overflow-hidden shadow-lg">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"><X size={14} strokeWidth={3} /></button>
                           </div>
                         ))}
                         <button 
                           onClick={() => galleryImageInputRef.current?.click()}
                           className={`aspect-square rounded-2xl border-2 border-dashed ${borderLight} flex flex-col items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all bg-black/5`}
                         >
                            <PlusIcon size={24} />
                            <span className="text-[10px] mt-2 font-black">إضافة</span>
                         </button>
                         <input type="file" ref={galleryImageInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileChange(e, true)} />
                      </div>
                   </div>
                </div>
             </div>
             <div className="flex gap-4 mt-12">
               <button onClick={() => setEditingProduct(null)} className="flex-1 bg-white/5 py-6 rounded-[2rem] font-black text-lg hover:bg-white/10 transition-colors">إلغاء</button>
               <button onClick={saveProductChanges} className="flex-[2] bg-emerald-600 text-black py-6 rounded-[2rem] font-black text-lg shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"><Save size={24} /> حفظ المنتج</button>
             </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isCheckingOut && setSelectedProduct(null)} />
          <div className={`${bgSidebar} w-full max-w-7xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border ${borderLight} max-h-[95vh] animate-in zoom-in-95 duration-300`}>
            <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-8 right-8 z-[110] bg-white/5 p-4 rounded-full text-white/50 hover:text-white border border-white/10"><X size={24} /></button>
            <div className={`w-full md:w-1/2 ${theme === 'dark' ? 'bg-black' : 'bg-slate-50'} flex flex-col items-center justify-center p-8 border-l ${borderLight} relative`}>
              <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl">
                <img src={activeGalleryImage || selectedProduct.thumbnail} className="w-full h-full object-cover transition-all duration-700" />
              </div>
              {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 && (
                <div className="flex gap-3 mt-8 overflow-x-auto no-scrollbar w-full px-4 py-2">
                  <div 
                    onClick={() => setActiveGalleryImage(selectedProduct.thumbnail)}
                    className={`min-w-[80px] h-[80px] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${activeGalleryImage === selectedProduct.thumbnail ? 'border-emerald-500 scale-105' : 'border-transparent opacity-50'}`}
                  >
                    <img src={selectedProduct.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  {selectedProduct.galleryImages.map((img, i) => (
                    <div 
                      key={i}
                      onClick={() => setActiveGalleryImage(img)}
                      className={`min-w-[80px] h-[80px] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${activeGalleryImage === img ? 'border-emerald-500 scale-105' : 'border-transparent opacity-50'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-between overflow-y-auto no-scrollbar">
               {!isCheckingOut ? (
                 <>
                   <div className="space-y-8">
                     <span className="bg-emerald-500/10 text-emerald-500 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">{selectedProduct.category}</span>
                     <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">{selectedProduct.title}</h2>
                     <p className={`${textSecondary} font-medium text-xl leading-relaxed whitespace-pre-wrap`}>{selectedProduct.description}</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className={`p-6 rounded-3xl border ${borderLight} bg-white/5 text-center`}><Truck className="text-emerald-500 mx-auto mb-2" /><p className="font-bold text-sm">{selectedProduct.shippingTime}</p></div>
                        <div className={`p-6 rounded-3xl border ${borderLight} bg-white/5 text-center`}><ShieldCheck className="text-emerald-500 mx-auto mb-2" /><p className="font-bold text-sm">ضمان الجودة</p></div>
                     </div>
                   </div>
                   <div className="mt-16 space-y-6">
                     <div className="flex items-center justify-between p-10 bg-emerald-600 rounded-[3rem] shadow-2xl shadow-emerald-600/20 text-black">
                       <div><p className="text-[10px] font-black uppercase opacity-60">السعر النهائي</p><p className="text-6xl font-black">{selectedProduct.price} <small className="text-2xl">DH</small></p></div>
                       <div className="text-right hidden sm:block"><p className="font-black text-sm uppercase">دفع عند الاستلام</p><p className="text-black/60 text-xs">توصيل سريع</p></div>
                     </div>
                     <button onClick={() => setIsCheckingOut(true)} className="w-full bg-white text-black py-10 rounded-[3rem] font-black text-3xl shadow-2xl hover:scale-[1.02] transition-all animate-buy-pulse">اشترِ الآن</button>
                   </div>
                 </>
               ) : (
                 <div className="space-y-10 py-4 h-full flex flex-col">
                    <div className="flex items-center gap-6"><button onClick={() => setIsCheckingOut(false)} className="p-4 rounded-full text-emerald-500 border ${borderLight} shadow-md"><ChevronLeft size={24} /></button><h3 className="text-4xl font-black tracking-tighter">معلومات التوصيل</h3></div>
                    <div className="flex-1 space-y-8 mt-6">
                      <div className="space-y-2"><label className={`text-[10px] ${textSecondary} font-black px-6`}>الاسم الكامل</label><div className={`bg-white/5 border ${borderLight} p-7 rounded-[2rem] flex items-center gap-4 focus-within:border-emerald-500 transition-all`}><User className={textSecondary} /><input type="text" placeholder="اسمك الكامل" className="bg-transparent border-none outline-none flex-1 font-bold text-xl" value={customerInfo.fullName} onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})} /></div></div>
                      <div className="space-y-2"><label className={`text-[10px] ${textSecondary} font-black px-6`}>المدينة</label><div className={`bg-white/5 border ${borderLight} p-7 rounded-[2rem] flex items-center gap-4 focus-within:border-emerald-500 transition-all`}><MapPin className={textSecondary} /><select className="bg-transparent border-none outline-none flex-1 font-bold text-xl appearance-none" value={customerInfo.city} onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}><option value="">اختر مدينتك</option>{MOROCCAN_CITIES.map(city => <option key={city} value={city} style={{color: '#000'}}>{city}</option>)}</select></div></div>
                      <div className="space-y-2"><label className={`text-[10px] ${textSecondary} font-black px-6`}>رقم الهاتف</label><div className={`bg-white/5 border ${borderLight} p-7 rounded-[2rem] flex items-center gap-4 focus-within:border-emerald-500 transition-all`}><Phone className={textSecondary} /><input type="tel" placeholder="06xx-xxxxxx" className="bg-transparent border-none outline-none flex-1 font-bold text-ltr text-xl" value={customerInfo.phoneNumber} onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} /></div></div>
                    </div>
                    <button onClick={confirmOrder} className="w-full bg-emerald-600 text-black py-10 rounded-[3rem] font-black text-2xl shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-4">تأكيد الطلب <ArrowRight size={28} /></button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveOrder(null)} />
          <div className={`${bgSidebar} w-full max-w-2xl rounded-[4rem] p-16 text-center relative border ${borderLight} shadow-2xl`}>
             <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-black mx-auto mb-10 shadow-xl shadow-emerald-500/30"><Check size={50} strokeWidth={4} /></div>
             <h3 className="text-4xl font-black mb-6 tracking-tighter">تم استلام طلبك!</h3>
             <p className={`${textSecondary} font-bold text-xl mb-12`}>شكراً {activeOrder.customer.fullName}. سنتصل بك قريباً في مدينة {activeOrder.customer.city} لتأكيد عملية الشحن.</p>
             <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-600 text-black py-6 rounded-3xl font-black text-xl shadow-xl">العودة للتسوق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;