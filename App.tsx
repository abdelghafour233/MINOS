
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
  Loader2
} from 'lucide-react';
import { TrendingAd, FilterState, Platform, Country } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS, PLATFORM_LABELS, CATEGORIES } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  // UI State
  const [activeTab, setActiveTab] = useState<'ads' | 'winning' | 'seasonal'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [ads, setAds] = useState<TrendingAd[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    platform: 'all',
    country: 'all',
    category: 'الكل',
    sortBy: 'views'
  });

  // Initialize ads with mock data or local storage
  useEffect(() => {
    const saved = localStorage.getItem('trending_ads');
    if (saved) {
      setAds(JSON.parse(saved));
    } else {
      setAds(MOCK_TRENDS);
    }
  }, []);

  // AI Discovery Function
  const discoverRealTrends = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Find 5 currently trending "winning products" for dropshipping and e-commerce in May 2024. 
      Focus on viral products on TikTok, Facebook, and Instagram.
      For each product, provide:
      1. A catchy title in Arabic.
      2. The platform where it's trending (tiktok, facebook, or instagram).
      3. Primary country (SA, MA, or AE).
      4. Estimated views and likes.
      5. Category.
      6. A brief description of why it's winning.
      
      Return the data strictly as a JSON array of objects with this structure:
      {
        "id": "unique_string",
        "title": "string in Arabic",
        "thumbnail": "https://picsum.photos/seed/{id}/400/500",
        "platform": "tiktok|facebook|instagram",
        "country": "SA|MA|AE",
        "views": number,
        "likes": number,
        "shares": number,
        "category": "string in Arabic",
        "firstSeen": "2024-05-01",
        "lastSeen": "2024-05-20",
        "isWinning": true
      }`;

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
      
      const updatedAds = [...newTrends, ...ads].slice(0, 20); // Keep latest 20
      setAds(updatedAds);
      localStorage.setItem('trending_ads', JSON.stringify(updatedAds));
      alert("تم اكتشاف منتجات رابحة جديدة بنجاح!");
    } catch (error) {
      console.error("AI Discovery Error:", error);
      alert("حدث خطأ أثناء البحث عن التريندات. يرجى المحاولة لاحقاً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered Data
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
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
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
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black text-slate-800 tracking-tight">ترند مـاينيا</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* AI Discover Button */}
          <button
            onClick={discoverRealTrends}
            disabled={isAiLoading}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100`}
          >
            {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />}
            {isSidebarOpen && <span className="font-black text-sm">اكتشاف عبر الذكاء الاصطناعي</span>}
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
                ? 'bg-blue-50 text-blue-700 font-bold' 
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
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن منتج، متجر، أو كلمة مفتاحية..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all relative">
              <Star size={20} />
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">3</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white shadow-sm" />
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
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {Object.entries(COUNTRY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="views">الأكثر مشاهدة</option>
            <option value="date">الأحدث</option>
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
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-8">
              <div className="relative mb-8">
                <Loader2 size={80} className="text-blue-600 animate-spin" />
                <Sparkles size={32} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">جاري تحليل تريندات السوق...</h2>
              <p className="text-slate-600 max-w-md text-lg">يقوم الذكاء الاصطناعي الآن بمسح منصات التواصل الاجتماعي لاكتشاف المنتجات التي تحقق أعلى مبيعات حالياً.</p>
              <div className="mt-8 flex gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}

          {activeTab === 'seasonal' ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-10 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-4xl font-black mb-4">عيد الأضحى يقترب! 🐏</h2>
                  <p className="text-emerald-50 text-lg max-w-md">قمنا بتحليل أكثر من 500 إعلان ناجح في دول الخليج والمغرب العربي استعداداً لموسم الأضحى.</p>
                  <button className="mt-8 bg-white text-emerald-600 px-8 py-3 rounded-2xl font-black text-lg shadow-lg hover:scale-105 transition-transform">اكتشف المجموعة</button>
                </div>
                <Calendar size={200} className="absolute -left-10 -bottom-10 opacity-10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-xl mb-2 text-slate-800">أكثر التصنيفات طلباً</h3>
                  <div className="space-y-3 mt-4">
                    {['مستلزمات الشواء', 'الديكور المنزلي', 'هدايا العيد'].map(tag => (
                      <div key={tag} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-600">{tag}</span>
                        <Zap size={16} className="text-amber-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAds.map(ad => (
                <div key={ad.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group flex flex-col h-full">
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <img 
                      src={ad.thumbnail} 
                      alt={ad.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                        {ad.platform === 'tiktok' && <span className="bg-black text-white p-0.5 rounded"><Video size={10} /></span>}
                        {ad.platform === 'facebook' && <Facebook size={14} className="text-blue-600" />}
                        {ad.platform === 'instagram' && <Instagram size={14} className="text-pink-600" />}
                        <span className="text-[10px] font-black uppercase text-slate-800">{PLATFORM_LABELS[ad.platform]}</span>
                      </div>
                    </div>
                    {ad.isWinning && (
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-lg animate-pulse">
                          <Crown size={12} />
                          رابح مؤكد
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <button className="w-full bg-white text-blue-600 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-xl">
                        <Eye size={18} />
                        عرض تفاصيل الإعلان
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                        <MapPin size={12} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{COUNTRY_LABELS[ad.country]}</span>
                      <div className="mx-1 text-slate-200">•</div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ad.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-800 mb-6 leading-tight line-clamp-2 h-12">{ad.title}</h3>
                    
                    <div className="mt-auto pt-6 border-t border-slate-50 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">مشاهدات</p>
                        <p className="text-sm font-black text-blue-600">{formatNumber(ad.views)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">تفاعل</p>
                        <p className="text-sm font-black text-pink-600">{formatNumber(ad.likes)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">مشاركة</p>
                        <p className="text-sm font-black text-emerald-600">{formatNumber(ad.shares)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button className="lg:hidden fixed bottom-6 left-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-50">
        <Menu size={24} />
      </button>
    </div>
  );
};

export default App;
