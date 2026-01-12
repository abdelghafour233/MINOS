
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Share2, Copy, Facebook, Link as LinkIcon, Camera, 
  Activity, Info, CheckCircle2, AlertTriangle, Plus,
  ChevronDown, Search, ArrowUpRight, Zap, Award, UploadCloud, Download,
  ImagePlus, HelpCircle, RefreshCcw, Globe, Database, Server, Link, Code, RefreshCw
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
  const [isTestingConn, setIsTestingConn] = useState(false);

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

  const handleAdminClick = () => {
    if (isAdminAuthenticated) setView('admin');
    else setShowLoginModal(true);
  };

  useEffect(() => {
    if (selectedProduct) setActiveGalleryImage(selectedProduct.thumbnail);
  }, [selectedProduct]);

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

  const fetchData = async () => {
    if (supabase) {
      const { data: dbProducts, error: pError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!pError && dbProducts && dbProducts.length > 0) setProducts(dbProducts);
      else if (!pError) setProducts(MOCK_PRODUCTS);
      
      const { data: dbOrders, error: oError } = await supabase.from('orders').select('*').order('id', { ascending: false });
      if (!oError && dbOrders) setOrders(dbOrders);
    } else {
      const savedProducts = localStorage.getItem('ecom_products_v7');
      setProducts(savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS);
      const savedOrders = localStorage.getItem('ecom_orders_v7');
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
    }
  };

  useEffect(() => {
    fetchData();
    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);
  }, [supabase]);

  const testConnection = async () => {
    if (!supabase) { showToast('يرجى إدخال البيانات أولاً', 'error'); return; }
    setIsTestingConn(true);
    try {
      const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      showToast('تم الاتصال بنجاح! الموقع جاهز للمزامنة');
    } catch (err: any) {
      showToast('فشل الاتصال: تأكد من كود SQL ومن المفاتيح', 'error');
    } finally {
      setIsTestingConn(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const productToSave = {
      ...editingProduct,
      created_at: editingProduct.id.includes('Date') ? new Date().toISOString() : undefined
    };

    if (supabase) {
      const { error } = await supabase.from('products').upsert(productToSave);
      if (error) { showToast('خطأ في المزامنة السحابية', 'error'); return; }
    }
    
    await fetchData(); // Refresh data from source
    setEditingProduct(null);
    setIsAddingProduct(false);
    showToast('تم الحفظ والمزامنة الفورية!');
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) { showToast('خطأ في التحديث', 'error'); return; }
      fetchData();
      showToast('تم تحديث حالة الطلب');
    }
  };

  const confirmOrder = async () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !selectedProduct) {
      showToast('المرجو ملأ المعلومات المطلوبة', 'error'); return;
    }
    const newOrder = {
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
      if (error) { showToast('خطأ في إرسال الطلب للسحابة', 'error'); return; }
    }
    const updated = [newOrder, ...orders];
    setOrders(updated as any);
    localStorage.setItem('ecom_orders_v7', JSON.stringify(updated));
    setActiveOrder(newOrder as any);
    setIsCheckingOut(false);
    setSelectedProduct(null);
    setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
  };

  const saveDbConfig = () => {
    localStorage.setItem('sb_url', dbConfig.url);
    localStorage.setItem('sb_key', dbConfig.key);
    showToast('تم الحفظ، جارِ إعادة التشغيل...');
    setTimeout(() => window.location.reload(), 1000);
  };

  const sqlCode = `-- كود إنشاء الجداول (ضعه في SQL Editor بـ Supabase)

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail TEXT,
  galleryImages TEXT[],
  price NUMERIC,
  originalPrice NUMERIC,
  description TEXT,
  category TEXT,
  stockStatus TEXT,
  rating NUMERIC,
  reviewsCount NUMERIC,
  shippingTime TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  orderId TEXT,
  productId TEXT,
  productTitle TEXT,
  productPrice NUMERIC,
  customer JSONB,
  orderDate TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-bold text-sm`}>
          {toast.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle2 size={16}/>}
          {toast.message}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-t-0 md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10 pb-2">
        <div className="hidden md:flex flex-col items-center gap-2 mb-10">
          <div className={`w-12 h-12 ${supabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} rounded-2xl flex items-center justify-center text-black shadow-lg`}>
            {supabase ? <Server size={24} /> : <Database size={24} />}
          </div>
        </div>
        <div className="flex md:flex-col gap-6 md:gap-10 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><ShoppingBag size={22} /></button>
          <button onClick={handleAdminClick} className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><LayoutDashboard size={22} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen pb-24 md:pb-0">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <section className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/60 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black uppercase tracking-widest"><Sparkles size={14} /> متجر بريمة الموثوق</span>
                <h1 className="text-4xl md:text-8xl font-black leading-tight text-gradient">تسوق الأفضل <br/> بتقنية سحابية</h1>
                <p className="text-slate-400 text-sm md:text-2xl font-medium max-w-md leading-relaxed">متجرك الآن مربوط بقاعدة بيانات عالمية. غير الأثمنة والصور من أي مكان وتظهر للجميع فوراً.</p>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black text-xl premium-btn shadow-2xl shadow-emerald-500/20 flex items-center gap-3">ابدأ التسوق <ArrowRight size={24} /></button>
              </div>
            </section>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-4 rounded-2xl font-black transition-all border ${activeTab === cat ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl' : 'glass-morphism text-slate-400 border-white/5'}`}>{cat}</button>
              ))}
            </div>

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
                      <p className="text-2xl md:text-4xl font-black text-emerald-500">{product.price} <span className="text-xs">DH</span></p>
                      <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 hover:bg-emerald-500 hover:text-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10 font-black">اطلب الآن</button>
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
                <h2 className="text-4xl md:text-5xl font-black text-gradient">مركز التحكم السحابي</h2>
                <div className={`flex items-center gap-2 text-[11px] font-black mt-3 px-5 py-2 rounded-full w-fit ${supabase ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                  <span className={`w-2 h-2 rounded-full ${supabase ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                  {supabase ? 'مزامنة مباشرة مفعلة' : 'بانتظار الربط السحابي (وضع الأوفلاين)'}
                </div>
              </div>
              <div className="flex gap-2 glass-morphism p-2 rounded-[2rem] border border-white/5">
                <button onClick={() => setAdminTab('orders')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الطلبيات ({orders.length})</button>
                <button onClick={() => setAdminTab('products')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>المنتجات ({products.length})</button>
                <button onClick={() => setAdminTab('settings')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>إعدادات الربط</button>
              </div>
            </header>

            {adminTab === 'settings' && (
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                <div className="glass-morphism p-10 rounded-[3rem] border border-white/5 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl"><Database size={28}/></div>
                      <h3 className="text-2xl font-black">بيانات الاتصال</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-2">Project URL</label><input type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none" value={dbConfig.url} onChange={e => setDbConfig({...dbConfig, url: e.target.value})} placeholder="https://xyz.supabase.co" /></div>
                      <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-2">Anon Key</label><input type="password" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none" value={dbConfig.key} onChange={e => setDbConfig({...dbConfig, key: e.target.value})} placeholder="المفتاح السري" /></div>
                      <div className="flex gap-4">
                        <button onClick={saveDbConfig} className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn shadow-lg">حفظ البيانات</button>
                        <button onClick={testConnection} disabled={isTestingConn} className="px-8 bg-white/5 border border-white/10 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-white/10 transition-all">{isTestingConn ? <RefreshCw size={20} className="animate-spin"/> : <Zap size={20} className="text-emerald-500"/>} اختبار الاتصال</button>
                      </div>
                   </div>
                </div>

                <div className="glass-morphism p-10 rounded-[3rem] border border-white/5 flex flex-col">
                   <div className="flex items-center gap-4 mb-6"><div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Code size={28}/></div><h3 className="text-2xl font-black">مساعد SQL</h3></div>
                   <pre className="flex-1 bg-black/40 p-6 rounded-[2rem] text-[10px] text-emerald-500 font-mono overflow-auto border border-emerald-500/20 custom-scroll text-ltr">{sqlCode}</pre>
                   <button onClick={() => { navigator.clipboard.writeText(sqlCode); showToast('تم نسخ الكود! ضعه في Supabase'); }} className="mt-4 flex items-center justify-center gap-2 text-emerald-500 font-black text-sm hover:scale-105 transition-all"><Copy size={16}/> نسخ الكود لإنشاء الجداول</button>
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
                  <span className="font-black">إضافة منتج للسحابة</span>
                </button>
                {products.map(p => (
                  <div key={p.id} className="glass-morphism rounded-[2.5rem] overflow-hidden group relative border border-white/5">
                    <img src={p.thumbnail} className="w-full h-full object-cover aspect-square" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                      <button onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }} className="p-4 bg-emerald-500 text-black rounded-2xl font-black shadow-xl"><Edit3 size={20} /></button>
                      <button onClick={async () => { 
                        if(window.confirm('هل تريد الحذف نهائياً من السحابة؟')) {
                          if (supabase) await supabase.from('products').delete().eq('id', p.id);
                          setProducts(products.filter(pr => pr.id !== p.id));
                          showToast('تم الحذف بنجاح');
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
                    <div className="flex flex-col md:items-end gap-3 text-right">
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">المنتج: <span className="text-emerald-500">{order.productTitle}</span></p>
                       <div className="flex items-center gap-2">
                         <button onClick={() => updateOrderStatus(order.id as any, 'pending')} className={`px-3 py-1 rounded-lg text-[10px] font-black ${order.status === 'pending' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>قيد المعالجة</button>
                         <button onClick={() => updateOrderStatus(order.id as any, 'shipped')} className={`px-3 py-1 rounded-lg text-[10px] font-black ${order.status === 'shipped' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>تم الشحن</button>
                         <button onClick={() => updateOrderStatus(order.id as any, 'delivered')} className={`px-3 py-1 rounded-lg text-[10px] font-black ${order.status === 'delivered' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>تم التوصيل</button>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-40 glass-morphism rounded-[3rem] space-y-6 border border-dashed border-white/5">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700"><ShoppingBag size={48}/></div>
                    <p className="text-slate-500 font-black text-2xl">بانتظار وصول أول طلبية سحابية...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product View Modal */}
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
                      <span className="bg-emerald-500 text-black px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedProduct.category}</span>
                      <h2 className="text-3xl md:text-6xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <p className="text-slate-400 text-sm md:text-xl font-medium leading-relaxed">{selectedProduct.description}</p>
                    </div>
                    <div className="p-10 glass-morphism rounded-[3rem] flex items-center justify-between border border-white/5 relative">
                      <div><p className="text-xs font-black text-slate-500">السعر الحالي</p><p className="text-5xl md:text-7xl font-black text-emerald-500">{selectedProduct.price} <span className="text-xl">DH</span></p></div>
                      <div className="text-right"><p className="flex items-center gap-2 justify-end text-emerald-500 font-black"><Truck size={22} /> توصيل مجاني</p></div>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-7 rounded-[2rem] font-black text-xl md:text-3xl animate-buy-pulse premium-btn shadow-2xl shadow-emerald-500/30">أطلب الآن - الدفع عند الاستلام</button>
                  </div>
                ) : (
                  <div className="space-y-10 my-auto">
                     <div className="flex items-center gap-4"><button onClick={() => setIsCheckingOut(false)} className="p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all"><ChevronLeft size={28} /></button><h3 className="text-3xl md:text-5xl font-black text-gradient">بيانات التوصيل</h3></div>
                     <div className="space-y-6">
                       <input type="text" className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold focus:border-emerald-500 outline-none transition-all" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="الإسم الكامل للزبون" />
                       <input type="tel" className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold text-left focus:border-emerald-500 outline-none transition-all" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="رقم الهاتف للاتصال" />
                       <select className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-bold appearance-none focus:border-emerald-500 outline-none transition-all" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                            <option value="" className="bg-[#050a18]">اختر المدينة</option>
                            {MOROCCAN_CITIES.map(c => <option key={c} value={c} className="bg-[#050a18]">{c}</option>)}
                       </select>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-7 rounded-[2rem] font-black text-xl premium-btn shadow-2xl">تأكيد الطلب الآن</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-5xl w-full glass-morphism p-10 md:p-16 rounded-[4rem] space-y-12 overflow-y-auto max-h-[95vh] no-scrollbar border border-white/5">
            <div className="flex justify-between items-center"><h3 className="text-4xl font-black text-gradient">تعديل المنتج السحابي</h3><button onClick={() => setEditingProduct(null)} className="p-4 bg-white/5 rounded-full"><X size={28}/></button></div>
            <form onSubmit={saveProduct} className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 px-2">إسم المنتج</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 px-2">السعر</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 px-2">الصورة الرئيسية</label>
                  <div className="aspect-video rounded-[3rem] border-4 border-dashed border-white/5 flex flex-col items-center justify-center relative overflow-hidden bg-white/5 group">
                      {editingProduct.thumbnail ? <img src={editingProduct.thumbnail} className="absolute inset-0 w-full h-full object-cover" /> : <UploadCloud size={60}/>}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><p className="text-white font-black">اضغط للتغيير</p></div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if(file) {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => setEditingProduct({...editingProduct, thumbnail: reader.result as string});
                          }
                      }} />
                  </div>
                </div>
              </div>
              <div className="space-y-8 flex flex-col">
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 px-2">وصف المنتج</label><textarea required className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] font-bold flex-1 h-32" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
                
                <div className="space-y-2">
                   <div className="flex justify-between px-2"><label className="text-xs font-black text-slate-500">معرض الصور (Gallery)</label><button type="button" onClick={() => galleryInputRef.current?.click()} className="text-emerald-500 text-xs font-black">+ إضافة صور</button></div>
                   <input type="file" ref={galleryInputRef} hidden multiple accept="image/*" onChange={async (e) => {
                      const files = e.target.files;
                      if(files) {
                        const newImages: string[] = [];
                        for(let i=0; i<files.length; i++) {
                          const reader = new FileReader();
                          reader.readAsDataURL(files[i]);
                          await new Promise(resolve => {
                            reader.onload = () => { newImages.push(reader.result as string); resolve(null); };
                          });
                        }
                        setEditingProduct({...editingProduct, galleryImages: [...(editingProduct.galleryImages || []), ...newImages]});
                      }
                   }} />
                   <div className="grid grid-cols-4 gap-2 bg-white/5 p-4 rounded-[2rem] min-h-[80px]">
                      {editingProduct.galleryImages?.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                           <img src={img} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setEditingProduct({...editingProduct, galleryImages: editingProduct.galleryImages?.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><Trash2 size={16}/></button>
                        </div>
                      ))}
                   </div>
                </div>

                <button type="submit" className="w-full bg-emerald-500 text-black py-7 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30"><Save size={32}/> حفظ ومزامنة فورية</button>
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
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Lock size={40}/></div>
              <h3 className="text-4xl font-black text-gradient">دخول الإدارة</h3>
            </div>
            <input type="password" className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-bold focus:border-emerald-500 outline-none text-center text-2xl tracking-widest" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('خطأ في الرمز', 'error')} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl premium-btn">دخول آمن</button>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[4rem] text-center space-y-10 animate-fade-in-up border border-emerald-500/20 shadow-2xl">
            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={64} /></div>
            <h3 className="text-4xl font-black text-gradient">تم تسجيل طلبك!</h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً لطلبك من متجر بريمة. تم تسجيل طلبك في قاعدة بياناتنا السحابية وسنتصل بك فوراً.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl">العودة للمتجر</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
