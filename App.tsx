
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
import { GoogleGenAI } from "@google/genai";

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

  // وظيفة تنظيف استجابة JSON من أي علامات Markdown
  const cleanJsonResponse = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  };

  const generateProductImage = async (ai: any, title: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `Professional commercial product photography of ${title}, high resolution, studio lighting, white background, 4k.` }] }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      const part = response.candidates[0].content.parts.find((p: any) => p.inlineData);
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const textPrompt = `Find 6 highly trending Winning Products for dropshipping in Morocco and Gulf countries (Saudi Arabia, UAE) for May 2024. 
      Return ONLY a JSON array of objects. 
      Structure: [{"id": "string", "title_ar": "اسم المنتج بالعربية", "title_en": "English name", "price_mad": number, "description_ar": "وصف جذاب", "platform": "tiktok"|"facebook", "country": "MA"|"SA"|"AE", "category": "electronics"|"home"|"beauty", "views": number}].
      Ensure the data is realistic and the JSON is valid.`;

      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: textPrompt }] }],
        config: { 
          tools: [{ googleSearch: {} }], 
          responseMimeType: "application/json" 
        }
      });

      const cleanedText = cleanJsonResponse(res.text || "[]");
      const rawData = JSON.parse(cleanedText);
      
      if (!Array.isArray(rawData)) throw new Error("Invalid response format");

      const processed: TrendingAd[] = [];

      for (const item of rawData) {
        // توليد صورة مخصصة لكل منتج
        const imageUrl = await generateProductImage(ai, item.title_en || item.title_ar);
        
        processed.push({
          id: item.id || Math.random().toString(36).substr(2, 9),
          title: item.title_ar || "منتج رائع",
          thumbnail: imageUrl,
          videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4',
          price: item.price_mad || 299,
          description: item.description_ar || "منتج ترند عالي الجودة متوفر حالياً.",
          platform: (item.platform as any) || 'tiktok',
          country: (item.country as any) || 'MA',
          views: item.views || Math.floor(Math.random() * 1000000),
          likes: Math.floor(Math.random() * 50000),
          shares: Math.floor(Math.random() * 5000),
          category: item.category || 'إلكترونيات',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isWinning: true
        });
      }
      
      setAds(prev => {
        const unique = [...processed, ...prev].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        localStorage.setItem('trending_ads', JSON.stringify(unique.slice(0, 40)));
        return unique.slice(0, 40);
      });
      
      setActiveTab('ads'); // العودة لصفحة الإعلانات بعد التحديث
    } catch (error) {
      console.error("Error discovering trends:", error);
      alert("عذراً، حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.");
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
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
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
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all disabled:opacity-50 group active:scale-95"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
              Live Monitoring
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative no-scrollbar bg-[#F8FAFC]">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center p-6">
              <div className="relative mb-8">
                <Loader2 size={100} className="text-indigo-600 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={40} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">جاري استخراج البيانات...</h2>
              <p className="text-indigo-600 font-bold text-xl animate-bounce">{loadingMessages[loadingStep]}</p>
              <p className="mt-10 text-slate-400 text-sm max-w-sm">نحن نستخدم الذكاء الاصطناعي لمسح الويب واكتشاف المنتجات الأكثر طلباً في الأسواق العربية حالياً.</p>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAds.length > 0 ? filteredAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col"
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                        <Crown size={12} />
                        رابح
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{ad.category}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] font-bold text-slate-500">{COUNTRY_LABELS[ad.country]}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-2 h-14 leading-tight group-hover:text-indigo-600 transition-colors">{ad.title}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-black text-indigo-600">{ad.price} <small className="text-sm font-bold">د.م</small></span>
                      <div className="bg-slate-50 text-slate-400 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Play size={18} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-20">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">لا توجد منتجات مطابقة</h3>
                  <p className="text-slate-500">حاول تغيير كلمة البحث أو اضغط على "تحديث التريندات"</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                   <p className="text-slate-400 font-bold text-sm mb-1">إجمالي الطلبات</p>
                   <p className="text-4xl font-black">{orders.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                   <p className="text-slate-400 font-bold text-sm mb-1">المبيعات المتوقعة</p>
                   <p className="text-4xl font-black text-indigo-600">{orders.reduce((a,b)=>a+b.amount, 0)} <small className="text-sm">د.م</small></p>
                 </div>
              </div>
              
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-xl">سجل المبيعات</h3>
                  <button onClick={() => { localStorage.removeItem('orders'); setOrders([]); }} className="text-xs text-red-500 font-bold">مسح السجل</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase">
                         <tr>
                            <th className="p-6">الطلب</th>
                            <th className="p-6">الزبون</th>
                            <th className="p-6">المدينة</th>
                            <th className="p-6">المبلغ</th>
                            <th className="p-6">الحالة</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {orders.length > 0 ? orders.map(o => (
                           <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-6 font-bold text-indigo-600">{o.productTitle}</td>
                             <td className="p-6 font-medium">{o.customerName}</td>
                             <td className="p-6">{o.city}</td>
                             <td className="p-6 font-black">{o.amount} د.م</td>
                             <td className="p-6"><span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">انتظار التاكيد</span></td>
                           </tr>
                         )) : (
                           <tr>
                             <td colSpan={5} className="p-20 text-center text-slate-400 font-bold">لا توجد طلبات مسجلة حالياً</td>
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
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">إعدادات المتجر والتتبع</h3>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Facebook Pixel ID</label>
                        <input type="text" placeholder="1234567890" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none" defaultValue={pixelConfig.facebook} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Google Analytics ID</label>
                        <input type="text" placeholder="G-XXXXXX" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none" defaultValue={pixelConfig.google} />
                     </div>
                     <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black">حفظ الإعدادات</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setSelectedAd(null)} />
          <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[92vh] rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedAd(null)} className="absolute top-6 left-6 z-[110] bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
            
            <div className="md:w-1/2 bg-black flex flex-col items-center justify-center relative min-h-[300px]">
              <video 
                key={selectedAd.id}
                className="w-full h-full object-contain"
                src={selectedAd.videoUrl}
                autoPlay loop controls muted
              />
              <div className="absolute bottom-6 right-6 left-6 flex gap-3">
                <a 
                  href={`https://www.tiktok.com/search?q=${encodeURIComponent(selectedAd.title)}`} 
                  target="_blank" 
                  className="flex-1 bg-white/20 backdrop-blur-xl text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/40 transition-all"
                >
                  <Video size={16} /> ابحث في TikTok
                </a>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedAd.title)}+review`} 
                  target="_blank" 
                  className="flex-1 bg-white/20 backdrop-blur-xl text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/40 transition-all"
                >
                  <Youtube size={16} /> مراجعات يوتيوب
                </a>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col no-scrollbar">
              {showCheckout ? (
                <div className="animate-in slide-in-from-left-4">
                  <h2 className="text-3xl font-black mb-8">إتمام الطلب 🛍️</h2>
                  {orderSuccess ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} className="animate-bounce" /></div>
                      <h3 className="text-3xl font-black mb-2 text-slate-800">شكراً لك!</h3>
                      <p className="text-slate-500 font-bold">تم استلام طلبك بنجاح، سنتصل بك قريباً.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 mb-6">
                        <img src={selectedAd.thumbnail} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-sm text-slate-800 line-clamp-1">{selectedAd.title}</p>
                          <p className="text-indigo-600 font-black">{selectedAd.price} د.م</p>
                        </div>
                      </div>
                      <input required placeholder="الاسم الكامل" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                      <input required placeholder="المدينة" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={checkoutData.city} onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} />
                      <input required placeholder="رقم الهاتف" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-ltr" type="tel" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                      <button type="submit" disabled={isOrdering} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">
                        {isOrdering ? <Loader2 className="animate-spin mx-auto" /> : 'تأكيد الطلب الآن'}
                      </button>
                      <button type="button" onClick={() => setShowCheckout(false)} className="w-full text-slate-400 font-bold py-2">رجوع</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedAd.category}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-bold flex items-center gap-1.5"><MapPin size={16} /> {COUNTRY_LABELS[selectedAd.country]}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 mb-6 leading-[1.1]">{selectedAd.title}</h2>
                  <div className="flex items-center gap-6 mb-10">
                    <span className="text-6xl font-black text-indigo-600">{selectedAd.price} <small className="text-xl font-bold">د.م</small></span>
                    <div className="flex flex-col">
                       <span className="text-slate-300 line-through text-2xl">{(selectedAd.price * 1.5).toFixed(0)} د.م</span>
                       <span className="text-red-500 font-black text-sm uppercase">خصم 40% اليوم</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 opacity-20" />
                    <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">لماذا هذا المنتج رابح؟</h4>
                    <p className="text-slate-600 leading-relaxed font-medium text-lg">
                      {selectedAd.description}
                    </p>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all mt-auto flex items-center justify-center gap-4">
                    <ShoppingCart /> اطلب الآن (الدفع عند الاستلام)
                  </button>
                  <div className="mt-6 flex items-center justify-center gap-3 text-slate-400 font-bold text-xs opacity-60">
                     <ShieldCheck size={16} /> تسوق آمن 100% | توصيل سريع لجميع المدن
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
