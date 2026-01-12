
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, ShoppingCart, Star, Truck, MapPin, Phone, User, Check, 
  ArrowRight, Package, Sparkles, ShieldCheck, ChevronLeft, Bell, 
  Settings, Edit3, Trash2, LayoutDashboard, Save, Lock, LogOut, 
  PlusCircle, Eye, EyeOff, Sun, Moon, Image as ImageIcon, 
  Share2, Copy, Facebook, Link as LinkIcon, Camera, 
  Activity, Info, CheckCircle2, AlertTriangle, Plus,
  ChevronDown, Search, ArrowUpRight, Zap, Award, UploadCloud, Download,
  ImagePlus, HelpCircle, RefreshCcw, Globe, Database, Server, Link, Code, RefreshCw,
  Wifi, WifiOff, Radio, SlidersHorizontal, MoreVertical, CopyCheck, Terminal
} from 'lucide-react';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const adminPassword = 'admin'; 

// البيانات التي زودتنا بها
const DEFAULT_SB_URL = 'https://xulrpjjucjwoctgkpqli.supabase.co';
const DEFAULT_SB_KEY = 'sb_publishable_opXVbx0wGCR7vCxGamuPBw_JpNs5aSe';

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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ fullName: '', phoneNumber: '', city: '', address: '' });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);
  
  const [dbConfig, setDbConfig] = useState({
    url: localStorage.getItem('sb_url') || DEFAULT_SB_URL,
    key: localStorage.getItem('sb_key') || DEFAULT_SB_KEY
  });
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 5000);
  };

  useEffect(() => {
    if (dbConfig.url && dbConfig.key) {
      try {
        const client = createClient(dbConfig.url.trim(), dbConfig.key.trim());
        setSupabase(client);
      } catch (e) {
        console.error("Supabase Init Error", e);
      }
    }
  }, [dbConfig.url, dbConfig.key]);

  const fetchData = async () => {
    if (supabase) {
      try {
        // جلب المنتجات
        const { data: dbProducts, error: pError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!pError && dbProducts) {
          setProducts(dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
        
        // جلب الطلبات
        const { data: dbOrders, error: oError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!oError && dbOrders) {
          // تحويل البيانات من snake_case للعرض
          const formattedOrders = dbOrders.map((o: any) => ({
            orderId: o.order_id,
            productTitle: o.product_title,
            productPrice: o.product_price,
            customer: {
              fullName: o.full_name,
              phoneNumber: o.phone_number,
              city: o.city,
              address: o.address
            },
            status: o.status,
            orderDate: new Date(o.created_at).toLocaleDateString('ar-MA')
          }));
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error("Fetch error", err);
      }
    } else {
      setProducts(MOCK_PRODUCTS);
    }
  };

  useEffect(() => {
    fetchData();
    if (sessionStorage.getItem('admin_auth') === 'true') setIsAdminAuthenticated(true);
  }, [supabase]);

  const confirmOrder = async () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !selectedProduct) {
      showToast('المرجو ملأ المعلومات المطلوبة', 'error'); return;
    }
    
    setIsSubmittingOrder(true);
    
    // إعداد البيانات بصيغة متوافقة مع قواعد البيانات القياسية
    const orderPayload = {
      order_id: 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      product_id: selectedProduct.id,
      product_title: selectedProduct.title,
      product_price: selectedProduct.price,
      full_name: customerInfo.fullName,
      phone_number: customerInfo.phoneNumber,
      city: customerInfo.city,
      address: customerInfo.address || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    try {
      if (supabase) {
        const { error } = await supabase.from('orders').insert([orderPayload]);
        if (error) throw error;
        showToast('تم إرسال طلبك بنجاح للسحابة');
      } else {
        const localOrders = JSON.parse(localStorage.getItem('ecom_orders_v9') || '[]');
        localStorage.setItem('ecom_orders_v9', JSON.stringify([orderPayload, ...localOrders]));
        showToast('تم الحفظ محلياً (لا يوجد اتصال سحابي)');
      }
      
      setActiveOrder({
        orderId: orderPayload.order_id,
        productTitle: orderPayload.product_title,
        productPrice: orderPayload.product_price,
        customer: customerInfo,
        status: 'pending',
        orderDate: new Date().toLocaleDateString('ar-MA')
      } as any);
      
      setIsCheckingOut(false);
      setSelectedProduct(null);
      setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
      fetchData();
    } catch (err: any) {
      console.error("Sync Error:", err);
      showToast(`فشل المزامنة: ${err.message}`, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSyncing(true);
    
    try {
      if (supabase) {
        const { error } = await supabase.from('products').upsert(editingProduct);
        if (error) throw error;
        showToast('تم حفظ المنتج في السحابة');
      }
      fetchData();
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveDbConfig = () => {
    localStorage.setItem('sb_url', dbConfig.url);
    localStorage.setItem('sb_key', dbConfig.key);
    showToast('تم تحديث الإعدادات');
    window.location.reload();
  };

  const sqlSetup = `
-- 1. جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  thumbnail TEXT,
  description TEXT,
  category TEXT,
  "galleryImages" JSONB DEFAULT '[]',
  "stockStatus" TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  order_id TEXT UNIQUE,
  product_id TEXT,
  product_title TEXT,
  product_price NUMERIC,
  full_name TEXT,
  phone_number TEXT,
  city TEXT,
  address TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. تفعيل الأذونات للعامة (مهم جداً للربط)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read" ON orders FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON products FOR SELECT USING (true);
`.trim();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 pb-20 md:pb-0`}>
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-black text-sm max-w-[90vw] text-center`}>
          {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          <span>{toast.message}</span>
        </div>
      )}

      {/* شريط التنقل */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-t-0 md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10">
        <div className="flex md:flex-col gap-6 md:gap-10 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><ShoppingBag size={22} /></button>
          <button onClick={() => isAdminAuthenticated ? setView('admin') : setShowLoginModal(true)} className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><LayoutDashboard size={22} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            {/* واجهة العرض الرئيسية */}
            <section className="relative h-[350px] md:h-[500px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/70 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-[11px] font-black uppercase tracking-widest"><Sparkles size={14} /> متجر بريمة الموثوق</span>
                <h1 className="text-3xl md:text-6xl font-black leading-tight text-gradient">أفضل المنتجات <br/> بجودة عالمية</h1>
                <p className="text-slate-400 text-sm md:text-xl font-medium max-w-md">توصيل سريع لباب المنزل في كافة المدن المغربية والدفع عند الاستلام.</p>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-lg premium-btn flex items-center gap-3">ابدأ التسوق <ArrowRight size={22} /></button>
              </div>
            </section>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black transition-all border text-xs md:text-sm flex-shrink-0 ${activeTab === cat ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl' : 'glass-morphism text-slate-400 border-white/5'}`}>{cat}</button>
              ))}
            </div>

            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {(activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map((product, idx) => (
                <div key={product.id} className="group glass-morphism rounded-[2rem] overflow-hidden flex flex-col animate-fade-in-up border border-white/5">
                  <div className="aspect-[4/5] overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4 flex-1 flex flex-col">
                    <h3 className="font-black text-[13px] md:text-lg line-clamp-1">{product.title}</h3>
                    <div className="mt-auto flex flex-col gap-3">
                      <p className="text-xl md:text-3xl font-black text-emerald-500">{product.price} <span className="text-[10px] md:text-sm">DH</span></p>
                      <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 hover:bg-emerald-500 hover:text-black py-3 rounded-xl border border-white/10 font-black text-xs md:text-sm transition-all">اطلب الآن</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* واجهة الإدارة */
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-gradient">لوحة الإدارة</h2>
                <p className="text-slate-500 font-bold mt-2">مراقبة الطلبيات وضبط إعدادات السحابة.</p>
              </div>
              <div className="flex gap-2 glass-morphism p-2 rounded-2xl border border-white/5">
                <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>الطلبيات</button>
                <button onClick={() => setAdminTab('settings')} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>الإعدادات</button>
              </div>
            </header>

            {adminTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="glass-morphism p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-8">
                  <div className="flex items-center gap-4"><div className="p-4 bg-emerald-500 text-black rounded-2xl"><Database size={28}/></div><h3 className="text-2xl font-black">إعدادات Supabase</h3></div>
                  <div className="space-y-6">
                     <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase px-2">رابط المشروع</label><input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={dbConfig.url} onChange={e => setDbConfig({...dbConfig, url: e.target.value})} /></div>
                     <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase px-2">مفتاح الوصول</label><input type="password" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={dbConfig.key} onChange={e => setDbConfig({...dbConfig, key: e.target.value})} /></div>
                     <button onClick={saveDbConfig} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg premium-btn">تحديث البيانات</button>
                  </div>
                </div>

                <div className="glass-morphism p-8 md:p-12 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-500 font-black"><Terminal size={24}/> <h3>خطوات إعداد الجداول (هام جداً)</h3></div>
                    <button onClick={() => { navigator.clipboard.writeText(sqlSetup); showToast('تم النسخ'); }} className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"><Copy size={16}/> نسخ الكود</button>
                  </div>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">لضمان عمل الربط، اذهب إلى لوحة تحكم Supabase > SQL Editor، الصق الكود واضغط Run. سيقوم بإنشاء الجداول وإعطاء صلاحيات الإدخال للمتجر.</p>
                  <pre className="bg-black/40 p-4 rounded-xl text-[10px] text-emerald-400 font-mono overflow-x-auto">{sqlSetup}</pre>
                </div>
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? <div className="py-20 text-center text-slate-500 font-bold">لا توجد طلبيات مسجلة حالياً</div> : orders.map((order, i) => (
                  <div key={i} className="glass-morphism p-6 md:p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"><User size={24}/></div>
                       <div>
                          <h4 className="font-black text-xl">{order.customer.fullName}</h4>
                          <p className="text-slate-500 font-bold text-xs">{order.customer.phoneNumber} - {order.customer.city}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-2">المنتج: <span className="text-emerald-500">{order.productTitle}</span></p>
                       <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black">{order.status === 'pending' ? 'بانتظار التأكيد' : 'مكتمل'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* نافذة تفاصيل المنتج */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[92vh] md:rounded-[2.5rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-2 bg-black/40 rounded-full text-white"><X size={18} /></button>
             
             {/* قسم الصورة المصغر */}
             <div className="w-full md:w-[35%] h-[20vh] md:h-auto bg-slate-950/40 relative flex items-center justify-center p-4">
                <img src={activeGalleryImage} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
             </div>

             {/* قسم المحتوى المنسق */}
             <div className="w-full md:w-[65%] p-5 md:p-10 flex flex-col h-[70vh] md:h-auto overflow-y-auto border-t md:border-t-0 md:border-r border-white/5">
                {!isCheckingOut ? (
                  <div className="space-y-4 md:space-y-6 flex flex-col h-full">
                    <div className="space-y-2">
                      <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{selectedProduct.category}</span>
                      <h2 className="text-xl md:text-3xl font-black text-gradient">{selectedProduct.title}</h2>
                      <div className="max-h-24 md:max-h-32 overflow-y-auto custom-scroll pr-1">
                         <p className="text-slate-400 text-[11px] md:text-[14px] leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                      </div>
                    </div>
                    <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1">السعر النهائي</p><p className="text-2xl md:text-4xl font-black text-emerald-500">{selectedProduct.price} DH</p></div>
                        <p className="text-emerald-500 font-black text-[10px] flex items-center gap-1"><Truck size={12}/> توصيل مجاني</p>
                      </div>
                      <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg animate-buy-pulse">أطلب الآن - الدفع عند الاستلام</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 flex flex-col h-full">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-1.5 bg-white/5 rounded-lg text-slate-400"><ChevronLeft size={18}/></button><h3 className="text-lg font-black text-gradient">بيانات التوصيل</h3></div>
                     <div className="space-y-3 flex-grow">
                       <div className="space-y-1"><label className="text-[9px] font-black text-slate-500">الإسم الكامل</label><input type="text" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg font-bold text-xs" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="الاسم الكامل" /></div>
                       <div className="space-y-1"><label className="text-[9px] font-black text-slate-500">رقم الهاتف</label><input type="tel" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg font-bold text-xs text-left" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06XXXXXXXX" /></div>
                       <div className="space-y-1"><label className="text-[9px] font-black text-slate-500">المدينة</label><select className="w-full bg-white/5 border border-white/10 p-3 rounded-lg font-bold text-xs" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}><option value="">اختر مدينتك</option>{MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                     </div>
                     <button onClick={confirmOrder} disabled={isSubmittingOrder} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-sm premium-btn flex items-center justify-center gap-2">{isSubmittingOrder ? <RefreshCw className="animate-spin" size={18}/> : 'تأكيد الطلب'}</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* مودال النجاح */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 md:p-12 rounded-[3rem] text-center space-y-8 animate-fade-in-up border border-emerald-500/20 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black animate-bounce"><Check size={54} /></div>
            <h3 className="text-3xl font-black text-gradient">تم تسجيل طلبك!</h3>
            <p className="text-slate-400 font-medium text-base">شكراً لثقتك بمتجرنا. سنتصل بك قريباً لتأكيد الطلب وترتيب عملية التوصيل.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg">العودة للمتجر</button>
          </div>
        </div>
      )}

      {/* مودال الدخول للإدارة */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 rounded-[2.5rem] space-y-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"><Lock size={40}/></div>
            <div><h3 className="text-2xl font-black text-gradient">دخول الإدارة</h3></div>
            <input type="password" placeholder="الرمز السري" className="w-full bg-white/5 border border-white/10 p-5 rounded-xl font-bold text-center text-2xl tracking-[0.5rem]" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('الرمز خاطئ', 'error')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg premium-btn">دخول</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
