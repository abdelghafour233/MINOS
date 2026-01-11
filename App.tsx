
import React, { useState, useEffect } from 'react';
import { 
  Search, X, ShoppingBag, ShoppingCart, Star, 
  Truck, MapPin, Phone, User, History, Check, 
  ArrowRight, CreditCard, Package, Info, ChevronLeft, 
  Menu, Bell, Heart, Filter, ArrowUpRight, Sparkles,
  Zap, ShieldCheck, Clock
} from 'lucide-react';
import { StoreProduct, StoreOrder, CustomerInfo } from './types';
import { MOCK_PRODUCTS, CATEGORIES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'orders'>('shop');
  const [products, setProducts] = useState<StoreProduct[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('الكل');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [activeOrder, setActiveOrder] = useState<StoreOrder | null>(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('ecom_orders_v2');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    }
  }, []);

  const confirmOrder = () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !customerInfo.address) {
      alert("يرجى إكمال بيانات الشحن لضمان وصول طلبك.");
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
    setOrders(updatedOrders);
    localStorage.setItem('ecom_orders_v2', JSON.stringify(updatedOrders));
    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
  };

  const filteredProducts = activeTab === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex font-['Tajawal'] overflow-hidden">
      
      {/* Sidebar - Sleek & Narrow */}
      <aside className="w-24 md:w-80 bg-[#0a0a0a] border-l border-white/5 flex flex-col h-screen z-50 transition-all duration-500">
        <div className="p-8 flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sparkles size={24} />
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-black tracking-tighter text-white">فخامة</h1>
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">LUXURY STORE</p>
          </div>
        </div>

        <nav className="flex-1 px-4 md:px-6 mt-10 space-y-4">
          <button 
            onClick={() => setView('shop')} 
            className={`w-full group relative flex items-center justify-center md:justify-start gap-5 px-5 py-5 rounded-[2rem] transition-all duration-300 ${
              view === 'shop' 
                ? 'bg-violet-600/10 text-violet-400' 
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <ShoppingBag size={24} className={view === 'shop' ? 'scale-110' : ''} />
            <span className="hidden md:block text-lg font-bold">المتجر</span>
            {view === 'shop' && <div className="absolute left-0 w-1.5 h-8 bg-violet-600 rounded-r-full shadow-lg shadow-violet-500/50"></div>}
          </button>
          
          <button 
            onClick={() => setView('orders')} 
            className={`w-full group relative flex items-center justify-center md:justify-start gap-5 px-5 py-5 rounded-[2rem] transition-all duration-300 ${
              view === 'orders' 
                ? 'bg-violet-600/10 text-violet-400' 
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <History size={24} className={view === 'orders' ? 'scale-110' : ''} />
            <span className="hidden md:block text-lg font-bold">طلباتي</span>
            {view === 'orders' && <div className="absolute left-0 w-1.5 h-8 bg-violet-600 rounded-r-full shadow-lg shadow-violet-500/50"></div>}
          </button>
        </nav>

        <div className="p-8 hidden md:block">
           <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/40 p-6 rounded-[2.5rem] border border-violet-500/20 relative overflow-hidden group">
              <Zap className="absolute -top-4 -left-4 text-violet-500/20 w-24 h-24" />
              <p className="text-sm font-bold text-violet-200 relative z-10">توصيل مجاني</p>
              <p className="text-[10px] text-violet-400/80 mb-4 relative z-10">على الطلبات فوق 500 درهم</p>
              <button className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-black hover:bg-violet-100 transition-all relative z-10">اكتشف المزيد</button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#050505]">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-fuchsia-600/5 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <header className="px-10 py-8 flex items-center justify-between z-40">
           <div className="relative w-full max-w-xl group hidden md:block">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ابحث عن منتجك المفضل..." 
                className="w-full bg-[#111] border border-white/5 py-4 pr-14 pl-6 rounded-[1.5rem] text-sm focus:border-violet-500/50 outline-none transition-all placeholder:text-slate-600"
              />
           </div>
           
           <div className="flex items-center gap-6 mr-auto">
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <ShieldCheck size={18} className="text-violet-400" />
                <span className="text-xs font-black text-slate-200">دفع آمن عند الاستلام</span>
              </div>
              <button className="relative p-4 bg-[#111] rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
                <Bell size={22} />
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-fuchsia-500 rounded-full border-2 border-[#111]"></div>
              </button>
           </div>
        </header>

        {/* Content Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar relative z-10">
          {view === 'shop' && (
            <div className="space-y-12">
              {/* Hero/Promotions */}
              <div className="relative h-64 md:h-80 rounded-[3.5rem] overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-1000"></div>
                 <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black/80"></div>
                 <div className="relative h-full flex flex-col justify-center p-12 space-y-4">
                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-fit">مجموعة الصيف 2024</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">أناقتك تبدأ <br/> <span className="text-violet-300">من هنا.</span></h2>
                    <button className="bg-white text-black px-8 py-3.5 rounded-2xl font-black text-sm w-fit hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-2 group">
                      تسوق الآن <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </div>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-8 py-4 rounded-[1.8rem] whitespace-nowrap text-sm font-black transition-all duration-300 ${
                      activeTab === cat 
                        ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/30 ring-2 ring-violet-400/20' 
                        : 'bg-[#111] text-slate-500 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="group relative bg-[#0d0d0d] rounded-[2.8rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-violet-500/30 hover:-translate-y-2"
                  >
                    <div className="aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img 
                        src={product.thumbnail} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80"></div>
                      
                      {product.originalPrice && (
                        <div className="absolute top-6 left-6 bg-fuchsia-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-lg">
                          -{Math.round((1 - product.price/product.originalPrice) * 100)}%
                        </div>
                      )}
                      
                      <div className="absolute bottom-8 right-8 left-8">
                         <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black mb-3">
                           <Star size={12} fill="currentColor" /> {product.rating}
                         </div>
                         <h4 className="text-xl font-black text-white leading-tight line-clamp-2">{product.title}</h4>
                      </div>
                    </div>

                    <div className="p-8 flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">السعر النهائي</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-2xl font-black text-white">{product.price} <small className="text-xs">DH</small></span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="bg-violet-600 hover:bg-violet-500 text-white p-4.5 rounded-[1.5rem] shadow-xl shadow-violet-600/20 transition-all hover:rotate-6 active:scale-95"
                      >
                        <ShoppingCart size={22} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="max-w-5xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-5">
               <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">طلباتك السابقة</h3>
                    <p className="text-slate-500 font-bold mt-2">تتبع مشترياتك وحالتها من هنا</p>
                  </div>
                  <div className="p-6 bg-violet-600/10 rounded-3xl text-violet-400">
                    <Package size={40} />
                  </div>
               </div>
               
               {orders.length === 0 ? (
                 <div className="text-center py-40 opacity-20">
                   <Package size={80} className="mx-auto mb-6" />
                   <p className="text-2xl font-bold">لم تطلب أي منتج بعد</p>
                 </div>
               ) : (
                 <div className="grid gap-6">
                   {orders.map(order => (
                     <div key={order.orderId} className="bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-violet-500/20 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-20 h-20 bg-violet-600/10 rounded-[2rem] flex items-center justify-center text-violet-400">
                             <Zap size={30} />
                           </div>
                           <div>
                              <h4 className="text-2xl font-black text-white">{order.productTitle}</h4>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{order.orderId} • {order.orderDate}</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-10">
                           <div className="text-right">
                             <p className="text-[10px] text-slate-500 font-black uppercase mb-1">المبلغ</p>
                             <p className="text-2xl font-black text-violet-400">{order.productPrice} DH</p>
                           </div>
                           <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${order.status === 'pending' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                              <div className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                              <span className="text-xs font-black uppercase tracking-widest">{order.status === 'pending' ? 'قيد المعالجة' : 'تم التوصيل'}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal - High End Design */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => { if(!isCheckingOut) setSelectedProduct(null); }} />
          
          <div className="bg-[#0a0a0a] w-full max-w-7xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(139,92,246,0.1)] border border-white/5 animate-in zoom-in-95 duration-500 max-h-[95vh]">
            <button 
              onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} 
              className="absolute top-8 right-8 z-[110] bg-white/5 hover:bg-violet-600 text-white p-4 rounded-full transition-all border border-white/10"
            >
              <X size={24} />
            </button>
            
            {/* Image Preview */}
            <div className="w-full md:w-1/2 bg-[#050505] flex items-center justify-center p-12 relative overflow-hidden">
               <div className="absolute top-20 left-20 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full"></div>
               <img 
                src={selectedProduct.thumbnail} 
                className="w-full h-full max-h-[600px] object-cover rounded-[3.5rem] shadow-2xl relative z-10 border border-white/5 animate-float" 
               />
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-between overflow-y-auto no-scrollbar bg-[#0d0d0d]">
               {!isCheckingOut ? (
                 <>
                   <div className="space-y-8">
                     <div className="flex items-center gap-4">
                        <span className="bg-violet-600/10 text-violet-400 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-500/10">{selectedProduct.category}</span>
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                           <Check size={14} /> متوفر بالمخزون
                        </div>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">{selectedProduct.title}</h2>
                     <p className="text-slate-400 font-medium text-xl leading-relaxed">{selectedProduct.description}</p>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                           <Truck className="text-violet-400" />
                           <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase">سرعة التوصيل</p>
                              <p className="text-sm font-bold text-white">{selectedProduct.shippingTime}</p>
                           </div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                           <ShieldCheck className="text-violet-400" />
                           <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase">ضمان الجودة</p>
                              <p className="text-sm font-bold text-white">منتج أصلي 100%</p>
                           </div>
                        </div>
                     </div>
                   </div>
                   
                   <div className="mt-16 space-y-6">
                     <div className="flex items-center justify-between p-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-violet-600/20">
                       <div>
                         <p className="text-[10px] text-violet-200 font-black uppercase mb-1">السعر الإجمالي</p>
                         <p className="text-6xl font-black text-white tracking-tighter">{selectedProduct.price} <small className="text-2xl">DH</small></p>
                       </div>
                       <div className="text-right hidden sm:block">
                          <p className="text-white font-black text-sm mb-1 uppercase tracking-widest">دفع عند الاستلام</p>
                          <p className="text-violet-200 text-xs">توصيل آمن لجميع المدن</p>
                       </div>
                     </div>
                     
                     <button 
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full bg-white text-black py-10 rounded-[3rem] font-black text-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
                     >
                       <ShoppingBag size={32} />
                       اطلب الآن بنقرة واحدة
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="space-y-10 animate-in slide-in-from-right-10 duration-500 h-full flex flex-col">
                    <div className="flex items-center gap-6">
                       <button onClick={() => setIsCheckingOut(false)} className="bg-white/5 p-4 rounded-full text-violet-400 hover:bg-white/10 transition-all">
                         <ChevronLeft size={24} />
                       </button>
                       <h3 className="text-4xl font-black text-white tracking-tighter">إتمام الطلب</h3>
                    </div>
                    
                    <div className="flex-1 space-y-6 mt-6">
                      <div className="space-y-3">
                        <label className="text-[10px] text-slate-500 uppercase font-black px-6 tracking-widest">الاسم الكامل للزبون</label>
                        <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4 focus-within:border-violet-500 transition-all">
                           <User size={20} className="text-slate-600" />
                           <input 
                            type="text" 
                            placeholder="مثال: يونس الإدريسي" 
                            className="bg-transparent border-none outline-none flex-1 text-white font-bold text-lg"
                            value={customerInfo.fullName}
                            onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-500 uppercase font-black px-6 tracking-widest">رقم الهاتف</label>
                          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
                             <Phone size={20} className="text-slate-600" />
                             <input 
                              type="tel" 
                              placeholder="06XXXXXXXX" 
                              className="bg-transparent border-none outline-none flex-1 text-white font-bold text-ltr text-lg"
                              value={customerInfo.phoneNumber}
                              onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})}
                             />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-500 uppercase font-black px-6 tracking-widest">المدينة</label>
                          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
                             <MapPin size={20} className="text-slate-600" />
                             <input 
                              type="text" 
                              placeholder="الرباط، مراكش..." 
                              className="bg-transparent border-none outline-none flex-1 text-white font-bold text-lg"
                              value={customerInfo.city}
                              onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                             />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] text-slate-500 uppercase font-black px-6 tracking-widest">العنوان بالتفصيل</label>
                        <textarea 
                          placeholder="الحي، رقم الشقة أو المنزل، مراجع قريبة..." 
                          className="w-full bg-[#111] border border-white/5 p-8 rounded-[2.5rem] text-white font-bold min-h-[140px] outline-none focus:border-violet-500 transition-all text-lg"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-10">
                      <button 
                        onClick={confirmOrder}
                        className="w-full bg-violet-600 text-white py-9 rounded-[3rem] font-black text-2xl hover:bg-violet-500 shadow-2xl shadow-violet-600/20 flex items-center justify-center gap-4 transition-all"
                      >
                        تأكيد وإرسال الطلب <ArrowRight size={28} />
                      </button>
                      <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-6">الدفع نقداً عند استلام منتجك</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Premium Experience */}
      {activeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setActiveOrder(null)} />
          <div className="bg-[#0d0d0d] w-full max-w-2xl rounded-[4rem] p-16 text-center relative border border-violet-500/20 animate-in bounce-in duration-700 shadow-[0_0_80px_rgba(139,92,246,0.15)]">
             <div className="w-28 h-28 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-violet-500/30">
               <Check size={60} strokeWidth={4} />
             </div>
             <h3 className="text-5xl font-black text-white mb-6 tracking-tighter">شكراً لثقتك!</h3>
             <p className="text-slate-400 font-bold text-xl mb-12">سيد {activeOrder.customer.fullName}، تم تسجيل طلبك تحت رقم <span className="text-violet-400">#{activeOrder.orderId}</span>. سنتصل بك قريباً لتأكيد الشحن.</p>
             
             <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 mb-12 text-right space-y-4">
                <div className="flex justify-between items-center text-slate-500 text-sm font-bold">
                   <span>المنتج المختار</span>
                   <span className="text-white font-black">{activeOrder.productTitle}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                   <span className="text-slate-500 text-sm font-bold">المجموع عند الاستلام</span>
                   <span className="text-violet-400 font-black text-4xl">{activeOrder.productPrice} DH</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveOrder(null)} className="bg-white/5 text-white py-6 rounded-3xl font-black hover:bg-white/10 transition-all border border-white/5">العودة للمتجر</button>
                <button 
                  onClick={() => { setView('orders'); setActiveOrder(null); }} 
                  className="bg-violet-600 text-white py-6 rounded-3xl font-black hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3"
                >
                  <History size={20} /> تتبع طلبي
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
