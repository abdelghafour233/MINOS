
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
  Wifi, WifiOff, Radio, SlidersHorizontal, MoreVertical, CopyCheck, Terminal,
  Home
} from 'lucide-react';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES, MOROCCAN_CITIES, STORE_CONFIG } from './constants';

const adminPassword = 'admin'; 

// إعدادات افتراضية (سيتم استبدالها بما هو في المتصفح إذا توفر)
const DEFAULT_SB_URL = 'https://xulrpjjucjwoctgkpqli.supabase.co';
const DEFAULT_SB_KEY = 'sb_publishable_opXVbx0wGCR7vCxGamuPBw_JpNs5aSe';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'settings'>('orders');
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('الكل');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | ''}>({message: '', type: ''});
  
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
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
        const { data: dbProducts, error: pError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!pError && dbProducts) {
          setProducts(dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
        
        const { data: dbOrders, error: oError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!oError && dbOrders) {
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
    }
  };

  useEffect(() => {
    fetchData();
    if (sessionStorage.getItem('admin_auth') === 'true') setIsAdminAuthenticated(true);
  }, [supabase]);

  // دالة إرسال الطلب المصححة
  const confirmOrder = async () => {
    // التحقق من الحقول الإجبارية
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city) {
      showToast('المرجو ملأ الإسم ورقم الهاتف والمدينة', 'error'); 
      return;
    }

    if (customerInfo.phoneNumber.length < 10) {
      showToast('رقم الهاتف غير صحيح', 'error');
      return;
    }
    
    // إعداد البيانات بصيغة snake_case لتناسب قاعدة البيانات
    const orderPayload = {
      order_id: 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      product_id: selectedProduct?.id,
      product_title: selectedProduct?.title,
      product_price: selectedProduct?.price,
      full_name: customerInfo.fullName,
      phone_number: customerInfo.phoneNumber,
      city: customerInfo.city,
      address: customerInfo.address || 'لم يتم تحديد العنوان بدقة',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    try {
      if (supabase) {
        const { error } = await supabase.from('orders').insert([orderPayload]);
        if (error) throw error;
        
        showToast('تم إرسال الطلب بنجاح');
        
        // إظهار مودال النجاح
        setActiveOrder({
          orderId: orderPayload.order_id,
          productTitle: orderPayload.product_title,
          productPrice: orderPayload.product_price,
          customer: customerInfo,
          status: 'pending',
          orderDate: new Date().toLocaleDateString('ar-MA')
        } as any);
        
        // تصفير البيانات
        setIsCheckingOut(false);
        setSelectedProduct(null);
        setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
        fetchData();
      } else {
        showToast('خطأ: لا يوجد اتصال بقاعدة البيانات', 'error');
      }
    } catch (err: any) {
      console.error("Order Error:", err);
      showToast('حدث خطأ أثناء إرسال الطلب، المرجو المحاولة لاحقاً', 'error');
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (supabase) {
        const { error } = await supabase.from('products').upsert(editingProduct);
        if (error) throw error;
        showToast('تم حفظ المنتج');
      }
      fetchData();
      setEditingProduct(null);
    } catch (err: any) {
      showToast('فشل الحفظ', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('هل تريد حذف المنتج؟')) return;
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        showToast('تم الحذف');
        fetchData();
      }
    }
  };

  const sqlSetup = `-- سكريبت إعداد الجداول (انسخه في SQL Editor بـ Supabase)
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

-- تفعيل الأمان
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admin all" ON products FOR ALL USING (true);
CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage orders" ON orders FOR ALL USING (true);`.trim();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050a18] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500 pb-20 md:pb-0`}>
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-black text-sm`}>
          {toast.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}
          <span>{toast.message}</span>
        </div>
      )}

      {/* التنقل */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 h-[72px] md:h-screen glass-morphism z-[100] border-t md:border-l border-white/5 flex md:flex-col items-center justify-around md:py-10">
        <div className="flex md:flex-col gap-8 w-full justify-around md:justify-start">
          <button onClick={() => setView('shop')} className={`p-3 rounded-xl transition-all ${view === 'shop' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><ShoppingBag size={22} /></button>
          <button onClick={() => isAdminAuthenticated ? setView('admin') : setShowLoginModal(true)} className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500'}`}><LayoutDashboard size={22} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 text-slate-500">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
        </div>
      </nav>

      <main className="md:pr-24 min-h-screen">
        {view === 'shop' ? (
          <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
            <header className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden flex items-center px-6 md:px-20 animate-fade-in-up shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/70 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-20 max-w-xl space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest"><Sparkles size={14} /> بضاعة مغربية مختارة</span>
                <h1 className="text-3xl md:text-5xl font-black text-gradient leading-tight">فخامة التسوق <br/> بين يديك</h1>
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior:'smooth'})} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-lg premium-btn flex items-center gap-2">تسوق الآن <ArrowRight size={22} /></button>
              </div>
            </header>

            <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pt-6">
              {products.map((product) => (
                <div key={product.id} className="group glass-morphism rounded-[2rem] overflow-hidden flex flex-col border border-white/5 product-card-glow">
                  <div className="aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img src={product.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <h3 className="font-black text-sm md:text-base line-clamp-1">{product.title}</h3>
                    <p className="text-xl md:text-2xl font-black text-emerald-500">{product.price} DH</p>
                    <button onClick={() => setSelectedProduct(product)} className="w-full bg-white/5 py-3 rounded-xl border border-white/10 font-black text-xs hover:bg-emerald-500 hover:text-black transition-all">اطلب الآن</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* واجهة الإدارة */
          <div className="p-4 md:p-12 max-w-6xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-black text-gradient">إدارة المتجر</h2>
              <div className="flex gap-2 glass-morphism p-2 rounded-2xl border border-white/5">
                <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl text-xs font-black ${adminTab === 'orders' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>الطلبات</button>
                <button onClick={() => setAdminTab('products')} className={`px-5 py-2.5 rounded-xl text-xs font-black ${adminTab === 'products' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>المنتجات</button>
                <button onClick={() => setAdminTab('settings')} className={`px-5 py-2.5 rounded-xl text-xs font-black ${adminTab === 'settings' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}>السحابة</button>
              </div>
            </header>

            {adminTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? <div className="py-20 text-center text-slate-500 font-bold">لا توجد طلبيات</div> : orders.map((order, i) => (
                  <div key={i} className="glass-morphism p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center font-black">#</div>
                      <div>
                        <h4 className="font-black text-lg md:text-xl">{order.customer.fullName}</h4>
                        <p className="text-sm text-slate-500 font-bold">{order.customer.phoneNumber} - {order.customer.city}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{order.customer.address}</p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-xs font-black text-emerald-500 mb-2">{order.productTitle}</p>
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">طلب جديد</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'products' && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <button onClick={() => { setEditingProduct({ id: 'P-' + Date.now(), title: '', price: 0, category: 'إلكترونيات', description: '', thumbnail: '', stockStatus: 'available', rating: 5, reviewsCount: 0, shippingTime: '24 ساعة' }); }} className="aspect-square glass-morphism rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                    <Plus size={40}/>
                    <span className="font-black text-xs mt-2">إضافة منتج</span>
                 </button>
                 {products.map(p => (
                   <div key={p.id} className="glass-morphism rounded-[2rem] overflow-hidden border border-white/5 group">
                      <img src={p.thumbnail} className="aspect-square object-cover" />
                      <div className="p-4 space-y-3">
                        <h4 className="font-black text-xs truncate">{p.title}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="flex-1 bg-white/5 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-500 hover:text-black">تعديل</button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            )}

            {adminTab === 'settings' && (
              <div className="max-w-3xl mx-auto glass-morphism p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                <div className="flex items-center gap-4 text-emerald-500"><Terminal size={32}/><h3 className="text-2xl font-black">إعدادات قاعدة البيانات</h3></div>
                <div className="space-y-4 text-slate-400 font-bold text-sm leading-relaxed">
                   <p>لضمان عمل المتجر بسلاسة، يرجى نسخ الكود التالي وتنفيذه في SQL Editor الخاص بـ Supabase:</p>
                   <pre className="bg-black/60 p-5 rounded-2xl text-[10px] text-emerald-400 font-mono overflow-x-auto border border-emerald-500/10">{sqlSetup}</pre>
                   <button onClick={() => { navigator.clipboard.writeText(sqlSetup); showToast('تم النسخ'); }} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-base flex items-center justify-center gap-2"><Copy size={20}/> نسخ كود الإعداد</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* نافذة تفاصيل المنتج والطلب */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl" onClick={() => !isCheckingOut && setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-3xl glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-white/5 shadow-2xl">
             <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className="absolute top-4 right-4 z-[210] p-2 bg-black/40 rounded-full text-white hover:bg-rose-500"><X size={18} /></button>
             
             {/* صورة المنتج */}
             <div className="w-full md:w-[40%] h-[20vh] md:h-auto bg-slate-950/40 flex items-center justify-center p-8">
                <img src={selectedProduct.thumbnail} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
             </div>

             {/* محتوى المنتج أو الفورم */}
             <div className="w-full md:w-[60%] p-6 md:p-10 flex flex-col border-t md:border-t-0 md:border-r border-white/5 overflow-y-auto max-h-[70vh] md:max-h-full no-scrollbar">
                {!isCheckingOut ? (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-3">
                      <h2 className="text-xl md:text-3xl font-black text-gradient">{selectedProduct.title}</h2>
                      <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                    </div>
                    <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <p className="text-3xl md:text-4xl font-black text-emerald-500">{selectedProduct.price} DH</p>
                        <p className="text-emerald-500 font-black text-[10px] flex items-center gap-1"><Truck size={14}/> توصيل مجاني</p>
                      </div>
                      <button onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-2xl font-black text-lg animate-buy-pulse">أطلب الآن - الدفع عند الاستلام</button>
                    </div>
                  </div>
                ) : (
                  /* فورم الطلب المصحح */
                  <div className="space-y-5 flex flex-col h-full">
                     <div className="flex items-center gap-3"><button onClick={() => setIsCheckingOut(false)} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><ChevronLeft size={20}/></button><h3 className="text-xl font-black text-gradient">إتمام الطلب</h3></div>
                     <div className="space-y-4 flex-1">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><User size={12}/> الإسم الكامل *</label>
                         <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-sm" value={customerInfo.fullName} onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})} placeholder="الاسم الكامل للزبون" />
                       </div>
                       
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Phone size={12}/> رقم الهاتف *</label>
                         <input type="tel" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-sm text-left" value={customerInfo.phoneNumber} onChange={e => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} placeholder="06 XX XX XX XX" />
                       </div>

                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><MapPin size={12}/> المدينة *</label>
                         <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-sm" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}>
                           <option value="">اختر مدينتك</option>
                           {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                       </div>

                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Home size={12}/> العنوان الكامل (اختياري)</label>
                         <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-sm" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="الحي، رقم المنزل، الشارع..." />
                       </div>
                     </div>
                     <button onClick={confirmOrder} className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-2xl font-black text-lg premium-btn mt-4 shadow-xl">تأكيد الطلب</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* مودال النجاح الفائق */}
      {activeOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-md w-full glass-morphism p-10 md:p-12 rounded-[3rem] text-center space-y-8 animate-fade-in-up border border-emerald-500/20 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-2xl animate-bounce"><Check size={54} /></div>
            <h3 className="text-3xl font-black text-gradient">تم تسجيل طلبك!</h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">شكراً لثقتك. لقد استلمنا طلبك وسيقوم فريقنا بالاتصال بك في أقرب وقت لتأكيد عملية الشحن.</p>
            <button onClick={() => setActiveOrder(null)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-transform">حسناً، فهمت</button>
          </div>
        </div>
      )}

      {/* مودال دخول الإدارة */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#050a18]/95 backdrop-blur-xl">
          <div className="max-w-xs w-full glass-morphism p-10 rounded-[3rem] space-y-8 text-center border border-white/5">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"><Lock size={40}/></div>
            <input type="password" placeholder="الرمز السري" className="w-full bg-white/5 border border-white/10 p-5 rounded-xl font-bold text-center text-3xl tracking-widest" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && passwordInput === adminPassword && (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin'))} />
            <button onClick={() => passwordInput === adminPassword ? (setIsAdminAuthenticated(true), sessionStorage.setItem('admin_auth', 'true'), setShowLoginModal(false), setView('admin')) : showToast('الرمز خاطئ', 'error')} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-lg">دخول</button>
          </div>
        </div>
      )}

      {/* مودال تحرير منتج */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#050a18]/95 backdrop-blur-xl">
          <form onSubmit={saveProduct} className="max-w-2xl w-full glass-morphism p-8 md:p-12 rounded-[3rem] space-y-6 overflow-y-auto max-h-[90vh] border border-white/5">
            <h3 className="text-2xl font-black text-gradient">إدارة المنتج</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">اسم المنتج</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-xs" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">السعر (DH)</label><input type="number" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-xs" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">رابط الصورة</label><input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-xs" value={editingProduct.thumbnail} onChange={e => setEditingProduct({...editingProduct, thumbnail: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">الفئة</label>
                <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-xs" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}>
                  {CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">وصف المنتج</label><textarea required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-xs h-32" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-black text-lg">حفظ المنتج</button>
              <button type="button" onClick={() => setEditingProduct(null)} className="px-8 bg-white/5 rounded-xl font-black text-slate-400">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
