
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Search, ShoppingCart, X, CheckCircle, Package, 
  Settings, Globe, ShieldCheck, Smartphone, DollarSign, 
  LayoutDashboard, Database, ExternalLink, Play, Zap, Table, 
  Server, Code2, Loader2, Sparkles, RefreshCw, MapPin, Crown, 
  Link as LinkIcon, Mail, Download, Key, Monitor, BookOpen, Plus, Image as ImageIcon, Trash2
} from 'lucide-react';
import { TrendingAd, FilterState, Order, IntegrationConfig, Platform, Country } from './types';
import { MOCK_TRENDS, COUNTRY_LABELS, CATEGORIES } from './constants';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'ads' | 'dashboard' | 'integrations' | 'settings'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [ads, setAds] = useState<TrendingAd[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
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
  const [selectedAd, setSelectedAd] = useState<TrendingAd | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', email: '', phone: '' });
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Form State for manual product entry
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: CATEGORIES[1],
    description: '',
    image: ''
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    platform: 'all',
    country: 'all',
    category: 'الكل',
    sortBy: 'views'
  });

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

  // Filtering Logic
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchesSearch = ad.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'الكل' || ad.category === filters.category;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (filters.sortBy === 'views') return b.views - a.views;
      return 0;
    });
  }, [ads, filters]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: TrendingAd = {
      id: Math.random().toString(36).substring(2, 9),
      title: newProduct.title,
      price: Number(newProduct.price),
      description: newProduct.description,
      thumbnail: newProduct.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
      category: newProduct.category,
      platform: 'instagram',
      country: 'MA',
      views: 0,
      likes: 0,
      shares: 0,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isWinning: true
    };

    const updatedAds = [product, ...ads];
    setAds(updatedAds);
    localStorage.setItem('trending_ads', JSON.stringify(updatedAds));
    setShowAddProduct(false);
    setNewProduct({ title: '', price: '', category: CATEGORIES[1], description: '', image: '' });
    setActiveTab('ads');
  };

  const deleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = ads.filter(a => a.id !== id);
      setAds(updated);
      localStorage.setItem('trending_ads', JSON.stringify(updated));
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    setIsOrdering(true);
    
    const newOrder: Order = {
      id: 'DGT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customerName: checkoutData.name,
      city: checkoutData.email,
      phone: checkoutData.phone,
      productId: selectedAd.id,
      productTitle: selectedAd.title,
      amount: selectedAd.price,
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'pending',
      syncedToSheets: false
    };

    if (config.zapierWebhookUrl) {
      try {
        await fetch(config.zapierWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        newOrder.syncedToSheets = true;
      } catch (err) { }
    }

    setTimeout(() => {
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      setIsOrdering(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
        setSelectedAd(null);
      }, 2500);
    }, 1200);
  };

  const saveConfiguration = () => {
    localStorage.setItem('app_config', JSON.stringify(config));
    alert('تم حفظ الإعدادات!');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 border-l border-slate-800 transition-all duration-300 flex flex-col h-screen z-50 sticky top-0 shadow-2xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black text-white tracking-tight">رقمي ترند</h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'ads', label: 'المتجر الرقمي', icon: Monitor },
            { id: 'dashboard', label: 'لوحة التحكم', icon: Table },
            { id: 'integrations', label: 'الأتمتة', icon: Database },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}