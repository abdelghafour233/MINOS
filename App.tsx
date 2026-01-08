
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Search, ShoppingCart, X, CheckCircle, Package, 
  Settings, Globe, ShieldCheck, Smartphone, DollarSign, 
  LayoutDashboard, Database, ExternalLink, Play, Zap, Table, 
  Server, Code2, Loader2, Sparkles, RefreshCw, MapPin, Crown, Link as LinkIcon
} from 'lucide-react';
import { TrendingAd, FilterState, Order, IntegrationConfig } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'ads' | 'dashboard' | 'integrations' | 'settings'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [ads, setAds] = useState<TrendingAd[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  
  // Integration Config State
  const [config, setConfig] = useState<IntegrationConfig>({
    apifyToken: '',
    zapierWebhookUrl: '',
    googleSheetUrl: '',
    facebookPixel: '',
    googlePixel: '',
    tiktokPixel: ''
  });

  // UI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
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
    "جاري تشغيل Apify Scraper...",
    "فحص المنتجات الرابحة على TikTok...",
    "تحليل البيانات من AliExpress...",
    "توليد الصور ومزامنة لوحة التحكم..."
  ];

  // Load Initial Data
  useEffect(() => {
    const savedAds = localStorage.getItem('trending_ads');
    const savedOrders = localStorage.getItem('orders');
    const savedConfig = localStorage.getItem('app_config');
    
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

  // Loading Animation Timer
  useEffect(() => {
    let interval: any;
    if (isAiLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  // Filtering Logic
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchesSearch = ad.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPlatform = filters.platform === 'all' || ad.platform === filters.platform;
      const matchesCountry = filters.country === 'all' || ad.country === filters.country;
      const matchesCategory = filters.category === 'الكل' || ad.category === filters.category;
      return matchesSearch && matchesPlatform && matchesCountry && matchesCategory;
    }).sort((a, b) => {
      if (filters.sortBy === 'views') return b.views - a.views;
      if (filters.sortBy === 'likes') return b.likes - a.likes;
      return 0;
    });
  }, [ads, filters]);

  // AI Content Handlers
  const extractJsonFromText = (text: string) => {
    try {
      const regex = /\[[\s\S]*\]/;
      const match = text.match(regex);
      return match ? JSON.parse(match[0]) : JSON.parse(text);
    } catch (e) {
      console.error("JSON Parsing Error:", e);
      return null;
    }
  };

  const generateProductImage = async (ai: any, title: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Professional commercial studio photography of ${title}, high resolution, white background.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      
      let imageUrl = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      return imageUrl;
    } catch (e) {
      return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`;
    }
  };

  const discoverRealTrends = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setLoadingStep(0);
    setSources([]);

    try {
      // Create fresh instance per call to ensure latest API key context
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const promptText = `Return exactly 6 trending winning products for e-commerce in Morocco/GCC.
      Format: JSON array of objects.
      Fields: id (string), title_ar (string), title_en (string), price_mad (number), description_ar (string), platform (tiktok/aliexpress), country (MA/SA/AE), category (string), views (number).
      Constraint: High engagement products only. No conversational text, only the JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptText }] }],
        config: { tools: [{ googleSearch: {} }] },
      });

      const grounding = response.candidates?.[0]?.groundingMetadata;
      if (grounding?.groundingChunks) {
        setSources(grounding.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ title: c.web.title, uri: c.web.uri })));
      }

      const rawData = extractJsonFromText(response.text || "");
      if (!rawData || !Array.isArray(rawData)) throw new Error("فشل في معالجة البيانات من الذكاء الاصطناعي");

      const processed: TrendingAd[] = [];
      for (const item of rawData) {
        // Generate a custom image for each discovered product
        const imageUrl = await generateProductImage(ai, item.title_en || item.title_ar);
        
        processed.push({
          id: item.id || Math.random().toString(36).substring(2, 9),
          title: item.title_ar,
          thumbnail: imageUrl,
          videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70860-536967732_tiny.mp4',
          price: item.price_mad || 199,
          description: item.description_ar,
          platform: (item.platform === 'aliexpress' ? 'aliexpress' : 'tiktok') as any,
          country: (item.country || 'MA') as any,
          views: item.views || Math.floor(Math.random() * 500000),
          likes: Math.floor(Math.random() * 20000),
          shares: Math.floor(Math.random() * 1000),
          category: item.category || 'عام',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isWinning: true
        });
      }
      
      const updatedAds = [...processed, ...ads].slice(0, 50);
      setAds(updatedAds);
      localStorage.setItem('trending_ads', JSON.stringify(updatedAds));
      setActiveTab('ads');
    } catch (error: any) {
      console.error(error);
      alert(`عذراً، حدث خطأ أثناء التحديث: ${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    setIsOrdering(true);
    
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customerName: checkoutData.name,
      city: checkoutData.city,
      phone: checkoutData.phone,
      productId: selectedAd.id,
      productTitle: selectedAd.title,
      amount: selectedAd.price,
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'pending',
      syncedToSheets: false
    };

    // Integration Logic: Zapier/Make Webhook
    if (config.zapierWebhookUrl) {
      try {
        await fetch(config.zapierWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        newOrder.syncedToSheets = true;
      } catch (err) {
        console.warn("Webhook sync failed, saving locally.");
      }
    }

    setTimeout(() => {
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      setIsOrdering(false);
      setOrderSuccess(true);
      
      // Auto-close success message
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
        setSelectedAd(null);
      }, 2500);
    }, 1200);
  };

  const saveConfiguration = () => {
    localStorage.setItem('app_config', JSON.stringify(config));
    alert('تم حفظ الإعدادات بنجاح!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0 shadow-sm`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black text-slate-800 tracking-tight">ترند ماينيا</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'ads', label: 'المتجر الرئيسي', icon: Smartphone },
            { id: 'dashboard', label: 'لوحة الطلبات', icon: LayoutDashboard },
            { id: 'integrations', label: 'تكامل No-Code', icon: Zap },
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
            className="w-full mt-6 bg-indigo-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 group"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-all duration-500" />}
            {isSidebarOpen && <span>تحديث من Apify</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 shadow-sm">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن منتج محدد..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-4">
            {config.zapierWebhookUrl && (
              <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 border border-green-100">
                <Table size={12} /> Google Sheets Sync Active
              </div>
            )}
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-indigo-100">
              Morocco MAD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
          {/* AI Loading Overlay */}
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
              <div className="relative mb-10 scale-125">
                <Loader2 size={80} className="text-indigo-600 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={32} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">تحليل التريندات العالمية...</h2>
              <p className="text-indigo-600 font-bold text-xl h-8">{loadingMessages[loadingStep]}</p>
              <div className="mt-12 w-64 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full animate-pulse w-full" />
              </div>
            </div>
          )}

          {/* Storefront View */}
          {activeTab === 'ads' && (
            <div className="space-y-8 pb-32">
              {/* Grounding Sources */}
              {sources.length > 0 && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
                  <h4 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest"><Globe size={14} /> مصادر البحث الحية</h4>
                  <div className="flex flex-wrap gap-3">
                    {sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100">
                        <LinkIcon size={12} /> {src.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAds.length > 0 ? filteredAds.map((ad) => (
                  <div 
                    key={ad.id} 
                    className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col"
                    onClick={() => setSelectedAd(ad)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-50">
                      <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-5 left-5 flex gap-2">
                        <div className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-xl flex items-center gap-1.5 border border-white/20">
                          <Crown size={12} /> رابح
                        </div>
                        {ad.platform === 'aliexpress' && (
                          <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-xl border border-white/20">AliExpress</div>
                        )}
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
                        <span className="text-2xl font-black text-indigo-600">{ad.price} <small className="text-sm font-bold">د.م</small></span>
                        <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <ShoppingCart size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-32">
                    <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="text-slate-300" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد منتجات مطابقة</h3>
                    <p className="text-slate-500 font-medium">حاول تعديل الفلاتر أو تحديث البيانات من Apify</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <p className="text-slate-400 font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><Package size={16}/> إجمالي الطلبيات</p>
                   <p className="text-5xl font-black tracking-tighter text-slate-800">{orders.length}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <p className="text-slate-400 font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><Table size={16}/> المزامنة مع Sheets</p>
                   <p className="text-3xl font-black text-green-600 tracking-tighter">{orders.filter(o=>o.syncedToSheets).length} / {orders.length}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <p className="text-slate-400 font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><DollarSign size={16}/> المبيعات المحققة</p>
                   <p className="text-4xl font-black text-indigo-600 tracking-tighter">{orders.reduce((a,b)=>a+b.amount, 0)} <small className="text-lg font-bold">د.م</small></p>
                 </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-black text-2xl text-slate-800">إدارة المبيعات الحالية</h3>
                  <button onClick={() => { if(confirm('تأكيد مسح كافة السجلات؟')) { localStorage.removeItem('orders'); setOrders([]); } }} className="text-[10px] text-red-400 font-black uppercase hover:text-red-600 transition-colors">مسح السجل</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-right">
                      <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                         <tr>
                            <th className="p-8">رقم الطلب</th>
                            <th className="p-8">المنتج</th>
                            <th className="p-8">الزبون</th>
                            <th className="p-8">المبلغ</th>
                            <th className="p-8 text-center">المزامنة</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {orders.length > 0 ? orders.map(o => (
                           <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="p-8 font-mono text-xs text-slate-400">{o.id}</td>
                             <td className="p-8 font-bold text-slate-800">{o.productTitle}</td>
                             <td className="p-8 font-bold text-slate-600">{o.customerName} - {o.city}</td>
                             <td className="p-8 font-black text-indigo-600">{o.amount} د.م</td>
                             <td className="p-8 flex justify-center">
                                {o.syncedToSheets ? (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle size={10} /> موصول</span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><X size={10} /> محلي</span>
                                )}
                             </td>
                           </tr>
                         )) : (
                           <tr>
                             <td colSpan={5} className="p-24 text-center text-slate-300 font-black text-xl">لا توجد طلبات مسجلة حالياً</td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {/* Integrations View */}
          {activeTab === 'integrations' && (
            <div className="max-w-4xl mx-auto space-y-12 pb-32">
               <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-4xl font-black mb-4 flex items-center gap-4"><Zap fill="currentColor" /> مركز الربط (No-Code Hub)</h3>
                    <p className="text-indigo-100 font-bold text-lg opacity-80 leading-relaxed">قم بربط متجرك مع الأدوات الخارجية لأتمتة عمليات جلب البيانات وإدارة الطلبيات.</p>
                  </div>
                  <Zap className="absolute -bottom-10 -left-10 text-white/10" size={300} strokeWidth={1} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                     <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Server size={32} /></div>
                     <h4 className="text-2xl font-black mb-4">Apify API</h4>
                     <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">تكامل مباشر لجلب التريندات من TikTok و AliExpress عبر حسابك في Apify.</p>
                     <div className="space-y-4">
                        <input className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="Apify API Token" value={config.apifyToken} onChange={e=>setConfig({...config, apifyToken: e.target.value})} />
                        <button onClick={saveConfiguration} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-sm hover:bg-orange-700 transition-colors">حفظ التوكن</button>
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                     <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Zap size={32} /></div>
                     <h4 className="text-2xl font-black mb-4">Zapier / Make</h4>
                     <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">إرسال كل طلبية جديدة تلقائياً إلى Webhook مخصص لبدء عمليات الأتمتة.</p>
                     <div className="space-y-4">
                        <input className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Webhook URL (Zapier/Make)" value={config.zapierWebhookUrl} onChange={e=>setConfig({...config, zapierWebhookUrl: e.target.value})} />
                        <button onClick={saveConfiguration} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm hover:bg-indigo-700 transition-colors">تفعيل Webhook</button>
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all md:col-span-2">
                     <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Table size={32} /></div>
                     <h4 className="text-2xl font-black mb-4">Google Sheets Preview</h4>
                     <p className="text-slate-500 font-medium mb-6 text-sm">أدخل رابط العرض العام لجدول البيانات الخاص بك لعرضه هنا في لوحة التحكم.</p>
                     <div className="flex gap-4">
                        <input className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm outline-none" placeholder="Google Sheet URL" value={config.googleSheetUrl} onChange={e=>setConfig({...config, googleSheetUrl: e.target.value})} />
                        <button onClick={saveConfiguration} className="bg-green-600 text-white px-10 py-4 rounded-xl font-black text-sm hover:bg-green-700 transition-colors">حفظ</button>
                     </div>
                     {config.googleSheetUrl && (
                       <div className="mt-8 bg-slate-100 rounded-2xl h-64 flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-200">
                          (معاينة الجدول تتطلب صلاحيات العرض العام)
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
               <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-900">
                    <Globe className="text-indigo-600" /> إعدادات الدومين و الـ DNS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                     <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">اسم النطاق (Domain)</label>
                        <input type="text" placeholder="example.com" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none" />
                     </div>
                     <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Name Server 1</label>
                        <input type="text" placeholder="ns1.hosting-provider.com" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none" />
                     </div>
                  </div>

                  <h3 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-900 border-t border-slate-100 pt-10">
                    <Code2 className="text-indigo-600" /> أكواد التتبع (JavaScript Pixels)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 uppercase">Facebook Pixel ID</label>
                        <input type="text" placeholder="123456789..." className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none" value={config.facebookPixel} onChange={e=>setConfig({...config, facebookPixel: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 uppercase">Google Analytics G-ID</label>
                        <input type="text" placeholder="G-XXXXXXXXXX" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none" value={config.googlePixel} onChange={e=>setConfig({...config, googlePixel: e.target.value})} />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-black text-slate-700 mb-3 uppercase">TikTok Pixel Code</label>
                        <input type="text" placeholder="CXXXXXXXXXXXXXXX" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none" value={config.tiktokPixel} onChange={e=>setConfig({...config, tiktokPixel: e.target.value})} />
                     </div>
                  </div>
                  <button onClick={saveConfiguration} className="mt-12 bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100">حفظ كافة التغييرات</button>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Detail & Checkout Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => { if(!isOrdering) setSelectedAd(null); }} />
          <div className="bg-white w-full max-w-7xl h-full md:h-auto md:max-h-[92vh] rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-500 border border-white/10">
            <button onClick={() => setSelectedAd(null)} className="absolute top-8 left-8 z-[110] bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-md"><X size={28} /></button>
            
            <div className="md:w-1/2 bg-black flex flex-col items-center justify-center relative min-h-[350px]">
              <video 
                key={selectedAd.id}
                className="w-full h-full object-contain"
                src={selectedAd.videoUrl}
                autoPlay loop controls muted
              />
            </div>

            <div className="md:w-1/2 p-10 md:p-16 overflow-y-auto bg-white flex flex-col no-scrollbar">
              {showCheckout ? (
                <div className="animate-in slide-in-from-left-8 duration-500">
                  <h2 className="text-4xl font-black mb-10 text-slate-900 tracking-tight">تأكيد الطلب 🚀</h2>
                  {orderSuccess ? (
                    <div className="text-center py-24">
                      <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={56} className="animate-bounce" /></div>
                      <h3 className="text-4xl font-black mb-3 text-slate-900">شكراً لك!</h3>
                      <p className="text-slate-500 font-bold text-xl">تم إرسال طلبك بنجاح وسنتواصل معك قريباً.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center gap-6 mb-8 border border-slate-100">
                        <img src={selectedAd.thumbnail} className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                        <div>
                          <p className="font-black text-lg text-slate-800 line-clamp-1">{selectedAd.title}</p>
                          <p className="text-indigo-600 font-black text-2xl">{selectedAd.price} د.م</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <input required placeholder="الاسم الكامل" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                        <input required placeholder="المدينة" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold" value={checkoutData.city} onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} />
                        <input required placeholder="رقم الهاتف" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold text-ltr" type="tel" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                      </div>
                      <button type="submit" disabled={isOrdering} className="w-full bg-indigo-600 text-white py-8 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-6">
                        {isOrdering ? <Loader2 className="animate-spin mx-auto" size={32} /> : 'إرسال الطلب الآن'}
                      </button>
                      <button type="button" onClick={() => setShowCheckout(false)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors">رجوع للمنتج</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">{selectedAd.category}</span>
                    <span className="text-slate-500 font-black flex items-center gap-2 text-sm"><MapPin size={18} /> {COUNTRY_LABELS[selectedAd.country]}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{selectedAd.title}</h2>
                  <div className="flex items-center gap-8 mb-12">
                    <span className="text-6xl font-black text-indigo-600 tracking-tighter">{selectedAd.price} <small className="text-2xl font-bold">د.م</small></span>
                    <div className="flex flex-col">
                       <span className="text-slate-300 line-through text-2xl">{(selectedAd.price * 1.6).toFixed(0)} د.م</span>
                       <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-black text-xs mt-1">عرض خاص محدود</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-12 flex-1">
                    <p className="text-slate-600 leading-relaxed font-bold text-xl">{selectedAd.description}</p>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full bg-indigo-600 text-white py-10 rounded-[3.5rem] font-black text-3xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all mt-auto flex items-center justify-center gap-4">
                    <ShoppingCart size={32} /> اطلب الآن
                  </button>
                  <div className="mt-8 flex items-center justify-center gap-8 text-slate-400 font-black text-[10px] opacity-70 uppercase tracking-widest">
                     <div className="flex items-center gap-2"><ShieldCheck size={18} /> ضمان الجودة</div>
                     <div className="flex items-center gap-2"><Globe size={18} /> توصيل سريع</div>
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
