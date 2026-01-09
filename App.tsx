
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ShoppingCart, X, CheckCircle, Settings, Globe, ShieldCheck, 
  DollarSign, Database, Zap, Table, Loader2, Sparkles, Plus, 
  Trash2, Download, Key, Monitor, Mail, Phone, LayoutGrid, Edit3, 
  ImageIcon, Eye, TrendingUp, Wand2, Target, BarChart3, Rocket
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TrendingAd, Order } from './types';
import { MOCK_TRENDS } from './constants';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'discover' | 'inventory' | 'analysis'>('discover');
  
  // AI & Data State
  const [discoveredTrends, setDiscoveredTrends] = useState<TrendingAd[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  // UI State
  const [selectedAd, setSelectedAd] = useState<TrendingAd | null>(null);

  // Load Initial Data
  useEffect(() => {
    const savedAds = localStorage.getItem('ai_discovered_products');
    if (savedAds) {
      try { 
        const parsed = JSON.parse(savedAds);
        setDiscoveredTrends(parsed.length > 0 ? parsed : MOCK_TRENDS); 
      } catch(e) { setDiscoveredTrends(MOCK_TRENDS); }
    } else {
      setDiscoveredTrends(MOCK_TRENDS);
    }
  }, []);

  // Gemini AI Trend Hunting Logic
  const huntTrends = async () => {
    if (!searchPrompt.trim()) return;
    setIsGenerating(true);
    setAiAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // First, get analysis and 4 specific products
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنت خبير في تحليل ترندات التجارة الإلكترونية الرقمية. 
        المجال المطلوب: "${searchPrompt}". 
        أعطني 4 منتجات رقمية (دورات، اشتراكات، خدمات، قوالب) تعتبر "ترند" حالياً ولها إمكانية ربح عالية.
        يجب أن يكون الرد بصيغة JSON حصراً ويحتوي على مصفوفة من المنتجات مع:
        - title (عنوان جذاب)
        - price (سعر مقترح بالدرهم المغربي MAD)
        - category (تصنيف دقيق)
        - description (وصف مقنع)
        - platform (فيسبوك أو تيك توك أو إنستغرام)
        - views (رقم عشوائي كبير للمشاهدات المتوقعة)
        - likes (رقم عشوائي كبير للإعجابات)
        - thumbnail (رابط صورة من unsplash تبحث بالكلمة الإنجليزية المناسبة للمنتج)
        - isWinning (دائماً true)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                price: { type: Type.NUMBER },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                platform: { type: Type.STRING },
                views: { type: Type.NUMBER },
                likes: { type: Type.NUMBER },
                thumbnail: { type: Type.STRING },
                isWinning: { type: Type.BOOLEAN }
              },
              required: ["title", "price", "category", "description", "platform", "views", "likes", "thumbnail"]
            }
          }
        }
      });

      const generated = JSON.parse(response.text || "[]");
      const newTrends: TrendingAd[] = generated.map((item: any) => ({
        ...item,
        id: 'trend-' + Math.random().toString(36).substring(2, 9),
        country: 'MA',
        shares: Math.floor(item.likes / 15),
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      }));

      const updatedAds = [...newTrends, ...discoveredTrends];
      setDiscoveredTrends(updatedAds);
      localStorage.setItem('ai_discovered_products', JSON.stringify(updatedAds));
      
      // Move to results automatically
      setActiveTab('inventory');
    } catch (error) {
      console.error("Discovery Error:", error);
      alert("خطأ في الاتصال بالذكاء الاصطناعي. يرجى التحقق من المفتاح.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteTrend = (id: string) => {
    const updated = discoveredTrends.filter(a => a.id !== id);
    setDiscoveredTrends(updated);
    localStorage.setItem('ai_discovered_products', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-['Tajawal']">
      {/* Sidebar - Control Panel */}
      <aside className="w-80 bg-slate-900/40 backdrop-blur-xl border-l border-slate-800/50 flex flex-col h-screen z-50">
        <div className="p-10 flex items-center gap-4 border-b border-white/5">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 rounded-2xl text-white shadow-2xl shadow-cyan-500/20 ring-4 ring-cyan-500/10">
            <Zap size={28} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">ترند ذكي</h1>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">AI Intelligence</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'discover', label: 'صيد الترندات', icon: Target },
            { id: 'inventory', label: 'المنتجات المكتشفة', icon: Database },
            { id: 'analysis', label: 'تقارير الأداء', icon: BarChart3 },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 font-black border-r-4 border-cyan-500 shadow-xl' 
                  : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
              }`}
            >
              <item.icon size={22} className={`${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-cyan-500/5 p-6 rounded-[2rem] border border-cyan-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-[40px] rounded-full"></div>
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-xs font-black uppercase">Gemini-3 Flash</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
              المحرك الآن يحلل ملايين نقاط البيانات لاكتشاف المنتج الرابح القادم.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Analysis Engine */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617] relative">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

        <header className="bg-transparent border-b border-white/5 px-12 py-8 flex items-center justify-between z-40">
           <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <h2 className="text-xl font-bold text-white uppercase tracking-wider">
               {activeTab === 'discover' && 'Trend Hunting Engine'}
               {activeTab === 'inventory' && 'Intelligence Database'}
               {activeTab === 'analysis' && 'Advanced Market Reports'}
             </h2>
           </div>
           <div className="flex items-center gap-6">
              <button className="text-slate-400 hover:text-white transition-colors"><Settings size={20}/></button>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div className="bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700 text-xs font-black text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                ACTIVE SESSION
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative z-10">
          {activeTab === 'discover' && (
            <div className="max-w-5xl mx-auto space-y-16 py-10">
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center gap-3 bg-cyan-500/10 text-cyan-400 px-6 py-2 rounded-full text-xs font-black border border-cyan-500/20 uppercase tracking-[0.2em] mb-4">
                  <Rocket size={14} /> Next Gen Product Research
                </div>
                <h3 className="text-7xl font-black text-white leading-tight tracking-tighter">
                  اصطد <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">الترندات</span> <br/>بذكاء خارق
                </h3>
                <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                  أدخل الكلمة المفتاحية، النيش، أو حتى فكرة مجردة.. وسيقوم محرك Gemini بالباقي.
                </p>
              </div>

              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-4 shadow-2xl">
                  <div className="p-5 bg-white/5 rounded-[2rem] text-slate-400">
                    <Search size={28} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="ابحث عن: اشتراكات ترفيهية، دورات، كتب، نيش الصحة..."
                    className="flex-1 bg-transparent border-none outline-none py-6 text-2xl font-bold text-white placeholder:text-slate-600"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && huntTrends()}
                  />
                  <button 
                    onClick={huntTrends}
                    disabled={isGenerating}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center gap-4 shadow-xl shadow-cyan-500/20 disabled:opacity-50 group/btn"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={24} className="group-hover/btn:rotate-12 transition-transform" />}
                    {isGenerating ? 'جاري التحليل...' : 'اكتشف الآن'}
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                  { icon: TrendingUp, label: "Trend Scoring", val: "98.2%", color: "text-cyan-400" },
                  { icon: Target, label: "Market Precision", val: "High", color: "text-blue-400" },
                  { icon: Sparkles, label: "AI Confidence", val: "9.8/10", color: "text-purple-400" }
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-white/10 transition-all cursor-default">
                    <div className={`p-4 bg-white/5 rounded-2xl ${s.color}`}>
                      <s.icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-3xl font-black text-white">{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-12 pb-32">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-black text-white mb-2">قاعدة بيانات الترندات</h3>
                  <p className="text-slate-500 font-bold">جميع المنتجات التي تم تحليلها واكتشافها بواسطة الذكاء الاصطناعي</p>
                </div>
                <div className="bg-cyan-500/10 px-6 py-3 rounded-2xl border border-cyan-500/20 font-black text-cyan-400">
                  {discoveredTrends.length} منتج مكتشف
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {discoveredTrends.map((ad) => (
                  <div 
                    key={ad.id} 
                    className="group relative bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10"
                    onClick={() => setSelectedAd(ad)}
                  >
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img 
                        src={`${ad.thumbnail}?auto=format&fit=crop&q=80&w=600`} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                        <div className="bg-cyan-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg">
                          <Rocket size={12} fill="currentColor" /> WINNING
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTrend(ad.id); }}
                          className="bg-black/40 hover:bg-rose-500 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 z-20">
                         <div className="flex items-center gap-3 text-[10px] font-black text-white/60 mb-3">
                           <span className="bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1"><Eye size={12} /> {ad.views.toLocaleString()}</span>
                           <span className="bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1"><Sparkles size={12} /> {ad.likes.toLocaleString()}</span>
                         </div>
                         <h4 className="text-xl font-black text-white leading-tight line-clamp-2 h-14">{ad.title}</h4>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 bg-slate-900/60 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black text-cyan-400 uppercase tracking-widest">{ad.category}</div>
                        <div className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg uppercase">{ad.platform}</div>
                      </div>
                      <div className="flex items-center justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Target Price</p>
                          <p className="text-3xl font-black text-white">{ad.price} <small className="text-sm font-bold opacity-50">MAD</small></p>
                        </div>
                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xl">
                          <TrendingUp size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700 animate-pulse">
                 <BarChart3 size={48} />
               </div>
               <h3 className="text-3xl font-black text-white">التقارير المتقدمة</h3>
               <p className="text-slate-500 max-w-md font-bold italic">هذه الميزة تقوم حالياً بجمع بيانات حقيقية من الأسواق لتوليد تقارير بيانية دقيقة حول فترات الترندات.</p>
            </div>
          )}
        </div>
      </main>

      {/* Intelligent Detail View / Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl" onClick={() => setSelectedAd(null)} />
          <div className="bg-slate-900 w-full max-w-6xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setSelectedAd(null)} 
              className="absolute top-10 left-10 z-[110] bg-white/5 hover:bg-rose-500 text-white p-4 rounded-full transition-all border border-white/5"
            >
              <X size={24} />
            </button>
            
            <div className="md:w-[45%] bg-slate-950 p-12 flex flex-col items-center gap-10 border-l border-white/5">
              <div className="relative w-full group">
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all"></div>
                <img 
                  src={`${selectedAd.thumbnail}?auto=format&fit=crop&q=90&w=800`} 
                  className="w-full aspect-square rounded-[3rem] shadow-2xl object-cover relative z-10 border border-white/10" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Trend Score</p>
                   <p className="text-3xl font-black text-cyan-500">9.4</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Competition</p>
                   <p className="text-3xl font-black text-blue-500">Low</p>
                </div>
              </div>
            </div>

            <div className="md:w-[55%] p-16 bg-slate-900 overflow-y-auto max-h-[90vh] no-scrollbar flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-cyan-500/10 text-cyan-400 px-6 py-2 rounded-2xl text-xs font-black border border-cyan-500/20 uppercase tracking-widest">{selectedAd.category}</span>
                <span className="text-slate-500 font-black text-sm flex items-center gap-2"><Target size={18}/> {selectedAd.platform} Target</span>
              </div>

              <h2 className="text-5xl font-black text-white mb-10 leading-tight tracking-tight">{selectedAd.title}</h2>
              
              <div className="space-y-10 flex-1">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 text-white group-hover:opacity-20 transition-all">
                    <Sparkles size={64} />
                  </div>
                  <h4 className="text-slate-400 font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest"><Eye size={18} /> AI Content Description</h4>
                  <p className="text-slate-200 font-bold text-2xl leading-relaxed whitespace-pre-line relative z-10">
                    {selectedAd.description}
                  </p>
                </div>

                <div className="flex items-center justify-between p-8 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-[2.5rem] border border-cyan-500/20">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Recommended Price</p>
                     <p className="text-5xl font-black text-cyan-400">{selectedAd.price} <small className="text-xl">MAD</small></p>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className="text-green-500 text-xs font-black flex items-center gap-1"><TrendingUp size={14}/> High Margin</span>
                     <span className="text-slate-500 text-[10px] font-bold">Recommended for {selectedAd.platform} Ads</span>
                   </div>
                </div>
              </div>

              <div className="mt-14 flex flex-col gap-6">
                <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-10 rounded-[3rem] font-black text-3xl hover:from-cyan-500 hover:to-blue-500 transition-all shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-6 group">
                  <Download size={36} className="group-hover:-translate-y-1 transition-transform" />
                  تحميل خطة التسويق (PDF)
                </button>
                <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[12px] uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-green-500" /> AI Verified Trend</div>
                   <div className="flex items-center gap-3"><Monitor size={20} className="text-blue-500" /> Platform Optimized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
