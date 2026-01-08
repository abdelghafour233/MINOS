
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Home, 
  Car, 
  Tv, 
  LayoutDashboard, 
  ShoppingCart, 
  ChevronLeft, 
  Search,
  Settings,
  Package,
  ListOrdered,
  Globe,
  Code,
  LineChart,
  Trash2,
  Plus,
  Save,
  Download,
  Menu,
  X
} from 'lucide-react';
import { Product, CartItem, Order, TrackingConfig, DomainConfig } from './types';
import { MOCK_PRODUCTS, CATEGORIES_LABELS } from './constants';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'store' | 'dashboard'>('store');
  const [currentPage, setCurrentPage] = useState<'home' | 'product' | 'checkout' | 'success'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Store State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout State
  const [customerData, setCustomerData] = useState({ fullName: '', city: '', phone: '' });

  // Dashboard State
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig>({
    facebookPixel: '',
    googleAnalytics: '',
    tiktokPixel: '',
    googleSheetsUrl: '',
    customHeaderJs: '',
    customFooterJs: ''
  });
  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    domainName: '',
    nameServers: ['ns1.mydomain.com', 'ns2.mydomain.com']
  });
  const [dashboardView, setDashboardView] = useState<'overview' | 'orders' | 'inventory' | 'tracking' | 'domain'>('overview');

  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedConfig = localStorage.getItem('config');
    if (savedConfig) setTrackingConfig(JSON.parse(savedConfig));

    const savedDomain = localStorage.getItem('domain');
    if (savedDomain) setDomainConfig(JSON.parse(savedDomain));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Handlers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.fullName || !customerData.city || !customerData.phone) return;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customerData.fullName,
      city: customerData.city,
      phone: customerData.phone,
      items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
      total: calculateTotal(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setCurrentPage('success');
  };

  const downloadProject = () => {
    // Logic to simulate downloading a bundle
    const content = JSON.stringify({ products, orders, trackingConfig, domainConfig }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'store_data_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Components
  const StoreHeader = () => (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => { setCurrentPage('home'); setActiveTab('store'); }}>لوجو المتجر</h1>
          <nav className="hidden md:flex gap-6">
            <button onClick={() => setCurrentPage('home')} className="text-gray-600 hover:text-blue-600 font-medium">الرئيسية</button>
            <button className="text-gray-600 hover:text-blue-600 font-medium">الإلكترونيات</button>
            <button className="text-gray-600 hover:text-blue-600 font-medium">المنزل</button>
            <button className="text-gray-600 hover:text-blue-600 font-medium">السيارات</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab(activeTab === 'store' ? 'dashboard' : 'store')}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {activeTab === 'store' ? <LayoutDashboard size={20} /> : <ShoppingBag size={20} />}
            <span className="hidden sm:inline font-medium">{activeTab === 'store' ? 'لوحة التحكم' : 'العودة للمتجر'}</span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );

  const DashboardSidebar = () => (
    <aside className="w-64 bg-white h-[calc(100vh-64px)] border-l flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-bold mb-6 text-gray-500 uppercase tracking-wider text-xs">القائمة الرئيسية</h2>
        <nav className="space-y-2">
          <button 
            onClick={() => setDashboardView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LineChart size={20} />
            <span className="font-medium">نظرة عامة</span>
          </button>
          <button 
            onClick={() => setDashboardView('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ListOrdered size={20} />
            <span className="font-medium">الطلبات</span>
          </button>
          <button 
            onClick={() => setDashboardView('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package size={20} />
            <span className="font-medium">المنتجات</span>
          </button>
          <button 
            onClick={() => setDashboardView('tracking')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'tracking' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Code size={20} />
            <span className="font-medium">أكواد التتبع والبكسل</span>
          </button>
          <button 
            onClick={() => setDashboardView('domain')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'domain' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Globe size={20} />
            <span className="font-medium">إعدادات الدومين</span>
          </button>
        </nav>
      </div>
      <div className="mt-auto p-6 border-t">
        <button 
          onClick={downloadProject}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
        >
          <Download size={20} />
          <span>تصدير ملفات الموقع</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StoreHeader />

      {activeTab === 'store' ? (
        <main className="flex-1">
          {currentPage === 'home' && (
            <>
              {/* Hero Section */}
              <section className="bg-gradient-to-l from-blue-700 to-blue-500 py-20 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="max-w-2xl">
                    <h2 className="text-5xl font-extrabold mb-6 leading-tight">اكتشف أفضل المنتجات بأفضل الأسعار في المغرب</h2>
                    <p className="text-xl opacity-90 mb-8">نقدم لك تشكيلة واسعة من الإلكترونيات، مستلزمات المنزل والسيارات الفاخرة.</p>
                    <div className="flex gap-4">
                      <button className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">تسوق الآن</button>
                      <button className="border-2 border-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">عروض حصرية</button>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-12 right-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
              </section>

              {/* Products Grid */}
              <section className="container mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-3xl font-bold">أحدث المنتجات</h3>
                  <div className="flex gap-2">
                    {Object.entries(CATEGORIES_LABELS).map(([key, label]) => (
                      <button key={key} className="px-4 py-2 bg-white border rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">{label}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border">
                      <div className="relative overflow-hidden h-64">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-blue-600 shadow-sm">
                          {CATEGORIES_LABELS[product.category]}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold mb-2 truncate">{product.name}</h4>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-blue-600">{product.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase">درهم مغربي (MAD)</span>
                          </div>
                          <button 
                            onClick={() => addToCart(product)}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                          >
                            <Plus size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {currentPage === 'checkout' && (
            <section className="container mx-auto px-4 py-16 max-w-4xl">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border">
                <div className="flex-1 p-10">
                  <h3 className="text-3xl font-bold mb-8">إتمام الطلب</h3>
                  <form onSubmit={placeOrder} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                      <input 
                        type="text" 
                        required
                        value={customerData.fullName}
                        onChange={e => setCustomerData({...customerData, fullName: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="أدخل اسمك بالكامل"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">المدينة</label>
                      <input 
                        type="text" 
                        required
                        value={customerData.city}
                        onChange={e => setCustomerData({...customerData, city: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="مثل: الدار البيضاء، مراكش..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                      <input 
                        type="tel" 
                        required
                        value={customerData.phone}
                        onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="06XXXXXXXX"
                      />
                    </div>
                    <div className="pt-6">
                      <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                      >
                        تأكيد الطلب الآن
                      </button>
                      <p className="text-center text-gray-400 mt-4 text-sm font-medium">الدفع نقداً عند الاستلام</p>
                    </div>
                  </form>
                </div>
                <div className="w-full md:w-80 bg-gray-50 p-10 border-r border-gray-100">
                  <h4 className="text-xl font-bold mb-6">ملخص السلة</h4>
                  <div className="space-y-4 mb-8">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.name} × {item.quantity}</span>
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString()} د.م</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">المجموع الكلي:</span>
                    <span className="text-2xl font-black text-blue-600">{calculateTotal().toLocaleString()} د.م</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentPage === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <Package size={48} />
              </div>
              <h2 className="text-4xl font-black mb-4">شكراً لطلبك!</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-md">لقد تم استلام طلبك بنجاح. سيتصل بك فريقنا قريباً لتأكيد المعلومات والشحن.</p>
              <button 
                onClick={() => setCurrentPage('home')}
                className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl"
              >
                العودة للتسوق
              </button>
            </div>
          )}
        </main>
      ) : (
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-10 bg-gray-50 overflow-y-auto">
            {dashboardView === 'overview' && (
              <div className="space-y-8">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black">لوحة التحكم</h2>
                    <p className="text-gray-500 mt-1">نظرة عامة على أداء متجرك اليوم</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border flex items-center gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><LineChart size={20} /></div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold">مبيعات اليوم</p>
                        <p className="text-lg font-black">{orders.length > 0 ? orders[0].total.toLocaleString() : 0} د.م</p>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <h4 className="text-gray-400 font-bold mb-1">إجمالي الطلبات</h4>
                    <p className="text-4xl font-black">{orders.length}</p>
                    <div className="mt-4 flex items-center gap-2 text-green-500 text-sm font-bold">
                      <span>+12% عن الشهر الماضي</span>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <h4 className="text-gray-400 font-bold mb-1">إجمالي المبيعات</h4>
                    <p className="text-4xl font-black">{orders.reduce((a, b) => a + b.total, 0).toLocaleString()} د.م</p>
                    <div className="mt-4 flex items-center gap-2 text-blue-500 text-sm font-bold">
                      <span>نمو مستقر</span>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border">
                    <h4 className="text-gray-400 font-bold mb-1">المنتجات النشطة</h4>
                    <p className="text-4xl font-black">{products.length}</p>
                    <div className="mt-4 flex items-center gap-2 text-orange-500 text-sm font-bold">
                      <span>{products.filter(p => p.stock < 5).length} منتجات قاربت على النفاد</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                  <h3 className="text-xl font-bold mb-6">رسم بياني للمبيعات</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLine data={orders.slice(0, 7).reverse().map(o => ({ date: new Date(o.createdAt).toLocaleDateString('ar-MA'), total: o.total }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      </RechartsLine>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {dashboardView === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black">إدارة الطلبات</h2>
                  <button 
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                    onClick={() => {
                       const csv = "Order ID,Customer,City,Phone,Total,Status\n" + orders.map(o => `${o.id},${o.customerName},${o.city},${o.phone},${o.total},${o.status}`).join('\n');
                       const blob = new Blob([csv], { type: 'text/csv' });
                       const url = URL.createObjectURL(blob);
                       const a = document.createElement('a');
                       a.href = url;
                       a.download = 'orders.csv';
                       a.click();
                    }}
                  >
                    <Download size={18} />
                    <span>تحميل CSV</span>
                  </button>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-sm font-bold text-gray-400">رقم الطلب</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-400">الزبون</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-400">المدينة</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-400">الهاتف</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-400">المبلغ</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-400">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-blue-600">{order.id}</td>
                          <td className="px-6 py-4 font-medium">{order.customerName}</td>
                          <td className="px-6 py-4 text-gray-500">{order.city}</td>
                          <td className="px-6 py-4 text-gray-500">{order.phone}</td>
                          <td className="px-6 py-4 font-black">{order.total.toLocaleString()} د.م</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {order.status === 'pending' ? 'انتظار التفعيل' : 'تم التوصيل'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium">لا توجد طلبات حالياً</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dashboardView === 'tracking' && (
              <div className="max-w-4xl space-y-8">
                <header>
                  <h2 className="text-3xl font-black">أكواد التتبع والبكسل</h2>
                  <p className="text-gray-500 mt-1">قم بربط متجرك مع منصات الإعلانات والتحليلات</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                  {/* Pixels Section */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Code size={24} className="text-blue-600" />
                      إعدادات البكسل
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Facebook Pixel ID</label>
                        <input 
                          type="text" 
                          value={trackingConfig.facebookPixel}
                          onChange={e => setTrackingConfig({...trackingConfig, facebookPixel: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
                          placeholder="مثال: 123456789012345"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Google Analytics (G-ID)</label>
                        <input 
                          type="text" 
                          value={trackingConfig.googleAnalytics}
                          onChange={e => setTrackingConfig({...trackingConfig, googleAnalytics: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
                          placeholder="مثال: G-XXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">TikTok Pixel ID</label>
                        <input 
                          type="text" 
                          value={trackingConfig.tiktokPixel}
                          onChange={e => setTrackingConfig({...trackingConfig, tiktokPixel: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
                          placeholder="مثال: C6XXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Google Sheets (رابط الربط)</label>
                        <input 
                          type="text" 
                          value={trackingConfig.googleSheetsUrl}
                          onChange={e => setTrackingConfig({...trackingConfig, googleSheetsUrl: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom JS Section */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
                    <h3 className="text-xl font-bold">أكواد JavaScript مخصصة</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Header Scripts (قبل &lt;/head&gt;)</label>
                        <textarea 
                          rows={4}
                          value={trackingConfig.customHeaderJs}
                          onChange={e => setTrackingConfig({...trackingConfig, customHeaderJs: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none font-mono text-sm" 
                          placeholder="<script> ... </script>"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Footer Scripts (قبل &lt;/body&gt;)</label>
                        <textarea 
                          rows={4}
                          value={trackingConfig.customFooterJs}
                          onChange={e => setTrackingConfig({...trackingConfig, customFooterJs: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none font-mono text-sm" 
                          placeholder="<script> ... </script>"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      localStorage.setItem('config', JSON.stringify(trackingConfig));
                      alert('تم حفظ الإعدادات بنجاح');
                    }}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                  >
                    <Save size={20} />
                    <span>حفظ جميع الإعدادات</span>
                  </button>
                </div>
              </div>
            )}

            {dashboardView === 'domain' && (
              <div className="max-w-4xl space-y-8">
                <header>
                  <h2 className="text-3xl font-black">إعدادات الدومين</h2>
                  <p className="text-gray-500 mt-1">اربط متجرك بعنوان ويب مخصص</p>
                </header>

                <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم الدومين</label>
                      <input 
                        type="text" 
                        value={domainConfig.domainName}
                        onChange={e => setDomainConfig({...domainConfig, domainName: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" 
                        placeholder="www.mystore.ma"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.setItem('domain', JSON.stringify(domainConfig));
                        alert('تم تحديث الدومين');
                      }}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 h-fit"
                    >
                      ربط الدومين
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-600">
                      <Settings size={20} />
                      إعدادات Name Servers
                    </h4>
                    <p className="text-sm text-gray-500 mb-6">يرجى توجيه الدومين الخاص بك إلى العناوين التالية:</p>
                    <div className="space-y-3">
                      {domainConfig.nameServers.map((ns, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <span className="font-bold text-gray-400">NS {idx + 1}:</span>
                          <code className="text-blue-600 font-bold flex-1">{ns}</code>
                          <button 
                            className="text-xs bg-white border px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(ns);
                              alert('تم النسخ');
                            }}
                          >نسخ</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-2xl font-black">سلة المشتريات</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg">سلتك فارغة حالياً</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <img src={item.image} className="w-20 h-20 object-cover rounded-xl border" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h4>
                      <p className="text-blue-600 font-black mb-2">{item.price.toLocaleString()} د.م</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        <span className="text-xs font-bold text-gray-400">الكمية: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-bold">المجموع:</span>
                  <span className="text-3xl font-black text-blue-600">{calculateTotal().toLocaleString()} د.م</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setCurrentPage('checkout'); }}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl transition-all active:scale-95"
                >
                  تأكيد الشراء
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-blue-600">لوجو المتجر</h3>
            <p className="text-gray-500 text-sm">متجرك المفضل للإلكترونيات والسيارات في جميع أنحاء المغرب. جودة عالية وتوصيل سريع.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-600 text-sm font-medium">
              <li className="hover:text-blue-600 cursor-pointer">من نحن</li>
              <li className="hover:text-blue-600 cursor-pointer">شروط الاستخدام</li>
              <li className="hover:text-blue-600 cursor-pointer">سياسة الخصوصية</li>
              <li className="hover:text-blue-600 cursor-pointer">تتبع طلبك</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">التصنيفات</h4>
            <ul className="space-y-2 text-gray-600 text-sm font-medium">
              <li className="hover:text-blue-600 cursor-pointer">هواتف ذكية</li>
              <li className="hover:text-blue-600 cursor-pointer">أثاث منزلي</li>
              <li className="hover:text-blue-600 cursor-pointer">سيارات دفع رباعي</li>
              <li className="hover:text-blue-600 cursor-pointer">إكسسوارات</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">اشترك في النشرة البريدية</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="بريدك الإلكتروني" className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">اشترك</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-gray-400 text-xs font-bold">
          © 2024 جميع الحقوق محفوظة لمتجرنا - صنع بفخر في المغرب
        </div>
      </footer>
    </div>
  );
};

export default App;
