
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
    "توليد صور احترافية مطابقة لكل منتج بالذكاء الاصطناعي...",
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
      return part ? `data:image/png;base64,${part.inlineData.data}` : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
    } catch (e) {
      return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
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
          videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4',
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
          {isSidebarOpen && <h1 className="text-xl font-black text-slate-800">ترند ماينيا</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'ads', label: 'مكتبة الإعلانات', icon: Smartphone },
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
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isSidebarOpen && <span>توليد تريندات بالذكاء</span>}
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
              placeholder="ابحث عن منتج أو إعلان..."
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
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 border border-white shadow-sm" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <Loader2 size={80} className="text-indigo-600 animate-spin" />
                <Sparkles size={32} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">جاري تحليل السوق...</h2>
              <p className="text-indigo-600 font-bold text-lg animate-pulse">{loadingMessages[loadingStep]}</p>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      {ad.isWinning && (
                        <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                          <Crown size={12} />
                          رابح
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg">
                       <span className="text-[10px] font-bold text-slate-800 uppercase">{PLATFORM_LABELS[ad.platform]}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{ad.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-2 h-14 leading-tight">{ad.title}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-black text-indigo-600">{ad.price} <small className="text-sm">د.م</small></span>
                      <button className="bg-slate-100 text-slate-700 p-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package size={24} /></div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
                  </div>
                  <h4 className="text-slate-500 font-medium mb-1">إجمالي الطلبات</h4>
                  <p className="text-4xl font-black text-slate-800">{orders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><DollarSign size={24} /></div>
                  </div>
                  <h4 className="text-slate-500 font-medium mb-1">المبيعات الإجمالية</h4>
                  <p className="text-4xl font-black text-slate-800">{orders.reduce((acc, curr) => acc + curr.amount, 0)} <small className="text-lg">د.م</small></p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BarChart3 size={24} /></div>
                  </div>
                  <h4 className="text-slate-500 font-medium mb-1">معدل التحويل</h4>
                  <p className="text-4xl font-black text-slate-800">3.2%</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-xl">الطلبات الأخيرة</h3>
                  <div className="flex gap-2">
                    <button className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                       <Database size={16} /> تصدير لـ Sheets
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="px-6 py-5">رقم الطلب</th>
                        <th className="px-6 py-5">المنتج</th>
                        <th className="px-6 py-5">الزبون</th>
                        <th className="px-6 py-5">المدينة</th>
                        <th className="px-6 py-5">المبلغ</th>
                        <th className="px-6 py-5">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.length > 0 ? orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-indigo-600">{order.id}</td>
                          <td className="px-6 py-4">{order.productTitle}</td>
                          <td className="px-6 py-4 font-medium">{order.customerName}</td>
                          <td className="px-6 py-4">{order.city}</td>
                          <td className="px-6 py-4 font-black">{order.amount} د.م</td>
                          <td className="px-6 py-4">
                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">قيد الانتظار</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-400">لا توجد طلبات لعرضها حالياً</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Globe className="text-indigo-600" /> إعدادات تتبع البكسل</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Facebook className="text-blue-600" size={16} /> Facebook Pixel ID</label>
                    <input 
                      type="text" 
                      placeholder="أدخل ID بكسل فيسبوك هنا..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      value={pixelConfig.facebook || ''}
                      onChange={(e) => {
                        const newPixels = {...pixelConfig, facebook: e.target.value};
                        setPixelConfig(newPixels);
                        localStorage.setItem('pixels', JSON.stringify(newPixels));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Globe className="text-orange-500" size={16} /> Google Analytics / G-Pixel</label>
                    <input 
                      type="text" 
                      placeholder="G-XXXXXXXXXX" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={pixelConfig.google || ''}
                      onChange={(e) => {
                        const newPixels = {...pixelConfig, google: e.target.value};
                        setPixelConfig(newPixels);
                        localStorage.setItem('pixels', JSON.stringify(newPixels));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Video className="text-black" size={16} /> TikTok Pixel ID</label>
                    <input 
                      type="text" 
                      placeholder="أدخل ID بكسل تيك توك هنا..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Database className="text-indigo-600" /> ربط الطلبات (Google Sheets)</h3>
                <div className="p-6 bg-indigo-50 rounded-[1.5rem] border border-indigo-100 mb-6">
                   <p className="text-sm text-indigo-800 leading-relaxed font-bold">
                     عند تفعيل هذا الخيار، سيتم إرسال كل طلب جديد تلقائياً إلى ملف Excel الخاص بك في Google Sheets لتسهيل عملية التأكيد والشحن.
                   </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input type="text" placeholder="رابط الـ Webhook الخاص بجوجل شيت..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-colors">تحديث الربط</button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-black mb-6">أكواد تتبع إضافية (JS)</h3>
                <textarea 
                  rows={6}
                  placeholder="<script> ... </script>"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                <button className="mt-4 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">حفظ الأكواد</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal & Video Player */}
      {selectedAd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedAd(null)} />
          <div className="bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedAd(null)}
              className="absolute top-6 left-6 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white md:text-slate-500 p-2.5 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="md:w-1/2 bg-black flex items-center justify-center relative overflow-hidden group">
              <video 
                key={selectedAd.id}
                className="w-full h-full object-contain"
                src={selectedAd.videoUrl}
                autoPlay
                loop
                controls
                playsInline
              />
              <div className="absolute top-6 right-6">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex flex-col items-center gap-2 text-white border border-white/20">
                   <div className="flex flex-col items-center">
                     <Facebook size={16} />
                     <span className="text-[10px] font-bold">12K</span>
                   </div>
                   <div className="w-full h-px bg-white/20" />
                   <div className="flex flex-col items-center">
                     <Instagram size={16} />
                     <span className="text-[10px] font-bold">5K</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col custom-scrollbar bg-white">
              {showCheckout ? (
                <div className="h-full flex flex-col">
                  <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">إتمام الطلب <ShoppingCart className="text-indigo-600" /></h2>
                  {orderSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100">
                        <CheckCircle size={48} className="animate-bounce" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-2">تم استلام طلبك!</h3>
                      <p className="text-slate-500 font-bold">سنتواصل معك في أقل من 24 ساعة لتأكيد الشحن.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-6 flex-1">
                      <div className="bg-indigo-50 p-6 rounded-[2rem] flex items-center gap-4 border border-indigo-100 mb-6">
                        <img src={selectedAd.thumbnail} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                        <div>
                          <h4 className="font-bold text-slate-800 line-clamp-1">{selectedAd.title}</h4>
                          <p className="text-indigo-600 font-black text-xl">{selectedAd.price} د.م</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><User size={16} /> الاسم الكامل</label>
                        <input 
                          required
                          type="text" 
                          placeholder="أدخل اسمك الكامل هنا..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={checkoutData.name}
                          onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><MapPin size={16} /> المدينة</label>
                        <input 
                          required
                          type="text" 
                          placeholder="المدينة (مثال: الدار البيضاء)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={checkoutData.city}
                          onChange={e => setCheckoutData({...checkoutData, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Phone size={16} /> رقم الهاتف</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="06XXXXXXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-ltr"
                          value={checkoutData.phone}
                          onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})}
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isOrdering}
                        className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                        {isOrdering ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        تأكيد الطلب الآن
                      </button>
                      <button onClick={() => setShowCheckout(false)} className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors">إلغاء والعودة</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">{selectedAd.category}</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-sm font-bold"><MapPin size={16} /> {COUNTRY_LABELS[selectedAd.country]}</span>
                  </div>
                  
                  <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{selectedAd.title}</h2>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl font-black text-indigo-600">{selectedAd.price} <small className="text-xl">د.م</small></span>
                    <div className="flex flex-col">
                      <span className="text-slate-400 line-through text-lg">{(selectedAd.price * 1.4).toFixed(0)} د.م</span>
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black text-center">-40% خصم اليوم</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-8 rounded-[2rem] mb-10 border border-slate-100 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                    <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Sparkles size={20} className="text-indigo-600" /> لمحة عن المنتج:</h4>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                      {selectedAd.description || 'هذا المنتج يعتبر من الأكثر مبيعاً حالياً نظراً لجودته العالية وتصميمه العصري الذي يسهل الحياة اليومية. تم اختباره من طرف خبراء التريندات لدينا وأظهر نتائج تفاعل مبهرة.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-emerald-50 p-5 rounded-[1.5rem] flex items-center gap-4 border border-emerald-100">
                      <ShieldCheck className="text-emerald-600" size={28} />
                      <div>
                        <p className="text-xs font-black text-emerald-800">ضمان الجودة</p>
                        <p className="text-[10px] text-emerald-600 font-bold">منتج أصلي 100%</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-[1.5rem] flex items-center gap-4 border border-blue-100">
                      <Package className="text-blue-600" size={28} />
                      <div>
                        <p className="text-xs font-black text-blue-800">توصيل سريع</p>
                        <p className="text-[10px] text-blue-600 font-bold">24-48 ساعة عمل</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 mt-auto"
                  >
                    <ShoppingCart />
                    اطلب الآن - الدفع عند الاستلام
                  </button>
                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 font-bold">
                    <ShieldCheck size={16} />
                    <span className="text-xs">تسوق آمن وموثوق بمعدل تقييم 4.9/5</span>
                  </div>
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
