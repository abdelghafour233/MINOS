
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, PackagePlus, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Upload, Plus as PlusIcon, RefreshCw, Link as LinkIcon, Share2, Copy, 
  Target, Facebook, Code, FileCode, KeyRound, Images, Camera, 
  Activity, Info, Table, Database, ExternalLink
} from 'lucide-react';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const DEFAULT_ADMIN_PASSWORD = 'admin'; 

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
  
  // Facebook Pixel States
  const [pixelId, setPixelId] = useState<string>(STORE_CONFIG.pixelId);
  const [testEventCode, setTestEventCode] = useState<string>(STORE_CONFIG.testCode);

  // Google Sheets States
  const [sheetId, setSheetId] = useState<string>(STORE_CONFIG.sheetId || '');
  const [sheetName, setSheetName] = useState<string>(STORE_CONFIG.sheetName || 'Orders');
  const [sheetScriptUrl, setSheetScriptUrl] = useState<string>(STORE_CONFIG.sheetScriptUrl || '');
  
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
  const STORAGE_KEY_CONFIG = 'ecom_config_v5';
  const STORAGE_KEY_PASS = 'ecom_admin_pass_v5';

  const trackPixelEvent = (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).fbq && pixelId) {
      const payload = testEventCode 
        ? { ...data, test_event_code: testEventCode } 
        : data;
      (window as any).fbq('track', eventName, payload);
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
      try { initialProducts = JSON.parse(savedProducts); } catch (e) { initialProducts = MOCK_PRODUCTS; }
      setProducts(initialProducts);
    } else {
      setProducts(MOCK_PRODUCTS);
    }

    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    }

    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      const c = JSON.parse(savedConfig);
      setPixelId(c.pixelId || STORE_CONFIG.pixelId);
      setTestEventCode(c.testCode || STORE_CONFIG.testCode);
      setSheetId(c.sheetId || STORE_CONFIG.sheetId);
      setSheetName(c.sheetName || STORE_CONFIG.sheetName);
      setSheetScriptUrl(c.sheetScriptUrl || STORE_CONFIG.sheetScriptUrl);
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
    const configStr = JSON.stringify({ 
      pixelId, testCode: testEventCode, 
      sheetId, sheetName, sheetScriptUrl,
      storeName: 'Berrima Store', currency: 'DH' 
    }, null, 2);
    
    return `import { StoreProduct } from './types';\n\nexport const STORE_CONFIG = ${configStr};\n\nexport const MOROCCAN_CITIES = ${JSON.stringify(MOROCCAN_CITIES, null, 2)};\n\nexport const MOCK_PRODUCTS: StoreProduct[] = ${productsStr};\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};`;
  };

  const copyToClipboard = (text: string, message: string = "تم النسخ!") => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || !editingProduct) return;
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isGallery) {
          setEditingProduct(prev => prev ? { ...prev, galleryImages: [...(prev.galleryImages || []), base64String] } : null);
        } else {
          setEditingProduct(prev => prev ? { ...prev, thumbnail: base64String } : null);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; 
  };

  const sendOrderToSheet = async (order: StoreOrder) => {
    if (!sheetScriptUrl) return;
    try {
      await fetch(sheetScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          date: order.orderDate,
          customer: order.customer.fullName,
          phone: order.customer.phoneNumber,
          city: order.customer.city,
          product: order.productTitle,
          price: order.productPrice
        })
      });
    } catch (error) {
      console.error('Error sending to sheet:', error);
    }
  };

  const confirmOrder = async () => {
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

    // إرسال لغوغل شيت
    if (sheetScriptUrl) await sendOrderToSheet(newOrder);

    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
  };

  const saveConfigSettings = () => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ 
      pixelId, testCode: testEventCode,
      sheetId, sheetName, sheetScriptUrl
    }));
    alert("✅ تم حفظ الإعدادات محلياً.");
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setView('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const bgMain = theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50';
  const bgSidebar = theme === 'dark' ? 'bg-[#070b1d]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const borderLight = theme === 'dark' ? 'border-emerald-500/10' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} flex flex-col md:flex-row font-['Tajawal'] overflow-hidden relative`}>
      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <aside className={`fixed md:relative bottom-0 left-0 right-0 md:top-0 w-full md:w-80 h-20 md:h-screen ${bgSidebar} border-t md:border-t-0 md:border-l ${borderLight} flex md:flex-col z-[100] transition-all shadow-2xl items-center justify-around md:justify-start`}>
        <div className="hidden md:flex p-8 items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20"><Sparkles size={24} /></div>
          <div><h1 className="text-2xl font-black uppercase">Berrima</h1><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">berrima.store</p></div>
        </div>
        
        <nav className="flex-1 w-full flex md:flex-col px-4 md:mt-10 gap-2 md:space-y-4 items-center md:items-stretch">
          <button onClick={() => setView('shop')} className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-5 px-5 py-3 md:py-5 rounded-2xl md:rounded-[2rem] transition-all ${view === 'shop' ? 'bg-emerald-500/10 text-emerald-600' : `${textSecondary} hover:text-emerald-500`}`}>
            <ShoppingBag size={24} />
            <span className="text-[10px] md:text-lg font-bold">المتجر</span>
          </button>
          <button onClick={handleAdminClick} className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-5 px-5 py-3 md:py-5 rounded-2xl md:rounded-[2rem] transition-all ${view === 'admin' ? 'bg-emerald-500/10 text-emerald-600' : `${textSecondary} hover:text-emerald-500`}`}>
            {isAdminAuthenticated ? <LayoutDashboard size={24} /> : <Lock size={24} />}
            <span className="text-[10px] md:text-lg font-bold">لوحة التحكم</span>
          </button>
          
          <div className="md:hidden flex-1 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all text-slate-400" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            <span className="text-[10px] font-bold">{theme === 'dark' ? 'فاتح' : 'ليلي'}</span>
          </div>
        </nav>

        {isAdminAuthenticated && (
          <div className="hidden md:block p-8">
            <button onClick={() => { setIsAdminAuthenticated(false); setView('shop'); sessionStorage.removeItem('admin_auth'); }} className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all border border-rose-500/20 font-black text-sm"><LogOut size={18} /> تسجيل الخروج</button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-20 md:pb-0">
        <header className={`px-6 md:px-10 py-6 md:py-8 flex items-center justify-between z-40 ${bgCard} border-b ${borderLight} shadow-sm`}>
           <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{view === 'admin' ? 'الإدارة' : 'Berrima Store'}</h2>
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`hidden md:flex p-4 rounded-2xl border ${borderLight} items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-emerald-600 text-black' : 'bg-white text-slate-400'}`}>
             {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          {view === 'shop' ? (
            <div className="space-y-8 md:space-y-12">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
                {CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[1.8rem] whitespace-nowrap text-xs md:text-sm font-black transition-all ${activeTab === cat ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' : `${bgCard} ${textSecondary} border ${borderLight} hover:text-emerald-500`}`}>{cat}</button>)}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-32">
                {(activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map(product => (
                  <div key={product.id} className={`group relative ${bgCard} rounded-[1.5rem] md:rounded-[2.8rem] border ${borderLight} overflow-hidden transition-all duration-500 hover:border-emerald-500/30 md:hover:-translate-y-2 flex flex-col h-full shadow-lg`}>
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 md:bottom-8 right-4 md:left-8 left-4"><h4 className="text-sm md:text-xl font-black text-white leading-tight">{product.title}</h4></div>
                    </div>
                    <div className="p-4 md:p-8 flex items-center justify-between mt-auto">
                      <span className="text-sm md:text-2xl font-black text-emerald-600">{product.price} DH</span>
                      <button onClick={() => setSelectedProduct(product)} className="bg-emerald-600 text-black p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl hover:bg-emerald-500 transition-all"><ShoppingCart size={16} md:size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-10 pb-32 max-w-7xl mx-auto">
              <div className={`${bgCard} p-4 md:p-8 rounded-2xl md:rounded-[3rem] border ${borderLight} flex flex-wrap gap-2 md:gap-4 items-center justify-between`}>
                 <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <button onClick={() => setAdminTab('orders')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>الطلبيات ({orders.length})</button>
                    <button onClick={() => setAdminTab('products')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>المنتجات ({products.length})</button>
                    <button onClick={() => setAdminTab('settings')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>الإعدادات</button>
                 </div>
                 <button onClick={() => setAdminTab('export')} className={`w-full md:w-auto mt-2 md:mt-0 px-6 py-4 rounded-2xl font-black text-xs transition-all bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black flex items-center justify-center gap-2`}><FileCode size={16} /> تحديث المتجر</button>
              </div>

              {adminTab === 'settings' && (
                <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className={`${bgCard} p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] border-2 border-[#1877F2]/20 shadow-xl`}>
                      <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#1877F2] rounded-xl md:rounded-2xl flex items-center justify-center text-white"><Facebook size={24} md:size={28} /></div>
                        <h3 className="text-lg md:text-2xl font-black">إعدادات فيسبوك</h3>
                      </div>
                      <div className="space-y-4 md:space-y-6">
                        <input type="text" placeholder="Pixel ID" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-4 md:p-5 rounded-xl md:rounded-2xl font-bold`} value={pixelId} onChange={(e) => setPixelId(e.target.value)} />
                        <input type="text" placeholder="Test Event Code" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-4 md:p-5 rounded-xl md:rounded-2xl font-bold`} value={testEventCode} onChange={(e) => setTestEventCode(e.target.value)} />
                      </div>
                    </div>

                    <div className={`${bgCard} p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] border-2 border-emerald-500/20 shadow-xl`}>
                      <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center text-black"><Table size={24} md:size={28} /></div>
                        <h3 className="text-lg md:text-2xl font-black">غوغل شيت (Sheets)</h3>
                      </div>
                      <div className="space-y-4 md:space-y-6">
                        <input type="text" placeholder="Spreadsheet ID" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-4 md:p-5 rounded-xl md:rounded-2xl font-bold`} value={sheetId} onChange={(e) => setSheetId(e.target.value)} />
                        <input type="text" placeholder="Sheet Name" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-4 md:p-5 rounded-xl md:rounded-2xl font-bold`} value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
                        <input type="text" placeholder="Apps Script Web App URL" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-4 md:p-5 rounded-xl md:rounded-2xl font-bold`} value={sheetScriptUrl} onChange={(e) => setSheetScriptUrl(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <button onClick={saveConfigSettings} className="w-full bg-emerald-600 text-black py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl shadow-xl transition-all flex items-center justify-center gap-4"><Save size={24} /> حفظ الإعدادات</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Details Modal - Optimized for Mobile */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isCheckingOut && setSelectedProduct(null)} />
          <div className={`${bgSidebar} w-full h-full md:h-auto md:max-w-7xl md:rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border ${borderLight} md:max-h-[95vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-300`}>
            <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 md:top-8 right-4 md:right-8 z-[110] bg-black/40 md:bg-white/5 p-3 md:p-4 rounded-full text-white border border-white/10"><X size={20} md:size={24} /></button>
            
            <div className={`w-full md:w-1/2 h-[50vh] md:h-auto ${theme === 'dark' ? 'bg-black' : 'bg-slate-50'} flex flex-col items-center justify-center relative p-0 md:p-8`}>
              <div className="relative w-full h-full md:aspect-[4/5] overflow-hidden md:rounded-[3rem] shadow-2xl">
                <img src={activeGalleryImage || selectedProduct.thumbnail} className="w-full h-full object-cover transition-all duration-700" />
              </div>
              {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 && (
                <div className="absolute bottom-4 left-0 right-0 flex gap-2 overflow-x-auto no-scrollbar px-4">
                  <div onClick={() => setActiveGalleryImage(selectedProduct.thumbnail)} className={`min-w-[60px] h-[60px] md:min-w-[80px] md:h-[80px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${activeGalleryImage === selectedProduct.thumbnail ? 'border-emerald-500' : 'border-transparent'}`}><img src={selectedProduct.thumbnail} className="w-full h-full object-cover" /></div>
                  {selectedProduct.galleryImages.map((img, i) => (
                    <div key={i} onClick={() => setActiveGalleryImage(img)} className={`min-w-[60px] h-[60px] md:min-w-[80px] md:h-[80px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${activeGalleryImage === img ? 'border-emerald-500' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" /></div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 flex-1 p-6 md:p-20 flex flex-col justify-between overflow-y-auto no-scrollbar">
               {!isCheckingOut ? (
                 <>
                   <div className="space-y-4 md:space-y-8">
                     <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-500/20">{selectedProduct.category}</span>
                     <h2 className="text-2xl md:text-6xl font-black leading-tight tracking-tighter">{selectedProduct.title}</h2>
                     <p className={`${textSecondary} font-medium text-sm md:text-xl leading-relaxed whitespace-pre-wrap`}>{selectedProduct.description}</p>
                   </div>
                   <div className="mt-8 md:mt-16 space-y-4 md:space-y-6">
                     <div className="flex items-center justify-between p-6 md:p-10 bg-emerald-600 rounded-2xl md:rounded-[3rem] text-black shadow-xl">
                       <div><p className="text-[10px] font-black uppercase opacity-60">السعر النهائي</p><p className="text-3xl md:text-6xl font-black">{selectedProduct.price} <small className="text-sm md:text-2xl">DH</small></p></div>
                       <div className="text-right"><p className="font-black text-[10px] md:text-sm uppercase">دفع عند الاستلام</p></div>
                     </div>
                     <button onClick={() => setIsCheckingOut(true)} className="w-full bg-white text-black py-6 md:py-10 rounded-2xl md:rounded-[3rem] font-black text-xl md:text-3xl shadow-2xl animate-buy-pulse">اشترِ الآن</button>
                   </div>
                 </>
               ) : (
                 <div className="space-y-6 md:space-y-10 h-full flex flex-col">
                    <div className="flex items-center gap-4 md:gap-6">
                      <button onClick={() => setIsCheckingOut(false)} className="p-3 md:p-4 rounded-full text-emerald-500 border ${borderLight} shadow-md"><ChevronLeft size={20} md:size={24} /></button>
                      <h3 className="text-2xl md:text-4xl font-black tracking-tighter">معلومات التوصيل</h3>
                    </div>
                    <div className="flex-1 space-y-4 md:space-y-8">
                      <div className="space-y-1"><label className={`text-[10px] ${textSecondary} font-black px-4`}>الاسم الكامل</label><div className={`bg-white/5 border ${borderLight} p-4 md:p-7 rounded-xl md:rounded-[2rem] flex items-center gap-3 md:gap-4`}><User className={textSecondary} size={18} /><input type="text" placeholder="اسمك الكامل" className="bg-transparent border-none outline-none flex-1 font-bold text-sm md:text-xl" value={customerInfo.fullName} onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})} /></div></div>
                      <div className="space-y-1"><label className={`text-[10px] ${textSecondary} font-black px-4`}>المدينة</label><div className={`bg-white/5 border ${borderLight} p-4 md:p-7 rounded-xl md:rounded-[2rem] flex items-center gap-3 md:gap-4`}><MapPin className={textSecondary} size={18} /><select className="bg-transparent border-none outline-none flex-1 font-bold text-sm md:text-xl appearance-none" value={customerInfo.city} onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}><option value="">اختر مدينتك</option>{MOROCCAN_CITIES.map(city => <option key={city} value={city} className="text-black">{city}</option>)}</select></div></div>
                      <div className="space-y-1"><label className={`text-[10px] ${textSecondary} font-black px-4`}>رقم الهاتف</label><div className={`bg-white/5 border ${borderLight} p-4 md:p-7 rounded-xl md:rounded-[2rem] flex items-center gap-3 md:gap-4`}><Phone className={textSecondary} size={18} /><input type="tel" placeholder="رقم الهاتف" className="bg-transparent border-none outline-none flex-1 font-bold text-ltr text-sm md:text-xl" value={customerInfo.phoneNumber} onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} /></div></div>
                    </div>
                    <button onClick={confirmOrder} className="w-full bg-emerald-600 text-black py-6 md:py-10 rounded-2xl md:rounded-[3rem] font-black text-lg md:text-2xl shadow-2xl flex items-center justify-center gap-3">تأكيد الطلب <ArrowRight size={24} /></button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveOrder(null)} />
          <div className={`${bgSidebar} w-full max-w-xl rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-center relative border ${borderLight} shadow-2xl`}>
             <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-600 rounded-full flex items-center justify-center text-black mx-auto mb-6 md:mb-10 shadow-xl"><Check size={32} md:size={50} strokeWidth={4} /></div>
             <h3 className="text-2xl md:text-4xl font-black mb-4">تم استلام طلبك!</h3>
             <p className={`${textSecondary} font-bold text-sm md:text-xl mb-8 md:mb-12`}>شكراً {activeOrder.customer.fullName}. سنتصل بك قريباً لتأكيد الشحن.</p>
             <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-600 text-black py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-lg shadow-xl">العودة للتسوق</button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowLoginModal(false)} />
          <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === adminPassword) { setIsAdminAuthenticated(true); sessionStorage.setItem('admin_auth', 'true'); setShowLoginModal(false); setView('admin'); setPasswordInput(''); } else setLoginError(true); }} className={`${bgCard} w-full max-w-md rounded-[2.5rem] p-8 md:p-12 relative border ${borderLight} shadow-2xl`}>
             <h3 className="text-2xl md:text-3xl font-black text-center mb-8">دخول المسؤول</h3>
             <div className="space-y-4 md:space-y-6">
                <div className="relative"><input type={showPassword ? "text" : "password"} placeholder="كلمة المرور" className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${loginError ? 'border-rose-500' : borderLight} p-5 md:p-6 rounded-2xl ${textPrimary} font-bold outline-none pr-14`} value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }} autoFocus /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                <button type="submit" className="w-full bg-emerald-600 text-black py-4 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-emerald-500 shadow-xl transition-all">دخول</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
