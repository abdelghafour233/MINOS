
import React, { useState, useEffect } from 'react';
import { 
  Search, X, ShoppingBag, ShoppingCart, Star, 
  Truck, MapPin, Phone, User, History, Check, 
  ArrowRight, Package, Sparkles,
  Zap, ShieldCheck, ChevronLeft, Bell, ArrowUpRight,
  Settings, Edit3, Trash2, LayoutDashboard, Save, Plus,
  Lock, LogOut, KeyRound, PlusCircle, PackagePlus,
  Eye, EyeOff, Sun, Moon
} from 'lucide-react';
import { StoreProduct, StoreOrder, CustomerInfo, Category } from './types';
import { MOCK_PRODUCTS, CATEGORIES } from './constants';

const ADMIN_PASSWORD = 'admin'; 

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'orders' | 'products'>('orders');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('الكل');
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [loginError, setLoginError] = useState(false);

  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  const STORAGE_KEY_PRODUCTS = 'ecom_products_v4';
  const STORAGE_KEY_ORDERS = 'ecom_orders_v4';

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') setIsAdminAuthenticated(true);

    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts([]); 
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
    }

    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    } else {
      setOrders([]);
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
        if (view === 'admin') setView('shop');
        else setView('admin');
    } else {
        setShowLoginModal(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setShowLoginModal(false);
      setView('admin');
      setLoginError(false);
      setPasswordInput('');
      setShowPassword(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setView('shop');
  };

  const updateStorage = (newProducts: StoreProduct[], newOrders: StoreOrder[]) => {
    setProducts(newProducts);
    setOrders(newOrders);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(newOrders));
  };

  const createNewProduct = () => {
    const newProd: StoreProduct = {
      id: 'p' + Date.now(),
      title: '',
      thumbnail: '',
      price: 0,
      description: '',
      category: 'أدوات منزلية',
      stockStatus: 'available',
      rating: 5,
      reviewsCount: 0,
      shippingTime: '24-48 ساعة'
    };
    setEditingProduct(newProd);
  };

  const saveProductChanges = () => {
    if (!editingProduct) return;
    if (!editingProduct.title || !editingProduct.price || !editingProduct.thumbnail) {
      alert("يرجى ملء الاسم والسعر ورابط الصورة على الأقل.");
      return;
    }
    
    const exists = products.find(p => p.id === editingProduct.id);
    let updated;
    if (exists) {
      updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    } else {
      updated = [...products, editingProduct];
    }
    
    updateStorage(updated, orders);
    setEditingProduct(null);
    alert("تم حفظ المنتج بنجاح!");
  };

  const confirmOrder = () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city) {
      alert("يرجى إكمال البيانات الأساسية.");
      return;
    }
    if (!selectedProduct) return;

    const newOrder: StoreOrder = {
      orderId: 'PREM-' + Math.random().toString(36).toUpperCase().substring(2, 8),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productPrice: selectedProduct.price,
      customer: { ...customerInfo },
      orderDate: new Date().toLocaleString('ar-MA'),
      status: 'pending'
    };

    const updatedOrders = [newOrder, ...orders];
    updateStorage(products, updatedOrders);
    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
    setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
  };

  const deleteOrder = (id: string) => {
    if(window.confirm("هل أنت متأكد من حذف هذه الطلبية؟")) {
      const updated = orders.filter(o => o.orderId !== id);
      updateStorage(products, updated);
    }
  };

  const deleteProduct = (id: string) => {
    if(window.confirm("حذف المنتج سيؤدي لإزالته من المتجر نهائياً. متابعة؟")) {
      const updated = products.filter(p => p.id !== id);
      updateStorage(updated, orders);
    }
  };

  const filteredProducts = activeTab === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeTab);

  // Dynamic Theme Classes
  const bgMain = theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50';
  const bgSidebar = theme === 'dark' ? 'bg-[#070b1d]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const borderLight = theme === 'dark' ? 'border-emerald-500/10' : 'border-slate-100';
  const shadowCard = theme === 'dark' ? 'shadow-2xl' : 'shadow-xl shadow-slate-200/50';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} flex font-['Tajawal'] overflow-hidden transition-colors duration-500`}>
      
      {/* Sidebar */}
      <aside className={`w-24 md:w-80 ${bgSidebar} border-l ${borderLight} flex flex-col h-screen z-50 transition-all duration-500 shadow-2xl`}>
        <div className="p-8 flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
            <Sparkles size={24} />
          </div>
          <div className="hidden md:block">
            <h1 className={`text-2xl font-black tracking-tighter ${textPrimary} uppercase`}>فخامة</h1>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Premium Store</p>
          </div>
        </div>

        <nav className="flex-1 px-4 md:px-6 mt-10 space-y-4">
          <button onClick={() => setView('shop')} className={`w-full relative flex items-center justify-center md:justify-start gap-5 px-5 py-5 rounded-[2rem] transition-all ${view === 'shop' ? 'bg-emerald-500/10 text-emerald-500' : `${textSecondary} hover:text-emerald-500`}`}>
            <ShoppingBag size={24} />
            <span className="hidden md:block text-lg font-bold">المتجر</span>
            {view === 'shop' && <div className="absolute left-0 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-lg shadow-emerald-500/50"></div>}
          </button>
          
          <button onClick={handleAdminClick} className={`w-full relative flex items-center justify-center md:justify-start gap-5 px-5 py-5 rounded-[2rem] transition-all ${view === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : `${textSecondary} hover:text-emerald-500`}`}>
            {isAdminAuthenticated ? <LayoutDashboard size={24} /> : <Lock size={24} />}
            <span className="hidden md:block text-lg font-bold">لوحة التحكم</span>
            {view === 'admin' && <div className="absolute left-0 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-lg shadow-emerald-500/50"></div>}
          </button>
        </nav>

        <div className="p-8 hidden md:block">
           {isAdminAuthenticated && (
             <button onClick={handleLogout} className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all border border-rose-500/20 font-black text-sm">
               <LogOut size={18} /> تسجيل الخروج
             </button>
           )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className={`px-10 py-8 flex items-center justify-between z-40 ${theme === 'dark' ? 'bg-[#070b1d]/80' : 'bg-white/80'} backdrop-blur-md border-b ${borderLight}`}>
           <div className="flex items-center gap-4">
              <h2 className={`text-2xl font-black ${textPrimary} uppercase tracking-tighter`}>
                {view === 'shop' ? 'المتجر المباشر' : 'إدارة المتجر'}
              </h2>
           </div>

           <div className="flex items-center gap-4 mr-auto">
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className={`p-4 rounded-2xl transition-all border ${borderLight} flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-emerald-600 text-black shadow-emerald-500/20' : 'bg-white text-slate-400 hover:text-emerald-600'}`}
                title={theme === 'dark' ? 'وضع النهار' : 'وضع الليل'}
              >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>

              <button 
                onClick={handleAdminClick}
                className={`p-4 rounded-2xl transition-all border ${borderLight} flex items-center justify-center shadow-lg ${
                    isAdminAuthenticated && view === 'admin' 
                    ? 'bg-emerald-600 text-black shadow-emerald-500/30' 
                    : `${bgCard} ${textSecondary} hover:text-emerald-500`
                }`}
                title="دخول لوحة التحكم"
              >
                {isAdminAuthenticated && view === 'admin' ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>

              <button className={`p-4 ${bgCard} rounded-2xl ${textSecondary} border ${borderLight} hover:text-emerald-500 transition-all`}>
                <Bell size={20} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar relative z-10">
          {view === 'shop' && (
            <div className="space-y-12">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-4 rounded-[1.8rem] whitespace-nowrap text-sm font-black transition-all ${activeTab === cat ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' : `${bgCard} ${textSecondary} border ${borderLight} hover:text-emerald-500`}`}>{cat}</button>
                ))}
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center opacity-30">
                  <PackagePlus size={100} className="mb-6 text-emerald-500" />
                  <h3 className={`text-3xl font-black mb-2 ${textPrimary}`}>المتجر فارغ حالياً</h3>
                  <p className={`font-bold ${textSecondary}`}>يرجى إضافة منتجات من لوحة التحكم للبدء</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
                  {filteredProducts.map(product => (
                    <div key={product.id} className={`group relative ${bgCard} rounded-[2.8rem] border ${borderLight} overflow-hidden transition-all duration-500 hover:border-emerald-500/30 hover:-translate-y-2 flex flex-col h-full ${shadowCard}`}>
                      <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-[#020617]' : 'from-white'} via-transparent to-transparent opacity-80 transition-opacity`}></div>
                        <div className="absolute bottom-8 right-8 left-8"><h4 className={`text-xl font-black ${textPrimary} leading-tight`}>{product.title}</h4></div>
                      </div>
                      <div className={`p-8 flex items-center justify-between mt-auto ${theme === 'light' ? 'bg-slate-50/50' : ''}`}>
                        <span className="text-2xl font-black text-emerald-600">{product.price} DH</span>
                        <button onClick={() => setSelectedProduct(product)} className="bg-emerald-600 text-black p-4 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all active:scale-95 green-glow-hover"><ShoppingCart size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'admin' && isAdminAuthenticated && (
            <div className="space-y-10 pb-32 max-w-7xl mx-auto animate-in fade-in duration-500">
               <div className={`flex flex-col md:flex-row gap-6 items-center justify-between ${bgCard} p-8 rounded-[3rem] border ${borderLight} shadow-xl`}>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setAdminTab('orders')} className={`px-8 py-4 rounded-2xl font-black text-sm transition-all ${adminTab === 'orders' ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' : `${textSecondary} hover:text-emerald-500`}`}>الطلبيات ({orders.length})</button>
                     <button onClick={() => setAdminTab('products')} className={`px-8 py-4 rounded-2xl font-black text-sm transition-all ${adminTab === 'products' ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' : `${textSecondary} hover:text-emerald-500`}`}>المنتجات ({products.length})</button>
                  </div>
                  {adminTab === 'products' && (
                    <button onClick={createNewProduct} className="bg-emerald-500 hover:bg-emerald-600 text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg green-glow active:scale-95">
                      <PlusCircle size={20} /> إضافة منتج جديد
                    </button>
                  )}
                  <div className={`${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} px-6 py-3 rounded-2xl border ${borderLight} text-right`}>
                     <p className={`text-[10px] ${textSecondary} font-black mb-1 uppercase`}>إجمالي المبيعات</p>
                     <p className="text-xl font-black text-emerald-600">{orders.reduce((acc, curr) => acc + curr.productPrice, 0)} DH</p>
                  </div>
               </div>

               {adminTab === 'orders' ? (
                 <div className="grid gap-6 animate-in slide-in-from-bottom-5">
                    {orders.length === 0 ? (
                      <div className="text-center py-40 opacity-20"><Package size={80} className="mx-auto" /><p className="text-xl mt-4">لا توجد طلبيات</p></div>
                    ) : (
                      orders.map(order => (
                        <div key={order.orderId} className={`${bgCard} border ${borderLight} p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-emerald-500/20 transition-all ${shadowCard}`}>
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><User size={24} /></div>
                              <div><h4 className={`text-xl font-black ${textPrimary}`}>{order.customer.fullName}</h4><p className={`text-xs ${textSecondary} font-bold uppercase`}>{order.productTitle}</p></div>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                              <div><p className={`text-xs ${textSecondary} font-black mb-1`}>المدينة</p><p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{order.customer.city}</p></div>
                              <div><p className={`text-xs ${textSecondary} font-black mb-1`}>الهاتف</p><p className="text-sm font-bold text-emerald-500 text-ltr">{order.customer.phoneNumber}</p></div>
                              <button onClick={() => deleteOrder(order.orderId)} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all self-center active:scale-90"><Trash2 size={20} /></button>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5">
                    {products.length === 0 ? (
                      <div className="col-span-full text-center py-40 opacity-20"><PackagePlus size={80} className="mx-auto text-emerald-500" /><p className="text-xl mt-4">قم بإضافة منتجك الأول الآن</p></div>
                    ) : (
                      products.map(p => (
                        <div key={p.id} className={`${bgCard} border ${borderLight} p-8 rounded-[3rem] flex gap-8 group hover:border-emerald-500/20 transition-all ${shadowCard}`}>
                           <img src={p.thumbnail} className={`w-32 h-32 object-cover rounded-[2rem] border ${borderLight} shadow-xl`} />
                           <div className="flex-1 space-y-4">
                              <div><h4 className={`text-xl font-black ${textPrimary}`}>{p.title}</h4><p className="text-sm font-bold text-emerald-500">{p.price} DH</p></div>
                              <div className="flex gap-3">
                                 <button onClick={() => setEditingProduct(p)} className={`flex-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} py-3 rounded-xl font-black text-xs hover:bg-emerald-600 hover:text-black transition-all flex items-center justify-center gap-2 border ${borderLight}`}><Edit3 size={14} /> تعديل</button>
                                 <button onClick={() => deleteProduct(p.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/95' : 'bg-slate-900/60'} backdrop-blur-3xl animate-in fade-in duration-300`} onClick={() => { setShowLoginModal(false); setShowPassword(false); }} />
          <form onSubmit={handleLogin} className={`${bgCard} w-full max-w-md rounded-[3.5rem] p-12 relative border ${borderLight} ${shadowCard} animate-in zoom-in-95 duration-300`}>
             <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner"><Lock size={40} /></div>
             <h3 className={`text-3xl font-black ${textPrimary} text-center mb-10`}>دخول المسؤول</h3>
             <div className="space-y-6">
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="كلمة المرور" 
                    className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${loginError ? 'border-rose-500' : borderLight} p-6 rounded-[2rem] ${textPrimary} font-bold outline-none focus:border-emerald-500 transition-all pr-6 pl-16`} 
                    value={passwordInput} 
                    onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }} 
                    autoFocus 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute left-6 top-1/2 -translate-y-1/2 ${textSecondary} hover:text-emerald-500 p-2 rounded-xl transition-all`}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-black py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">دخول</button>
             </div>
             <button type="button" onClick={() => { setShowLoginModal(false); setShowPassword(false); }} className={`w-full mt-4 ${textSecondary} hover:text-rose-500 font-bold text-sm`}>إلغاء</button>
          </form>
        </div>
      )}

      {/* Product Edit/Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/98' : 'bg-slate-900/70'} backdrop-blur-3xl animate-in fade-in duration-300`} onClick={() => setEditingProduct(null)} />
          <div className={`${bgCard} w-full max-w-3xl rounded-[3.5rem] p-12 relative border ${borderLight} overflow-y-auto max-h-[90vh] no-scrollbar animate-in zoom-in-95 duration-300 ${shadowCard}`}>
             <h3 className={`text-3xl font-black ${textPrimary} mb-8 flex items-center gap-4`}>
               {products.find(p => p.id === editingProduct.id) ? <Edit3 className="text-emerald-500" /> : <PlusCircle className="text-emerald-500" />} 
               {products.find(p => p.id === editingProduct.id) ? 'تعديل المنتج' : 'إضافة منتج جديد'}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className={`text-xs font-black ${textSecondary} px-4`}>اسم المنتج</label><input type="text" value={editingProduct.title} onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none focus:border-emerald-500 transition-all`} /></div>
                <div className="space-y-2"><label className={`text-xs font-black ${textSecondary} px-4`}>السعر (DH)</label><input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none focus:border-emerald-500 transition-all`} /></div>
                <div className="space-y-2 md:col-span-2"><label className={`text-xs font-black ${textSecondary} px-4`}>رابط الصورة (URL)</label><input type="text" value={editingProduct.thumbnail} onChange={(e) => setEditingProduct({...editingProduct, thumbnail: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-5 rounded-2xl ${textPrimary} font-bold outline-none focus:border-emerald-500 transition-all`} /></div>
                <div className="space-y-2 md:col-span-2"><label className={`text-xs font-black ${textSecondary} px-4`}>الوصف</label><textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className={`w-full ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-6 rounded-3xl ${textPrimary} font-bold min-h-[120px] outline-none focus:border-emerald-500 transition-all`} /></div>
             </div>
             <div className="flex gap-4 mt-10">
                <button onClick={() => setEditingProduct(null)} className={`flex-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} ${textPrimary} py-6 rounded-3xl font-black hover:bg-rose-500 hover:text-white transition-all border ${borderLight}`}>إلغاء</button>
                <button onClick={saveProductChanges} className="flex-[2] bg-emerald-600 text-black py-6 rounded-3xl font-black hover:bg-emerald-500 shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Save size={20} /> حفظ المنتج</button>
             </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/95' : 'bg-slate-900/70'} backdrop-blur-md animate-in fade-in duration-500`} onClick={() => { if(!isCheckingOut) setSelectedProduct(null); }} />
          <div className={`${bgSidebar} w-full max-w-7xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border ${borderLight} max-h-[95vh] animate-in zoom-in-95 duration-500`}>
            <button onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} className={`absolute top-8 right-8 z-[110] ${theme === 'dark' ? 'bg-white/5' : 'bg-white'} hover:bg-rose-500 hover:text-white ${textSecondary} p-4 rounded-full transition-all active:scale-90 border ${borderLight} shadow-lg`}><X size={24} /></button>
            <div className={`w-full md:w-1/2 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'} flex items-center justify-center p-12 overflow-hidden border-l ${borderLight}`}><img src={selectedProduct.thumbnail} className={`w-full h-full max-h-[600px] object-cover rounded-[3.5rem] shadow-2xl animate-float border ${borderLight}`} /></div>
            <div className={`w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-between overflow-y-auto no-scrollbar ${bgSidebar}`}>
               {!isCheckingOut ? (
                 <>
                   <div className="space-y-8">
                     <div className="flex items-center gap-4"><span className="bg-emerald-500/10 text-emerald-500 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">{selectedProduct.category}</span><div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest"><Check size={14} strokeWidth={3} /> متوفر في المخزون</div></div>
                     <h2 className={`text-4xl md:text-6xl font-black ${textPrimary} leading-tight tracking-tighter`}>{selectedProduct.title}</h2>
                     <p className={`${textSecondary} font-medium text-xl leading-relaxed`}>{selectedProduct.description}</p>
                   </div>
                   <div className="mt-16 space-y-6">
                     <div className="flex items-center justify-between p-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[3rem] shadow-2xl shadow-emerald-600/20">
                       <div><p className="text-[10px] text-emerald-100 font-black mb-1 uppercase tracking-widest">السعر النهائي</p><p className="text-6xl font-black text-black tracking-tighter">{selectedProduct.price} <small className="text-2xl opacity-80">DH</small></p></div>
                       <div className="text-right hidden sm:block"><p className="text-black font-black text-sm uppercase">دفع عند الاستلام</p><p className="text-emerald-100 text-xs">توصيل سريع لكل المغرب</p></div>
                     </div>
                     <button onClick={() => setIsCheckingOut(true)} className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} py-10 rounded-[3rem] font-black text-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4`}><ShoppingBag size={32} /> تأكيد الطلب</button>
                   </div>
                 </>
               ) : (
                 <div className="space-y-10 animate-in slide-in-from-right-10 duration-500 h-full flex flex-col py-4">
                    <div className="flex items-center gap-6"><button onClick={() => setIsCheckingOut(false)} className={`p-4 rounded-full text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all border ${borderLight} shadow-md`}><ChevronLeft size={24} /></button><h3 className={`text-4xl font-black ${textPrimary} tracking-tighter`}>معلومات التوصيل</h3></div>
                    <div className="flex-1 space-y-8 mt-6">
                      <div className="space-y-3"><label className={`text-[10px] ${textSecondary} uppercase font-black px-6`}>الاسم الكامل</label><div className={`${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-7 rounded-[2.2rem] flex items-center gap-4 focus-within:border-emerald-500 transition-all`}><User size={24} className={textSecondary} /><input type="text" placeholder="اسمك الكامل" className={`bg-transparent border-none outline-none flex-1 ${textPrimary} font-bold text-xl`} value={customerInfo.fullName} onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})} /></div></div>
                      <div className="space-y-3"><label className={`text-[10px] ${textSecondary} uppercase font-black px-6`}>المدينة</label><div className={`${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-7 rounded-[2.2rem] flex items-center gap-4 focus-within:border-emerald-500 transition-all`}><MapPin size={24} className={textSecondary} /><input type="text" placeholder="اسم المدينة" className={`bg-transparent border-none outline-none flex-1 ${textPrimary} font-bold text-xl`} value={customerInfo.city} onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})} /></div></div>
                      <div className="space-y-3"><label className={`text-[10px] ${textSecondary} uppercase font-black px-6`}>رقم الهاتف</label><div className={`${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50'} border ${borderLight} p-7 rounded-[2.2rem] flex items-center gap-4 focus-within:border-emerald-500 transition-all`}><Phone size={24} className={textSecondary} /><input type="tel" placeholder="06XXXXXXXX" className={`bg-transparent border-none outline-none flex-1 ${textPrimary} font-bold text-ltr text-xl`} value={customerInfo.phoneNumber} onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})} /></div></div>
                    </div>
                    <div className="pt-10">
                      <button onClick={confirmOrder} className="w-full bg-emerald-600 text-black py-10 rounded-[3rem] font-black text-2xl hover:bg-emerald-500 shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 green-glow">تأكيد وإرسال الطلب <ArrowRight size={28} /></button>
                      <p className={`text-center text-[10px] ${textSecondary} font-black uppercase mt-8 flex items-center justify-center gap-2`}><ShieldCheck size={14} className="text-emerald-500" /> دفع آمن عند الاستلام</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/98' : 'bg-white/95'} backdrop-blur-3xl animate-in fade-in duration-700`} onClick={() => setActiveOrder(null)} />
          <div className={`${bgSidebar} w-full max-w-2xl rounded-[4rem] p-16 text-center relative border ${borderLight} animate-in bounce-in shadow-2xl duration-700`}>
             <div className="w-28 h-28 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-black mx-auto mb-10 shadow-xl shadow-emerald-500/30"><Check size={60} strokeWidth={4} /></div>
             <h3 className={`text-5xl font-black ${textPrimary} mb-6 tracking-tighter`}>تم استلام طلبك!</h3>
             <p className={`${textSecondary} font-bold text-xl mb-12`}>سيد {activeOrder.customer.fullName}، شكراً لثقتك بمتجرنا. سنتصل بك قريباً في مدينة {activeOrder.customer.city} لتأكيد عملية الشحن.</p>
             <button onClick={() => setActiveOrder(null)} className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} py-6 rounded-3xl font-black transition-all border ${borderLight} text-xl active:scale-95 shadow-xl`}>العودة للتسوق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
