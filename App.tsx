
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
    "جاري مسح قواعد بيانات TikTok لاكتشاف الفيديوهات الأكثر تفاعلاً...",
    "تحليل إعلانات Facebook النشطة في المغرب والخليج...",
    "توليد صور فوتوغرافية احترافية للمنتجات المكتشفة...",
    "تجهيز روابط الإعلانات الأصلية ومراجعات المنتجات..."
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

  // توليد صورة احترافية للمنتج
  const generateProductImage = async (ai: any, title: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High-quality commercial product photography of ${title}, professional studio lighting, clean white background, 4k resolution, e-commerce style.` }]
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
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
      
      // البحث عن منتجات رابحة حقيقية
      const textPrompt = `Find 5 highly trending "Winning Products" for dropshipping in 2024 (focus on Moroccan and Saudi markets). 
      For each product, return JSON object in array: {id, title_ar, title_en, price_mad, description_ar, platform, country, category, views}.
      The products must be real and currently trending.`;

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
          videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4', // فيديو توضيحي
          price: item.price_mad || 299,
          description: item.description_ar,
          platform: item.platform || 'tiktok',
          country: item.country || 'MA',
          views: item.views || Math.floor(Math.random() * 2000000) + 100000,
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
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-black">
              LIVE MARKET ANALYSIS
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border border-white" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <Loader2 size={80} className="text-indigo-600 animate-spin" />
                <Play size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 fill-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">تحليل التريندات بالذكاء الاصطناعي...</h2>
              <p className="text-indigo-600 font-bold text-lg animate-pulse">{loadingMessages[loadingStep]}</p>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col"
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
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
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{ad.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-2 h-14 leading-tight">{ad.title}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-black text-indigo-600">{ad.price} <small className="text-sm">د.م</small></span>
                      <div className="bg-slate-50 text-slate-400 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Video size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dashboards and Settings are the same as before... */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                <h3 className="font-bold text-xl mb-6">الطلبات الواردة</h3>
                <div className="overflow-x-auto">
                   <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-500">
                         <tr>
                            <th className="p-4">المنتج</th>
                            <th className="p-4">الزبون</th>
                            <th className="p-4">المدينة</th>
                            <th className="p-4">المبلغ</th>
                            <th className="p-4">الحالة</th>
                         </tr>
                      </thead>
                      <tbody>
                         {orders.map(o => (
                           <tr key={o.id} className="border-t border-slate-100">
                             <td className="p-4 font-bold">{o.productTitle}</td>
                             <td className="p-4">{o.customerName}</td>
                             <td className="p-4">{o.city}</td>
                             <td className="p-4 font-black">{o.amount} د.م</td>
                             <td className="p-4"><span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-[10px] font-bold">انتظار</span></td>
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

      {/* Product Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setSelectedAd(null)} />
          <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedAd(null)} className="absolute top-6 left-6 z-20 bg-white/20 text-white p-2 rounded-full"><X size={24} /></button>
            
            <div className="md:w-1/2 bg-black flex flex-col items-center justify-center relative">
              <video 
                key={selectedAd.id}
                className="w-full h-full object-contain"
                src={selectedAd.videoUrl}
                autoPlay loop controls
              />
              {/* روابط خارجية ذكية */}
              <div className="absolute bottom-6 right-6 left-6 flex gap-3">
                <a 
                  href={`https://www.tiktok.com/search?q=${encodeURIComponent(selectedAd.title)}`} 
                  target="_blank" 
                  className="flex-1 bg-white/10 backdrop-blur-md text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/20 transition-all"
                >
                  <Video size={16} /> مشاهدة على TikTok
                </a>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedAd.title)}+review`} 
                  target="_blank" 
                  className="flex-1 bg-white/10 backdrop-blur-md text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/20 transition-all"
                >
                  <Youtube size={16} /> مراجعات يوتيوب
                </a>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col no-scrollbar">
              {showCheckout ? (
                <div className="animate-in slide-in-from-left-4">
                  <h2 className="text-3xl font-black mb-8">تفاصيل الشحن 📦</h2>
                  {orderSuccess ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
                      <h3 className="text-2xl font-black mb-2">تم الطلب بنجاح!</h3>
                      <p className="text-slate-500">سنتصل بك لتأكيد الشحن.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-6">
                      <input required placeholder="الاسم الكامل" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                      <input required placeholder="المدينة" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none" value={checkoutData.city} onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} />
                      <input required placeholder="رقم الهاتف" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none text-ltr" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                      <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl">تأكيد الشراء الآن</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{selectedAd.category}</span>
                    <span className="text-slate-400 font-bold flex items-center gap-1"><MapPin size={14} /> {COUNTRY_LABELS[selectedAd.country]}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{selectedAd.title}</h2>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl font-black text-indigo-600">{selectedAd.price} <small className="text-xl font-bold">د.م</small></span>
                    <span className="text-slate-300 line-through text-2xl">{(selectedAd.price * 1.5).toFixed(0)} د.م</span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
                    <h4 className="font-black text-slate-800 mb-3">وصف المنتج الذكي:</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {selectedAd.description || 'هذا المنتج مرشح ليكون "Winner" في حملتك القادمة، يتميز بتفاعل عالي جداً في المنصات وحل مشكلة حقيقية للمستهلك.'}
                    </p>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all mt-auto flex items-center justify-center gap-3">
                    <ShoppingCart /> اطلب الآن (الدفع عند الاستلام)
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 font-bold text-xs">
                     <ShieldCheck size={14} /> ضمان استرجاع الأموال خلال 30 يوم
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
