
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, PackagePlus, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Upload, Plus as PlusIcon, RefreshCw, Link as LinkIcon, Share2, Copy, 
  Target, Facebook, Code, FileCode, KeyRound, Images, Camera, 
  Activity, Info, Table, Database, ExternalLink, Filter, MoreVertical,
  Calendar, CreditCard, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const DEFAULT_ADMIN_PASSWORD = 'admin'; 

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'settings' | 'export'>('orders');
  
  // State for store data
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  
  // UI Interaction states
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('الكل');
  
  // Admin Management states
  const [editingOrder, setEditingOrder] = useState<StoreOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<StoreOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Config States
  const [pixelId, setPixelId] = useState<string>(STORE_CONFIG.pixelId);
  const [testEventCode, setTestEventCode] = useState<string>(STORE_CONFIG.testCode);
  const [sheetId, setSheetId] = useState<string>(STORE_CONFIG.sheetId || '');
  const [sheetName, setSheetName] = useState<string>(STORE_CONFIG.sheetName || 'Orders');
  const [sheetScriptUrl, setSheetScriptUrl] = useState<string>(STORE_CONFIG.sheetScriptUrl || '');
  
  // Auth states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [loginError, setLoginError] = useState(false);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);

  // Password change states
  const [currentPassChange, setCurrentPassChange] = useState('');
  const [newPassChange, setNewPassChange] = useState('');
  const [confirmPassChange, setConfirmPassChange] = useState('');
  const [passChangeMessage, setPassChangeMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Storage keys
  const STORAGE_KEY_PRODUCTS = 'ecom_products_v6';
  const STORAGE_KEY_ORDERS = 'ecom_orders_v6';
  const STORAGE_KEY_CONFIG = 'ecom_config_v6';
  const STORAGE_KEY_PASS = 'ecom_admin_pass_v6';

  const trackPixelEvent = (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).fbq && pixelId) {
      const payload = testEventCode ? { ...data, test_event_code: testEventCode } : data;
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
      try { initialProducts = JSON.parse(savedProducts) as StoreProduct[]; } catch (_e) { initialProducts = MOCK_PRODUCTS; }
    }
    setProducts(initialProducts);

    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders) as StoreOrder[]); } catch(_e) { setOrders([]); }
    }

    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try {
        const c = JSON.parse(savedConfig);
        if (c && typeof c === 'object') {
          setPixelId(c.pixelId || STORE_CONFIG.pixelId);
          setTestEventCode(c.testCode || STORE_CONFIG.testCode);
          setSheetId(c.sheetId || STORE_CONFIG.sheetId);
          setSheetName(c.sheetName || STORE_CONFIG.sheetName);
          setSheetScriptUrl(c.sheetScriptUrl || STORE_CONFIG.sheetScriptUrl);
        }
      } catch (_e) {
        console.warn("Failed to parse store configuration.");
      }
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setActiveGalleryImage(selectedProduct.thumbnail);
      trackPixelEvent('ViewContent', {
        content_name: selectedProduct.title,
        content_category: selectedProduct.category,
        content_ids: [selectedProduct.id],
        content_type: 'product',
        value: selectedProduct.price,
        currency: 'MAD'
      });
    }
  }, [selectedProduct]);

  // Order Operations
  const deleteOrder = (orderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الطلبية؟')) {
      const updated = orders.filter(o => o.orderId !== orderId);
      setOrders(updated);
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    }
  };

  const saveOrderEdit = () => {
    if (!editingOrder) return;
    const updated = orders.map(o => o.orderId === editingOrder.orderId ? editingOrder : o);
    setOrders(updated);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    setEditingOrder(null);
  };

  // Product Operations
  const deleteProduct = (productId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    }
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    let updatedProducts;
    if (isAddingProduct) {
      updatedProducts = [editingProduct, ...products];
    } else {
      updatedProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    }
    
    setProducts(updatedProducts);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedProducts));
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'gallery') => {
    const files = e.target.files;
    if (!files || !editingProduct) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'thumbnail') setEditingProduct({ ...editingProduct, thumbnail: base64 });
        else setEditingProduct({ ...editingProduct, galleryImages: [...(editingProduct.galleryImages || []), base64] });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassChange !== adminPassword) {
      setPassChangeMessage({ text: '❌ كلمة السر الحالية غير صحيحة', type: 'error' });
      return;
    }
    if (newPassChange !== confirmPassChange) {
      setPassChangeMessage({ text: '❌ كلمات السر الجديدة غير متطابقة', type: 'error' });
      return;
    }
    if (newPassChange.length < 4) {
      setPassChangeMessage({ text: '❌ كلمة السر يجب أن تكون 4 أحرف على الأقل', type: 'error' });
      return;
    }
    
    setAdminPassword(newPassChange);
    localStorage.setItem(STORAGE_KEY_PASS, newPassChange);
    setPassChangeMessage({ text: '✅ تم تغيير كلمة السر بنجاح', type: 'success' });
    setCurrentPassChange('');
    setNewPassChange('');
    setConfirmPassChange('');
    
    setTimeout(() => setPassChangeMessage({ text: '', type: '' }), 5000);
  };

  // Customer Checkout Logic
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  const confirmOrder = async () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city) {
      alert("يرجى إكمال بيانات التوصيل.");
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

    if (sheetScriptUrl) {
      fetch(sheetScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.orderId,
          date: newOrder.orderDate,
          customer: newOrder.customer.fullName,
          phone: newOrder.customer.phoneNumber,
          city: newOrder.customer.city,
          product: newOrder.productTitle,
          price: newOrder.productPrice
        })
      }).catch(console.error);
    }

    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
  };

  const generateConstantsCode = () => {
    return `import { StoreProduct } from './types';

export const STORE_CONFIG = ${JSON.stringify({ 
      pixelId, testCode: testEventCode, 
      sheetId, sheetName, sheetScriptUrl,
      storeName: 'Berrima Store', currency: 'DH' 
    }, null, 2)};

export const MOROCCAN_CITIES = ${JSON.stringify(MOROCCAN_CITIES, null, 2)};

export const MOCK_PRODUCTS: StoreProduct[] = ${JSON.stringify(products, null, 2)};

export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};`;
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) setView('admin');
    else setShowLoginModal(true);
  };

  const bgMain = theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50';
  const bgSidebar = theme === 'dark' ? 'bg-[#070b1d]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const borderLight = theme === 'dark' ? 'border-emerald-500/10' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} flex flex-col md:flex-row font-['Tajawal'] overflow-hidden relative`}>
      {/* Sidebar/Navigation */}
      <aside className={`fixed md:relative bottom-0 left-0 right-0 md:top-0 w-full md:w-80 h-20 md:h-screen ${bgSidebar} border-t md:border-t-0 md:border-l ${borderLight} flex md:flex-col z-[100] transition-all shadow-2xl items-center justify-around md:justify-start`}>
        <div className="hidden md:flex p-8 items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20"><Sparkles size={24} /></div>
          <div><h1 className="text-2xl font-black uppercase tracking-tighter">Berrima</h1><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">berrima.store</p></div>
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
            <button onClick={() => { setIsAdminAuthenticated(false); setView('shop'); sessionStorage.removeItem('admin_auth'); }} className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all border border-rose-500/20 font-black text-sm"><LogOut size={18} /> خروج</button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-20 md:pb-0">
        <header className={`px-6 md:px-10 py-6 md:py-8 flex items-center justify-between z-40 ${bgCard} border-b ${borderLight} shadow-sm`}>
           <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{view === 'admin' ? 'لوحة التحكم' : 'Berrima Store'}</h2>
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
                      <button onClick={() => setSelectedProduct(product)} className="bg-emerald-600 text-black p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl hover:bg-emerald-500 transition-all"><ShoppingCart size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-10 pb-32 max-w-7xl mx-auto">
              <div className={`${bgCard} p-4 md:p-8 rounded-2xl md:rounded-[3rem] border ${borderLight} flex flex-wrap gap-2 md:gap-4 items-center justify-between shadow-xl`}>
                 <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <button onClick={() => setAdminTab('orders')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>الطلبيات ({orders.length})</button>
                    <button onClick={() => setAdminTab('products')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>المنتجات ({products.length})</button>
                    <button onClick={() => setAdminTab('settings')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-600 text-black' : `${textSecondary} hover:text-emerald-500`}`}>الإعدادات</button>
                    <button onClick={() => setAdminTab('export')} className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all bg-amber-500/10 text-amber-500 border border-amber-500/20`}><FileCode size={14} /></button>
                 </div>
                 {adminTab === 'products' && (
                    <button onClick={() => { setEditingProduct({ id: 'prod-' + Date.now(), title: '', price: 0, category: 'أدوات منزلية', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24-48 ساعة' }); setIsAddingProduct(true); }} className="bg-emerald-600 text-black px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg"><PlusCircle size={18} /> إضافة منتج</button>
                 )}
              </div>

              {adminTab === 'orders' && (
                <div className="grid gap-4 md:gap-6">
                  {orders.length === 0 ? (
                    <div className="p-20 text-center opacity-30 font-black">لا توجد طلبيات</div>
                  ) : orders.map(order => (
                    <div key={order.orderId} className={`${bgCard} border ${borderLight} p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 group shadow-lg transition-all hover:border-emerald-500/20`}>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${
                          order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-500' : 
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' : 
                          'bg-amber-500/20 text-amber-500'
                        }`}>
                          {order.status === 'delivered' ? <CheckCircle2 size={24} /> : order.status === 'shipped' ? <Truck size={24} /> : <Clock size={24} />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm md:text-lg font-black">{order.customer.fullName}</h4>
                          <p className={`text-[10px] md:text-xs ${textSecondary} font-bold`}>{order.productTitle} • {order.orderId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end w-full md:w-auto">
                        <button onClick={() => setViewingOrder(order)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><Eye size={18} /></button>
                        <button onClick={() => setEditingOrder(order)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={18} /></button>
                        <button onClick={() => deleteOrder(order.orderId)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'products' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                   {products.map(product => (
                      <div key={product.id} className={`${bgCard} border ${borderLight} rounded-[2rem] overflow-hidden flex flex-col shadow-lg group`}>
                         <div className="aspect-square relative overflow-hidden">
                            <img src={product.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setEditingProduct(product); setIsAddingProduct(false); }} className="p-3 bg-blue-600 text-white rounded-xl shadow-xl"><Edit3 size={18} /></button>
                               <button onClick={() => deleteProduct(product.id)} className="p-3 bg-rose-600 text-white rounded-xl shadow-xl"><Trash2 size={18} /></button>
                            </div>
                         </div>
                         <div className="p-6">
                            <h4 className="font-black text-sm line-clamp-1">{product.title}</h4>
                            <p className="text-emerald-500 font-black">{product.price} DH</p>
                         </div>
                      </div>
                   ))}
                </div>
              )}

              {adminTab === 'settings' && (
                <div className="max-w-6xl mx-auto space-y-12 pb-20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Settings */}
                    <div className={`${bgCard} p-8 rounded-[3rem] border-2 border-emerald-500/10 shadow-xl space-y-8`}>
                       <h3 className="text-xl font-black flex items-center gap-3"><Settings className="text-emerald-500" /> إعدادات المتجر</h3>
                       <div className="space-y-6">
                         <div className="space-y-1"><label className="text-[10px] font-black opacity-50 px-4">Facebook Pixel ID</label><input type="text" className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={pixelId} onChange={(e) => setPixelId(e.target.value)} /></div>
                         <div className="space-y-1"><label className="text-[10px] font-black opacity-50 px-4">Google Sheet Script URL</label><input type="text" className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={sheetScriptUrl} onChange={(e) => setSheetScriptUrl(e.target.value)} /></div>
                       </div>
                    </div>

                    {/* Password Change Section */}
                    <form onSubmit={handleChangePassword} className={`${bgCard} p-8 rounded-[3rem] border-2 border-amber-500/10 shadow-xl space-y-8`}>
                       <h3 className="text-xl font-black flex items-center gap-3"><KeyRound className="text-amber-500" /> تغيير كلمة المرور</h3>
                       <div className="space-y-4">
                         {passChangeMessage.text && (
                           <div className={`p-4 rounded-2xl text-xs font-bold text-center ${passChangeMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                             {passChangeMessage.text}
                           </div>
                         )}
                         <div className="space-y-1"><label className="text-[10px] font-black opacity-50 px-4">كلمة السر الحالية</label><input type="password" required className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={currentPassChange} onChange={(e) => setCurrentPassChange(e.target.value)} /></div>
                         <div className="space-y-1"><label className="text-[10px] font-black opacity-50 px-4">كلمة السر الجديدة</label><input type="password" required className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={newPassChange} onChange={(e) => setNewPassChange(e.target.value)} /></div>
                         <div className="space-y-1"><label className="text-[10px] font-black opacity-50 px-4">تأكيد كلمة السر الجديدة</label><input type="password" required className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={confirmPassChange} onChange={(e) => setConfirmPassChange(e.target.value)} /></div>
                         <button type="submit" className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 mt-4 hover:bg-amber-400 transition-all"><RefreshCw size={18} /> تحديث كلمة السر</button>
                       </div>
                    </form>
                  </div>
                  <button onClick={() => { localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ pixelId, sheetScriptUrl })); alert('تم الحفظ بنجاح!'); }} className="w-full bg-emerald-600 text-black py-6 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3"><Save size={24} /> حفظ كافة الإعدادات</button>
                </div>
              )}

              {adminTab === 'export' && (
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                   <div className={`${bgCard} p-10 rounded-[3.5rem] border-2 border-amber-500/20 shadow-2xl`}>
                      <h3 className="text-3xl font-black mb-6 flex items-center gap-4 text-amber-500"><Code size={40} /> تحديث الكود المصدري</h3>
                      <p className="text-sm opacity-60 font-bold mb-8">انسخ الكود أدناه وضعه في ملف constants.tsx لتثبيت التغييرات للمتجر بالكامل.</p>
                      <div className="relative group">
                         <pre className="bg-black/50 p-8 rounded-3xl font-mono text-[10px] text-ltr overflow-x-auto h-80 no-scrollbar opacity-70">{generateConstantsCode()}</pre>
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] rounded-3xl">
                            <button onClick={() => { navigator.clipboard.writeText(generateConstantsCode()); alert('تم نسخ الكود!'); }} className="bg-amber-500 text-black px-12 py-5 rounded-full font-black flex items-center gap-3 shadow-2xl scale-110"><Copy size={24} /> نسخ الكود بالكامل</button>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Viewing Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setViewingOrder(null)} />
          <div className={`${bgCard} w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative border ${borderLight} shadow-2xl overflow-y-auto max-h-[90vh]`}>
            <button onClick={() => setViewingOrder(null)} className="absolute top-8 left-8 text-slate-500 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-emerald-500"><Package /> تفاصيل الطلبية</h3>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border ${borderLight}"><p className="text-[10px] font-black opacity-50 mb-1">رقم الطلب</p><p className="font-mono font-bold">{viewingOrder.orderId}</p></div>
                  <div className="bg-white/5 p-6 rounded-3xl border ${borderLight}"><p className="text-[10px] font-black opacity-50 mb-1">الحالة</p><span className="text-[10px] font-black px-3 py-1 bg-emerald-500 text-black rounded-full">{viewingOrder.status}</span></div>
               </div>
               <div className="bg-white/5 p-8 rounded-3xl border ${borderLight} space-y-4">
                  <h4 className="font-black flex items-center gap-2"><User size={18} className="text-emerald-500" /> بيانات الزبون</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold">
                     <div><p className="opacity-40 text-[10px] mb-1">الاسم</p><p>{viewingOrder.customer.fullName}</p></div>
                     <div><p className="opacity-40 text-[10px] mb-1">الهاتف</p><p className="text-emerald-500 font-mono">{viewingOrder.customer.phoneNumber}</p></div>
                     <div className="col-span-2"><p className="opacity-40 text-[10px] mb-1">المدينة</p><p>{viewingOrder.customer.city}</p></div>
                  </div>
               </div>
               <button onClick={() => { setEditingOrder(viewingOrder); setViewingOrder(null); }} className="w-full bg-emerald-600 text-black py-6 rounded-3xl font-black text-lg">تعديل الطلبية</button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setEditingOrder(null)} />
          <div className={`${bgCard} w-full max-w-xl rounded-[3rem] p-10 relative border ${borderLight} shadow-2xl`}>
            <h3 className="text-2xl font-black mb-8">تعديل الطلبية</h3>
            <div className="space-y-6">
               <input type="text" className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={editingOrder.customer.fullName} onChange={(e) => setEditingOrder({...editingOrder, customer: {...editingOrder.customer, fullName: e.target.value}})} />
               <input type="text" className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={editingOrder.customer.phoneNumber} onChange={(e) => setEditingOrder({...editingOrder, customer: {...editingOrder.customer, phoneNumber: e.target.value}})} />
               <select className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={editingOrder.status} onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value as any})}>
                  <option value="pending" className="text-black">في الانتظار</option>
                  <option value="shipped" className="text-black">مشحون</option>
                  <option value="delivered" className="text-black">تم التوصيل</option>
               </select>
               <button onClick={saveOrderEdit} className="w-full bg-emerald-600 text-black py-6 rounded-3xl font-black text-lg">حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Adding/Editing Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setEditingProduct(null)} />
          <div className={`${bgCard} w-full max-w-4xl rounded-[3.5rem] p-12 relative border ${borderLight} shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar`}>
            <h3 className="text-3xl font-black mb-10">{isAddingProduct ? 'إضافة منتج' : 'تعديل منتج'}</h3>
            <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <input type="text" placeholder="اسم المنتج" required className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={editingProduct.title} onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} />
                  <input type="number" placeholder="السعر" required className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold`} value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                  <textarea rows={5} placeholder="الوصف" className={`w-full bg-white/5 border ${borderLight} p-5 rounded-2xl font-bold text-sm`} value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} />
               </div>
               <div className="space-y-8">
                  <div className="aspect-square bg-white/5 border-2 border-dashed border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group">
                     {editingProduct.thumbnail ? (
                        <>
                          <img src={editingProduct.thumbnail} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => document.getElementById('thumb-upload')?.click()}><Camera size={40} /></div>
                        </>
                     ) : (
                        <button type="button" onClick={() => document.getElementById('thumb-upload')?.click()} className="flex flex-col items-center gap-4 text-emerald-500/40 font-black"><ImageIcon size={50} /> رفع الصورة</button>
                     )}
                     <input id="thumb-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'thumbnail')} />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-black py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl">حفظ المنتج</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Shop Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isCheckingOut && setSelectedProduct(null)} />
          <div className={`${bgSidebar} w-full h-full md:h-auto md:max-w-7xl md:rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border ${borderLight} md:max-h-[95vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-300`}>
            <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 md:top-8 right-4 md:right-8 z-[110] bg-black/40 md:bg-white/5 p-3 md:p-4 rounded-full text-white border border-white/10"><X size={20} /></button>
            <div className={`w-full md:w-1/2 h-[45vh] md:h-auto ${theme === 'dark' ? 'bg-black' : 'bg-slate-50'} relative p-0 md:p-8`}>
              <img src={activeGalleryImage || selectedProduct.thumbnail} className="w-full h-full object-cover md:rounded-[3rem]" />
            </div>
            <div className="w-full md:w-1/2 flex-1 p-8 md:p-20 overflow-y-auto no-scrollbar">
               {!isCheckingOut ? (
                 <div className="space-y-10">
                   <div className="space-y-4">
                     <span className="bg-emerald-500/10 text-emerald-500 px-5 py-1.5 rounded-full text-[10px] font-black border border-emerald-500/20">{selectedProduct.category}</span>
                     <h2 className="text-3xl md:text-5xl font-black leading-tight">{selectedProduct.title}</h2>
                     <p className={`${textSecondary} font-medium text-sm md:text-lg leading-relaxed whitespace-pre-wrap`}>{selectedProduct.description}</p>
                   </div>
                   <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-black shadow-xl flex items-center justify-between">
                     <p className="text-4xl md:text-6xl font-black">{selectedProduct.price} DH</p>
                     <div className="text-right"><p className="text-[10px] font-black uppercase opacity-60">توصيل مجاني</p><p className="font-bold">الدفع عند الاستلام</p></div>
                   </div>
                   <button onClick={() => setIsCheckingOut(true)} className="w-full bg-white text-black py-8 md:py-10 rounded-[3rem] font-black text-2xl md:text-4xl shadow-2xl animate-buy-pulse">اشترِ الآن</button>
                 </div>
               ) : (
                 <div className="space-y-10 h-full flex flex-col">
                    <div className="flex items-center gap-6"><button onClick={() => setIsCheckingOut(false)} className="p-4 rounded-full text-emerald-500 border ${borderLight} shadow-md"><ChevronLeft size={24} /></button><h3 className="text-3xl font-black">معلومات التوصيل</h3></div>
                    <div className="flex-1 space-y-6">
                       <input type="text" placeholder="اسمك الكامل" className={`w-full bg-white/5 border ${borderLight} p-6 rounded-3xl font-bold text-lg`} value={customerInfo.fullName} onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})} />
                       <select className={`w-full bg-white/5 border ${borderLight} p-6 rounded-3xl font-bold text-lg appearance-none`} value={customerInfo.city} onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}><option value="">اختر مدينتك</option>{MOROCCAN_CITIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}</select>
                       <input type="tel" placeholder="رقم الهاتف" className={`w-full bg-white/5 border ${borderLight} p-6 rounded-3xl font-bold text-lg text-ltr`} value={customerInfo.phoneNumber} onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} />
                    </div>
                    <button onClick={confirmOrder} className="w-full bg-emerald-600 text-black py-8 rounded-[3rem] font-black text-2xl flex items-center justify-center gap-4">تأكيد الطلب <ArrowRight size={28} /></button>
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
          <div className={`${bgSidebar} w-full max-w-xl rounded-[4rem] p-12 text-center relative border ${borderLight} shadow-2xl`}>
             <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-black mx-auto mb-8 shadow-xl shadow-emerald-500/30"><Check size={40} strokeWidth={4} /></div>
             <h3 className="text-3xl font-black mb-4">تم استلام طلبك!</h3>
             <p className={`${textSecondary} font-bold text-lg mb-10`}>سنتصل بك قريباً لتأكيد الطلبية.</p>
             <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-600 text-black py-6 rounded-3xl font-black text-xl shadow-xl">العودة للمتجر</button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowLoginModal(false)} />
          <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === adminPassword) { setIsAdminAuthenticated(true); sessionStorage.setItem('admin_auth', 'true'); setShowLoginModal(false); setView('admin'); setPasswordInput(''); } else setLoginError(true); }} className={`${bgCard} w-full max-w-md rounded-[3rem] p-10 relative border ${borderLight} shadow-2xl`}>
             <h3 className="text-2xl font-black text-center mb-8">دخول المسؤول</h3>
             <div className="space-y-4">
                <input type={showPassword ? "text" : "password"} placeholder="كلمة المرور" className={`w-full bg-white/5 border ${loginError ? 'border-rose-500' : borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none`} value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }} autoFocus />
                <button type="submit" className="w-full bg-emerald-600 text-black py-5 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all">دخول</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
