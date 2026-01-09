
import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, X, CheckCircle, Settings, Globe, ShieldCheck, 
  DollarSign, Database, Zap, Loader2, Sparkles, Plus, 
  Trash2, Download, Key, Monitor, Eye, TrendingUp, Wand2, Target, 
  Truck, Store, ExternalLink, AlertCircle, MousePointer2, LayoutDashboard,
  Rocket, Briefcase, ChevronRight, PackageCheck, BarChart4, Flame, Ghost, Video, Facebook,
  ShoppingCart, Image as ImageIcon, LineChart, Share2
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
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

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

  const generateAIImage = async (productTitle: string, visualDescription: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `E-commerce product shot of "${productTitle}". Context: ${visualDescription}. 
      High-end professional studio photography, cinematic lighting, ultra-sharp detail, 8k resolution, 
      realistic textures, clean minimalistic background, commercial appeal. No text or logos.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error("No image generated");
    } catch (e) {
      console.error("Image Gen Error:", e);
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600';
    }
  };

  const generateProduct = async () => {
    if (!searchPrompt.trim()) return;
    setIsGenerating(true);
    setErrorStatus(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `قم بتحليل واكتشاف 4 منتجات رابحة حالياً في السوق المغربي (COD) من المصادر التالية:
        1. Facebook Ads Library (إعلانات نشطة جداً).
        2. TikTok Ads Manager (ترندات فيديوهات سريعة).
        3. YouCan Stores (أفضل المتاجر مبيعاً في المغرب).
        
        النيش المطلوب: "${searchPrompt}".`,
        config: {
          systemInstruction: `أنت محرك تجسس متقدم (Ad Spy Tool). 
          مهمتك هي محاكاة نتائج حقيقية من "Facebook Ads" و "TikTok Creative Center" و "YouCan Stores".
          - اسم المنتج (title): يجب أن يكون باللهجة المغربية البيعية (مثال: المطحنة العجيبة، بروس احترافي...).
          - السعر (price): سعر واقعي بالدرهم المغربي (MAD).
          - المنصة (platform): يجب أن تكون حصراً: (facebook, tiktok, youcan).
          - وصف بصري (visual_description): وصف إنجليزي دقيق جداً للمنتج لتوليد صورة مطابقة.
          - وصف المنتج (description): تحليل لسبب كونه ترند في المغرب حالياً.`,
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
                visual_description: { type: Type.STRING },
                views: { type: Type.NUMBER },
                likes: { type: Type.NUMBER }
              },
              required: ["title", "price", "category", "description", "platform", "visual_description", "views", "likes"]
            }
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) throw new Error("فشل الاتصال بمحرك الاستخبارات.");
      
      const generatedData = JSON.parse(textOutput);
      
      // Parallel Image Generation for speed and accuracy
      const productPromises = generatedData.map(async (item: any) => {
        const imageUrl = await generateAIImage(item.title, item.visual_description);
        return {
          ...item,
          id: 'spy-' + Math.random().toString(36).substring(2, 9),
          thumbnail: imageUrl,
          country: 'MA' as const,
          shares: Math.floor(item.likes / 5),
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          isWinning: true
        };
      });

      const finalProducts = await Promise.all(productPromises);
      const updated = [...finalProducts, ...discoveredTrends];
      setDiscoveredTrends(updated);
      localStorage.setItem('ai_generated_trends', JSON.stringify(updated));
      setActiveTab('winners');
    } catch (error: any) {
      console.error("Spy Error:", error);
      setErrorStatus("حدث خطأ في جلب بيانات الإعلانات. يرجى التأكد من كتابة اسم النيش بشكل واضح.");
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
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col h-screen z-50 shadow-2xl">
        <div className="p-10 flex items-center gap-4 border-b border-white/5">
          <div className="bg-gradient-to-br from-blue-600 to-emerald-600 p-3 rounded-2xl text-white shadow-2xl ring-4 ring-white/5">
            <Target size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">جاسوس الترند</h1>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Ad Spy Engine</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'generator', label: 'صيد الترندات', icon: Wand2 },
            { id: 'winners', label: 'نتائج التجسس', icon: Flame },
            { id: 'inventory', label: 'مخزني الخاص', icon: PackageCheck },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all group ${
                activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400 font-black border-r-4 border-emerald-500 shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'scale-110 text-emerald-400' : ''} />
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 bg-slate-900/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Active Spy Sources:
            </div>
            <div className="grid grid-cols-3 gap-2 px-2">
               <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 flex items-center justify-center" title="Facebook Ads Library"><Facebook size={16}/></div>
               <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 flex items-center justify-center" title="TikTok Creative Center"><Video size={16}/></div>
               <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 flex items-center justify-center" title="YouCan Top Stores"><ShoppingCart size={16}/></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617] relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none"></div>

        <header className="bg-transparent border-b border-white/5 px-12 py-8 flex items-center justify-between z-40 backdrop-blur-xl">
           <h2 className="text-xl font-bold text-white uppercase flex items-center gap-3 tracking-widest">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
             {activeTab === 'generator' && 'Discover Real Winning Products'}
             {activeTab === 'winners' && 'Live Spy Results'}
             {activeTab === 'inventory' && 'My Private Winning List'}
           </h2>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700 shadow-2xl">
                <LineChart size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-white uppercase">Market Sync: Active</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative z-10">
          {activeTab === 'generator' && (
            <div className="max-w-5xl mx-auto space-y-16 py-10">
              <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-widest mb-4 shadow-xl">
                  <Monitor size={14} /> Facebook Ads • TikTok • YouCan
                </div>
                <h3 className="text-7xl font-black text-white leading-tight tracking-tighter">
                  حلل وجلد ترندات <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-400">الإعلانات والمتاجر المغربية</span>
                </h3>
                <p className="text-slate-500 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                  نظامنا يقوم بالتجسس الافتراضي على مكتبة إعلانات فيسبوك وتيك توك وتوب متاجر يوكان ليعطيك صورة كاملة عما يباع فعلياً الآن.
                </p>
              </div>

              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-400 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-4 shadow-2xl">
                  <div className="p-5 bg-white/5 rounded-[2rem] text-slate-400">
                    <Search size={28} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="ابحث عن نيش: مطبخ، إكسسوارات سيارات، عناية..."
                    className="flex-1 bg-transparent border-none outline-none py-6 text-2xl font-bold text-white placeholder:text-slate-600"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateProduct()}
                  />
                  <button 
                    onClick={generateProduct}
                    disabled={isGenerating}
                    className="bg-gradient-to-br from-emerald-500 to-blue-600 hover:brightness-110 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center gap-4 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={24} />}
                    {isGenerating ? 'جاري التجسس...' : 'ابدأ التجسس'}
                  </button>
                </div>
                
                {errorStatus && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {errorStatus}
                  </div>
                )}

                {isGenerating && (
                   <p className="text-center mt-6 text-emerald-400 font-bold animate-pulse flex items-center justify-center gap-3">
                     <ImageIcon size={18}/> جاري توليد 4 صور حصرية مطابقة لوصف المنتجات المكتشفة...
                   </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                  { platform: 'facebook', label: 'FB Ads Library', val: 'Active Ads', color: 'text-blue-500' },
                  { platform: 'tiktok', label: 'TikTok Creative', val: 'Trending Now', color: 'text-cyan-400' },
                  { platform: 'youcan', label: 'YouCan Stores', val: 'Top Selling', color: 'text-emerald-400' }
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-white/10 transition-all shadow-lg">
                    <div className={`p-4 bg-white/5 rounded-2xl ${s.color}`}>
                      <PlatformIcon platform={s.platform as any} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-xl font-black text-white">{s.val}</p>
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
                    {activeTab === 'winners' ? 'نتائج التجسس المباشرة' : 'قائمة المنتجات المجلوبة'}
                  </h3>
                  <p className="text-slate-500 font-bold">
                    {activeTab === 'winners' ? 'منتجات رابحة من فيسبوك وتيك توك ويوكان مع تحليل ذكي للربحية.' : 'المنتجات التي اخترتها ليتم عرضها في متجرك لتبدأ البيع.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {(activeTab === 'winners' ? discoveredTrends : myInventory).map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10"
                  >
                    <div className="aspect-square overflow-hidden relative cursor-pointer" onClick={() => setSelectedProduct(item)}>
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                        <div className="bg-emerald-500/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg border border-white/20">
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
                           <span className="bg-white/5 px-2 py-1 rounded-lg flex items-center gap-1 border border-white/5"><Eye size={12} /> {item.views.toLocaleString()}</span>
                           <span className="bg-white/5 px-2 py-1 rounded-lg flex items-center gap-1 border border-white/5"><Flame size={12} /> {item.likes.toLocaleString()}</span>
                         </div>
                         <h4 className="text-xl font-black text-white leading-tight line-clamp-2 h-14 group-hover:text-emerald-400 transition-colors">{item.title}</h4>
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
                            className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xl group/btn"
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
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
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
                <div className="absolute -inset-2 bg-emerald-500/20 rounded-[3.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all"></div>
                <img src={selectedProduct.thumbnail} className="w-full aspect-square rounded-[3.5rem] shadow-2xl object-cover relative z-10 border border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/5 p-7 rounded-3xl border border-white/5 text-center shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Spy Source</p>
                   <div className="flex items-center justify-center gap-2">
                     <PlatformIcon platform={selectedProduct.platform} />
                     <p className="text-xl font-black text-white uppercase">{PLATFORM_LABELS[selectedProduct.platform]}</p>
                   </div>
                </div>
                <div className="bg-white/5 p-7 rounded-3xl border border-white/5 text-center shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Growth Prob.</p>
                   <p className="text-2xl font-black text-emerald-500">Viral 🚀</p>
                </div>
              </div>
            </div>

            <div className="md:w-[55%] p-16 flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-2xl text-xs font-black border border-emerald-500/20 uppercase tracking-widest">{selectedProduct.category}</span>
                <span className="text-slate-500 font-black text-sm flex items-center gap-2"><Eye size={18}/> Active Market Spy Detection</span>
              </div>

              <h2 className="text-5xl font-black text-white mb-10 leading-tight tracking-tight">{selectedProduct.title}</h2>
              
              <div className="space-y-10 flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative">
                  <h4 className="text-emerald-400 font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest"><Sparkles size={18} /> تحليل استخباراتي معمق</h4>
                  <p className="text-slate-200 font-bold text-2xl leading-relaxed whitespace-pre-line">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex items-center justify-between p-8 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-[2.5rem] border border-emerald-500/20">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Selling Price</p>
                     <p className="text-5xl font-black text-white">{selectedProduct.price} <small className="text-xl">MAD</small></p>
                   </div>
                   <div className="flex flex-col items-end gap-2 text-ltr">
                     <span className="text-emerald-500 text-xs font-black flex items-center gap-1 uppercase tracking-tighter"><TrendingUp size={14}/> Profitable Margin</span>
                     <span className="text-slate-500 text-[10px] font-bold">Auto-calculated from live ads</span>
                   </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-6">
                <button 
                  onClick={() => { addToInventory(selectedProduct); alert('تم جلب المنتج بنجاح!'); }}
                  className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 text-white py-10 rounded-[3rem] font-black text-3xl hover:brightness-110 transition-all shadow-2xl flex items-center justify-center gap-6 group"
                >
                  <Download size={36} className="group-hover:-translate-y-1 transition-transform" />
                  جلب لمتجري الآن
                </button>
                <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[11px] uppercase tracking-[0.3em] opacity-60">
                   <div className="flex items-center gap-3"><Truck size={20} className="text-emerald-500" /> COD Moroccan Market</div>
                   <div className="flex items-center gap-3"><Share2 size={20} className="text-blue-500" /> Platform Verified</div>
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
