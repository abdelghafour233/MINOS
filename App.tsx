
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Search, Filter, Video, Facebook, Instagram, Calendar, 
  Eye, MapPin, Crown, Sparkles, Loader2, RefreshCw, ShoppingCart, 
  X, CheckCircle, Package, Settings, BarChart3, Globe, ShieldCheck,
  Smartphone, User, Phone, Map, DollarSign, LayoutDashboard, Database,
  ExternalLink, Youtube, Play
} from 'lucide-react';
import { TrendingAd, FilterState, Country, Order, PixelConfig } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS, PLATFORM_LABELS, CATEGORIES } from './constants';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'winning' | 'dashboard' | 'settings'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [ads, setAds] = useState<TrendingAd[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pixelConfig, setPixelConfig] = useState<PixelConfig>({});
  
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
    "جاري الاتصال بقواعد بيانات التريندات العالمية...",
    "تحليل تفاعل الجمهور على TikTok و Facebook...",
    "توليد صور احترافية مطابقة للمنتجات المكتشفة...",
    "تجهيز روابط البحث المباشرة عن الإعلانات..."
  ];

  useEffect(() => {
    const savedAds = localStorage.getItem('trending_ads');
    const savedOrders = localStorage.getItem('orders');
    const savedPixels = localStorage.getItem('pixels');
    
    if (savedAds) {
      try { setAds(JSON.parse(savedAds)); } catch(e) { setAds(MOCK_TRENDS); }
    } else {
      setAds(MOCK_TRENDS);
    }
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedPixels) setPixelConfig(JSON.parse(savedPixels));
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAiLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  const generateProductImage = async (ai: any, title: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `High-quality, professional studio photography of ${title} for e-commerce, isolated on clean white background, commercial lighting, 4k resolution.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
    } catch (e) {
      console.error("Image generation failed:", e);
      return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
    }
  };

  const discoverRealTrends = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setLoadingStep(0);

    try {
      // 1. تأكد من تهيئة الـ API بشكل صحيح
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Find 6 highly trending Winning Products for dropshipping in Morocco and GCC (Saudi Arabia, UAE) for mid-2024.
      Focus on viral products with high problem-solving capacity or aesthetic appeal.`;

      // 2. استخدم استدعاء API أكثر استقراراً مع responseSchema
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title_ar: { type: Type.STRING },
                title_en: { type: Type.STRING },
                price_mad: { type: Type.NUMBER },
                description_ar: { type: Type.STRING },
                platform: { type: Type.STRING },
                country: { type: Type.STRING },
                category: { type: Type.STRING },
                views: { type: Type.NUMBER }
              },
              required: ["id", "title_ar", "title_en", "price_mad", "description_ar", "platform", "country", "category"]
            }
          },
          tools: [{ googleSearch: {} }] 
        }
      });

      const rawData = JSON.parse(res.text || "[]");
      
      if (!Array.isArray(rawData)) throw new Error("Format is not an array");

      const processed: TrendingAd[] = [];

      // جلب البيانات ومعالجة الصور بشكل متتابع لضمان الاستقرار
      for (const item of rawData) {
        const imageUrl = await generateProductImage(ai, item.title_en || item.title_ar);
        
        processed.push({
          id: item.id || Math.random().toString(36).substr(2, 9),
          title: item.title_ar || "منتج ترند جديد",
          thumbnail: imageUrl,
          videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4',
          price: item.price_mad || 349,
          description: item.description_ar || "هذا المنتج يحقق مبيعات خيالية حالياً في الأسواق العربية.",
          platform: (item.platform?.toLowerCase() === 'tiktok' ? 'tiktok' : 'facebook') as any,
          country: (['MA', 'SA', 'AE', 'KW', 'EG'].includes(item.country) ? item.country : 'MA') as any,
          views: item.views || Math.floor(Math.random() * 500000) + 100000,
          likes: Math.floor(Math.random() * 20000),
          shares: Math.floor(Math.random() * 3000),
          category: item.category || 'إلكترونيات',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isWinning: true
        });
      }
      
      setAds(prev => {
        const unique = [...processed, ...prev].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        localStorage.setItem('trending_ads', JSON.stringify(unique.slice(0, 50)));
        return unique.slice(0, 50);
      });
      
      setActiveTab('ads');
    } catch (error) {
      console.error("API Error Details:", error);
      alert("عذراً، لم نتمكن من جلب التريندات حالياً. تأكد من اتصال الإنترنت وحاول مرة أخرى.");
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
      }, 2000);
    }, 1500);
  };

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchSearch = ad.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchPlatform = filters.platform === 'all' || ad.platform === filters.platform;
      return matchSearch && matchPlatform;
    });
  }, [filters, ads]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0 shadow-xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black text-slate-800 tracking-tight">ترند ماينيا</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'ads', label: 'الرئيسية', icon: Smartphone },
            { id: 'dashboard', label: 'الطلبات', icon: LayoutDashboard },
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
          
          <button
            onClick={discoverRealTrends}
            disabled={isAiLoading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 group"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
            {isSidebarOpen && <span>تحديث التريندات</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن منتج رابح..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border border-green-100">
              Live Market Sync
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative no-scrollbar bg-[#F8FAFC]">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
              <div className="relative mb-10 scale-125">
                <Loader2 size={80} className="text-indigo-600 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={32} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">جاري استخراج التريندات...</h2>
              <p className="text-indigo-600 font-bold text-xl h-8">{loadingMessages[loadingStep]}</p>
              <div className="mt-12 w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000" 
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
              {filteredAds.length > 0 ? filteredAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col"
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-5 left-5">
                      <div className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-xl">
                        <Crown size={14} />
                        رابح
                      </div>
                    </div>
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">{ad.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-400">{COUNTRY_LABELS[ad.country]}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 line-clamp-2 h-14 leading-[1.3] group-hover:text-indigo-600 transition-colors">{ad.title}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-indigo-600">{ad.price} <small className="text-sm font-bold">د.م</small></span>
                      </div>
                      <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-indigo-200">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-32">
                  <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-slate-300" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد منتجات حالياً</h3>
                  <p className="text-slate-500 font-medium">اضغط على زر "تحديث التريندات" للبحث عن منتجات رابحة جديدة بالذكاء الاصطناعي</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <p className="text-slate-400 font-bold text-sm mb-2 flex items-center gap-2"><Package size={16}/> إجمالي الطلبات</p>
                   <p className="text-5xl font-black tracking-tight">{orders.length}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <p className="text-slate-400 font-bold text-sm mb-2 flex items-center gap-2"><DollarSign size={16}/> المبيعات المتوقعة</p>
                   <p className="text-5xl font-black text-indigo-600 tracking-tight">{orders.reduce((a,b)=>a+b.amount, 0)} <small className="text-lg font-bold">د.م</small></p>
                 </div>
              </div>
              
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-2xl">سجل المبيعات والطلبات</h3>
                  <button onClick={() => { if(confirm('هل تريد مسح جميع الطلبات؟')) { localStorage.removeItem('orders'); setOrders([]); } }} className="text-xs text-red-400 font-black uppercase hover:text-red-600 transition-colors">مسح السجل بالكامل</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-right">
                      <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                         <tr>
                            <th className="p-8">المنتج المطلوب</th>
                            <th className="p-8">اسم الزبون</th>
                            <th className="p-8">المدينة</th>
                            <th className="p-8">المبلغ</th>
                            <th className="p-8">حالة الطلب</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {orders.length > 0 ? orders.map(o => (
                           <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="p-8">
                                <div className="font-bold text-slate-800 text-lg">{o.productTitle}</div>
                                <div className="text-[10px] text-slate-400 font-black mt-1">ID: {o.id}</div>
                             </td>
                             <td className="p-8 font-bold text-slate-600">{o.customerName}</td>
                             <td className="p-8 text-slate-500 font-medium">{o.city}</td>
                             <td className="p-8 font-black text-xl text-indigo-600">{o.amount} <small className="text-xs">د.م</small></td>
                             <td className="p-8">
                                <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-amber-200">في انتظار التاكيد</span>
                             </td>
                           </tr>
                         )) : (
                           <tr>
                             <td colSpan={5} className="p-24 text-center text-slate-300 font-black text-xl">لا توجد أي مبيعات مسجلة حتى الآن</td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
               <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-16 translate-x-16 opacity-50" />
                  <h3 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-900">
                    <Database className="text-indigo-600" /> إعدادات التتبع والربط
                  </h3>
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Facebook Pixel ID</label>
                           <input type="text" placeholder="1234567890..." className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono" defaultValue={pixelConfig.facebook} />
                        </div>
                        <div>
                           <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Google Analytics ID</label>
                           <input type="text" placeholder="G-XXXXXX..." className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono" defaultValue={pixelConfig.google} />
                        </div>
                     </div>
                     <div className="pt-6 border-t border-slate-100">
                        <button className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">حفظ التغييرات</button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setSelectedAd(null)} />
          <div className="bg-white w-full max-w-7xl h-full md:h-auto md:max-h-[92vh] rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-500 ease-out border border-white/10">
            <button onClick={() => setSelectedAd(null)} className="absolute top-8 left-8 z-[110] bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-md"><X size={28} /></button>
            
            <div className="md:w-1/2 bg-black flex flex-col items-center justify-center relative min-h-[350px]">
              <video 
                key={selectedAd.id}
                className="w-full h-full object-contain"
                src={selectedAd.videoUrl}
                autoPlay loop controls muted
              />
              <div className="absolute bottom-8 right-8 left-8 flex gap-4">
                <a 
                  href={`https://www.tiktok.com/search?q=${encodeURIComponent(selectedAd.title)}`} 
                  target="_blank" 
                  className="flex-1 bg-white/10 backdrop-blur-2xl text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-white/20 transition-all border border-white/10"
                >
                  <Video size={20} /> بحث TikTok
                </a>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedAd.title)}+review`} 
                  target="_blank" 
                  className="flex-1 bg-white/10 backdrop-blur-2xl text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-white/20 transition-all border border-white/10"
                >
                  <Youtube size={20} /> مراجعات
                </a>
              </div>
            </div>

            <div className="md:w-1/2 p-10 md:p-16 overflow-y-auto bg-white flex flex-col no-scrollbar">
              {showCheckout ? (
                <div className="animate-in slide-in-from-left-8 duration-500">
                  <h2 className="text-4xl font-black mb-10 text-slate-900 tracking-tight">إتمام الطلب 🛍️</h2>
                  {orderSuccess ? (
                    <div className="text-center py-24">
                      <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={56} className="animate-bounce" /></div>
                      <h3 className="text-4xl font-black mb-3 text-slate-900">شكراً لثقتك!</h3>
                      <p className="text-slate-500 font-bold text-xl">لقد استلمنا طلبك، وسنتواصل معك خلال 24 ساعة.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-8">
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center gap-6 mb-8 border border-slate-100">
                        <img src={selectedAd.thumbnail} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                        <div>
                          <p className="font-black text-lg text-slate-800 line-clamp-1">{selectedAd.title}</p>
                          <p className="text-indigo-600 font-black text-2xl">{selectedAd.price} <small className="text-xs">د.م</small></p>
                        </div>
                      </div>
                      <div className="space-y-5">
                        <input required placeholder="الاسم بالكامل" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                        <input required placeholder="المدينة" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold" value={checkoutData.city} onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} />
                        <input required placeholder="رقم الهاتف (واتساب)" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold text-ltr" type="tel" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                      </div>
                      <button type="submit" disabled={isOrdering} className="w-full bg-indigo-600 text-white py-8 rounded-[3rem] font-black text-3xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all mt-6">
                        {isOrdering ? <Loader2 className="animate-spin mx-auto" size={32} /> : 'تأكيد الطلب الآن'}
                      </button>
                      <button type="button" onClick={() => setShowCheckout(false)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors">إلغاء والعودة</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em]">{selectedAd.category}</span>
                    <span className="text-slate-200">|</span>
                    <span className="text-slate-500 font-black flex items-center gap-2 text-sm"><MapPin size={18} /> {COUNTRY_LABELS[selectedAd.country]}</span>
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 mb-8 leading-[1.15] tracking-tight">{selectedAd.title}</h2>
                  <div className="flex items-center gap-8 mb-12">
                    <span className="text-7xl font-black text-indigo-600 tracking-tighter">{selectedAd.price} <small className="text-2xl font-bold">د.م</small></span>
                    <div className="flex flex-col">
                       <span className="text-slate-300 line-through text-3xl">{(selectedAd.price * 1.6).toFixed(0)} د.م</span>
                       <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-black text-sm uppercase mt-1 self-start">توفير 40%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2.5 h-full bg-indigo-600" />
                    <h4 className="font-black text-slate-900 mb-5 text-xl flex items-center gap-3">
                      <Sparkles className="text-amber-500" /> لماذا هذا المنتج رابح؟
                    </h4>
                    <p className="text-slate-600 leading-[1.7] font-bold text-xl">
                      {selectedAd.description}
                    </p>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full bg-indigo-600 text-white py-10 rounded-[3.5rem] font-black text-3xl shadow-2xl shadow-indigo-100 hover:scale-[1.03] active:scale-95 transition-all mt-auto flex items-center justify-center gap-5">
                    <ShoppingCart size={32} /> اطلب الآن (الدفع عند الاستلام)
                  </button>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-slate-400 font-black text-xs opacity-70">
                     <div className="flex items-center gap-2"><ShieldCheck size={20} /> تسوق آمن 100%</div>
                     <div className="flex items-center gap-2"><Globe size={20} /> شحن سريع ومجاني</div>
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
