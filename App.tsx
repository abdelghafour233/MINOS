
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
  Wifi, WifiOff, Radio, SlidersHorizontal, MoreVertical
} from 'lucide-react';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const adminPassword = 'admin'; 

// دالة ضغط الصور لضمان قبولها في السحابة
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
      setProducts(savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS);
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
        const { error } = await supabase
          .from('products')
          .upsert(productToSave, { onConflict: 'id' });

        if (error) throw error;
        showToast('تمت المزامنة والحفظ في السحابة بنجاح');
      } else {
        const updatedProducts = isAddingProduct 
          ? [productToSave, ...products]
          : products.map(p => p.id === productToSave.id ? productToSave : p);
        localStorage.setItem('ecom_products_v7', JSON.stringify(updatedProducts));
        showToast('تم الحفظ محلياً (لا يوجد ربط سحابي)');
      }
      
      await fetchData(); 
      setEditingProduct(null);
      setIsAddingProduct(false);
    } catch (err: any) {
      showToast(`خطأ في المزامنة: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateOrderStatus = async (orderId: any, status: string) => {
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) { showToast('خطأ في تحديث الحالة سحابياً', 'error'); return; }
      fetchData();
      showToast('تم تحديث حالة الطلب في السحابة');
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
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    try {
      if (supabase) {
        const { error } = await supabase.from('orders').insert([newOrder]);
        if (error) throw error;
      }
      setActiveOrder(newOrder as any);
      setIsCheckingOut(false);
      setSelectedProduct(null);
      setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
      fetchData();
    } catch (e) {
      showToast('خطأ في إرسال الطلب للسحابة، جرب لاحقاً', 'error');
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
          /* واجهة المتجر الرئيسية */
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <section className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/60 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black uppercase tracking-widest"><Sparkles size={14} /> متجر بريمة الموثوق</span>
                <h1 className="text-4xl md:text-8xl font-black leading-tight text-gradient">تسوق الأفضل <br/> لراحتك اليومية</h1>
                <p className="text-slate-400 text-sm md:text-2xl font-medium max-w-md leading-relaxed">توصيل سريع لكافة المدن المغربية والدفع عند الاستلام.</p>
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
          /* واجهة التحكم بالإدارة */
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gradient">الإدارة والسحابة</h2>
                <p className="text-slate-500 font-bold mt-2">إدارة المنتجات، الطلبيات، ومزامنة البيانات.</p>
              </div>
              <div className="flex gap-2 glass-morphism p-2 rounded-[2rem] border border-white/5">
                <button onClick={() => setAdminTab('products')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>المنتجات</button>
                <button onClick={() => setAdminTab('orders')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الطلبيات</button>
                <button onClick={() => setAdminTab('settings')} className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400'}`}>الربط السحابي</button>
              </div>
            </header>

            {adminTab === 'products' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <h3 className="text-2xl font-black flex items-center gap-3">المنتجات النشطة</h3>
                   <button 
                      onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة', galleryImages: [] }); setIsAddingProduct(true); }}
                      className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <PlusCircle size={20} /> إضافة منتج
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map(p => (
                    <div key={p.id} className="glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 group shadow-xl">
                      <div className="aspect-square overflow-hidden relative">
                         <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-emerald-500 border border-emerald-500/30">
                            {p.price} DH
                         </div>
                      </div>
                      <div className="p-6 space-y-6">
                         <div className="space-y-1">
                           <h4 className="font-black text-lg line-clamp-1">{p.title}</h4>
                           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{p.category}</p>
                         </div>
                         
                         <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                            <button 
                              onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }}
                              className="w-full bg-emerald-500/10 text-emerald-500 py-3 rounded-xl flex items-center justify-center gap-2 font-black border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all"
                            >
                              <Edit3 size={16} /> تعديل البيانات
                            </button>
                            <button 
                              onClick={async () => { 
                                if(window.confirm('سيتم حذف المنتج نهائياً من قاعدة البيانات السحابية، هل أنت متأكد؟')) {
                                  if (supabase) {
                                    await supabase.from('products').delete().eq('id', p.id);
                                  } else {
                                    const updated = products.filter(pr => pr.id !== p.id);
                                    localStorage.setItem('ecom_products_v7', JSON.stringify(updated));
                                  }
                                  fetchData();
                                  showToast('تم حذف المنتج بنجاح من السحابة');
                                }
                              }}
                              className="w-full bg-rose-500/10 text-rose-500 py-3 rounded-xl flex items-center justify-center gap-2 font-black border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <Trash2 size={16} /> حذف المنتج
                            </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <div className="max-w-3xl mx-auto glass-morphism p-10 rounded-[3rem] border border-white/5 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl"><Database size={28}/></div>
                    <h3 className="text-2xl font-black">إعدادات الربط مع Supabase</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-2 uppercase">رابط المشروع (URL)</label><input type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none" value={dbConfig.url} onChange={e => setDbConfig({...dbConfig, url: e.target.value})} placeholder="Project URL" /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-slate-500 px-2 uppercase">مفتاح الوصول (API Key)</label><input type="password" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-emerald-500 outline-none" value={dbConfig.key} onChange={e => setDbConfig({...dbConfig, key: e.target.value})} placeholder="Anon Key" /></div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={saveDbConfig} className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg premium-btn shadow-lg shadow-emerald-500/20">حفظ وربط المتجر</button>
                      <button onClick={testConnection} disabled={isTestingConn} className="px-8 bg-white/5 border border-white/10 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
                        {isTestingConn ? <RefreshCw size={20} className="animate-spin"/> : <Zap size={20} className="text-emerald-500"/>} اختبار الاتصال
                      </button>
                    </div>
                 </div>
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.orderId} className="glass-morphism p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><User size={28} /></div>
                      <div>
                        <h4 className="font-black text-2xl mb-1">{order.customer.fullName}</h4>
                        <p className="text-slate-500 font-bold">{order.customer.phoneNumber} - {order.customer.city}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                       <p className="text-xs text-slate-500 font-black">المنتج: <span className="text-emerald-500">{order.productTitle}</span></p>
                       <div className="flex items-center gap-2">
                         <button onClick={() => updateOrderStatus(order.id, 'pending')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${order.status === 'pending' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>قيد المعالجة</button>
                         <button onClick={() => updateOrderStatus(order.id, 'shipped')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${order.status === 'shipped' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>تم الشحن</button>
                         <button onClick={() => updateOrderStatus(order.id, 'delivered')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${order.status === 'delivered' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}>تم التوصيل</button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* مودال التعديل والمزامنة */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-5xl w-full glass-morphism p-8 md:p-16 rounded-[4rem] space-y-10 overflow-y-auto max-h-[95vh] no-scrollbar border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-emerald-500 text-black rounded-2xl"><Edit3 size={28}/></div>
                 <h3 className="text-2xl md:text-4xl font-black text-gradient">تعديل ومزامنة المنتج</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-4 bg-white/5 rounded-full hover:bg-rose-500 transition-all"><X size={28}/></button>
            </div>
            
            <form onSubmit={saveProduct} className="grid md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 px-2">إسم المنتج</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black focus:border-emerald-500 outline-none" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 px-2">السعر (DH)</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-black focus:border-emerald-500 outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 px-2">الصورة الرئيسية للمنتج</label>
                  <div className="aspect-video rounded-[2.5rem] border-4 border-dashed border-white/5 flex flex-col items-center justify-center relative overflow-hidden bg-white/5 group">
                      {isProcessingImage ? (
                        <div className="flex flex-col items-center gap-4 text-emerald-500"><RefreshCw className="animate-spin" size={40}/><span className="font-black text-xs">جاري الضغط والمعالجة...</span></div>
                      ) : editingProduct.thumbnail ? (
                        <img src={editingProduct.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-600"><UploadCloud size={60}/><p className="font-black">رفع صورة</p></div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                        <p className="text-white font-black bg-emerald-500 px-6 py-2 rounded-full">تغيير الصورة</p>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if(file) {
                            setIsProcessingImage(true);
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = async () => {
                              const compressed = await compressImage(reader.result as string);
                              setEditingProduct({...editingProduct, thumbnail: compressed});
                              setIsProcessingImage(false);
                            };
                          }
                      }} />
                  </div>
                </div>
              </div>

              <div className="space-y-8 flex flex-col">
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 px-2">الوصف والمميزات</label><textarea required className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] font-bold flex-1 h-32 focus:border-emerald-500 outline-none" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
                
                <div className="space-y-2">
                   <div className="flex justify-between px-2 mb-2"><label className="text-xs font-black text-slate-500">معرض الصور</label><button type="button" onClick={() => galleryInputRef.current?.click()} className="text-emerald-500 text-[10px] font-black border border-emerald-500/20 px-4 py-1.5 rounded-full hover:bg-emerald-500 hover:text-black transition-all">+ إضافة</button></div>
                   <input type="file" ref={galleryInputRef} hidden multiple accept="image/*" onChange={async (e) => {
                      const files = e.target.files;
                      if(files) {
                        setIsProcessingImage(true);
                        const newImages: string[] = [];
                        for(let i=0; i<files.length; i++) {
                          const reader = new FileReader();
                          reader.readAsDataURL(files[i]);
                          await new Promise(resolve => {
                            reader.onload = async () => { 
                              const compressed = await compressImage(reader.result as string, 600, 0.5); 
                              newImages.push(compressed); 
                              resolve(null); 
                            };
                          });
                        }
                        setEditingProduct({...editingProduct, galleryImages: [...(editingProduct.galleryImages || []), ...newImages]});
                        setIsProcessingImage(false);
                      }
                   }} />
                   <div className="grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-3xl min-h-[80px] border border-white/5">
                      {editingProduct.galleryImages?.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                           <img src={img} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setEditingProduct({...editingProduct, galleryImages: editingProduct.galleryImages?.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    disabled={isProcessingImage || isSyncing} 
                    className="flex-1 bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 premium-btn"
                  >
                    {isSyncing ? <RefreshCw className="animate-spin" size={24}/> : <Save size={24}/>}
                    {isSyncing ? 'جاري المزامنة مع السحابة...' : 'حفظ ومزامنة'}
                  </button>
                  <button 
                    type="button"
                    onClick={async () => {
                      if(window.confirm('حذف هذا المنتج نهائياً من السحابة؟')) {
                        if(supabase) await supabase.from('products').delete().eq('id', editingProduct.id);
                        fetchData();
                        setEditingProduct(null);
                        showToast('تم الحذف من السحابة');
                      }
                    }}
                    className="px-8 bg-rose-500/10 text-rose-500 rounded-[2rem] font-black border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={24}/>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال الدخول */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[4rem] space-y-10 border border-white/5 text-center shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"><Lock size={48}/></div>
            <div>
              <h3 className="text-4xl font-black text-gradient">دخول آمن</h3>
              <p className="text-slate-500 font-bold mt-2">يرجى إدخال رمز الإدارة للوصول.</p>
            </div>
            <input type="password" placeholder="الرمز السري" className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] font-bold focus:border-emerald-500 outline-none text-center text-3xl tracking-[1rem]" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('رمز الدخول غير صحيح', 'error')} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl premium-btn">تأكيد الدخول</button>
          </div>
        </div>
      )}

      {/* عرض تفاصيل المنتج للزبون - تحسين الصوره والزر */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-6xl max-h-[98vh] md:rounded-[3.5rem] glass-morphism overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5 shadow-2xl">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-2 md:p-3 bg-black/40 rounded-full text-white hover:bg-emerald-500 hover:text-black transition-all shadow-2xl"><X size={20} /></button>
             
             {/* قسم الصورة - إصلاح حجم المنتج ليكون كاملاً داخل الاطار */}
             <div className="w-full md:w-1/2 h-[35vh] md:h-auto bg-slate-950 relative flex items-center justify-center overflow-hidden">
                <img src={activeGalleryImage} className="w-full h-full object-contain transition-all duration-500" />
                {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0) && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar py-2">
                    <button onClick={() => setActiveGalleryImage(selectedProduct.thumbnail)} className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === selectedProduct.thumbnail ? 'border-emerald-500 scale-105 shadow-lg' : 'border-white/10 opacity-60'}`}><img src={selectedProduct.thumbnail} className="w-full h-full object-cover" /></button>
                    {selectedProduct.galleryImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveGalleryImage(img)} className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border-2 transition-all flex-shrink-0 overflow-hidden ${activeGalleryImage === img ? 'border-emerald-500 scale-105 shadow-lg' : 'border-white/10 opacity-60'}`}><img src={img} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}
             </div>

             {/* قسم المحتوى - ضمان بقاء الزر داخل الاطار عبر السكرول الداخلي */}
             <div className="w-full md:w-1/2 p-5 md:p-12 lg:p-16 flex flex-col h-[60vh] md:h-auto overflow-y-auto custom-scroll">
                {!isCheckingOut ? (
                  <div className="space-y-5 md:space-y-8 flex flex-col flex-grow">
                    <div className="space-y-3">
                      <span className="bg-emerald-500 text-black px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block">{selectedProduct.category}</span>
                      <h2 className="text-xl md:text-5xl font-black text-gradient leading-tight">{selectedProduct.title}</h2>
                      <div className="max-h-32 md:max-h-none overflow-y-auto md:overflow-visible custom-scroll">
                         <p className="text-slate-400 text-xs md:text-lg font-medium leading-relaxed">{selectedProduct.description}</p>
                      </div>
                    </div>
                    <div className="p-5 md:p-8 glass-morphism rounded-2xl md:rounded-[3rem] flex items-center justify-between border border-white/5 mt-auto">
                      <div><p className="text-[10px] md:text-xs font-black text-slate-500">السعر</p><p className="text-2xl md:text-5xl font-black text-emerald-500">{selectedProduct.price} <span className="text-sm md:text-xl">DH</span></p></div>
                      <div className="text-right"><p className="flex items-center gap-1 md:gap-2 justify-end text-emerald-500 font-black text-xs md:text-lg"><Truck size={18} /> توصيل مجاني</p></div>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-lg md:text-2xl animate-buy-pulse premium-btn shadow-xl shadow-emerald-500/20 shrink-0">أطلب الآن - الدفع عند الاستلام</button>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-10 flex flex-col flex-grow">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-2 md:p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><ChevronLeft size={24} /></button><h3 className="text-xl md:text-4xl font-black text-gradient">بيانات التوصيل</h3></div>
                     <div className="space-y-4 flex-grow overflow-y-auto no-scrollbar">
                       <input type="text" className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all text-sm" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="الإسم الكامل للزبون" />
                       <input type="tel" className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-left focus:border-emerald-500 outline-none transition-all text-sm" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="رقم الهاتف للاتصال" />
                       <select className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold appearance-none focus:border-emerald-500 outline-none transition-all text-sm" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                            <option value="" className="bg-[#050a18]">اختر المدينة</option>
                            {MOROCCAN_CITIES.map(c => <option key={c} value={c} className="bg-[#050a18]">{c}</option>)}
                       </select>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl premium-btn shadow-2xl shrink-0">تأكيد الطلب</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* مودال نجاح الطلب */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-12 rounded-[4rem] text-center space-y-10 animate-fade-in-up border border-emerald-500/20 shadow-2xl">
            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={64} /></div>
            <h3 className="text-4xl font-black text-gradient">تم تسجيل طلبك!</h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً لطلبك من متجر بريمة. سنتصل بك قريباً لتأكيد الطلب وترتيب عملية التوصيل.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xl">العودة للمتجر</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
