
import React, { useState, useEffect } from 'react';
import { 
  Search, X, ShoppingBag, ShoppingCart, Star, 
  Truck, MapPin, Phone, User, History, Check, 
  ArrowRight, CreditCard, Package, Info, ChevronLeft, 
  Menu, Bell, Heart, Filter
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
    const savedOrders = localStorage.getItem('ecom_orders_final');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    }
  }, []);

  const confirmOrder = () => {
    if (!customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.city || !customerInfo.address) {
      alert("يرجى ملء جميع المعلومات الضرورية لإتمام الطلب.");
      return;
    }

    if (!selectedProduct) return;

    const newOrder: StoreOrder = {
      orderId: 'MA-' + Math.random().toString(36).toUpperCase().substring(2, 8),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productPrice: selectedProduct.price,
      customer: { ...customerInfo },
      orderDate: new Date().toLocaleString('ar-MA'),
      status: 'pending'
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('ecom_orders_final', JSON.stringify(updatedOrders));
    setActiveOrder(newOrder);
    setIsCheckingOut(false);
    setSelectedProduct(null);
    setCustomerInfo({ fullName: '', phoneNumber: '', city: '', address: '' });
  };

  const filteredProducts = activeTab === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-['Tajawal']">
      
      {/* Navigation Sidebar */}
      <aside className="w-20 md:w-72 bg-slate-900 border-l border-white/5 flex flex-col h-screen z-50 shadow-2xl transition-all duration-300">
        <div className="p-6 md:p-10 flex items-center gap-4 border-b border-white/5">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl text-white shadow-lg">
            <ShoppingBag size={24} />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-white">متجري</h1>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">التسوق الذكي</span>
          </div>
        </div>

        <nav className="flex-1 p-4 md:p-6 space-y-4">
          <button 
            onClick={() => setView('shop')} 
            className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-4 rounded-2xl transition-all group ${
              view === 'shop' ? 'bg-emerald-500/10 text-emerald-400 font-bold border-r-4 border-emerald-500 shadow-md' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            <ShoppingCart size={22} />
            <span className="hidden md:block text-lg">المتجر الرئيسي</span>
          </button>
          
          <button 
            onClick={() => setView('orders')} 
            className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-4 rounded-2xl transition-all group ${
              view === 'orders' ? 'bg-emerald-500/10 text-emerald-400 font-bold border-r-4 border-emerald-500 shadow-md' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            <History size={22} />
            <span className="hidden md:block text-lg">طلباتي</span>
          </button>
        </nav>

        <div className="p-6 border-t border-white/5 hidden md:block">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">الدعم الفني</p>
            <p className="text-sm font-bold text-slate-300 mb-4">هل تحتاج مساعدة؟</p>
            <button className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-xl text-xs font-bold transition-all">اتصل بنا</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Top Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 py-6 flex items-center justify-between z-40">
           <div className="flex items-center gap-6">
              <h2 className="text-xl md:text-2xl font-black text-white">
                {view === 'shop' ? 'تصفح المنتجات' : 'سجل مشترياتك'}
              </h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-white/5">
                <Truck size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">توصيل لكل مدن المغرب</span>
              </div>
              <button className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-all text-slate-400">
                <Bell size={20} />
              </button>
           </div>
        </header>

        {/* Content Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar z-10">
          {view === 'shop' && (
            <div className="space-y-12">
              {/* Categories Bar */}
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-8 py-3 rounded-2xl whitespace-nowrap text-sm font-black transition-all ${
                      activeTab === cat 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="group bg-slate-900/60 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:translate-y-[-8px] flex flex-col"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img 
                        src={product.thumbnail} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                      
                      {product.originalPrice && (
                        <div className="absolute top-6 right-6 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-xl">
                          تخفيض %{Math.round((1 - product.price/product.originalPrice) * 100)}
                        </div>
                      )}

                      <div className="absolute bottom-6 right-6 left-6">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-black mb-2">
                          <Star size={12} fill="currentColor" /> {product.rating}
                        </div>
                        <h4 className="text-lg font-black text-white line-clamp-2 leading-tight">{product.title}</h4>
                      </div>
                    </div>

                    <div className="p-8 flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">السعر</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-2xl font-black text-white">{product.price} <small className="text-xs">DH</small></span>
                           {product.originalPrice && <span className="text-xs text-slate-500 line-through">{product.originalPrice} DH</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl shadow-xl transition-all group-hover:rotate-[-5deg]"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="max-w-5xl mx-auto space-y-10 pb-20">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-black text-white">مشترياتك السابقة</h3>
                  <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold">
                    إجمالي الطلبات: {orders.length}
                  </div>
               </div>
               
               {orders.length === 0 ? (
                 <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] py-32 text-center">
                   <Package size={60} className="mx-auto mb-6 text-slate-700" />
                   <p className="text-xl font-bold text-slate-500">لم تقم بأي طلبية بعد</p>
                   <button onClick={() => setView('shop')} className="mt-8 text-emerald-500 font-bold hover:underline">ابدأ التسوق الآن</button>
                 </div>
               ) : (
                 <div className="grid gap-6">
                   {orders.map(order => (
                     <div key={order.orderId} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                           <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                             <Package size={30} />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-white line-clamp-1">{order.productTitle}</h4>
                              <p className="text-xs text-slate-500 font-bold">رقم الطلب: {order.orderId} • {order.orderDate}</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-10">
                           <div>
                             <p className="text-[10px] text-slate-600 font-black uppercase mb-1">المجموع</p>
                             <p className="text-xl font-black text-emerald-400">{order.productPrice} DH</p>
                           </div>
                           <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                              <div className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                              <span className="text-xs font-black uppercase tracking-widest">{order.status === 'pending' ? 'قيد التجهيز' : 'تم التوصيل'}</span>
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" onClick={() => { if(!isCheckingOut) setSelectedProduct(null); }} />
          
          <div className="bg-slate-900 w-full max-w-6xl rounded-[3rem] md:rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500 max-h-full">
            <button 
              onClick={() => { setSelectedProduct(null); setIsCheckingOut(false); }} 
              className="absolute top-8 right-8 z-[110] bg-white/5 hover:bg-rose-500 text-white p-3 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            
            {/* Left/Top Image Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-950 flex flex-col items-center justify-center gap-8 relative">
               <img 
                src={selectedProduct.thumbnail} 
                className="w-full h-[300px] md:h-auto aspect-[4/5] object-cover rounded-[2.5rem] shadow-2xl border border-white/5" 
               />
               {!isCheckingOut && (
                 <div className="flex gap-4 w-full">
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-1">مدة التوصيل</p>
                      <p className="text-sm font-black text-emerald-400">{selectedProduct.shippingTime}</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-1">الدفع</p>
                      <p className="text-sm font-black text-blue-400">عند الاستلام</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Right/Bottom Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-full no-scrollbar">
               {!isCheckingOut ? (
                 <>
                   <div className="space-y-6">
                     <div className="flex items-center gap-3">
                       <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">{selectedProduct.category}</span>
                       <span className="text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div> منتج أصلي
                       </span>
                     </div>
                     <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{selectedProduct.title}</h2>
                     <p className="text-slate-400 font-medium text-lg leading-relaxed">{selectedProduct.description}</p>
                   </div>
                   
                   <div className="space-y-8 mt-12">
                     <div className="flex items-center justify-between p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                       <div>
                         <p className="text-[10px] text-slate-500 uppercase font-black mb-1">المبلغ المطلوب</p>
                         <p className="text-5xl font-black text-white">{selectedProduct.price} <small className="text-xl">DH</small></p>
                         {selectedProduct.originalPrice && <p className="text-slate-600 line-through mt-1">{selectedProduct.originalPrice} DH</p>}
                       </div>
                       <div className="hidden sm:block text-right">
                         <p className="text-emerald-500 font-black text-xs">متوفر الآن بالمخزون</p>
                         <p className="text-slate-500 text-[10px]">توصيل مجاني متوفر لبعض المدن</p>
                       </div>
                     </div>
                     
                     <button 
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-4 transition-all"
                     >
                       <ShoppingBag size={28} />
                       اطلب الآن - دفع عند الاستلام
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                    <div className="flex items-center gap-4 mb-2">
                       <button onClick={() => setIsCheckingOut(false)} className="text-emerald-500 font-black flex items-center gap-2 hover:underline">
                         <ChevronLeft size={20} /> رجوع
                       </button>
                       <h3 className="text-3xl font-black text-white">تأكيد طلبك</h3>
                    </div>
                    <p className="text-slate-500 font-bold">يرجى إدخال معلوماتك لنتصل بك ونقوم بشحن طلبك فوراً.</p>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-black px-4">الاسم الكامل</label>
                        <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center gap-4 focus-within:border-emerald-500 transition-all">
                           <User size={18} className="text-slate-600" />
                           <input 
                            type="text" 
                            placeholder="اسمك الكامل" 
                            className="bg-transparent border-none outline-none flex-1 text-white font-bold"
                            value={customerInfo.fullName}
                            onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-black px-4">رقم الهاتف</label>
                          <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center gap-4">
                             <Phone size={18} className="text-slate-600" />
                             <input 
                              type="tel" 
                              placeholder="06XXXXXXXX" 
                              className="bg-transparent border-none outline-none flex-1 text-white font-bold text-ltr"
                              value={customerInfo.phoneNumber}
                              onChange={(e) => setCustomerInfo({...customerInfo, phoneNumber: e.target.value})}
                             />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-black px-4">المدينة</label>
                          <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center gap-4">
                             <MapPin size={18} className="text-slate-600" />
                             <input 
                              type="text" 
                              placeholder="مثال: الدار البيضاء" 
                              className="bg-transparent border-none outline-none flex-1 text-white font-bold"
                              value={customerInfo.city}
                              onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                             />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-black px-4">عنوان السكن</label>
                        <textarea 
                          placeholder="أدخل عنوان الشحن بالتفصيل (الحي، الزقاق، رقم الدار)" 
                          className="w-full bg-white/5 border border-white/5 p-6 rounded-3xl text-white font-bold min-h-[100px] outline-none focus:border-emerald-500 transition-all no-scrollbar"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={confirmOrder}
                      className="w-full bg-emerald-600 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-emerald-500 shadow-2xl flex items-center justify-center gap-3 transition-all"
                    >
                      تأكيد الطلب مجاناً <ArrowRight size={24} />
                    </button>
                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">لن تدفع شيئاً إلا عند استلام منتجك</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setActiveOrder(null)} />
          <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 md:p-16 text-center relative border border-white/10 animate-in bounce-in duration-500 shadow-2xl">
             <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-emerald-500/20">
               <Check size={50} strokeWidth={4} />
             </div>
             <h3 className="text-3xl md:text-4xl font-black text-white mb-4">مبروك! تم تسجيل طلبك</h3>
             <p className="text-slate-400 font-bold mb-10">شكراً لك {activeOrder.customer.fullName}. سنتصل بك قريباً على الرقم {activeOrder.customer.phoneNumber} لتأكيد عملية الشحن.</p>
             
             <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 mb-10 text-right">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-slate-500 font-bold">المنتج</span>
                   <span className="text-white font-black">{activeOrder.productTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-slate-500 font-bold">الإجمالي</span>
                   <span className="text-emerald-400 font-black text-2xl">{activeOrder.productPrice} DH</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveOrder(null)} className="bg-white/5 text-white py-5 rounded-2xl font-black hover:bg-white/10 transition-all border border-white/5">إغلاق</button>
                <button 
                  onClick={() => { setView('orders'); setActiveOrder(null); }} 
                  className="bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <History size={18} /> تتبع طلبي
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
