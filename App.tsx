
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ShoppingCart, X, CheckCircle, Settings, Globe, ShieldCheck, 
  DollarSign, Database, Zap, Table, Loader2, Sparkles, Plus, 
  Trash2, Download, Key, Monitor, Mail, Phone, LayoutGrid, Edit3, Image as ImageIcon, Eye
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
  
  // Product Management State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: CATEGORIES[1],
    description: '',
    image: '',
    additionalImage: ''
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
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing product
      const updatedAds = ads.map(ad => {
        if (ad.id === editingId) {
          return {
            ...ad,
            title: newProduct.title,
            price: Number(newProduct.price),
            description: newProduct.description,
            thumbnail: newProduct.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
            additionalImage: newProduct.additionalImage,
            category: newProduct.category
          };
        }
        return ad;
      });
      setAds(updatedAds);
      localStorage.setItem('digital_products', JSON.stringify(updatedAds));
    } else {
      // Add new product
      const product: TrendingAd = {
        id: 'prod-' + Math.random().toString(36).substring(2, 9),
        title: newProduct.title,
        price: Number(newProduct.price),
        description: newProduct.description,
        thumbnail: newProduct.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
        additionalImage: newProduct.additionalImage,
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
    }

    resetForm();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setNewProduct({ title: '', price: '', category: CATEGORIES[1], description: '', image: '', additionalImage: '' });
  };

  const startEdit = (ad: TrendingAd) => {
    setEditingId(ad.id);
    setNewProduct({
      title: ad.title,
      price: ad.price.toString(),
      category: ad.category,
      description: ad.description || '',
      image: ad.thumbnail,
      additionalImage: ad.additionalImage || ''
    });
    setShowAddForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      city: checkoutData.email, 
      phone: checkoutData.phone,
      productId: selectedAd.id,
      productTitle: selectedAd.title,
      amount: selectedAd.price,
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'pending',
      syncedToSheets: false
    };

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
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg w-fit">{ad.category}</span>
                        {ad.additionalImage && <ImageIcon size={14} className="text-slate-500" title="يحتوي على صور إضافية" />}
                      </div>
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
            <div className="max-w-5xl mx-auto space-y-8 pb-32">
              <div className="flex justify-between items-center bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div>
                  <h2 className="text-3xl font-black">إدارة المنتجات</h2>
                  <p className="text-slate-500 font-bold">تحكم كامل في مخزون متجرك الرقمي</p>
                </div>
                <button 
                  onClick={() => editingId ? resetForm() : setShowAddForm(!showAddForm)}
                  className={`${editingId || showAddForm ? 'bg-slate-700' : 'bg-cyan-600 hover:bg-cyan-500'} text-white p-4 rounded-2xl flex items-center gap-2 font-black transition-all`}
                >
                  {showAddForm || editingId ? <X size={20} /> : <Plus size={20} />}
                  <span>{editingId ? 'إلغاء التعديل' : (showAddForm ? 'إلغاء' : 'إضافة منتج جديد')}</span>
                </button>
              </div>

              {(showAddForm || editingId) && (
                <div className="bg-slate-900 p-8 rounded-3xl border-2 border-cyan-500/20 animate-in fade-in slide-in-from-top-4 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-cyan-500/20 p-3 rounded-2xl text-cyan-500">
                      {editingId ? <Edit3 size={24} /> : <Plus size={24} />}
                    </div>
                    <h3 className="text-2xl font-black">{editingId ? 'تعديل المنتج الحالي' : 'إضافة منتج رقمي جديد'}</h3>
                  </div>
                  
                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">اسم المنتج</label>
                      <input required className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="مثال: اشتراك نتفليكس 4K" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">السعر (MAD)</label>
                      <input required type="number" className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">التصنيف</label>
                      <select className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                        {CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">رابط الصورة الرئيسية</label>
                      <div className="relative">
                        <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input className="w-full bg-slate-800 border border-slate-700 pr-12 pl-4 py-4 rounded-xl outline-none focus:border-cyan-500 text-ltr" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-400">رابط صورة إضافية (اختياري)</label>
                      <div className="relative">
                        <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input className="w-full bg-slate-800 border border-slate-700 pr-12 pl-4 py-4 rounded-xl outline-none focus:border-cyan-500 text-ltr" placeholder="https://..." value={newProduct.additionalImage} onChange={e => setNewProduct({...newProduct, additionalImage: e.target.value})} />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="block text-sm font-bold text-slate-400">وصف المنتج المفصل</label>
                      <textarea rows={4} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="اشرح للعميل مميزات هذا المنتج الرقمي وكيفية الاستلام..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                    </div>

                    <div className="md:col-span-2 flex gap-4 pt-4">
                      <button type="submit" className="flex-1 bg-cyan-600 text-white p-5 rounded-2xl font-black text-xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3">
                        <CheckCircle size={24} />
                        {editingId ? 'تحديث بيانات المنتج' : 'حفظ ونشر في المتجر'}
                      </button>
                      {editingId && (
                        <button type="button" onClick={resetForm} className="bg-slate-800 text-slate-300 px-8 rounded-2xl font-bold hover:bg-slate-700 transition-all">إلغاء</button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                   <h4 className="font-black text-slate-400 flex items-center gap-2"><Database size={18} /> قائمة المنتجات ({ads.length})</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="p-6">المنتج</th>
                        <th className="p-6">التصنيف</th>
                        <th className="p-6">السعر</th>
                        <th className="p-6">صور</th>
                        <th className="p-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ads.map(ad => (
                        <tr key={ad.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <img src={ad.thumbnail} className="w-14 h-14 rounded-xl object-cover border border-slate-700" />
                              <div>
                                <div className="font-black text-white">{ad.title}</div>
                                <div className="text-[10px] text-slate-500 font-mono">ID: {ad.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold border border-slate-700">{ad.category}</span>
                          </td>
                          <td className="p-6 font-black text-cyan-400 text-lg">{ad.price} <small className="text-[10px]">MAD</small></td>
                          <td className="p-6">
                            <div className="flex -space-x-3 rtl:space-x-reverse">
                              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                <img src={ad.thumbnail} className="w-full h-full object-cover" />
                              </div>
                              {ad.additionalImage && (
                                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                  <img src={ad.additionalImage} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => startEdit(ad)}
                                className="bg-cyan-500/10 text-cyan-500 p-2.5 rounded-xl hover:bg-cyan-500 hover:text-white transition-all"
                                title="تعديل"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => deleteProduct(ad.id)} 
                                className="bg-rose-500/10 text-rose-500 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                title="حذف"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {ads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-600">
                               <Database size={48} className="opacity-20" />
                               <p className="font-bold">لا توجد منتجات حالياً، ابدأ بإضافة منتجك الأول.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-5xl mx-auto space-y-8 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg">
                   <p className="text-slate-500 font-bold text-sm mb-2">إجمالي الطلبات</p>
                   <p className="text-4xl font-black text-white">{orders.length}</p>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg border-b-4 border-b-cyan-500">
                   <p className="text-slate-500 font-bold text-sm mb-2">الطلبات المسلمة</p>
                   <p className="text-4xl font-black text-cyan-500">{orders.length}</p>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg">
                   <p className="text-slate-500 font-bold text-sm mb-2">إجمالي المبيعات</p>
                   <p className="text-4xl font-black text-white">{orders.reduce((a,b)=>a+b.amount, 0)} <small className="text-sm font-bold">د.م</small></p>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-800/30 font-black flex items-center gap-2"><DollarSign size={18} /> سجل المبيعات</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-800/50 text-[10px] uppercase font-black text-slate-500">
                      <tr>
                        <th className="p-6">ID الطلب</th>
                        <th className="p-6">المنتج</th>
                        <th className="p-6">العميل</th>
                        <th className="p-6">البريد الإلكتروني</th>
                        <th className="p-6">المبلغ</th>
                        <th className="p-6">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.map(o => (
                        <tr key={o.id} className="text-sm font-bold hover:bg-slate-800/20 transition-all">
                          <td className="p-6 font-mono text-xs text-slate-500">{o.id}</td>
                          <td className="p-6 text-white">{o.productTitle}</td>
                          <td className="p-6 text-slate-400">{o.customerName}</td>
                          <td className="p-6 text-cyan-400 font-mono text-ltr">{o.city}</td>
                          <td className="p-6 font-black">{o.amount} MAD</td>
                          <td className="p-6">
                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black border border-green-500/20">مدفوع ومسلم</span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-20 text-center text-slate-600 font-bold italic">لا توجد مبيعات مسجلة بعد.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product View / Checkout Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedAd(null)} />
          <div className="bg-slate-900 w-full max-w-5xl rounded-[3.5rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedAd(null)} className="absolute top-8 left-8 z-[110] bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full transition-all"><X size={20} /></button>
            
            <div className="md:w-2/5 bg-slate-950 p-10 flex flex-col items-center gap-6 border-l border-slate-800">
              <div className="space-y-4 w-full">
                <img src={selectedAd.thumbnail} className="w-full aspect-square rounded-3xl shadow-2xl object-cover border border-slate-800" />
                {selectedAd.additionalImage && (
                  <img src={selectedAd.additionalImage} className="w-full aspect-video rounded-2xl shadow-xl object-cover border border-slate-800" />
                )}
              </div>
              <div className="text-center w-full bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-black text-white mb-2">{selectedAd.title}</h3>
                <p className="text-4xl font-black text-cyan-400">{selectedAd.price} <small className="text-lg">د.م</small></p>
              </div>
            </div>

            <div className="md:w-3/5 p-14 bg-slate-900 overflow-y-auto max-h-[90vh] no-scrollbar">
              {showCheckout ? (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="bg-cyan-500 p-3 rounded-2xl text-white shadow-lg shadow-cyan-500/20"><ShoppingCart size={28} /></div>
                    <h2 className="text-4xl font-black text-white">إتمام الطلب</h2>
                  </div>
                  
                  {orderSuccess ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-[3rem] border border-cyan-500/20">
                      <div className="w-24 h-24 bg-cyan-500/20 text-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle size={48} className="animate-bounce" /></div>
                      <h3 className="text-3xl font-black mb-4">تم الطلب بنجاح!</h3>
                      <p className="text-slate-400 font-bold text-lg">شكراً لثقتك بنا. سيصلك رابط المنتج على بريدك الإلكتروني فوراً.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-500 mr-2">الاسم الكامل</label>
                         <input required placeholder="اكتب اسمك هنا..." className="w-full bg-slate-800 border border-slate-700 p-6 rounded-2xl outline-none text-white font-bold focus:border-cyan-500 transition-all shadow-inner" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-500 mr-2">البريد الإلكتروني (هام جداً)</label>
                         <input required type="email" placeholder="example@email.com" className="w-full bg-slate-800 border border-slate-700 p-6 rounded-2xl outline-none text-white font-bold text-ltr focus:border-cyan-500 transition-all shadow-inner" value={checkoutData.email} onChange={e => setCheckoutData({...checkoutData, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-500 mr-2">رقم الهاتف</label>
                         <input required placeholder="06XXXXXXXX" className="w-full bg-slate-800 border border-slate-700 p-6 rounded-2xl outline-none text-white font-bold text-ltr focus:border-cyan-500 transition-all shadow-inner" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                      </div>
                      <button type="submit" disabled={isOrdering} className="w-full bg-cyan-600 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-900/40 mt-10 flex items-center justify-center gap-4 group">
                        {isOrdering ? <Loader2 className="animate-spin" /> : (
                          <>
                            <span>تأكيد الشراء والاستلام</span>
                            <Zap size={24} className="group-hover:scale-125 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="bg-cyan-500/10 text-cyan-400 px-5 py-2 rounded-2xl text-xs font-black border border-cyan-500/20">{selectedAd.category}</span>
                    <span className="text-slate-500 font-black text-sm flex items-center gap-2"><Monitor size={16}/> تسليم رقمي فوري</span>
                  </div>
                  <h2 className="text-5xl font-black text-white mb-10 leading-tight">{selectedAd.title}</h2>
                  
                  <div className="space-y-6 flex-1">
                    <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-800">
                       <h4 className="text-slate-400 font-black text-sm mb-4 flex items-center gap-2"><Eye size={16} /> وصف المنتج:</h4>
                       <p className="text-slate-200 font-bold text-xl leading-relaxed whitespace-pre-line">
                         {selectedAd.description || 'لا يوجد وصف مفصل لهذا المنتج.'}
                       </p>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col gap-6">
                    <button onClick={() => setShowCheckout(true)} className="w-full bg-cyan-600 text-white py-8 rounded-[2.5rem] font-black text-3xl hover:bg-cyan-500 transition-all shadow-2xl flex items-center justify-center gap-4 group">
                      <ShoppingCart size={32} /> شراء المنتج الآن
                    </button>
                    <div className="flex items-center justify-center gap-8 text-slate-500 font-black text-[11px] uppercase tracking-wider">
                       <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> دفع مشفر وآمن</div>
                       <div className="flex items-center gap-2"><Mail size={18} className="text-cyan-500" /> دعم فني 24/7</div>
                    </div>
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
