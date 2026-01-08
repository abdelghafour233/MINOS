
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Video, 
  Facebook, 
  Instagram, 
  Calendar, 
  Eye, 
  MapPin, 
  Crown, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { TrendingAd, FilterState, Country } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS, PLATFORM_LABELS, CATEGORIES } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ads' | 'winning' | 'seasonal'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [ads, setAds] = useState<TrendingAd[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    platform: 'all',
    country: 'all',
    category: 'الكل',
    sortBy: 'views'
  });

  const loadingMessages = [
    "جاري مسح منصة TikTok لاكتشاف الفيديوهات الأكثر تفاعلاً...",
    "تحليل إعلانات Facebook في منطقة الشرق الأوسط...",
    "تحديد المنتجات الرابحة والمظلومة في السوق...",
    "توليد صور احترافية مطابقة لكل منتج بالذكاء الاصطناعي..."
  ];

  useEffect(() => {
    const saved = localStorage.getItem('trending_ads');
    if (saved) {
      setAds(JSON.parse(saved));
    } else {
      setAds(MOCK_TRENDS);
      setTimeout(() => discoverRealTrends(), 1000);
    }
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

  // Function to generate a real image using Gemini
  const generateProductImage = async (ai: any, title: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Professional high-quality studio product photography of ${title}, white background, e-commerce style, clear lighting, 4k resolution.` }]
        },
        config: {
          imageConfig: { aspectRatio: "4:3" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return `https://loremflickr.com/600/450/${encodeURIComponent(title)}`;
    } catch (e) {
      console.error("Image gen failed", e);
      return `https://loremflickr.com/600/450/${encodeURIComponent(title)}`;
    }
  };

  const discoverRealTrends = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Fetch Product Data
      const textPrompt = `Find 4 highly trending "Winning Products" for dropshipping in Saudi Arabia and Morocco for May 2024.
      Return strictly JSON array: [{id, title_ar, title_en, platform, country, views, likes, shares, category, isWinning: true}]`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: textPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });

      const rawData = JSON.parse(textResponse.text || "[]");
      const processedAds: TrendingAd[] = [];

      // 2. Generate Real Images for each discovered product
      for (const item of rawData) {
        const imageUrl = await generateProductImage(ai, item.title_en);
        processedAds.push({
          id: item.id || Math.random().toString(36).substr(2, 9),
          title: item.title_ar,
          thumbnail: imageUrl,
          platform: item.platform,
          country: item.country,
          views: item.views,
          likes: item.likes,
          shares: item.shares,
          category: item.category,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isWinning: true
        });
      }
      
      setAds(prev => {
        const combined = [...processedAds, ...prev];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const sliced = unique.slice(0, 30);
        localStorage.setItem('trending_ads', JSON.stringify(sliced));
        return sliced;
      });
      
    } catch (error) {
      console.error("AI Discovery Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchSearch = ad.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchPlatform = filters.platform === 'all' || ad.platform === filters.platform;
      const matchCountry = filters.country === 'all' || ad.country === filters.country;
      const matchCategory = filters.category === 'الكل' || ad.category === filters.category;
      const matchTab = activeTab === 'winning' ? ad.isWinning : true;
      return matchSearch && matchPlatform && matchCountry && matchCategory && matchTab;
    }).sort((a, b) => {
      if (filters.sortBy === 'views') return b.views - a.views;
      if (filters.sortBy === 'likes') return b.likes - a.likes;
      return 0;
    });
  }, [filters, activeTab, ads]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0 shadow-2xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">ترند مـاينيا</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">ذكاء اصطناعي حقيقي</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={discoverRealTrends}
            disabled={isAiLoading}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all mb-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 disabled:opacity-70 group relative overflow-hidden`}
          >
            {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="text-amber-300 fill-amber-300" />}
            {isSidebarOpen && <span className="font-black text-sm">توليد تريندات بالذكاء</span>}
          </button>

          {[
            { id: 'ads', label: 'مكتبة الإعلانات', icon: Video },
            { id: 'winning', label: 'منتجات رابحة', icon: Crown },
            { id: 'seasonal', label: 'ترندات موسمية', icon: Calendar },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن منتج بالذكاء الاصطناعي..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          <button 
            onClick={discoverRealTrends}
            className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={16} className={isAiLoading ? 'animate-spin' : ''} />
            تحديث البيانات
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl z-30 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
              <div className="relative mb-10">
                <Loader2 size={100} className="text-blue-600 animate-spin relative" />
                <ImageIcon size={40} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4">جاري توليد المحتوى الحصري...</h2>
              <p className="text-blue-600 font-bold text-xl animate-pulse h-8">
                {loadingMessages[loadingStep]}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredAds.map((ad, idx) => (
              <div 
                key={ad.id} 
                className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img 
                    src={ad.thumbnail} 
                    alt={ad.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    loading="lazy"
                  />
                  <div className="absolute top-5 right-5">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                      <span className="text-[10px] font-black uppercase text-slate-800">{PLATFORM_LABELS[ad.platform]}</span>
                    </div>
                  </div>
                  {ad.isWinning && (
                    <div className="absolute bottom-5 left-5">
                      <div className="bg-amber-400 text-amber-950 px-4 py-2 rounded-2xl font-black text-[11px] flex items-center gap-2 shadow-xl border border-amber-300">
                        <Crown size={14} />
                        منتج رابح
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-black text-slate-500">{COUNTRY_LABELS[ad.country]}</span>
                    <div className="mx-1 text-slate-300">•</div>
                    <span className="text-xs font-black text-blue-600 uppercase">{ad.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-6 leading-tight line-clamp-2 h-14">{ad.title}</h3>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">مشاهدات</p>
                      <p className="text-base font-black text-slate-800">{formatNumber(ad.views)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">تفاعل</p>
                      <p className="text-base font-black text-pink-600">{formatNumber(ad.likes)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">مشاركة</p>
                      <p className="text-base font-black text-emerald-600">{formatNumber(ad.shares)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
