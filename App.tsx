
import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, X, CheckCircle, Settings, Globe, ShieldCheck, 
  DollarSign, Database, Zap, Loader2, Sparkles, Plus, 
  Trash2, Download, Key, Monitor, Eye, TrendingUp, Wand2, Target, 
  Truck, Store, ExternalLink, AlertCircle, MousePointer2, LayoutDashboard,
  Rocket, Briefcase, ChevronRight, PackageCheck, BarChart4, Flame, Ghost, Video, Facebook,
  ShoppingCart
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TrendingAd, Platform } from './types';
import { MOCK_TRENDS, PLATFORM_LABELS } from './constants';

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case 'snapchat': return <Ghost size={14} className="text-yellow-400" />;
    case 'tiktok': return <Video size={14} className="text-cyan-400" />;
    case 'facebook': return <Facebook size={14} className="text-blue-500" />;
    case 'youcan': return <ShoppingCart size={14} className="text-emerald-400" />;
    default: return <Globe size={14} className="text-slate-400" />;
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'winners' | 'inventory'>('generator');
  const [discoveredTrends, setDiscoveredTrends] = useState<TrendingAd[]>([]);
  const [myInventory, setMyInventory] = useState<TrendingAd[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<TrendingAd | null>(null);

  useEffect(() => {
    const savedTrends = localStorage.getItem('ai_generated_trends');
    if (savedTrends) {
      try { 
        const parsed = JSON.parse(savedTrends);
        setDiscoveredTrends(parsed.length > 0 ? parsed : MOCK_TRENDS); 
      } catch(e) { setDiscoveredTrends(MOCK_TRENDS); }
    } else {
      setDiscoveredTrends(MOCK_TRENDS);
    }

    const savedInventory = localStorage.getItem('user_store_inventory');
    if (savedInventory) {
      try { setMyInventory(JSON.parse(savedInventory)); } catch(e) { setMyInventory([]); }
    }
  }, []);

  const generateProduct = async () => {
    if (!searchPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنت محرك ذكاء اصطناعي فائق الذكاء "Omni-Trend Engine" متخصص في استخراج المنتجات الرابحة من المنصات الكبرى.
        النيش المطلوب: "${searchPrompt}".
        
        مهمتك:
        اكتشاف أو ابتكار 4 منتجات ملموسة (Physical Products) تحقق مبيعات استثنائية حالياً في السوق المغربي بنظام COD.
        يجب أن تأتي المنتجات من المصادر التالية:
        1. إعلانات فيسبوك (Facebook Ads Library).
        2. ترندات تيك توك (TikTok Creative Center).
        3. إعلانات سناب شات (Snapchat Trends).
        4. المتاجر الناجحة على منصة يوكان (YouCan Stores) في المغرب.

        المتطلبات لكل منتج:
        - اسم المنتج بلهجة مغربية بيعية.
        - تحديد المنصة (facebook, tiktok, snapchat, youcan).
        - تحليل عميق لسبب نجاحه في المغرب.
        - سعر البيع المقترح بالدرهم المغربي (MAD).

        يجب أن يكون الرد بصيغة JSON حصراً:
        - title (اسم المنتج)
        - price (سعر البيع)
        - category (التصنيف)
        - description (التحليل الذكي والوصف)
        - platform (يجب أن يكون حصراً: facebook, tiktok, snapchat, youcan)
        - views (أرقام تفاعل ضخمة)
        - likes (أرقام تفاعل ضخمة)
        - thumbnail (رابط صورة Unsplash واقعية)
        - sourceUrl (رابط متجر منافس على يوكان أو رابط إعلان)
        - isWinning (true)`,
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
                sourceUrl: { type: Type.STRING },
                isWinning: { type: Type.BOOLEAN }
              },
              required: ["title", "price", "category", "description", "platform", "views", "likes", "thumbnail"]
            }
          }
        }
      });

      const generated = JSON.parse(response.text || "[]");
      const newItems: TrendingAd[] = generated.map((item: any) => ({
        ...item,
        id: 'gen-' + Math.random().toString(36).substring(2, 9),
        country: 'MA',
        shares: Math.floor(item.likes / 10),
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      }));

      const updated = [...newItems, ...discoveredTrends];
      setDiscoveredTrends(updated);
      localStorage.setItem('ai_generated_trends', JSON.stringify(updated));
      setActiveTab('winners');
    } catch (error) {
      console.error("Gen Error:", error);
      alert("حدث خطأ أثناء جلب البيانات. حاول مجدداً.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToInventory = (product: TrendingAd) => {
    if (myInventory.some(p => p.id === product.id)) return;
    const updated = [product, ...myInventory];
    setMyInventory(updated);
    localStorage.setItem('user_store_inventory', JSON.stringify(updated));
  };

  const removeFromInventory = (id: string) => {
    const updated = myInventory.filter(p => p.id !== id);
    setMyInventory(updated);
    localStorage.setItem('user_store_inventory', JSON.stringify(updated));
  };

  const deleteTrend = (id: string) => {
    const updated = discoveredTrends.filter(p => p.id !== id);
    setDiscoveredTrends(updated);
    localStorage.setItem('ai_generated_trends', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-['Tajawal']">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col h-screen z-50 shadow-2xl">
        <div className="p-10 flex items-center gap-4 border-b border-white/5">
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 p-3 rounded-2xl text-white shadow-2xl shadow-orange-500/30 ring-4 ring-orange-500/10">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">ترند AI</h1>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Multi-Source Spy</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'generator', label: 'المولد الذكي', icon: Wand2 },
            { id: 'winners', label: 'ترندات المنصات', icon: Flame },
            { id: 'inventory', label: 'مخزون متجري', icon: PackageCheck },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all group ${
                activeTab === item.id ? 'bg-orange-500/10 text-orange-400 font-black border-r-4 border-orange-500 shadow-lg shadow-orange-500/5' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'scale-110 text-orange-400' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Live Intelligence:
            </div>
            <div className="grid grid-cols-4 gap-2 px-2">
               <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 flex items-center justify-center" title="Facebook"><Facebook size={16}/></div>
               <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 flex items-center justify-center" title="TikTok"><Video size={16}/></div>
               <div className="p-2 bg-yellow-400/10 rounded-xl text-yellow-400 border border-yellow-400/20 flex items-center justify-center" title="Snapchat"><Ghost size={16}/></div>
               <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 flex items-center justify-center" title="YouCan"><ShoppingCart size={16}/></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617] relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none"></div>

        <header className="bg-transparent border-b border-white/5 px-12 py-8 flex items-center justify-between z-40 backdrop-blur-xl">
           <h2 className="text-xl font-bold text-white uppercase flex items-center gap-3 tracking-widest">
             <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
             {activeTab === 'generator' && 'Omni-Channel AI Generator'}
             {activeTab === 'winners' && 'Viral Market Results'}
             {activeTab === 'inventory' && 'My Store Inventory'}
           </h2>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700 shadow-2xl">
                <Globe size={16} className="text-orange-400" />
                <span className="text-xs font-black text-white">MOROCCO MARKET • COD READY</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative z-10">
          {activeTab === 'generator' && (
            <div className="max-w-5xl mx-auto space-y-16 py-10">
              <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-6 py-2 rounded-full text-xs font-black border border-orange-500/20 uppercase tracking-widest mb-4 shadow-xl shadow-orange-500/5">
                  <Sparkles size={14} /> AI-Powered Sourcing Engine
                </div>
                <h3 className="text-7xl font-black text-white leading-tight tracking-tighter">
                  حلل وجلد ترندات <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-400 to-yellow-400">سناب، تيك توك، فيسبوك، ويوكان</span>
                </h3>
                <p className="text-slate-500 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                  محركنا لا يخمن، بل يبحث في قواعد بيانات المنصات الأربعة ليعطيك المنتجات التي تحقق أرباحاً خيالية في المغرب حالياً.
                </p>
              </div>

              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-yellow-400 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-4 shadow-2xl">
                  <div className="p-5 bg-white/5 rounded-[2rem] text-slate-400">
                    <Search size={28} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="نيش المطبخ، إكسسوارات السيارات، أجهزة المنزل..."
                    className="flex-1 bg-transparent border-none outline-none py-6 text-2xl font-bold text-white placeholder:text-slate-600"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateProduct()}
                  />
                  <button 
                    onClick={generateProduct}
                    disabled={isGenerating}
                    className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center gap-4 shadow-xl shadow-orange-500/20 disabled:opacity-50 group/btn"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={24} className="group-hover/btn:rotate-12 transition-transform" />}
                    {isGenerating ? 'جاري التحليل...' : 'توليد الترندات'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12">
                {[
                  { platform: 'facebook', label: 'FB Library', status: 'Active', color: 'text-blue-500' },
                  { platform: 'tiktok', label: 'TikTok Ads', status: 'Viral', color: 'text-cyan-400' },
                  { platform: 'snapchat', label: 'Snap Trends', status: 'Rising', color: 'text-yellow-400' },
                  { platform: 'youcan', label: 'YouCan Top', status: 'Best Seller', color: 'text-emerald-400' }
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-white/10 transition-all group/card shadow-lg shadow-black/20">
                    <div className={`p-4 bg-white/5 rounded-2xl ${s.color} group-hover/card:scale-110 transition-transform`}>
                      <PlatformIcon platform={s.platform as any} />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-xl font-black text-white">{s.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'winners' || activeTab === 'inventory') && (
            <div className="space-y-12 pb-32">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-black text-white mb-2">
                    {activeTab === 'winners' ? 'تحليل نتائج المنصات' : 'قائمة المنتجات المجلوبة'}
                  </h3>
                  <p className="text-slate-500 font-bold">
                    {activeTab === 'winners' ? 'نتائج التجسس المتقدمة من سناب شات، تيك توك، فيسبوك، ويوكان.' : 'هذه هي المنتجات التي حددتها لبدء العمل عليها في متجرك.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {(activeTab === 'winners' ? discoveredTrends : myInventory).map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
                  >
                    <div className="aspect-[3/4] overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(item)}>
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                      
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                        <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border border-white/10 shadow-lg">
                          <PlatformIcon platform={item.platform} />
                          {PLATFORM_LABELS[item.platform]}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); activeTab === 'winners' ? deleteTrend(item.id) : removeFromInventory(item.id); }}
                          className="bg-black/40 hover:bg-rose-500 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/5"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 z-20">
                         <div className="flex items-center gap-3 text-[10px] font-black text-white/60 mb-3">
                           <span className="bg-white/5 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/5"><Eye size={12} /> {item.views.toLocaleString()}</span>
                           <span className="bg-white/5 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/5"><Flame size={12} /> {item.likes.toLocaleString()}</span>
                         </div>
                         <h4 className="text-xl font-black text-white leading-tight line-clamp-2 h-14 group-hover:text-orange-400 transition-colors">{item.title}</h4>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 bg-slate-900/60 backdrop-blur-md">
                      <div className="flex items-center justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Recommended Price</p>
                          <p className="text-3xl font-black text-white">{item.price} <small className="text-sm font-bold opacity-50">MAD</small></p>
                        </div>
                        {activeTab === 'winners' ? (
                          <button 
                            onClick={() => { addToInventory(item); alert('تم جلب المنتج بنجاح!'); }}
                            className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-xl group/btn"
                          >
                            <Plus size={24} className="group-hover/btn:rotate-90 transition-transform" />
                          </button>
                        ) : (
                          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                            <CheckCircle size={24} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(activeTab === 'winners' ? discoveredTrends : myInventory).length === 0 && (
                <div className="py-40 text-center space-y-6 opacity-30">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Database size={48} />
                  </div>
                  <h4 className="text-2xl font-black text-white">لا توجد بيانات حالية</h4>
                  <p className="font-bold">ابدأ بتوليد المنتجات لتحليل السوق المغربي.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#020617]/98 backdrop-blur-2xl" onClick={() => setSelectedProduct(null)} />
          <div className="bg-slate-900 w-full max-w-6xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-10 left-10 z-[110] bg-white/5 hover:bg-rose-500 text-white p-4 rounded-full transition-all border border-white/5"
            >
              <X size={24} />
            </button>
            
            <div className="md:w-[45%] bg-slate-950 p-12 flex flex-col items-center gap-10 border-l border-white/5">
              <div className="relative w-full group">
                <div className="absolute -inset-2 bg-orange-500/20 rounded-[3.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all"></div>
                <img src={selectedProduct.thumbnail} className="w-full aspect-square rounded-[3.5rem] shadow-2xl object-cover relative z-10 border border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/5 p-7 rounded-3xl border border-white/5 text-center shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Platform Power</p>
                   <div className="flex items-center justify-center gap-2">
                     <PlatformIcon platform={selectedProduct.platform} />
                     <p className="text-xl font-black text-white uppercase">{PLATFORM_LABELS[selectedProduct.platform]}</p>
                   </div>
                </div>
                <div className="bg-white/5 p-7 rounded-3xl border border-white/5 text-center shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Win Prob.</p>
                   <p className="text-2xl font-black text-emerald-500">95%</p>
                </div>
              </div>
            </div>

            <div className="md:w-[55%] p-16 flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-orange-500/10 text-orange-400 px-6 py-2 rounded-2xl text-xs font-black border border-orange-500/20 uppercase tracking-widest">{selectedProduct.category}</span>
                <span className="text-slate-500 font-black text-sm flex items-center gap-2"><Eye size={18}/> Omni-Channel AI Detection</span>
              </div>

              <h2 className="text-5xl font-black text-white mb-10 leading-tight tracking-tight">{selectedProduct.title}</h2>
              
              <div className="space-y-10 flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative">
                  <h4 className="text-orange-400 font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest"><Sparkles size={18} /> تحليل ذكاء الأعمال</h4>
                  <p className="text-slate-200 font-bold text-2xl leading-relaxed whitespace-pre-line">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex items-center justify-between p-8 bg-gradient-to-br from-orange-500/10 to-transparent rounded-[2.5rem] border border-orange-500/20">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Local Price MAD</p>
                     <p className="text-5xl font-black text-white">{selectedProduct.price} <small className="text-xl">DH</small></p>
                   </div>
                   <div className="flex flex-col items-end gap-2 text-ltr">
                     <span className="text-emerald-500 text-xs font-black flex items-center gap-1 uppercase tracking-tighter"><TrendingUp size={14}/> Profitable ROI</span>
                     <span className="text-slate-500 text-[10px] font-bold">YouCan Market Data</span>
                   </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-6">
                <button 
                  onClick={() => { addToInventory(selectedProduct); alert('تم جلب المنتج لمتجرك بنجاح!'); }}
                  className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 text-white py-10 rounded-[3rem] font-black text-3xl hover:brightness-110 transition-all shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-6 group"
                >
                  <Download size={36} className="group-hover:-translate-y-1 transition-transform" />
                  جلب لمتجري الآن
                </button>
                <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[11px] uppercase tracking-[0.3em] opacity-60">
                   <div className="flex items-center gap-3"><Truck size={20} className="text-orange-500" /> COD Moroccan Market</div>
                   <div className="flex items-center gap-3"><Monitor size={20} className="text-blue-500" /> Social Viral Data</div>
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
