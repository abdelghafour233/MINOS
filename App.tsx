
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

const compressImage = (base64Str: string, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

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
  const [isTestingConn, setIsTestingConn] = useState(false);

  const [dbConfig, setDbConfig] = useState({
    url: localStorage.getItem('sb_url') || '',
    key: localStorage.getItem('sb_key') || ''
  });
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

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
    setTimeout(() => setToast({ message: '', type: '' }), 5000);
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) setView('admin');
    else setShowLoginModal(true);
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
        const { data: dbProducts, error: pError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!pError && dbProducts) {
          setProducts(dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS);
        } else if (pError) {
          setProducts(MOCK_PRODUCTS);
        }
        
        const { data: dbOrders, error: oError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!oError && dbOrders) setOrders(dbOrders);
      } catch (err) {
        setProducts(MOCK_PRODUCTS);
      }
    } else {
      const savedProducts = localStorage.getItem('ecom_products_v7');
      const savedOrders = localStorage.getItem('ecom_orders_v7');
      setProducts(savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS);
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
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) throw error;
      showToast('تم الاتصال بنجاح وقاعدة البيانات مستعدة');
    } catch (err: any) {
      showToast(`فشل المزامنة: ${err.message}`, 'error');
    } finally {
      setIsTestingConn(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSyncing(true);
    
    // توحيد مسميات الأعمدة لتناسب قاعدة البيانات
    const productToSave: any = {
        id: editingProduct.id,
        title: editingProduct.title,
        price: editingProduct.price,
        thumbnail: editingProduct.thumbnail,
        description: editingProduct.description,
        category: editingProduct.category,
        galleryImages: editingProduct.galleryImages || [],
        stockStatus: editingProduct.stockStatus || 'available'
    };
    
    try {
      if (supabase) {
        const { error } = await supabase.from('products').upsert(productToSave, { onConflict: 'id' });
        if (error) throw error;
        showToast('تمت مزامنة المنتج بنجاح');
      } else {
        const updatedProducts = isAddingProduct 
          ? [productToSave, ...products]
          : products.map(p => p.id === productToSave.id ? productToSave : p);
        localStorage.setItem('ecom_products_v7', JSON.stringify(updatedProducts));
        showToast('تم الحفظ محلياً');
      }
      await fetchData(); 
      setEditingProduct(null);
      setIsAddingProduct(false);
    } catch (err: any) {
      showToast(`فشل المزامنة: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateOrderStatus = async (orderId: any, status: string) => {
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) { showToast('خطأ في تحديث الحالة', 'error'); return; }
      fetchData();
      showToast('تم تحديث الحالة بنجاح');
    }
  };

  const confirmOrder = async () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !selectedProduct) {
      showToast('المرجو ملأ المعلومات المطلوبة', 'error'); return;
    }
    
    setIsSubmittingOrder(true);
    
    // إنشاء طلب متوافق مع بنية الجداول القياسية (Snake Case)
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderPayload: any = {
      order_id: orderId,
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
        // محاولة الإرسال للسحابة
        const { error: sbError } = await supabase.from('orders').insert([orderPayload]);
        
        if (sbError) {
          console.error("Supabase Error:", sbError);
          // تحليل الخطأ لتقديم نصيحة للمستخدم
          let hint = sbError.message;
          if (sbError.code === '42P01') hint = "جدول 'orders' غير موجود. اذهب للإعدادات لرؤية كود SQL.";
          if (sbError.code === '42703') hint = "أعمدة الجدول غير متطابقة. تأكد من وجود: order_id, full_name, phone_number.";
          if (sbError.code === 'PGRST116') hint = "خطأ في صلاحيات الوصول (RLS). تأكد من تفعيل الإدخال للعامة.";
          
          throw new Error(hint);
        }
        showToast('تم إرسال الطلب للسحابة بنجاح');
      } else {
        // حفظ محلي
        const localOrders = JSON.parse(localStorage.getItem('ecom_orders_v7') || '[]');
        localStorage.setItem('ecom_orders_v7', JSON.stringify([orderPayload, ...localOrders]));
        showToast('تم الحفظ محلياً');
      }
      
      // تحويل البيانات لشكل العرض
      setActiveOrder({
        orderId: orderPayload.order_id,
        productId: orderPayload.product_id,
        productTitle: orderPayload.product_title,
        productPrice: orderPayload.product_price,
        customer: customerInfo,
        orderDate: new Date().toLocaleDateString('ar-MA'),
        status: 'pending'
      } as any);
      
      setIsCheckingOut(false);
      setSelectedProduct(null);
      setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
      fetchData();
    } catch (err: any) {
      console.error("Order Sync Failed:", err);
      showToast(`فشل الربط: ${err.message}`, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const saveDbConfig = () => {
    if (!dbConfig.url || !dbConfig.key) {
      showToast('يرجى ملأ الخانتين معاً', 'error');
      return;
    }
    localStorage.setItem('sb_url', dbConfig.url.trim());
    localStorage.setItem('sb_key', dbConfig.key.trim());
    showToast('تم حفظ الإعدادات، جارِ الربط...');
    setTimeout(() => window.location.reload(), 800);
  };

  useEffect(() => {
    if (selectedProduct) {
      setActiveGalleryImage(selectedProduct.thumbnail);
    }
  }, [selectedProduct]);

  // كود SQL لإنشاء الجداول
  const sqlSetup = `
-- 1. جدول المنتجات
CREATE TABLE products (
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
CREATE TABLE orders (
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

-- 3. تفعيل الوصول للعامة (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON products FOR SELECT USING (true);
CREATE POLICY "Admin Access" ON products FOR ALL USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Access" ON orders FOR ALL USING (true);
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
        <div className="hidden md:flex flex-col items-center gap-2 mb-10">
          <div className={`w-12 h-12 ${supabase ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'} rounded-2xl flex items-center justify-center text-black shadow-lg transition-all duration-700`}>
            {supabase ? <Radio size={24} className="animate-pulse" /> : <Database size={24} />}
          </div>
        </div>
        <div className="flex md:flex-col gap-6 md:gap-10 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><ShoppingBag size={22} /></button>
          <button onClick={handleAdminClick} className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><LayoutDashboard size={22} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            {/* واجهة المتجر */}
            <section className="relative h-[400px] md:h-[550px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/60 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-[11px] font-black uppercase tracking-widest"><Sparkles size={14} /> متجر بريمة الموثوق</span>
                <h1 className="text-3xl md:text-7xl font-black leading-tight text-gradient">تسوق الأفضل <br/> لراحتك اليومية</h1>
                <p className="text-slate-400 text-sm md:text-xl font-medium max-w-md leading-relaxed">توصيل سريع لكافة المدن المغربية والدفع عند الاستلام.</p>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black text-lg md:text-xl premium-btn shadow-2xl flex items-center gap-3">ابدأ التسوق <ArrowRight size={24} /></button>
              </div>
            </section>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all border text-xs md:text-sm ${activeTab === cat ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl' : 'glass-morphism text-slate-400 border-white/5'}`}>{cat}</button>
              ))}
            </div>

            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
              {(activeTab === 'الكل' ? products : products.filter(p => p.category === activeTab)).map((product, idx) => (
                <div key={product.id} className="group product-card-glow glass-morphism rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col animate-fade-in-up border border-white/5" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="aspect-[4/5] overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  <div className="p-4 md:p-8 space-y-3 md:space-y-4 flex-1 flex flex-col">
                    <h3 className="font-black text-[13px] md:text-lg line-clamp-1">{product.title}</h3>
                    <div className="mt-auto flex flex-col gap-3 md:gap-4">
                      <p className="text-xl md:text-3xl font-black text-emerald-500">{product.price} <span className="text-[10px] md:text-sm">DH</span></p>
                      <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 hover:bg-emerald-500 hover:text-black py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10 font-black text-xs md:text-base">اطلب الآن</button>
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
                <h2 className="text-3xl md:text-5xl font-black text-gradient">إدارة المتجر</h2>
                <p className="text-slate-500 font-bold mt-2">إدارة المنتجات، الطلبيات، وإعدادات السحابة.</p>
              </div>
              <div className="flex gap-2 glass-morphism p-2 rounded-2xl md:rounded-[2rem] border border-white/5">
                <button onClick={() => setAdminTab('products')} className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>المنتجات</button>
                <button onClick={() => setAdminTab('orders')} className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الطلبيات</button>
                <button onClick={() => setAdminTab('settings')} className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الربط السحابي</button>
              </div>
            </header>

            {adminTab === 'products' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl md:text-2xl font-black flex items-center gap-3">المنتجات النشطة</h3>
                   <button onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة', galleryImages: [] }); setIsAddingProduct(true); }} className="bg-emerald-500 text-black px-4 md:px-6 py-2 md:py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs md:text-sm"><PlusCircle size={18} /> إضافة منتج</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {products.map(p => (
                    <div key={p.id} className="glass-morphism rounded-[2rem] overflow-hidden flex flex-col border border-white/5 group shadow-xl">
                      <div className="aspect-square overflow-hidden relative"><img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-emerald-500 border border-emerald-500/30">{p.price} DH</div></div>
                      <div className="p-6 space-y-4">
                         <div className="space-y-1"><h4 className="font-black text-base line-clamp-1">{p.title}</h4><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{p.category}</p></div>
                         <div className="flex flex-col gap-2"><button onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }} className="w-full bg-emerald-500/10 text-emerald-500 py-3 rounded-xl flex items-center justify-center gap-2 font-black border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all text-xs"><Edit3 size={14} /> تعديل</button>
                            <button onClick={async () => { if(window.confirm('حذف من السحابة؟')) { if (supabase) await supabase.from('products').delete().eq('id', p.id); fetchData(); showToast('تم الحذف بنجاح'); } }} className="w-full bg-rose-500/10 text-rose-500 py-3 rounded-xl flex items-center justify-center gap-2 font-black border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-xs"><Trash2 size={14} /> حذف</button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-8">
                 <div className="glass-morphism p-8 md:p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                   <div className="flex items-center gap-4"><div className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl"><Database size={28}/></div><h3 className="text-2xl font-black">إعدادات Supabase</h3></div>
                   <div className="space-y-6">
                      <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-2 uppercase">رابط المشروع (URL)</label><input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold focus:border-emerald-500 outline-none" value={dbConfig.url} onChange={e => setDbConfig({...dbConfig, url: e.target.value})} placeholder="Project URL" /></div>
                      <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-2 uppercase">مفتاح الوصول (API Key)</label><input type="password" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold focus:border-emerald-500 outline-none" value={dbConfig.key} onChange={e => setDbConfig({...dbConfig, key: e.target.value})} placeholder="Anon Key" /></div>
                      <div className="flex gap-4 pt-4"><button onClick={saveDbConfig} className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-black text-lg premium-btn">حفظ وربط المتجر</button><button onClick={testConnection} disabled={isTestingConn} className="px-6 bg-white/5 border border-white/10 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-white/10 transition-all">{isTestingConn ? <RefreshCw size={20} className="animate-spin"/> : <Zap size={20} className="text-emerald-500"/>} اختبار الاتصال</button></div>
                   </div>
                 </div>

                 {/* تعليمات SQL */}
                 <div className="glass-morphism p-8 md:p-10 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-emerald-500 font-black"><Terminal size={24}/> <h3>إعداد الجداول في Supabase (هام للربط)</h3></div>
                      <button onClick={() => { navigator.clipboard.writeText(sqlSetup); showToast('تم نسخ الكود بنجاح'); }} className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-xs"><CopyCheck size={16}/> نسخ الكود</button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-bold">لإصلاح مشاكل الربط، انسخ الكود أعلاه ثم اذهب إلى **SQL Editor** في حسابك على Supabase والصقه هناك ثم اضغط **Run**. سيقوم هذا بإنشاء الجداول اللازمة وضبط الصلاحيات تلقائياً.</p>
                    <div className="bg-black/40 p-4 rounded-xl overflow-x-auto"><pre className="text-[10px] text-emerald-400 font-mono leading-relaxed">{sqlSetup}</pre></div>
                 </div>
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? <div className="text-center py-20 text-slate-500 font-bold">لا يوجد طلبيات مسجلة حالياً</div> : orders.map(order => (
                  <div key={order.orderId || (order as any).id} className="glass-morphism p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5">
                    <div className="flex items-center gap-6"><div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"><User size={24} /></div><div><h4 className="font-black text-xl mb-1">{(order as any).full_name || order.customer?.fullName || 'زبون'}</h4><p className="text-slate-500 font-bold">{(order as any).phone_number || order.customer?.phoneNumber || 'بدون هاتف'} - {(order as any).city || order.customer?.city || ''}</p></div></div>
                    <div className="flex flex-col md:items-end gap-3"><p className="text-xs text-slate-500 font-black">المنتج: <span className="text-emerald-500">{(order as any).product_title || order.productTitle}</span></p><div className="flex items-center gap-2">
                         <button onClick={() => updateOrderStatus((order as any).id, 'pending')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${order.status === 'pending' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>قيد المعالجة</button>
                         <button onClick={() => updateOrderStatus((order as any).id, 'shipped')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${order.status === 'shipped' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>تم الشحن</button>
                         <button onClick={() => updateOrderStatus((order as any).id, 'delivered')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${order.status === 'delivered' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>تم التوصيل</button>
                       </div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* المودالات (نفس السابق مع تحسينات طفيفة) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-4xl w-full glass-morphism p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] space-y-8 overflow-y-auto max-h-[95vh] no-scrollbar border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-6"><div className="flex items-center gap-4"><div className="p-3 bg-emerald-500 text-black rounded-xl"><Edit3 size={20}/></div><h3 className="text-xl md:text-3xl font-black text-gradient">تعديل المنتج</h3></div><button onClick={() => setEditingProduct(null)} className="p-3 bg-white/5 rounded-full hover:bg-rose-500 transition-all"><X size={20}/></button></div>
            <form onSubmit={saveProduct} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6"><div className="space-y-1"><label className="text-[10px] font-black text-slate-500 px-2 uppercase">إسم المنتج</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-black focus:border-emerald-500 outline-none" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 px-2 uppercase">السعر (DH)</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-black focus:border-emerald-500 outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 px-2 uppercase">الصورة الرئيسية</label><div className="aspect-video rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden bg-white/5 group">{isProcessingImage ? <div className="flex flex-col items-center gap-4 text-emerald-500"><RefreshCw className="animate-spin" size={30}/><span className="font-black text-[10px]">معالجة...</span></div> : editingProduct.thumbnail ? <img src={editingProduct.thumbnail} className="absolute inset-0 w-full h-full object-cover" /> : <UploadCloud size={40} className="text-slate-600"/>}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if(file) { setIsProcessingImage(true); const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = async () => { const compressed = await compressImage(reader.result as string); setEditingProduct({...editingProduct, thumbnail: compressed}); setIsProcessingImage(false); }; } }} />
                  </div></div></div>
              <div className="space-y-6 flex flex-col"><div className="space-y-1"><label className="text-[10px] font-black text-slate-500 px-2 uppercase">الوصف</label><textarea required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold flex-1 h-24 focus:border-emerald-500 outline-none" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
                <button type="submit" disabled={isProcessingImage || isSyncing} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 premium-btn">{isSyncing ? <RefreshCw className="animate-spin" size={24}/> : <Save size={24}/>}{isSyncing ? 'جاري الحفظ...' : 'حفظ ومزامنة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* عرض المنتج للزبون - الصورة مصغرة والوصف منسق */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[92vh] md:rounded-[2.5rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5 shadow-2xl">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-2 md:p-2 bg-black/40 rounded-full text-white hover:bg-emerald-500 hover:text-black transition-all shadow-2xl"><X size={18} /></button>
             
             {/* قسم الصورة - مصغر بشكل كبير لترك مساحة للبيانات */}
             <div className="w-full md:w-[38%] h-[22vh] md:h-auto bg-slate-950/40 relative flex items-center justify-center overflow-hidden p-2 md:p-6">
                <div className="relative w-full h-full max-h-[180px] md:max-h-[350px] flex items-center justify-center">
                  <img src={activeGalleryImage} className="max-w-full max-h-full object-contain transition-all duration-700 drop-shadow-2xl" />
                </div>
                {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0) && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar py-2">
                    <button onClick={() => setActiveGalleryImage(selectedProduct.thumbnail)} className={`w-7 h-7 md:w-10 md:h-10 rounded-lg border transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === selectedProduct.thumbnail ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white/10 opacity-60'}`}><img src={selectedProduct.thumbnail} className="w-full h-full object-cover" /></button>
                    {selectedProduct.galleryImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveGalleryImage(img)} className={`w-7 h-7 md:w-10 md:h-10 rounded-lg border transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === img ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white/10 opacity-60'}`}><img src={img} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}
             </div>

             {/* قسم المحتوى - منمق وأكثر كثافة */}
             <div className="w-full md:w-[62%] p-5 md:p-10 flex flex-col h-[70vh] md:h-auto overflow-y-auto custom-scroll border-t md:border-t-0 md:border-r border-white/5">
                {!isCheckingOut ? (
                  <div className="space-y-4 md:space-y-6 flex flex-col h-full">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black uppercase tracking-wider">{selectedProduct.category}</span></div>
                      <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <div className="max-h-24 md:max-h-32 overflow-y-auto custom-scroll pr-1">
                         <p className="text-slate-400 text-[10px] md:text-[13px] font-medium leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                      </div>
                    </div>
                    <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">السعر النهائي</p><div className="flex items-baseline gap-2"><p className="text-2xl md:text-4xl font-black text-emerald-500">{selectedProduct.price} <span className="text-xs md:text-sm">DH</span></p></div></div>
                        <div className="text-right space-y-0.5"><p className="flex items-center gap-1 justify-end text-emerald-500 font-black text-[9px] md:text-xs"><Truck size={12} /> توصيل مجاني</p></div>
                      </div>
                      <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-lg animate-buy-pulse premium-btn shadow-xl shadow-emerald-500/20 shrink-0">أطلب الآن - الدفع عند الاستلام</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 md:space-y-6 flex flex-col h-full">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all"><ChevronLeft size={18} /></button><div><h3 className="text-base md:text-xl font-black text-gradient">بيانات التوصيل</h3><p className="text-[9px] md:text-[11px] text-slate-500 font-bold">يرجى ملء المعلومات لإرسال طلبك للسحابة</p></div></div>
                     <div className="space-y-3 flex-grow">
                       <div className="space-y-1"><label className="text-[8px] md:text-[10px] font-black text-slate-500 px-1 uppercase tracking-wider">الإسم الكامل</label><input type="text" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg font-bold focus:border-emerald-500 outline-none transition-all text-xs" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="الاسم الشخصي والعائلي" /></div>
                       <div className="space-y-1"><label className="text-[8px] md:text-[10px] font-black text-slate-500 px-1 uppercase tracking-wider">رقم الهاتف</label><input type="tel" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg font-bold text-left focus:border-emerald-500 outline-none transition-all text-xs" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06 XX XX XX XX" /></div>
                       <div className="space-y-1"><label className="text-[8px] md:text-[10px] font-black text-slate-500 px-1 uppercase tracking-wider">المدينة</label><select className="w-full bg-white/5 border border-white/10 p-3 rounded-lg font-bold appearance-none focus:border-emerald-500 outline-none transition-all text-xs" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}><option value="" className="bg-[#050a18]">اختر مدينتك</option>{MOROCCAN_CITIES.map(c => <option key={c} value={c} className="bg-[#050a18]">{c}</option>)}</select></div>
                     </div>
                     <button onClick={confirmOrder} disabled={isSubmittingOrder} className="w-full bg-emerald-500 text-black py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base premium-btn shadow-2xl shrink-0 mt-3 flex items-center justify-center gap-2">{isSubmittingOrder ? <RefreshCw className="animate-spin" size={18}/> : 'تأكيد عملية الشراء'}</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* مودال نجاح الطلب */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 md:p-12 rounded-[3.5rem] md:rounded-[4rem] text-center space-y-8 animate-fade-in-up border border-emerald-500/20 shadow-2xl">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={54} /></div>
            <h3 className="text-3xl md:text-4xl font-black text-gradient">تم تسجيل طلبك!</h3>
            <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed">شكراً لطلبك من متجر بريمة. سنتصل بك قريباً لتأكيد الطلب وترتيب عملية التوصيل.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg">العودة للمتجر</button>
          </div>
        </div>
      )}

      {/* مودال الدخول للإدارة */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 md:p-12 rounded-[3rem] space-y-8 border border-white/5 text-center shadow-2xl"><div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"><Lock size={40}/></div><div><h3 className="text-3xl font-black text-gradient">دخول آمن</h3><p className="text-slate-500 font-bold mt-2">يرجى إدخال رمز الإدارة.</p></div>
            <input type="password" placeholder="الرمز السري" className="w-full bg-white/5 border border-white/10 p-5 rounded-xl font-bold focus:border-emerald-500 outline-none text-center text-2xl tracking-[0.5rem]" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('الرمز خاطئ', 'error')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg premium-btn">تأكيد</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
