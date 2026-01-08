
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  LayoutDashboard, 
  Video, 
  Facebook, 
  Instagram, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Globe, 
  ChevronDown,
  Zap,
  Star,
  Menu,
  X,
  MapPin,
  Clock,
  ExternalLink,
  Crown,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { TrendingAd, FilterState, Platform, Country } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS, PLATFORM_LABELS, CATEGORIES } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  // UI State
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
    "تحليل إعلانات Facebook في منطقة الشرق الأوسط وشمال أفريقيا...",
    "تحديد المنتجات ذات الطلب العالي ونسبة المنافسة المنخفضة...",
    "البحث عن صور حقيقية تعبر عن المنتجات المكتشفة..."
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

  const discoverRealTrends = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a world-class dropshipping product researcher. 
      Find 6 "Winning Products" that are currently trending in May 2024.
      Focus specifically on the GCC (Saudi Arabia, UAE) and Morocco markets.
      
      Instructions:
      1. Search for viral TikTok ads and Facebook winning products.
      2. Choose products that have high "problem-solving" value or high "wow factor".
      3. CRITICAL: For each product, determine its English name (e.g., "Flame Diffuser", "Massage Gun").
      4. Use this English name to create a thumbnail URL in this format: 
         'https://loremflickr.com/400/500/{EnglishNameKeyWords}'
         Example: if the product is a car vacuum, thumbnail is 'https://loremflickr.com/400/500/car,vacuum'
      
      Return ONLY a valid JSON array of objects with:
         - id: short unique string
         - title: Catchy Arabic marketing title
         - thumbnail: The dynamic URL created above
         - platform: 'tiktok', 'facebook', or 'instagram'
         - country: 'SA', 'MA', or 'AE'
         - views: number
         - likes: number
         - shares: number
         - category: Choose from: إلكترونيات, منزل, تجميل, أدوات مطبخ, سيارات
         - isWinning: true
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });

      const resultText = response.text || "[]";
      const newTrends: TrendingAd[] = JSON.parse(resultText);
      
      setAds(prev => {
        const combined = [...newTrends, ...prev];
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
      return b.views - a.views; // Fallback to views if no date
    });
  }, [filters, activeTab, ads]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0 shadow-2xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">ترند مـاينيا</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">نسخة المحترفين</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={discoverRealTrends}
            disabled={isAiLoading}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all mb-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="text-amber-300 fill-amber-300" />}
            {isSidebarOpen && <span className="font-black text-sm">تحديث التريندات بالذكاء</span>}
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
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 font-bold shadow-inner' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
              {isSidebarOpen && <span>{item.label}</span>}
              {activeTab === item.id && isSidebarOpen && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>
          ))}

          <div className="pt-8 pb-4">
            {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">المنصات</p>}
            <div className="space-y-1">
              {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilters({...filters, platform: key as any})}
                  className={`w-full flex items-center gap-4 px-4 py-2 text-sm rounded-lg ${
                    filters.platform === key ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${key === 'tiktok' ? 'bg-black' : key === 'facebook' ? 'bg-blue-600' : key === 'instagram' ? 'bg-pink-500' : 'bg-slate-300'}`} />
                  {isSidebarOpen && <span>{label}</span>}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">تصغير القائمة</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن منتج، متجر، أو كلمة مفتاحية..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={discoverRealTrends}
              className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              <RefreshCw size={16} className={isAiLoading ? 'animate-spin' : ''} />
              تحديث
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white shadow-sm cursor-pointer" />
          </div>
        </header>

        {/* Filter Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600 ml-2">تصفية:</span>
          </div>
          
          <select 
            value={filters.country}
            onChange={(e) => setFilters({...filters, country: e.target.value as Country})}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold cursor-pointer"
          >
            {Object.entries(COUNTRY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold cursor-pointer"
          >
            <option value="views">الأكثر مشاهدة</option>
            <option value="likes">الأكثر تفاعلاً</option>
          </select>

          <div className="mr-auto flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">نتائج البحث:</span>
            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-black">{filteredAds.length} إعلان</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative">
          {isAiLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
              <div className="relative mb-10">
                <div className="absolute -inset-4 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                <Loader2 size={100} className="text-blue-600 animate-spin relative" />
                <Sparkles size={40} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4">جاري تحليل تريندات السوق...</h2>
              <div className="h-8 mb-4">
                <p className="text-blue-600 font-bold text-xl animate-pulse transition-all duration-500">
                  {loadingMessages[loadingStep]}
                </p>
              </div>
              <div className="mt-12 flex gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredAds.map((ad, idx) => (
              <div 
                key={ad.id} 
                className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                  <img 
                    src={ad.thumbnail} 
                    alt={ad.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-5 right-5 flex gap-2">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                      {ad.platform === 'tiktok' && <div className="bg-black text-white p-1 rounded-md"><Video size={12} /></div>}
                      {ad.platform === 'facebook' && <Facebook size={16} className="text-blue-600" />}
                      {ad.platform === 'instagram' && <Instagram size={16} className="text-pink-600" />}
                      <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">{PLATFORM_LABELS[ad.platform]}</span>
                    </div>
                  </div>
                  {ad.isWinning && (
                    <div className="absolute bottom-5 left-5">
                      <div className="bg-amber-400 text-amber-950 px-4 py-2 rounded-2xl font-black text-[11px] flex items-center gap-2 shadow-xl border border-amber-300">
                        <Crown size={14} />
                        رابح مؤكد
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transform translate-y-10 group-hover:translate-y-0 transition-transform shadow-2xl hover:bg-blue-50">
                      <Eye size={20} />
                      عرض تفاصيل الإعلان
                    </button>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
                      <MapPin size={14} />
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{COUNTRY_LABELS[ad.country]}</span>
                    <div className="mx-1 text-slate-300">•</div>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{ad.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-6 leading-tight line-clamp-2 h-14 group-hover:text-blue-600 transition-colors">{ad.title}</h3>
                  
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
