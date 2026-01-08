
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Search, Filter, Video, Facebook, Instagram, Calendar, 
  Eye, MapPin, Crown, Sparkles, Loader2, RefreshCw, ShoppingCart, 
  X, CheckCircle, Package, Settings, BarChart3, Globe, ShieldCheck,
  Smartphone, User, Phone, Map, DollarSign, LayoutDashboard, Database
} from 'lucide-react';
import { TrendingAd, FilterState, Country, Order, PixelConfig } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS, PLATFORM_LABELS, CATEGORIES } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'winning' | 'dashboard' | 'settings'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [ads, setAds] = useState<TrendingAd[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pixelConfig, setPixelConfig] = useState<PixelConfig>({});
  
  // Modal & Selection
  const [selectedAd, setSelectedAd] = useState<TrendingAd | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', city: '', phone: '' });
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    platform: 'all',
    country: 'all',
    category: 'الكل',
    sortBy: 'views'
  });

  const loadingMessages = [
    "جاري البحث عن الفيديوهات الإعلانية الأكثر مبيعاً...",
    "تحليل تفاعل الجمهور في منصات التواصل الاجتماعي...",
    "استخراج تفاصيل المنتجات وتوليد الصور...",
    "تجهيز صفحة الهبوط الخاصة بكل منتج..."
  ];

  useEffect(() => {
    const savedAds = localStorage.getItem('trending_ads');
    const savedOrders = localStorage.getItem('orders');
    const savedPixels = localStorage.getItem('pixels');
    
    if (savedAds) setAds(JSON.parse(savedAds)); else setAds(MOCK_TRENDS);
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedPixels) setPixelConfig(JSON.parse(savedPixels));
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAiLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  const generateProductImage = async (ai: any, title: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Professional high-quality e-commerce product photography of ${title}, white background, studio lighting, 4k.` }]
        },
        config: { imageConfig: { aspectRatio: "4:3" } }
      });
      const part = response.candidates[0].content.parts.find((p: any) => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : `https://loremflickr.com/600/450/${encodeURIComponent(title)}`;
    } catch (e) {
      return `https://loremflickr.com/600/450/${encodeURIComponent(title)}`;
    }
  };

  const discoverRealTrends = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const textPrompt = `Find 4 high-demand products for dropshipping in Morocco and Gulf. 
      Return JSON array: [{id, title_ar, title_en, price_mad, description_ar, platform, country, views, category}]`;

      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: textPrompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
      });

      const rawData = JSON.parse(res.text || "[]");
      const processed: TrendingAd[] = [];

      for (const item of rawData) {
        const imageUrl = await generateProductImage(ai, item.title_en);
        processed.push({
          id: item.id || Math.random().toString(36).substr(2, 9),
          title: item.title_ar,
          thumbnail: imageUrl,
          videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4', // Realistic placeholder
          price: item.price_mad || 299,
          description: item.description_ar,
          platform: item.platform || 'tiktok',
          country: item.country || 'MA',
          views: item.views || 500000,
          likes: Math.floor(item.views * 0.05),
          shares: Math.floor(item.views * 0.005),
          category: item.category || 'إلكترونيات',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isWinning: true
        });
      }
      
      setAds(prev => {
        const combined = [...processed, ...prev];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        localStorage.setItem('trending_ads', JSON.stringify(unique.slice(0, 30)));
        return unique.slice(0, 30);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    setIsOrdering(true);
    
    setTimeout(() => {
      const newOrder: Order = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        customerName: checkoutData.name,
        city: checkoutData.city,
        phone: checkoutData.phone,
        productId: selectedAd.id,
        productTitle: selectedAd.title,
        amount: selectedAd.price,
        date: new Date().toLocaleDateString('ar-MA'),
        status: 'pending'
      };
      
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      setIsOrdering(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
        setSelectedAd(null);
      }, 2500);
    }, 1500);
  };

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchSearch = ad.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchPlatform = filters.platform === 'all' || ad.platform === filters.platform;
      const matchCategory = filters.category === 'الكل' || ad.category === filters.category;
      return matchSearch && matchPlatform && matchCategory;
    });
  }, [filters, ads]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0 shadow-xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black text-slate-800">متجري</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'ads', label: 'الرئيسية', icon: Smartphone },
            { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
          
          {activeTab === 'ads' && (
            <button
              onClick={discoverRealTrends}
              disabled={isAiLoading}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isSidebarOpen && <span>توليد منتجات رابحة</span>}
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
              <ShoppingCart size={16} />
              <span>{orders.length} طلبات</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center">
              <Loader2 size={64} className="text-indigo-600 animate-spin mb-6" />
              <h2 className="text-3xl font-black text-slate-800 mb-2">جاري البحث عن الكنوز...</h2>
              <p className="text-indigo-600 font-bold text-lg animate-pulse">{loadingMessages[loadingStep]}</p>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                        <Crown size={12} />
                        رابح
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{ad.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">{ad.title}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-black text-indigo-600">{ad.price} <small className="text-sm">د.م</small></span>
                      <button className="bg-slate-100 text-slate-700 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package size={24} /></div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
                  </div>
                  <h4 className="text-slate-500 font-medium mb-1">إجمالي الطلبات</h4>
                  <p className="text-3xl font-black text-slate-800">{orders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><DollarSign size={24} /></div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+5%</span>
                  </div>
                  <h4 className="text-slate-500 font-medium mb-1">المبيعات الإجمالية</h4>
                  <p className="text-3xl font-black text-slate-800">{orders.reduce((acc, curr) => acc + curr.amount, 0)} <small className="text-lg">د.م</small></p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BarChart3 size={24} /></div>
                  </div>
                  <h4 className="text-slate-500 font-medium mb-1">طلبات اليوم</h4>
                  <p className="text-3xl font-black text-slate-800">0</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-xl">قائمة الطلبات الأخيرة</h3>
                  <button className="text-sm font-bold text-indigo-600 hover:underline">تصدير لـ Google Sheets</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="px-6 py-4">رقم الطلب</th>
                        <th className="px-6 py-4">المنتج</th>
                        <th className="px-6 py-4">الزبون</th>
                        <th className="px-6 py-4">المدينة</th>
                        <th className="px-6 py-4">الهاتف</th>
                        <th className="px-6 py-4">المبلغ</th>
                        <th className="px-6 py-4">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.length > 0 ? orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-indigo-600">{order.id}</td>
                          <td className="px-6 py-4">{order.productTitle}</td>
                          <td className="px-6 py-4 font-medium">{order.customerName}</td>
                          <td className="px-6 py-4">{order.city}</td>
                          <td className="px-6 py-4 text-ltr">{order.phone}</td>
                          <td className="px-6 py-4 font-bold">{order.amount} د.م</td>
                          <td className="px-6 py-4">
                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">قيد الانتظار</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center text-slate-400">لا توجد طلبات حالياً</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Globe className="text-indigo-600" /> إعدادات البكسل (Pixels)</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Facebook Pixel ID</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 1234567890" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={pixelConfig.facebook || ''}
                      onChange={(e) => {
                        const newPixels = {...pixelConfig, facebook: e.target.value};
                        setPixelConfig(newPixels);
                        localStorage.setItem('pixels', JSON.stringify(newPixels));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Google Analytics / Google Pixel</label>
                    <input 
                      type="text" 
                      placeholder="Ex: G-XXXXXXXXXX" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={pixelConfig.google || ''}
                      onChange={(e) => {
                        const newPixels = {...pixelConfig, google: e.target.value};
                        setPixelConfig(newPixels);
                        localStorage.setItem('pixels', JSON.stringify(newPixels));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">TikTok Pixel ID</label>
                    <input 
                      type="text" 
                      placeholder="Ex: CXXXXXXXXXXXX" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={pixelConfig.tiktok || ''}
                      onChange={(e) => {
                        const newPixels = {...pixelConfig, tiktok: e.target.value};
                        setPixelConfig(newPixels);
                        localStorage.setItem('pixels', JSON.stringify(newPixels));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Database className="text-indigo-600" /> إعدادات الربط</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle size={20} /></div>
                    <div>
                      <h4 className="font-bold">Google Sheets</h4>
                      <p className="text-sm text-slate-500">مفعل - يتم إرسال الطلبات تلقائياً</p>
                    </div>
                  </div>
                  <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold">تغيير الرابط</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Details Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedAd(null)} />
          <div className="bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 fade-in duration-300">
            <button 
              onClick={() => setSelectedAd(null)}
              className="absolute top-6 left-6 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white md:text-slate-500 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* Video Player Section */}
            <div className="md:w-1/2 bg-black flex items-center justify-center relative group">
              <video 
                className="w-full h-full object-contain"
                src={selectedAd.videoUrl || 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4'}
                autoPlay
                loop
                controls
                playsInline
              />
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                 <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex flex-col items-center gap-1 text-white">
                   <Facebook size={18} />
                   <span className="text-[10px] font-bold">12K</span>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex flex-col items-center gap-1 text-white">
                   <Instagram size={18} />
                   <span className="text-[10px] font-bold">5K</span>
                 </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col">
              {showCheckout ? (
                <div className="h-full flex flex-col animate-in slide-in-from-left-4 duration-300">
                  <h2 className="text-3xl font-black text-slate-800 mb-8">إتمام الطلب 🛒</h2>
                  {orderSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle size={48} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">تم استلام طلبك بنجاح!</h3>
                      <p className="text-slate-500">سنتصل بك قريباً لتأكيد المعلومات.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-6 flex-1">
                      <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-4 border border-indigo-100 mb-6">
                        <img src={selectedAd.thumbnail} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-800 line-clamp-1">{selectedAd.title}</h4>
                          <p className="text-indigo-600 font-black">{selectedAd.price} د.م</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><User size={16} /> الاسم الكامل</label>
                        <input 
                          required
                          type="text" 
                          placeholder="أدخل اسمك الكامل"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={checkoutData.name}
                          onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin size={16} /> المدينة</label>
                        <input 
                          required
                          type="text" 
                          placeholder="المدينة"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={checkoutData.city}
                          onChange={e => setCheckoutData({...checkoutData, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Phone size={16} /> رقم الهاتف</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="06XXXXXXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                          value={checkoutData.phone}
                          onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})}
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isOrdering}
                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {isOrdering ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
                        تأكيد الطلب الآن
                      </button>
                    </form>
                  )}
                  {!orderSuccess && (
                    <button onClick={() => setShowCheckout(false)} className="mt-4 text-slate-400 font-bold hover:text-slate-600">العودة للتفاصيل</button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase">{selectedAd.category}</span>
                    <span className="text-slate-300 mx-2">|</span>
                    <span className="flex items-center gap-1 text-slate-500 text-sm font-bold"><MapPin size={14} /> {COUNTRY_LABELS[selectedAd.country]}</span>
                  </div>
                  
                  <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{selectedAd.title}</h2>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-black text-indigo-600">{selectedAd.price} <small className="text-lg">د.م</small></span>
                    <span className="text-slate-400 line-through text-xl">{(selectedAd.price * 1.5).toFixed(0)} د.م</span>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-black">-33% خصم</span>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                    <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2"><Sparkles size={18} className="text-indigo-600" /> وصف المنتج:</h4>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {selectedAd.description || 'هذا المنتج يعتبر من أكثر المنتجات طلباً في السوق حالياً نظراً لجودته العالية وتصميمه المبتكر الذي يحل مشاكل المستخدم اليومية بطريقة ذكية.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3">
                      <ShieldCheck className="text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-800">ضمان لمدة سنة</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3">
                      <Package className="text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">توصيل مجاني بالمغرب</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                  >
                    <ShoppingCart />
                    اطلب الآن - الدفع عند الاستلام
                  </button>
                  <p className="text-center mt-4 text-slate-400 text-sm font-bold">انضم لأكثر من +1200 زبون سعيد!</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
