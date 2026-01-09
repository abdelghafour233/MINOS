
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ShoppingCart, X, CheckCircle, Settings, Globe, ShieldCheck, 
  DollarSign, Database, Zap, Table, Loader2, Sparkles, Plus, 
  Trash2, Download, Key, Monitor, Mail, Phone, LayoutGrid, Edit3, 
  ImageIcon, Eye, TrendingUp, Wand2, Target, BarChart3, Rocket, 
  Truck, Store, ExternalLink, AlertCircle, TrendingDown, MousePointer2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TrendingAd, Order } from './types';
import { MOCK_TRENDS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spy' | 'winners' | 'stores'>('spy');
  const [discoveredTrends, setDiscoveredTrends] = useState<TrendingAd[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [selectedAd, setSelectedAd] = useState<TrendingAd | null>(null);

  useEffect(() => {
    const savedAds = localStorage.getItem('ma_spy_products');
    if (savedAds) {
      try { 
        const parsed = JSON.parse(savedAds);
        setDiscoveredTrends(parsed.length > 0 ? parsed : MOCK_TRENDS); 
      } catch(e) { setDiscoveredTrends(MOCK_TRENDS); }
    } else {
      setDiscoveredTrends(MOCK_TRENDS);
    }
  }, []);

  const spyOnTrends = async () => {
    if (!searchPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنت خبير تجسس على منتجات التجارة الإلكترونية (E-com Spy) في السوق المغربي. 
        المجال المطلوب البحث فيه: "${searchPrompt}".
        استخرج 4 منتجات ملموسة (Physical Products) تحقق مبيعات ضخمة حالياً في المغرب (COD Trends).
        
        ركز على:
        - المنتجات التي تظهر بكثرة في Facebook Ads Library و TikTok Creative Center في المغرب.
        - المنتجات التي يسهل بيعها بنظام "الدفع عند الاستلام".
        - استخرج "زاوية تسويقية" (Marketing Angle) لكل منتج.

        يجب أن يكون الرد بصيغة JSON حصراً ويحتوي على مصفوفة من المنتجات مع:
        - title (اسم المنتج بالدارجة المغربية أو العربية الفصحى التسويقية)
        - price (سعر البيع المقترح بالمغرب بالدرهم MAD)
        - category (التصنيف المناسب: مطبخ، جمال، سيارات، منزل...)
        - description (وصف تجسسي يشرح لماذا هذا المنتج رابح وما هي نقاط قوة المنافسين)
        - platform (فيسبوك أو تيك توك)
        - views (توقعات المشاهدات الحالية)
        - likes (توقعات التفاعل)
        - thumbnail (رابط صورة Unsplash تعبر عن المنتج الملموس بدقة)
        - sourceUrl (رابط وهمي لمتجر منافس كمثال)
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
              required: ["title", "price", "category", "description", "platform", "views", "likes", "thumbnail", "sourceUrl"]
            }
          }
        }
      });

      const generated = JSON.parse(response.text || "[]");
      const newTrends: TrendingAd[] = generated.map((item: any) => ({
        ...item,
        id: 'ma-' + Math.random().toString(36).substring(2, 9),
        country: 'MA',
        shares: Math.floor(item.likes / 10),
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      }));

      const updatedAds = [...newTrends, ...discoveredTrends];
      setDiscoveredTrends(updatedAds);
      localStorage.setItem('ma_spy_products', JSON.stringify(updatedAds));
      setActiveTab('winners');
    } catch (error) {
      console.error("Spy Error:", error);
      alert("عذراً، تعذر التجسس على البيانات حالياً.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteProduct = (id: string) => {
    const updated = discoveredTrends.filter(a => a.id !== id);
    setDiscoveredTrends(updated);
    localStorage.setItem('ma_spy_products', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-['Tajawal']">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col h-screen z-50">
        <div className="p-10 flex items-center gap-4 border-b border-white/5">
          <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-2xl shadow-orange-500/20">
            <Target size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">جاسوس الترند</h1>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">MA Market Spy</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'spy', label: 'محرك التجسس', icon: Search },
            { id: 'winners', label: 'السلع الرابحة', icon: Truck },
            { id: 'stores', label: 'تحليل المنافسين', icon: Store },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all ${
                activeTab === item.id ? 'bg-orange-500/10 text-orange-400 font-black border-r-4 border-orange-500' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              <item.icon size={22} />
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-orange-500/5 p-6 rounded-[2rem] border border-orange-500/10">
            <div className="flex items-center gap-2 text-orange-400 mb-3">
              <AlertCircle size={18} />
              <span className="text-xs font-black">حالة السوق</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">الطلب مرتفع حالياً على "أدوات المنزل" في الدار البيضاء والرباط.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full"></div>

        <header className="bg-transparent border-b border-white/5 px-12 py-8 flex items-center justify-between z-40">
           <h2 className="text-xl font-bold text-white uppercase flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-orange-500"></span>
             Morocco E-com Spy Engine
           </h2>
           <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
             <Globe size={16} className="text-orange-400" />
             <span className="text-xs font-black text-white">Target: Morocco (MA)</span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative z-10">
          {activeTab === 'spy' && (
            <div className="max-w-4xl mx-auto space-y-16 py-10">
              <div className="text-center space-y-6">
                <h3 className="text-6xl font-black text-white leading-tight">تجسس على <span className="text-orange-500">السلع الرابحة</span> <br/>في السوق المغربي</h3>
                <p className="text-slate-500 text-xl font-medium">أدخل الكلمة المفتاحية لنوع السلع التي تريد تحليلها.</p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[3rem] border border-white/10 flex items-center gap-4">
                  <input 
                    type="text" 
                    placeholder="مثال: مطبخ، إكسسوارات هواتف، أدوات تنظيف..."
                    className="flex-1 bg-transparent border-none outline-none py-6 px-8 text-2xl font-bold text-white placeholder:text-slate-600"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && spyOnTrends()}
                  />
                  <button 
                    onClick={spyOnTrends}
                    disabled={isGenerating}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl transition-all flex items-center gap-4 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={24} />}
                    {isGenerating ? 'جاري التجسس...' : 'ابدأ التجسس'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto text-orange-400"><TrendingUp size={24}/></div>
                  <h4 className="font-black text-white">تحليل الترند</h4>
                  <p className="text-xs text-slate-500 font-bold">معرفة المنتجات التي تحقق آلاف المشاهدات في المغرب.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-400"><Store size={24}/></div>
                  <h4 className="font-black text-white">مراقبة المتاجر</h4>
                  <p className="text-xs text-slate-500 font-bold">اكتشف صفحات الهبوط التي يستخدمها المنافسون.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-400"><DollarSign size={24}/></div>
                  <h4 className="font-black text-white">أرباح الـ COD</h4>
                  <p className="text-xs text-slate-500 font-bold">حساب هوامش الربح بناءً على أسعار السوق المحلي.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'winners' && (
            <div className="space-y-12 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {discoveredTrends.map((ad) => (
                  <div 
                    key={ad.id} 
                    className="group bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden hover:border-orange-500/30 transition-all cursor-pointer"
                    onClick={() => setSelectedAd(ad)}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                      <div className="absolute top-6 left-6 right-6 flex justify-between">
                        <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg uppercase">Winning</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteProduct(ad.id); }}
                          className="bg-black/40 hover:bg-rose-500 text-white p-2.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg">{ad.category}</span>
                         <span className="text-[10px] font-bold text-slate-500 uppercase">{ad.platform} Ads</span>
                      </div>
                      <h4 className="text-xl font-black text-white leading-tight line-clamp-2">{ad.title}</h4>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <p className="text-2xl font-black text-white">{ad.price} <small className="text-xs text-slate-500 font-bold">MAD</small></p>
                        <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          <MousePointer2 size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail View / Spy Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" onClick={() => setSelectedAd(null)} />
          <div className="bg-slate-900 w-full max-w-6xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
            <button onClick={() => setSelectedAd(null)} className="absolute top-10 left-10 z-[110] bg-white/5 hover:bg-rose-500 text-white p-4 rounded-full transition-all border border-white/5"><X size={24} /></button>
            
            <div className="md:w-[45%] bg-slate-950 p-12 flex flex-col items-center gap-10 border-l border-white/5">
              <img src={selectedAd.thumbnail} className="w-full aspect-square rounded-[3rem] shadow-2xl object-cover border border-white/10" />
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/5 p-6 rounded-3xl text-center border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Estimated CPA</p>
                   <p className="text-2xl font-black text-orange-500">25-45 DH</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl text-center border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Market Saturation</p>
                   <p className="text-2xl font-black text-blue-500">Low</p>
                </div>
              </div>
            </div>

            <div className="md:w-[55%] p-16 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-orange-500/10 text-orange-400 px-6 py-2 rounded-2xl text-xs font-black border border-orange-500/20 uppercase">Morocco Trend</span>
                <span className="text-slate-500 font-black text-sm flex items-center gap-2"><Eye size={18}/> {selectedAd.views.toLocaleString()} Active Views</span>
              </div>

              <h2 className="text-5xl font-black text-white mb-10 leading-tight">{selectedAd.title}</h2>
              
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 mb-10">
                <h4 className="text-orange-400 font-black text-sm mb-4 uppercase flex items-center gap-2"><AlertCircle size={18}/> تقرير التجسس:</h4>
                <p className="text-slate-200 font-bold text-2xl leading-relaxed">{selectedAd.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                 <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase">سعر البيع المقترح</p>
                   <p className="text-4xl font-black text-white">{selectedAd.price} <small className="text-sm opacity-50">MAD</small></p>
                 </div>
                 <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase">هامش الربح المتوقع</p>
                   <p className="text-4xl font-black text-green-500">120+ <small className="text-sm opacity-50">MAD</small></p>
                 </div>
              </div>

              <div className="mt-auto flex flex-col gap-6">
                <a 
                  href={selectedAd.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-white text-black py-10 rounded-[3rem] font-black text-3xl hover:bg-slate-200 transition-all flex items-center justify-center gap-6 shadow-2xl"
                >
                  <ExternalLink size={36} />
                  تجسس على المتجر المنافس
                </a>
                <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                   <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> COD Friendly</div>
                   <div className="h-4 w-[1px] bg-white/10"></div>
                   <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-500" /> Verified Ads</div>
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
