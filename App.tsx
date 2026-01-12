
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Share2, Copy, Facebook, Link as LinkIcon, Camera, 
  Activity, Info, CheckCircle2, AlertTriangle, Plus,
  ChevronDown, Search, ArrowUpRight, Zap, Award, UploadCloud, Download,
  ImagePlus, HelpCircle, RefreshCcw, Globe, Database, Server, Link
} from 'lucide-react';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

  // Supabase Config
  const [dbConfig, setDbConfig] = useState({
    url: localStorage.getItem('sb_url') || '',
    key: localStorage.getItem('sb_key') || ''
  });
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // Initialize Supabase if config exists
  useEffect(() => {
    if (dbConfig.url && dbConfig.key) {
      try {
        const client = createClient(dbConfig.url, dbConfig.key);
        setSupabase(client);
      } catch (e) {
        console.error("Supabase Init Error", e);
      }
    }
  }, [dbConfig]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (supabase) {
        // Fetch from Supabase
        const { data: dbProducts, error: pError } = await supabase.from('products').select('*');
        if (!pError && dbProducts) setProducts(dbProducts);
        
        const { data: dbOrders, error: oError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!oError && dbOrders) setOrders(dbOrders);
      } else {
        // Fallback to local storage or mock
        const savedProducts = localStorage.getItem('ecom_products_v7');
        setProducts(savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS);
        
        const savedOrders = localStorage.getItem('ecom_orders_v7');
        setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      }
    };

    fetchData();

    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);
  }, [supabase]);

  const handleAdminClick = () => {
    if (isAdminAuthenticated) setView('admin');
    else setShowLoginModal(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (supabase) {
      const { error } = await supabase.from('products').upsert(editingProduct);
      if (error) {
        showToast('خطأ في المزامنة مع قاعدة البيانات', 'error');
        return;
      }
    }

    const updated = isAddingProduct ? [editingProduct, ...products] : products.map(p => p.id === editingProduct.id ? editingProduct : p);
    setProducts(updated);
    localStorage.setItem('ecom_products_v7', JSON.stringify(updated));
    setEditingProduct(null);
    setIsAddingProduct(false);
    showToast('تم حفظ المنتج بنجاح وتحديثه للجميع!', 'success');
  };

  const confirmOrder = async () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !selectedProduct) {
      showToast('المرجو ملأ المعلومات الأساسية للطلب', 'error');
      return;
    }
    
    const newOrder: any = {
      orderId: 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productPrice: selectedProduct.price,
      customer: { ...customerInfo },
      orderDate: new Date().toLocaleDateString('ar-MA'),
      status: 'pending'
    };

    if (supabase) {
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) {
        showToast('حدث خطأ أثناء إرسال الطلب', 'error');
        return;
      }
    }

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('ecom_orders_v7', JSON.stringify(updated));
    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
    setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
  };

  const saveDbConfig = () => {
    localStorage.setItem('sb_url', dbConfig.url);
    localStorage.setItem('sb_key', dbConfig.key);
    showToast('تم حفظ إعدادات قاعدة البيانات. جارِ الاتصال...');
    window.location.reload(); // Refresh to re-init
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
        showToast('تم تحديث الصورة');
      } catch (err) {
        showToast('خطأ في التحميل', 'error');
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
        showToast('تم إضافة الصور');
      } catch (err) {
        showToast('خطأ في التحميل', 'error');
      }
    }
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

      {/* Sidebar Nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-t-0 md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10 pb-2">
        <div className="hidden md:flex flex-col items-center gap-2 mb-10">
          <div className={`w-12 h-12 ${supabase ? 'bg-emerald-500' : 'bg-amber-500'} rounded-2xl flex items-center justify-center text-black shadow-lg`}>
            {supabase ? <Server size={24} /> : <Database size={24} />}
          </div>
        </div>
        <div className="flex md:flex-col gap-6 md:gap-10 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}><ShoppingBag size={22} /></button>
          <button onClick={handleAdminClick} className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}><LayoutDashboard size={22} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen pb-24 md:pb-0">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            {/* Hero Section */}
            <section className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/60 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black tracking-widest uppercase"><Sparkles size={14} /> متجر بريمة الموثوق</span>
                <h1 className="text-4xl md:text-8xl font-black leading-tight text-gradient">اكتشف منتجات <br/> لم تكن تتخيلها</h1>
                <p className="text-slate-400 text-sm md:text-2xl font-medium max-w-md leading-relaxed">جودة عالية، توصيل سريع، ودفع عند الاستلام. نحن نهتم بكل تفاصيل تجربتك.</p>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black text-xl premium-btn shadow-2xl shadow-emerald-500/20 flex items-center gap-3">ابدأ التسوق <ArrowRight size={24} /></button>
              </div>
            </section>

            {/* Categories */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-4 rounded-2xl font-black transition-all border ${activeTab === cat ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl' : 'glass-morphism text-slate-400 border-white/5'}`}>{cat}</button>
              ))}
            </div>

            {/* Products */}
            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
              {(activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map((product, idx) => (
                <div key={product.id} className="group product-card-glow glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col animate-fade-in-up border border-white/5" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="aspect-[4/5] overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a18]/90 via-transparent to-transparent opacity-80"></div>
                  </div>
                  <div className="p-5 md:p-8 space-y-4 flex-1 flex flex-col">
                    <h3 className="font-black text-sm md:text-xl line-clamp-1">{product.title}</h3>
                    <div className="mt-auto flex flex-col gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-4xl font-black text-emerald-500">{product.price} <span className="text-xs">DH</span></span>
                        {product.originalPrice && <span className="text-xs md:text-sm text-slate-500 line-through font-bold">{product.originalPrice} DH</span>}
                      </div>
                      <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 hover:bg-emerald-500 hover:text-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10 font-black">طلب الآن <ShoppingCart size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gradient">إدارة المتجر</h2>
                <div className={`flex items-center gap-2 text-[11px] font-black mt-2 px-4 py-1.5 rounded-full w-fit ${supabase ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {supabase ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
                  <span>{supabase ? 'المتجر متصل بقاعدة البيانات السحابية' : 'المتجر يعمل محلياً - اربط قاعدة البيانات للنشر للجميع'}</span>
                </div>
              </div>
              <div className="flex gap-2 glass-morphism p-2 rounded-[2rem] border border-white/5">
                <button onClick={() => setAdminTab('orders')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الطلبيات ({orders.length})</button>
                <button onClick={() => setAdminTab('products')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>المنتجات ({products.length})</button>
                <button onClick={() => setAdminTab('settings')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الإعدادات السحابية</button>
              </div>
            </header>

            {adminTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="glass-morphism p-10 rounded-[3rem] border-2 border-emerald-500/20 bg-emerald-500/5">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl"><Database size={32}/></div>
                      <h3 className="text-3xl font-black text-emerald-500">ربط قاعدة البيانات (Supabase)</h3>
                   </div>
                   <p className="text-slate-400 font-medium mb-8 leading-relaxed">لجعل التغييرات تظهر في الهاتف والحاسوب وفيسبوك تلقائياً، قم بإنشاء مشروع مجاني في Supabase وأدخل البيانات هنا.</p>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 pr-2 flex items-center gap-2"><Link size={14}/> Supabase Project URL</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" value={dbConfig.url} onChange={e => setDbConfig({...dbConfig, url: e.target.value})} placeholder="https://xyz.supabase.co" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 pr-2 flex items-center gap-2"><Lock size={14}/> Supabase Anon Key</label>
                        <input type="password" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" value={dbConfig.key} onChange={e => setDbConfig({...dbConfig, key: e.target.value})} placeholder="your-anon-key" />
                      </div>
                      <button onClick={saveDbConfig} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-xl premium-btn shadow-xl shadow-emerald-500/20">حفظ وربط المتجر</button>
                   </div>
                </div>

                <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                   <h4 className="font-black text-xl flex items-center gap-3"><HelpCircle size={24} className="text-emerald-500"/> كيف أنشئ قاعدة البيانات؟</h4>
                   <ol className="list-decimal list-inside space-y-3 text-slate-400 font-medium text-sm">
                      <li>افتح حساب في <a href="https://supabase.com" target="_blank" className="text-emerald-500 underline">Supabase.com</a> مجاناً.</li>
                      <li>أنشئ مشروعاً جديداً وسمِّه "MyStore".</li>
                      <li>من القائمة الجانبية اختر "Table Editor" وأنشئ جدولاً باسم <code className="text-white bg-white/5 px-2 py-0.5 rounded">products</code> وجدولاً باسم <code className="text-white bg-white/5 px-2 py-0.5 rounded">orders</code>.</li>
                      <li>اضبط الأعمدة لتوافق البيانات (أو اسأل المساعد ليقوم بإنشاء الكود لك).</li>
                      <li>الآن انسخ الـ URL والـ Key من "Project Settings" وضعهما هنا.</li>
                   </ol>
                </div>
              </div>
            )}

            {adminTab === 'products' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة', galleryImages: [] }); setIsAddingProduct(true); }}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white/5 group"
                >
                  <PlusCircle size={40} className="group-hover:scale-110 transition-transform" />
                  <span className="font-black">منتج جديد</span>
                </button>
                {products.map(p => (
                  <div key={p.id} className="glass-morphism rounded-[2.5rem] overflow-hidden group relative border border-white/5">
                    <img src={p.thumbnail} className="w-full h-full object-cover aspect-square" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                      <button onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }} className="p-4 bg-emerald-500 text-black rounded-2xl font-black shadow-xl"><Edit3 size={20} /></button>
                      <button onClick={async () => { 
                        if(window.confirm('حذف؟')) {
                          if (supabase) await supabase.from('products').delete().eq('id', p.id);
                          const up = products.filter(pr => pr.id !== p.id);
                          setProducts(up);
                          showToast('تم الحذف');
                        }
                      }} className="p-4 bg-rose-500 text-white rounded-2xl shadow-xl"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.length > 0 ? orders.map(order => (
                  <div key={order.orderId} className="glass-morphism p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner"><User size={28} /></div>
                      <div>
                        <h4 className="font-black text-2xl mb-1">{order.customer.fullName}</h4>
                        <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                           <span className="flex items-center gap-1.5"><Phone size={14}/> {order.customer.phoneNumber}</span>
                           <span className="flex items-center gap-1.5"><MapPin size={14}/> {order.customer.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2 text-right">
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">المنتج المطلوب</p>
                       <p className="text-xl font-black text-emerald-500">{order.productTitle}</p>
                       <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black w-fit mt-2">جديد - قيد المعالجة</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-40 glass-morphism rounded-[3rem] space-y-6 border border-dashed border-white/5">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700"><ShoppingBag size={48}/></div>
                    <p className="text-slate-500 font-black text-2xl">بانتظار وصول أول طلبية...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full h-full md:h-auto md:max-w-6xl md:rounded-[3.5rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5 shadow-2xl">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-6 right-6 z-[210] p-3 bg-black/40 rounded-full text-white hover:bg-emerald-500 hover:text-black transition-all shadow-2xl"><X size={24} /></button>
             <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-slate-900 relative">
                <img src={activeGalleryImage} className="w-full h-full object-cover" />
                {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0) && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto no-scrollbar pb-2">
                    <button onClick={() => setActiveGalleryImage(selectedProduct.thumbnail)} className={`w-16 h-16 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === selectedProduct.thumbnail ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white/10 opacity-60'}`}><img src={selectedProduct.thumbnail} className="w-full h-full object-cover" /></button>
                    {selectedProduct.galleryImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveGalleryImage(img)} className={`w-16 h-16 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === img ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white/10 opacity-60'}`}><img src={img} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}
             </div>
             <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col overflow-y-auto no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-10 my-auto">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <span className="bg-emerald-500 text-black px-4 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">{selectedProduct.category}</span>
                         <div className="flex text-amber-500"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
                      </div>
                      <h2 className="text-3xl md:text-6xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <p className="text-slate-400 text-sm md:text-xl leading-relaxed font-medium whitespace-pre-wrap">{selectedProduct.description}</p>
                    </div>
                    <div className="p-10 glass-morphism rounded-[3rem] flex items-center justify-between border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-black text-[10px] font-black rounded-bl-2xl">خصم لفترة محدودة</div>
                      <div><p className="text-xs font-black text-slate-500 mb-1">السعر الحالي</p><p className="text-5xl md:text-7xl font-black text-emerald-500">{selectedProduct.price} <span className="text-xl">DH</span></p></div>
                      <div className="text-right space-y-2">
                        <p className="text-slate-500 line-through font-bold text-xl">{selectedProduct.originalPrice || selectedProduct.price + 200} DH</p>
                        <p className="flex items-center gap-2 justify-end text-emerald-500 font-black"><Truck size={22} /> توصيل مجاني</p>
                      </div>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-7 rounded-[2rem] font-black text-xl md:text-3xl animate-buy-pulse premium-btn shadow-2xl shadow-emerald-500/30">أطلب الآن - الدفع عند الاستلام</button>
                    <div className="flex justify-center gap-10 text-slate-500 font-bold text-sm">
                       <span className="flex items-center gap-2"><ShieldCheck size={18}/> ضمان 12 شهر</span>
                       <span className="flex items-center gap-2"><RefreshCcw size={18}/> استرجاع مجاني</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 my-auto">
                     <div className="flex items-center gap-4"><button onClick={() => setIsCheckingOut(false)} className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all"><ChevronLeft size={28} /></button><h3 className="text-3xl md:text-5xl font-black text-gradient">بيانات التوصيل</h3></div>
                     <div className="space-y-6">
                       <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 pr-6">الإسم الكامل للزبون</label><input type="text" className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold text-white focus:border-emerald-500 outline-none transition-all" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="مثلاً: أحمد المغربي" /></div>
                       <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 pr-6">رقم الهاتف للاتصال بك</label><input type="tel" className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold text-left text-white focus:border-emerald-500 outline-none transition-all" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06 XX XX XX XX" /></div>
                       <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 pr-6">المدينة</label>
                        <div className="relative">
                          <select className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold text-white appearance-none focus:border-emerald-500 outline-none transition-all" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                            <option value="" className="bg-[#050a18]">إختر مدينة التوصيل</option>
                            {MOROCCAN_CITIES.map(city => <option key={city} value={city} className="bg-[#050a18]">{city}</option>)}
                          </select>
                          <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                       </div>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-7 rounded-[2rem] font-black text-xl md:text-2xl premium-btn shadow-2xl shadow-emerald-500/30">تأكيد الطلب الآن</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-5xl w-full glass-morphism p-10 md:p-16 rounded-[4rem] space-y-12 overflow-y-auto max-h-[95vh] no-scrollbar border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black text-gradient">{isAddingProduct ? 'منتج جديد' : 'تعديل المنتج'}</h3>
              <button onClick={() => setEditingProduct(null)} className="p-4 bg-white/5 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-xl"><X size={28}/></button>
            </div>
            <form onSubmit={saveProduct} className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-4">عنوان المنتج</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black focus:border-emerald-500 outline-none transition-all" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-4">السعر بالدرهم</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black focus:border-emerald-500 outline-none transition-all" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 px-4">الصورة الرئيسية</label>
                  <div className="relative group aspect-video rounded-[3rem] overflow-hidden border-4 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 transition-all hover:border-emerald-500/40 bg-white/5 shadow-inner">
                    {editingProduct.thumbnail ? (
                      <>
                        <img src={editingProduct.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-2xl scale-110"><Camera size={24}/> تغيير</button>
                        </div>
                      </>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 text-slate-600 hover:text-emerald-500 transition-all">
                        <UploadCloud size={64}/>
                        <span className="font-black">ارفع صورة المنتج</span>
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleThumbnailUpload} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-4">وصف المنتج</label><textarea required className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] font-bold h-48 focus:border-emerald-500 outline-none transition-all leading-relaxed" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-xs font-black text-slate-500">صور إضافية</label>
                    <button type="button" onClick={() => galleryInputRef.current?.click()} className="text-emerald-500 flex items-center gap-2 font-black hover:scale-105 transition-all"><ImagePlus size={24}/> إضافة</button>
                    <input type="file" ref={galleryInputRef} hidden multiple accept="image/*" onChange={handleGalleryUpload} />
                  </div>
                  <div className="grid grid-cols-4 gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 min-h-[120px]">
                    {editingProduct.galleryImages?.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-2xl">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { const up = editingProduct.galleryImages?.filter((_, idx) => idx !== i); setEditingProduct({...editingProduct, galleryImages: up}) }} className="absolute inset-0 bg-rose-500/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><Trash2 size={24}/></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-500 text-black py-7 rounded-[2rem] font-black text-2xl premium-btn flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30"><Save size={32}/> {isAddingProduct ? 'إضافة للمتجر السحابي' : 'تحديث في كل الأجهزة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[4rem] space-y-10 border border-white/5 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Lock size={40}/></div>
              <h3 className="text-4xl font-black text-gradient">دخول الإدارة</h3>
              <p className="text-slate-500 font-bold">كلمة المرور هي: <code className="text-emerald-500">admin</code></p>
            </div>
            <div className="space-y-6">
              <input type="password" className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-bold focus:border-emerald-500 outline-none text-center text-2xl tracking-widest" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
              <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : setLoginError(true)} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl premium-btn">دخول آمن</button>
              <button onClick={() => setShowLoginModal(false)} className="w-full text-slate-500 font-bold hover:text-white transition-all">العودة للمتجر</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[4rem] text-center space-y-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 animate-fade-in-up">
            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl shadow-emerald-500/50 animate-bounce"><Check size={64} /></div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-gradient">تم إرسال طلبك!</h3>
              <p className="text-slate-400 font-medium text-xl leading-relaxed">شكراً لثقتك بمتجرنا. سيتصل بك فريقنا قريباً لتأكيد طلبك وتحديد موعد التوصيل.</p>
            </div>
            <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10">
              <p className="text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">رقم طلبك</p>
              <p className="text-4xl font-black text-emerald-500 tracking-widest">{activeOrder.orderId}</p>
            </div>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl premium-btn shadow-lg">العودة للتسوق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
