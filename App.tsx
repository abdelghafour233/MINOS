
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ShoppingCart, X, CheckCircle, Settings, Globe, ShieldCheck, 
  DollarSign, Database, Zap, Table, Loader2, Sparkles, Plus, 
  Trash2, Download, Key, Monitor, Mail, Phone, LayoutGrid
} from 'lucide-react';
import { TrendingAd, FilterState, Order, IntegrationConfig } from './types';
import { MOCK_TRENDS, CATEGORIES } from './constants';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'ads' | 'dashboard' | 'integrations' | 'settings'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [ads, setAds] = useState<TrendingAd[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Integration Config State
  const [config, setConfig] = useState<IntegrationConfig>({
    zapierWebhookUrl: '',
    googleSheetUrl: '',
    facebookPixel: '',
    googlePixel: '',
    tiktokPixel: ''
  });

  // UI State
  const [selectedAd, setSelectedAd] = useState<TrendingAd | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', email: '', phone: '' });
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // New Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: CATEGORIES[1],
    description: '',
    image: ''
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    platform: 'all',
    country: 'all',
    category: 'الكل',
    sortBy: 'views'
  });

  // Load Initial Data
  useEffect(() => {
    const savedAds = localStorage.getItem('digital_products');
    const savedOrders = localStorage.getItem('digital_orders');
    const savedConfig = localStorage.getItem('digital_config');
    
    if (savedAds) {
      try { 
        const parsed = JSON.parse(savedAds);
        setAds(parsed.length > 0 ? parsed : MOCK_TRENDS); 
      } catch(e) { setAds(MOCK_TRENDS); }
    } else {
      setAds(MOCK_TRENDS);
    }
    
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    }
    
    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch(e) { /* use default */ }
    }
  }, []);

  // Filtering Logic
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchesSearch = ad.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'الكل' || ad.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [ads, filters]);

  // Handlers
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: TrendingAd = {
      id: 'prod-' + Math.random().toString(36).substring(2, 9),
      title: newProduct.title,
      price: Number(newProduct.price),
      description: newProduct.description,
      thumbnail: newProduct.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
      category: newProduct.category,
      platform: 'instagram',
      country: 'MA',
      views: 0,
      likes: 0,
      shares: 0,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isWinning: true
    };

    const updatedAds = [product, ...ads];
    setAds(updatedAds);
    localStorage.setItem('digital_products', JSON.stringify(updatedAds));
    setShowAddForm(false);
    setNewProduct({ title: '', price: '', category: CATEGORIES[1], description: '', image: '' });
  };

  const deleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = ads.filter(a => a.id !== id);
      setAds(updated);
      localStorage.setItem('digital_products', JSON.stringify(updated));
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    setIsOrdering(true);
    
    const newOrder: Order = {
      id: 'DGT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customerName: checkoutData.name,
      city: checkoutData.email, // Using city field for email
      phone: checkoutData.phone,
      productId: selectedAd.id,
      productTitle: selectedAd.title,
      amount: selectedAd.price,
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'pending',
      syncedToSheets: false
    };

    // Simulate delay
    setTimeout(() => {
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('digital_orders', JSON.stringify(updatedOrders));
      setIsOrdering(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
        setSelectedAd(null);
      }, 2500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 border-l border-slate-800 transition-all duration-300 flex flex-col h-screen z-50 shadow-2xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black text-white tracking-tight">رقمي شوب</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'ads', label: 'المتجر الرقمي', icon: LayoutGrid },
            { id: 'dashboard', label: 'إدارة المنتجات', icon: Table },
            { id: 'integrations', label: 'المبيعات', icon: DollarSign },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0F172A]">
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between z-40">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="بحث في المنتجات المضافة..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-black border border-cyan-500/20">
            ADMIN MODE
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {activeTab === 'ads' && (
            <div className="space-y-8 pb-32">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilters({...filters, category: cat})}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                      filters.category === cat ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAds.map((ad) => (
                  <div 
                    key={ad.id} 
                    className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-sm hover:shadow-cyan-500/10 hover:border-slate-700 transition-all duration-300 group cursor-pointer flex flex-col"
                    onClick={() => setSelectedAd(ad)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-950">
                      <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4">
                        <div className="bg-cyan-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                          <Download size={12} /> تسليم فوري
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg w-fit mb-3">{ad.category}</span>
                      <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 h-12 leading-tight">{ad.title}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-black text-cyan-400">{ad.price} <small className="text-xs font-bold">د.م</small></span>
                        <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-cyan-500 group-hover:text-white transition-all">
                          <Key size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-center bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <div>
                  <h2 className="text-3xl font-black">إدارة المنتجات</h2>
                  <p className="text-slate-500 font-bold">إضافة، تعديل أو حذف المنتجات من المتجر</p>
                </div>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-2xl flex items-center gap-2 font-black transition-all"
                >
                  {showAddForm ? <X size={20} /> : <Plus size={20} />}
                  <span>{showAddForm ? 'إلغاء' : 'إضافة منتج جديد'}</span>
                </button>
              </div>

              {showAddForm && (
                <div className="bg-slate-900 p-8 rounded-3xl border border-cyan-500/30 animate-in fade-in slide-in-from-top-4">
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">اسم المنتج الرقمي</label>
                      <input required className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500" placeholder="مثال: اشتراك كانفا برو سنة" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">السعر (MAD)</label>
                      <input required type="number" className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500" placeholder="99" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">التصنيف</label>
                      <select className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                        {CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">رابط صورة المنتج</label>
                      <input className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500 text-ltr" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="block text-sm font-bold text-slate-400">وصف المنتج</label>
                      <textarea rows={3} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500" placeholder="اكتب تفاصيل المنتج وما سيحصل عليه العميل..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                    </div>
                    <button type="submit" className="md:col-span-2 bg-cyan-600 text-white p-5 rounded-2xl font-black text-xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20">حفظ المنتج في المتجر</button>
                  </form>
                </div>
              )}

              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="p-6">المنتج</th>
                      <th className="p-6">السعر</th>
                      <th className="p-6">التصنيف</th>
                      <th className="p-6">التحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ads.map(ad => (
                      <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-6 flex items-center gap-4">
                          <img src={ad.thumbnail} className="w-12 h-12 rounded-lg object-cover" />
                          <span className="font-bold">{ad.title}</span>
                        </td>
                        <td className="p-6 font-black text-cyan-400">{ad.price} MAD</td>
                        <td className="p-6"><span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold">{ad.category}</span></td>
                        <td className="p-6">
                          <button onClick={() => deleteProduct(ad.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all"><Trash2 size={20}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                   <p className="text-slate-500 font-bold text-sm mb-2">إجمالي الطلبات</p>
                   <p className="text-4xl font-black text-white">{orders.length}</p>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                   <p className="text-slate-500 font-bold text-sm mb-2">البريد الإلكتروني</p>
                   <p className="text-2xl font-black text-cyan-500">{orders.length} إرسالية</p>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                   <p className="text-slate-500 font-bold text-sm mb-2">إجمالي المبيعات</p>
                   <p className="text-3xl font-black text-white">{orders.reduce((a,b)=>a+b.amount, 0)} <small className="text-sm">د.م</small></p>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-800/30 font-black">سجل المبيعات الأخيرة</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-800/50 text-[10px] uppercase font-black text-slate-500">
                      <tr>
                        <th className="p-6">المنتج</th>
                        <th className="p-6">العميل</th>
                        <th className="p-6">البريد الإلكتروني</th>
                        <th className="p-6">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.map(o => (
                        <tr key={o.id} className="text-sm font-bold">
                          <td className="p-6">{o.productTitle}</td>
                          <td className="p-6 text-slate-400">{o.customerName}</td>
                          <td className="p-6 text-cyan-400 font-mono">{o.city}</td>
                          <td className="p-6 text-green-500">مدفوع</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedAd(null)} />
          <div className="bg-slate-900 w-full max-w-4xl rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedAd(null)} className="absolute top-6 left-6 z-[110] bg-slate-800 text-white p-2 rounded-full"><X size={20} /></button>
            
            <div className="md:w-2/5 bg-slate-950 p-8 flex flex-col justify-center items-center">
              <img src={selectedAd.thumbnail} className="w-full rounded-2xl shadow-2xl" />
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-black text-white mb-2">{selectedAd.title}</h3>
                <p className="text-3xl font-black text-cyan-400">{selectedAd.price} MAD</p>
              </div>
            </div>

            <div className="md:w-3/5 p-12 bg-slate-900">
              {showCheckout ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-3"><ShoppingCart className="text-cyan-500" /> تأكيد طلبك</h2>
                  {orderSuccess ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-cyan-500/20 text-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="animate-bounce" /></div>
                      <h3 className="text-2xl font-black mb-2">تم استلام طلبك!</h3>
                      <p className="text-slate-400 font-bold">تحقق من بريدك الإلكتروني خلال دقائق.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                      <input required placeholder="الاسم الكامل" className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl outline-none text-white font-bold" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                      <input required type="email" placeholder="البريد الإلكتروني (لاستلام الكود)" className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl outline-none text-white font-bold text-ltr" value={checkoutData.email} onChange={e => setCheckoutData({...checkoutData, email: e.target.value})} />
                      <input required placeholder="رقم الهاتف" className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl outline-none text-white font-bold text-ltr" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                      <button type="submit" disabled={isOrdering} className="w-full bg-cyan-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/40 mt-4 flex items-center justify-center gap-2">
                        {isOrdering ? <Loader2 className="animate-spin" /> : 'تأكيد الدفع والاستلام'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">{selectedAd.category}</span>
                    <span className="text-slate-500 font-black text-sm flex items-center gap-2"><Monitor size={16}/> متوفر حالياً</span>
                  </div>
                  <h2 className="text-4xl font-black text-white mb-6 leading-tight">{selectedAd.title}</h2>
                  <p className="text-slate-400 font-bold text-lg leading-relaxed mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-800 flex-1">{selectedAd.description || 'لا يوجد وصف متاح لهذا المنتج الرقمي.'}</p>
                  <button onClick={() => setShowCheckout(true)} className="w-full bg-cyan-600 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-cyan-500 transition-all shadow-2xl flex items-center justify-center gap-4">
                    <ShoppingCart size={28} /> ابدأ الشراء
                  </button>
                  <div className="mt-6 flex items-center justify-center gap-6 text-slate-500 font-black text-[10px] uppercase">
                     <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> دفع آمن</div>
                     <div className="flex items-center gap-1.5"><Mail size={14} /> تسليم رقمي</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
