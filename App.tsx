
import React, { useState, useEffect } from 'react';
import { 
  Search, X, CheckCircle, ShieldCheck, Zap, Loader2, Plus, 
  Trash2, Download, Monitor, Eye, TrendingUp, Wand2, 
  Store, ExternalLink, AlertCircle, LayoutDashboard,
  Rocket, Briefcase, PackageCheck, Flame, Video, Facebook,
  ShoppingCart, Image as ImageIcon, Cpu, BookOpen, Key, CloudLightning, 
  Lock, CreditCard, Tag, Star, User, History, Check, Copy
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { DigitalKeyProduct, UserOrder, Platform } from './types';
import { MOCK_PRODUCTS, CATEGORIES } from './constants';

const PlatformBadge = ({ platform }: { platform: Platform }) => {
  const styles: Record<Platform, string> = {
    windows: 'bg-blue-500/10 text-blue-400',
    gaming: 'bg-red-500/10 text-red-400',
    software: 'bg-indigo-500/10 text-indigo-400',
    streaming: 'bg-pink-500/10 text-pink-400',
    vpn: 'bg-emerald-500/10 text-emerald-400',
    design: 'bg-orange-500/10 text-orange-400'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[platform] || 'bg-slate-500/10 text-slate-400'}`}>
      {platform}
    {/* Fix: mismatched closing tag. Changed </div> to </span> */}
    </span>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'admin' | 'orders'>('shop');
  const [products, setProducts] = useState<DigitalKeyProduct[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<DigitalKeyProduct | null>(null);
  const [activeOrder, setActiveOrder] = useState<UserOrder | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('store_products');
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch(e) { setProducts(MOCK_PRODUCTS); }
    } else { setProducts(MOCK_PRODUCTS); }

    const savedOrders = localStorage.getItem('user_orders');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch(e) { setOrders([]); }
    }
  }, []);

  const generateAIImage = async (title: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Professional 3D high-tech box art for digital product: "${title}". 
      Futuristic software box or digital key card, glowing elements, neon lighting, 
      dark tech background, 8k resolution, cinematic render. No text.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=600';
    } catch { return 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=600'; }
  };

  const addProductViaAI = async () => {
    if (!searchPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `توليد منتج رقمي (مفتاح تفعيل) جديد بناءً على: "${searchPrompt}".`,
        config: {
          systemInstruction: `أنت مدير متجر مفاتيح رقمية. ولد بيانات منتج احترافي.
          - السعر بالدرهم (Price in MAD).
          - صيغة المفتاح (keyFormat): مثال AAAA-BBBB-CCCC.
          - المنصة (platform): اختر واحدة من (windows, gaming, software, streaming, vpn, design).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              platform: { type: Type.STRING },
              keyFormat: { type: Type.STRING }
            },
            required: ["title", "price", "category", "description", "platform", "keyFormat"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      const imageUrl = await generateAIImage(data.title);
      
      const newProd: DigitalKeyProduct = {
        ...data,
        id: 'p-' + Math.random().toString(36).substring(2, 7),
        thumbnail: imageUrl,
        isAvailable: true,
        rating: 4.5 + Math.random() * 0.5,
        salesCount: Math.floor(Math.random() * 100),
        deliveryTime: 'instant'
      };

      const updated = [newProd, ...products];
      setProducts(updated);
      localStorage.setItem('store_products', JSON.stringify(updated));
      setView('shop');
    } catch (e) { alert("خطأ في توليد المنتج."); }
    finally { setIsGenerating(false); }
  };

  const handlePurchase = (product: DigitalKeyProduct) => {
    // محاكاة شراء وتوليد مفتاح
    const key = product.keyFormat.replace(/X/g, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36))
    );
    
    const newOrder: UserOrder = {
      orderId: 'ORD-' + Math.random().toString(36).toUpperCase().substring(2, 8),
      productId: product.id,
      productTitle: product.title,
      generatedKey: key,
      purchaseDate: new Date().toLocaleString('ar-MA')
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('user_orders', JSON.stringify(updatedOrders));
    setActiveOrder(newOrder);
    setSelectedProduct(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-['Tajawal']">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col h-screen z-50 shadow-2xl">
        <div className="p-10 flex items-center gap-4 border-b border-white/5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl text-white shadow-2xl ring-4 ring-blue-500/10">
            <Key size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">متجر المفاتيح</h1>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Instant Digital Keys</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setView('shop')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all ${view === 'shop' ? 'bg-blue-500/10 text-blue-400 font-black border-r-4 border-blue-500 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Store size={20} /> <span className="text-lg">المتجر الرئيسي</span>
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all ${view === 'orders' ? 'bg-blue-500/10 text-blue-400 font-black border-r-4 border-blue-500 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <History size={20} /> <span className="text-lg">طلباتي ومفاتيحي</span>
          </button>
          <div className="pt-10 pb-4 px-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">إدارة المتجر</div>
          <button onClick={() => setView('admin')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all ${view === 'admin' ? 'bg-amber-500/10 text-amber-400 font-black border-r-4 border-amber-500 shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Wand2 size={20} /> <span className="text-lg">إضافة منتج ذكي</span>
          </button>
        </nav>

        <div className="p-8 border-t border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">A</div>
             <div>
               <p className="text-xs font-black text-white">أمين الإدريسي</p>
               <p className="text-[10px] text-slate-500">الرصيد: 1,250 MAD</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617] relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none"></div>

        <header className="bg-transparent border-b border-white/5 px-12 py-8 flex items-center justify-between z-40 backdrop-blur-xl">
           <h2 className="text-xl font-bold text-white uppercase flex items-center gap-3 tracking-widest">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
             {view === 'shop' && 'تصفح المفاتيح الرقمية الأصلية'}
             {view === 'orders' && 'سجل مفاتيح التفعيل الخاصة بك'}
             {view === 'admin' && 'إضافة منتجات ذكية للمتجر'}
           </h2>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black text-white uppercase">الحماية نشطة</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative z-10">
          {view === 'shop' && (
            <div className="space-y-12">
              <div className="flex flex-wrap gap-4">
                {CATEGORIES.map(c => (
                  <button key={c} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold hover:bg-blue-600 transition-all">
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
                {products.map(product => (
                  <div key={product.id} className="group bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                    <div className="aspect-square relative cursor-pointer overflow-hidden" onClick={() => setSelectedProduct(product)}>
                      <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                      <div className="absolute top-6 right-6">
                        <PlatformBadge platform={product.platform} />
                      </div>
                      <div className="absolute bottom-6 right-6 left-6">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-black mb-2">
                           <Star size={12} fill="currentColor" /> {product.rating} • {product.salesCount} مبيع
                        </div>
                        <h4 className="text-lg font-black text-white leading-tight line-clamp-2">{product.title}</h4>
                      </div>
                    </div>
                    <div className="p-8 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">السعر الحالي</p>
                        <p className="text-2xl font-black text-white">{product.price} <small className="text-xs">MAD</small></p>
                      </div>
                      <button onClick={() => setSelectedProduct(product)} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-xl transition-all">
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'admin' && (
            <div className="max-w-4xl mx-auto py-20 space-y-12 text-center">
               <h3 className="text-6xl font-black text-white tracking-tighter">أضف منتجات <span className="text-blue-500">بذكاء</span></h3>
               <p className="text-slate-500 text-xl font-medium">أدخل اسم المنتج الرقمي وسيقوم المحرك بتجهيز الوصف، السعر، والصورة التسويقية تلقائياً.</p>
               
               <div className="relative group max-w-2xl mx-auto">
                 <div className="absolute -inset-1 bg-blue-500 blur-2xl opacity-10 rounded-[3rem]"></div>
                 <div className="relative bg-slate-900 p-4 rounded-[3rem] border border-white/10 flex items-center gap-4">
                    <div className="p-5 text-slate-500"><Tag size={28} /></div>
                    <input 
                      type="text" 
                      placeholder="مثال: اشتراك نتفليكس 4K، مفتاح كاسبرسكي..." 
                      className="flex-1 bg-transparent border-none outline-none text-2xl font-bold text-white placeholder:text-slate-700"
                      value={searchPrompt}
                      onChange={(e) => setSearchPrompt(e.target.value)}
                    />
                    <button 
                      onClick={addProductViaAI}
                      disabled={isGenerating}
                      className="bg-blue-600 text-white px-10 py-6 rounded-[2.5rem] font-black text-xl hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={24} />}
                      {isGenerating ? 'جاري الإضافة...' : 'إضافة الآن'}
                    </button>
                 </div>
               </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="max-w-5xl mx-auto space-y-8">
               <h3 className="text-3xl font-black text-white mb-10">سجل مشترياتك</h3>
               {orders.length === 0 ? (
                 <div className="py-40 text-center opacity-20">
                   <PackageCheck size={80} className="mx-auto mb-6" />
                   <p className="text-2xl font-bold">لم تشتري أي مفاتيح بعد</p>
                 </div>
               ) : (
                 <div className="grid gap-6">
                   {orders.map(order => (
                     <div key={order.orderId} className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] flex items-center justify-between">
                       <div className="flex items-center gap-6">
                         <div className="p-5 bg-blue-500/10 rounded-2xl text-blue-400"><Key size={30} /></div>
                         <div>
                            <h4 className="text-xl font-black text-white">{order.productTitle}</h4>
                            <p className="text-xs text-slate-500">رقم الطلب: {order.orderId} • {order.purchaseDate}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4 bg-slate-950 px-6 py-4 rounded-2xl border border-white/5 group relative">
                          <code className="text-blue-400 font-mono font-bold tracking-widest text-lg">{order.generatedKey}</code>
                          <button onClick={() => copyToClipboard(order.generatedKey)} className="text-slate-500 hover:text-white transition-all ml-4">
                            <Copy size={18} />
                          </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedProduct(null)} />
          <div className="bg-slate-900 w-full max-w-5xl rounded-[4rem] relative overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 animate-in zoom-in-95">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 z-[110] text-slate-500 hover:text-white transition-all">
              <X size={24} />
            </button>
            <div className="md:w-1/2 p-12 bg-slate-950 flex flex-col items-center justify-center gap-8">
               <img src={selectedProduct.thumbnail} className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl border border-white/10" />
               <div className="flex gap-4 w-full">
                  <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">التسليم</p>
                    <p className="text-sm font-black text-emerald-400">فوري 🔥</p>
                  </div>
                  <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">الضمان</p>
                    <p className="text-sm font-black text-blue-400">سنة كاملة</p>
                  </div>
               </div>
            </div>
            <div className="md:w-1/2 p-16 flex flex-col justify-between">
               <div>
                 <div className="flex items-center gap-3 mb-6">
                   <PlatformBadge platform={selectedProduct.platform} />
                   <span className="text-slate-600 font-bold text-xs uppercase tracking-widest">Original Product</span>
                 </div>
                 <h2 className="text-4xl font-black text-white mb-8 leading-tight">{selectedProduct.title}</h2>
                 <p className="text-slate-400 font-bold text-xl leading-relaxed mb-10">{selectedProduct.description}</p>
               </div>
               
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-8 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase font-black mb-1">إجمالي السعر</p>
                     <p className="text-5xl font-black text-white">{selectedProduct.price} <small className="text-xl">MAD</small></p>
                   </div>
                   <div className="text-right">
                     <p className="text-emerald-500 font-black text-xs">متوفر في المخزون</p>
                     <p className="text-slate-500 text-[10px]">تشفير SSL آمن</p>
                   </div>
                 </div>
                 <button 
                  onClick={() => handlePurchase(selectedProduct)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-10 rounded-[3rem] font-black text-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-4 group transition-all"
                 >
                   <CreditCard size={32} />
                   إتمام الشراء الآن
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Order Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setActiveOrder(null)} />
          <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] p-16 text-center relative border border-white/10 animate-in bounce-in">
             <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-emerald-500/20">
               <Check size={50} strokeWidth={4} />
             </div>
             <h3 className="text-4xl font-black text-white mb-4">تم الشراء بنجاح!</h3>
             <p className="text-slate-400 font-bold mb-12">شكراً لثقتك بمتجرنا. إليك مفتاح التفعيل الخاص بك:</p>
             
             <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 relative group mb-10">
                <code className="text-3xl font-mono font-black text-blue-400 tracking-[0.3em] block mb-4">{activeOrder.generatedKey}</code>
                <button 
                  onClick={() => copyToClipboard(activeOrder.generatedKey)}
                  className="flex items-center gap-2 mx-auto text-slate-500 hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
                >
                  {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'تم النسخ!' : 'نسخ المفتاح'}
                </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveOrder(null)} className="bg-white/5 text-white py-6 rounded-3xl font-black hover:bg-white/10 transition-all">إغلاق</button>
                <button onClick={() => { setView('orders'); setActiveOrder(null); }} className="bg-blue-600 text-white py-6 rounded-3xl font-black hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                  <History size={18} />
                  سجل طلباتي
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
