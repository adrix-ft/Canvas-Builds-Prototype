import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, Layers, Users, Mail, LogOut, 
  Trash2, Loader2, Edit2, X, ShieldAlert, Plus, Search, Reply, Send, CheckSquare, Square, EyeOff, Upload,
  ShoppingCart, DollarSign, CheckCircle, TrendingUp, Sparkles, UserCheck, RefreshCw, Tag, Download
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';

// --- REAL-TIME INTERACTIVE SVG REVENUE & VOLUME CHART ---
const AnalyticsChart = ({ orders }: { orders: any[] }) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [metric, setMetric] = useState<'revenue' | 'volume'>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: number; x: number; y: number } | null>(null);

  const chartData = useMemo(() => {
    const days = timeRange;
    const bucketValues = Array(days).fill(0);
    const bucketLabels = Array(days).fill('');

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(today.getDate() - (days - 1 - i));
      bucketLabels[i] = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    orders.filter(o => o.status === 'paid').forEach(order => {
      const orderDate = new Date(order.created_at);
      const diffTime = today.getTime() - orderDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < days) {
        const index = days - 1 - diffDays;
        if (metric === 'revenue') {
          bucketValues[index] += Number(order.total_amount);
        } else {
          bucketValues[index] += 1;
        }
      }
    });

    const total = bucketValues.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...bucketValues, metric === 'revenue' ? 500 : 5);

    const points = bucketValues.map((val, i) => {
      const x = (i / (days - 1)) * 460 + 20; 
      const y = 140 - ((val / maxVal) * 110); 
      return { x, y, val, label: bucketLabels[i] };
    });

    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpx = p0.x + (p1.x - p0.x) / 2;
      pathD += ` C ${cpx},${p0.y} ${cpx},${p1.y} ${p1.x},${p1.y}`;
    }
    const fillD = `${pathD} L ${points[points.length - 1].x},160 L ${points[0].x},160 Z`;

    return { points, pathD, fillD, total, maxVal };
  }, [orders, timeRange, metric]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-text-primary)]/50 uppercase tracking-widest">
              Performance Trend
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
              Live Database
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-3xl font-black text-[var(--color-text-primary)]">
              {metric === 'revenue' ? `₹${chartData.total.toLocaleString('en-IN')}` : `${chartData.total} Orders`}
            </h4>
            <span className="text-xs text-slate-400 font-medium">in selected {timeRange} days</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === 'revenue' ? 'bg-white dark:bg-slate-900 text-[var(--color-text-primary)] shadow-sm' : 'text-slate-500'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metric === 'volume' ? 'bg-white dark:bg-slate-900 text-[var(--color-text-primary)] shadow-sm' : 'text-slate-500'
            }`}
          >
            Volume
          </button>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></span>
          {([7, 14, 30] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                timeRange === range ? 'bg-[var(--color-accent-purple)] text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {range}D
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-44 mt-auto rounded-2xl bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-950/40 border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-between py-3 opacity-10 pointer-events-none">
          <div className="border-t border-black dark:border-white w-full"></div>
          <div className="border-t border-black dark:border-white w-full"></div>
          <div className="border-t border-black dark:border-white w-full"></div>
        </div>

        <svg viewBox="0 0 500 160" className="w-full h-full preserve-3d absolute inset-0" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent-purple)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <motion.path
            key={`fill-${timeRange}-${metric}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            d={chartData.fillD}
            fill="url(#chartGrad)"
          />
          <motion.path
            key={`stroke-${timeRange}-${metric}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            d={chartData.pathD}
            fill="none"
            stroke="var(--color-accent-purple)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {chartData.points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              className="fill-[var(--color-accent-purple)] hover:r-6 cursor-pointer transition-all stroke-2 stroke-white dark:stroke-slate-900"
              onMouseEnter={() => setHoveredPoint({ day: pt.label, value: pt.val, x: pt.x, y: pt.y })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div 
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full border border-white/10"
            style={{ left: `${(hoveredPoint.x / 500) * 100}%`, top: `${(hoveredPoint.y / 160) * 100}%` }}
          >
            <div>{hoveredPoint.day}</div>
            <div className="text-emerald-400 font-mono">
              {metric === 'revenue' ? `₹${hoveredPoint.value}` : `${hoveredPoint.value} orders`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const AdminDashboard = () => {
  const { addToast, user, isAdmin, setIsAuthOpen, handleLogout } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'bundles' | 'promos' | 'subscribers' | 'messages'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [orderLimit, setOrderLimit] = useState(50);
  const [subscriberLimit, setSubscriberLimit] = useState(50);

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [availableZipFiles, setAvailableZipFiles] = useState<string[]>([]);
  const [isUploadingZip, setIsUploadingZip] = useState(false);

  // Modal & Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [replyState, setReplyState] = useState<{ id: number, email: string, name: string, message: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const defaultProduct = { id: null, category: 'Special', title: '', code_price: 0, ready_price: 0, original_price: 0, rating: '5.0', icon_name: 'Heart', gradient: 'from-pink-200 to-rose-100', tag: '', youtube_url: '', file_url: '', zip_filename: '', is_hidden: false };
  const defaultBundle = { id: null, title: '', description: '', price: '', original_price: '', tag: '', gradient: 'from-slate-900 to-slate-950', included_items: '[]', emoji_list: '["🎁"]', is_hidden: false };
  const defaultPromo = { id: null, code: '', discount_percentage: 10, max_uses: 100, is_active: true };
  
  const [productForm, setProductForm] = useState<any>(defaultProduct);
  const [bundleForm, setBundleForm] = useState<any>(defaultBundle);
  const [promoForm, setPromoForm] = useState<any>(defaultPromo);

  // Real-time Listeners
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel('admin_dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        addToast("Order database updated!", "info");
        fetchAllData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        addToast("New support message received!", "info");
        fetchAllData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, orderLimit, subscriberLimit]);

  useEffect(() => {
    if (isAdmin) fetchAllData();
  }, [isAdmin, orderLimit, subscriberLimit]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, bundRes, promoRes, subRes, msgRes, storageRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: true }),
        supabase.from('bundles').select('*').order('id', { ascending: true }),
        supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('subscribers').select('*').order('created_at', { ascending: false }).limit(subscriberLimit),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.storage.from('templates').list(),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(orderLimit)
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (bundRes.data) setBundles(bundRes.data);
      if (promoRes.data) setPromos(promoRes.data);
      if (subRes.data) setSubscribers(subRes.data);
      if (msgRes.data) setMessages(msgRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      
      if (storageRes.data) {
        const files = storageRes.data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => f.name);
        setAvailableZipFiles(files);
      }
    } catch (err) {
      addToast("Failed to load dashboard data", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return { products, bundles, promos, subscribers, messages, orders };
    return {
      products: products.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
      bundles: bundles.filter(b => b.title.toLowerCase().includes(q)),
      promos: promos.filter(p => p.code.toLowerCase().includes(q)),
      subscribers: subscribers.filter(s => s.email.toLowerCase().includes(q)),
      messages: messages.filter(m => m.name.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.message.toLowerCase().includes(q)),
      orders: orders.filter(o => o.customer_email?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q))
    };
  }, [searchQuery, products, bundles, promos, subscribers, messages, orders]);

  // CSV Export Helper
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
      addToast("No data available to export.", "info");
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateFulfillmentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ fulfillment_status: newStatus }).eq('id', orderId);
      if (error) throw error;
      addToast("Fulfillment status updated!", "success");
      setOrders(orders.map(o => o.id === orderId ? { ...o, fulfillment_status: newStatus } : o));
    } catch (err: any) {
      addToast(`Error updating status: ${err.message}`, "info");
    }
  };

  const analytics = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRev = paidOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
    const aov = paidOrders.length > 0 ? Math.round(totalRev / paidOrders.length) : 0;
    const conversionRate = orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0;
    
    const customerSet = new Set([
      ...orders.map(o => o.customer_email).filter(Boolean),
      ...messages.map(m => m.email).filter(Boolean)
    ]);

    let codeCount = 0;
    let readyCount = 0;
    paidOrders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          if (item.priceType === 'ready') readyCount++;
          else codeCount++;
        });
      }
    });

    const catMap: Record<string, number> = {};
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });

    return { totalRev, paidCount: paidOrders.length, pendingCount: orders.length - paidOrders.length, aov, conversionRate, uniqueCustomers: customerSet.size, codeCount, readyCount, catMap };
  }, [orders, products, messages]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...productForm };
      delete payload.id;
      delete payload.created_at;

      let res;
      if (productForm.id) {
        res = await supabase.from('products').update(payload).eq('id', productForm.id).select();
      } else {
        res = await supabase.from('products').insert([payload]).select();
      }
      if (res.error) throw res.error;
      addToast(`Product ${productForm.id ? 'updated' : 'added'}!`, "success");
      setShowProductModal(false);
      fetchAllData();
    } catch (err: any) { addToast(`Error: ${err.message}`, "info"); }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      addToast("Product deleted", "success");
    } catch (err: any) { addToast(`Error: ${err.message}`, "info"); }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...promoForm };
      delete payload.id;
      delete payload.created_at;
      
      payload.code = payload.code.toUpperCase().replace(/\s+/g, '');

      let res;
      if (promoForm.id) {
        res = await supabase.from('promo_codes').update(payload).eq('id', promoForm.id).select();
      } else {
        res = await supabase.from('promo_codes').insert([payload]).select();
      }
      if (res.error) throw res.error;
      addToast(`Promo Code ${promoForm.id ? 'updated' : 'added'}!`, "success");
      setShowPromoModal(false);
      fetchAllData();
    } catch (err: any) { addToast(`Error: ${err.message}`, "info"); }
  };

  const deletePromo = async (id: number) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      await supabase.from('promo_codes').delete().eq('id', id);
      setPromos(promos.filter(p => p.id !== id));
      addToast("Promo deleted", "success");
    } catch (err: any) { addToast(`Error: ${err.message}`, "info"); }
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...bundleForm };
      delete payload.id;
      
      try {
        payload.included_items = JSON.parse(bundleForm.included_items || '[]');
        payload.emoji_list = JSON.parse(bundleForm.emoji_list || '[]');
      } catch {
        addToast("Invalid JSON format in Emoji List.", "info");
        return;
      }

      let res;
      if (bundleForm.id) {
        res = await supabase.from('bundles').update(payload).eq('id', bundleForm.id).select();
      } else {
        res = await supabase.from('bundles').insert([payload]).select();
      }
      if (res.error) throw res.error;
      addToast(`Bundle ${bundleForm.id ? 'updated' : 'added'}!`, "success");
      setShowBundleModal(false);
      fetchAllData();
    } catch (err: any) { addToast(`Error: ${err.message}`, "info"); }
  };

  const deleteBundle = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const { error } = await supabase.from('bundles').delete().eq('id', id);
      if (error) throw error;
      setBundles(bundles.filter(b => b.id !== id));
      addToast("Bundle deleted", "success");
    } catch (err: any) { addToast(`Error: ${err.message}`, "info"); }
  };

  const deleteMessage = async (id: number) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await supabase.from('messages').delete().eq('id', id);
      setMessages(messages.filter(m => m.id !== id));
      if (replyState?.id === id) setReplyState(null);
      addToast("Message deleted", "success");
    } catch (err) { addToast("Failed to delete message", "info"); }
  };

  const deleteSubscriber = async (id: string) => {
    if (!window.confirm("Remove subscriber?")) return;
    try {
      await supabase.from('subscribers').delete().eq('id', id);
      setSubscribers(subscribers.filter(s => s.id !== id));
      addToast("Subscriber removed", "success");
    } catch (err) { addToast("Failed to remove subscriber", "info"); }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !replyState) return;
    setIsSendingReply(true);
    try {
      const { error } = await supabase.functions.invoke('send-reply-email', {
        body: { to: replyState.email, name: replyState.name, replyText: replyContent, originalMessage: replyState.message }
      });
      if (error) throw error;
      addToast("Reply sent successfully!", "success");
      setReplyState(null);
      setReplyContent('');
    } catch (err: any) {
      addToast(`Failed to send reply: ${err.message}`, "info");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (!file.name.endsWith('.zip')) {
      addToast("Please upload a valid .zip file", "info");
      return;
    }

    setIsUploadingZip(true);
    try {
      const { error } = await supabase.storage.from('templates').upload(file.name, file, { upsert: true });
      if (error) throw error;
      addToast(`Successfully uploaded ${file.name}`, "success");
      
      const { data } = await supabase.storage.from('templates').list();
      if (data) setAvailableZipFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => f.name));
      setProductForm({ ...productForm, zip_filename: file.name });
    } catch (err: any) {
      addToast(`Upload failed: ${err.message}`, "info");
    } finally {
      setIsUploadingZip(false);
      e.target.value = '';
    }
  };

  const toggleBundleProduct = (productTitle: string) => {
    let currentItems: string[] = [];
    try { currentItems = JSON.parse(bundleForm.included_items || '[]'); } catch { currentItems = []; }
    
    if (currentItems.includes(productTitle)) currentItems = currentItems.filter(t => t !== productTitle);
    else currentItems.push(productTitle);
    
    setBundleForm({ ...bundleForm, included_items: JSON.stringify(currentItems) });
  };

  const isProductInBundle = (productTitle: string) => {
    try { return JSON.parse(bundleForm.included_items || '[]').includes(productTitle); } catch { return false; }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-3xl border border-rose-500/20 shadow-2xl flex flex-col items-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] mb-2">Restricted Access</h1>
          <p className="text-xs text-[var(--color-text-primary)]/70 mb-6">
            You must be logged in as an authorized admin to view this command center.
          </p>
          <button onClick={() => setIsAuthOpen(true)} className="bg-[var(--color-text-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-accent-mint)] transition-all cursor-pointer w-full text-sm">
            {user ? "Switch Account" : "Admin Login"}
          </button>
        </div>
      </div>
    );
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-20 pb-10 px-4 sm:px-6 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 bg-[var(--color-text-primary)] text-white rounded-xl flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-5 h-5 text-[var(--color-accent-mint)]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)]">Canvas Builds</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Production</p>
          </div>
        </div>
        
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2.5 shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'orders', icon: ShoppingCart, label: 'Orders', badge: orders.length },
            { id: 'products', icon: Package, label: 'Products', badge: products.length },
            { id: 'bundles', icon: Layers, label: 'Bundles', badge: bundles.length },
            { id: 'promos', icon: Tag, label: 'Promo Codes', badge: promos.length },
            { id: 'subscribers', icon: Users, label: 'Subscribers', badge: subscribers.length },
            { id: 'messages', icon: Mail, label: 'Messages', badge: messages.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
              className={`relative flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-text-primary)] text-white shadow-sm' 
                  : 'text-[var(--color-text-primary)]/60 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[var(--color-accent-mint)]' : 'opacity-60'}`} />
                <span>{tab.label}</span>
              </div>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/5">
            <button onClick={() => { handleLogout(); navigate('/'); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" /> Secure Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 dark:border-white/5 flex flex-col">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] capitalize">
              {activeTab}
            </h3>
            <button onClick={fetchAllData} title="Refresh Database" className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {activeTab !== 'overview' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[var(--color-accent-mint)] transition-colors"
                />
              </div>

              {/* Action Buttons based on Active Tab */}
              {activeTab === 'orders' && (
                <button onClick={() => handleExportCSV(orders, `orders_export_${new Date().toISOString()}.csv`)} className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              )}
              {activeTab === 'subscribers' && (
                <button onClick={() => handleExportCSV(subscribers, `subscribers_export_${new Date().toISOString()}.csv`)} className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              )}
              {activeTab === 'products' && (
                <button onClick={() => { setProductForm(defaultProduct); setShowProductModal(true); }} className="bg-[var(--color-text-primary)] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[var(--color-accent-mint)] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Plus className="w-4 h-4" /> Add Template
                </button>
              )}
              {activeTab === 'bundles' && (
                <button onClick={() => { setBundleForm(defaultBundle); setShowBundleModal(true); }} className="bg-[var(--color-text-primary)] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[var(--color-accent-mint)] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Plus className="w-4 h-4" /> Add Bundle
                </button>
              )}
              {activeTab === 'promos' && (
                <button onClick={() => { setPromoForm(defaultPromo); setShowPromoModal(true); }} className="bg-[var(--color-text-primary)] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[var(--color-accent-purple)] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Plus className="w-4 h-4" /> Add Promo
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[var(--color-accent-mint)]" />
            <p className="font-bold tracking-widest uppercase text-[10px]">Syncing PostgreSQL Database...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW ANALYTICS TAB */}
            {activeTab === 'overview' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="overview" className="space-y-6">
                
                {/* Top 4 KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `₹${analytics.totalRev.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                    { label: 'Paid Orders', value: analytics.paidCount, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                    { label: 'Avg Order Value (AOV)', value: `₹${analytics.aov}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
                    { label: 'Paid Conversion', value: `${analytics.conversionRate}%`, icon: UserCheck, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40' }
                  ].map((kpi, idx) => (
                    <motion.div variants={itemVariants} key={idx} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                        <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                          <kpi.icon className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="text-2xl font-black text-[var(--color-text-primary)] font-mono">{kpi.value}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Performance Chart & Real-time Sales Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                    <AnalyticsChart orders={orders} />
                  </motion.div>
                  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Recent Live Purchases</h4>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">● Active</span>
                    </div>
                    <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
                      {orders.filter(o => o.status === 'paid').slice(0, 6).map(o => (
                        <div key={o.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-black/5 dark:border-white/5 text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{o.customer_email}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 shrink-0">₹{o.total_amount}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Granular Database Metrics: Breakdown Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Fulfillment Type Split */}
                  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm mb-1">Purchased Formats</h4>
                      <p className="text-xs text-slate-400 mb-4">Code DIY vs Fully Deployed Service</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-purple-600 dark:text-purple-400">Source Code (DIY)</span>
                            <span className="font-mono">{analytics.codeCount}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full" 
                              style={{ width: `${(analytics.codeCount / Math.max(analytics.codeCount + analytics.readyCount, 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-cyan-600 dark:text-cyan-400">Ready Website</span>
                            <span className="font-mono">{analytics.readyCount}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full" 
                              style={{ width: `${(analytics.readyCount / Math.max(analytics.codeCount + analytics.readyCount, 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                      Auto-calculated from items in the Supabase `orders` table.
                    </div>
                  </motion.div>

                  {/* Catalog Distribution */}
                  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                    <h4 className="font-bold text-sm mb-1">Catalog Categories</h4>
                    <p className="text-xs text-slate-400 mb-4">Distribution across inventory</p>
                    <div className="space-y-2">
                      {Object.entries(analytics.catMap).map(([cat, count]) => (
                        <div key={cat} className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{cat}</span>
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{count} items</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Audience & Lead Engagement */}
                  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm mb-1">Customer Database</h4>
                      <p className="text-xs text-slate-400 mb-4">Subscribers & Interactions</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-black/5 dark:border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Subscribers</p>
                          <p className="text-xl font-black font-mono mt-1">{subscribers.length}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-black/5 dark:border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Messages</p>
                          <p className="text-xl font-black font-mono mt-1">{messages.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{analytics.uniqueCustomers} unique customer profiles recorded</span>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="orders" className="space-y-3">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-black/5 dark:border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  <div className="col-span-3 sm:col-span-2">Order ID</div>
                  <div className="col-span-4 sm:col-span-3">Customer Email</div>
                  <div className="hidden sm:block sm:col-span-2">Date</div>
                  <div className="col-span-3 sm:col-span-2">Payment</div>
                  <div className="col-span-2 sm:col-span-3">Fulfillment Workflow</div>
                </div>
                {filteredData.orders.map(o => (
                  <motion.div variants={itemVariants} key={o.id} className="grid grid-cols-12 gap-4 items-center p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/5 text-xs hover:border-[var(--color-accent-purple)]/40 transition-colors">
                    <div className="col-span-3 sm:col-span-2 font-mono font-bold text-slate-400 truncate">{o.id?.split('-')[0]}</div>
                    <div className="col-span-4 sm:col-span-3 font-bold truncate pr-2">{o.customer_email}</div>
                    <div className="hidden sm:block sm:col-span-2 text-slate-400 font-mono">{new Date(o.created_at).toLocaleDateString()}</div>
                    <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                      {o.status === 'paid' ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Paid (₹{o.total_amount})</span>
                      ) : (
                        <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                    {/* New Fulfillment Workflow Dropdown */}
                    <div className="col-span-2 sm:col-span-3">
                      <select 
                        value={o.fulfillment_status || 'pending'} 
                        onChange={(e) => updateFulfillmentStatus(o.id, e.target.value)}
                        className={`w-full p-2 border border-black/10 dark:border-white/10 rounded-lg text-xs font-bold outline-none cursor-pointer ${
                          o.fulfillment_status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                          o.fulfillment_status === 'building' ? 'bg-blue-50 text-blue-700' :
                          'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="pending">🟡 Pending Setup</option>
                        <option value="building">🔵 Building Site</option>
                        <option value="delivered">🟢 Delivered</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
                {orders.length >= orderLimit && (
                  <div className="pt-4 text-center">
                    <button onClick={() => setOrderLimit(orderLimit + 50)} className="text-[var(--color-accent-purple)] font-bold text-xs hover:underline cursor-pointer">
                      Load More Orders...
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* PROMO CODES TAB */}
            {activeTab === 'promos' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="promos" className="space-y-3">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-black/5 dark:border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  <div className="col-span-4 sm:col-span-3">Promo Code</div>
                  <div className="col-span-3 sm:col-span-3">Discount</div>
                  <div className="col-span-3 sm:col-span-3">Usage Limit</div>
                  <div className="hidden sm:block sm:col-span-2">Status</div>
                  <div className="col-span-2 sm:col-span-1 text-right">Actions</div>
                </div>
                {filteredData.promos.map(p => (
                  <motion.div variants={itemVariants} key={p.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/5 text-xs hover:shadow-sm transition-all ${!p.is_active ? 'opacity-60' : ''}`}>
                    <div className="col-span-4 sm:col-span-3 font-mono font-bold text-lg text-[var(--color-accent-purple)]">{p.code}</div>
                    <div className="col-span-3 sm:col-span-3 font-bold text-emerald-600">{p.discount_percentage}% OFF</div>
                    <div className="col-span-3 sm:col-span-3 font-mono">
                      {p.current_uses} / {p.max_uses} used
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.current_uses / p.max_uses) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="hidden sm:block sm:col-span-2">
                      {p.is_active ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><EyeOff className="w-3 h-3"/> Disabled</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end gap-1">
                      <button onClick={() => { setPromoForm(p); setShowPromoModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500 cursor-pointer"><Edit2 className="w-3.5 h-3.5"/></button>
                      <button onClick={() => deletePromo(p.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="products" className="space-y-3">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-black/5 dark:border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  <div className="col-span-6 sm:col-span-5">Product</div>
                  <div className="col-span-3 sm:col-span-2">Code Price</div>
                  <div className="hidden sm:block sm:col-span-2">Ready Price</div>
                  <div className="hidden sm:block sm:col-span-2">Status</div>
                  <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
                </div>
                {filteredData.products.map(p => (
                  <motion.div variants={itemVariants} key={p.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/5 text-xs hover:shadow-sm transition-all ${p.is_hidden ? 'opacity-60' : ''}`}>
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-base shrink-0 shadow-inner`}>
                        {p.icon_name === 'Heart' ? '💖' : p.icon_name === 'Users' ? '👥' : '✨'}
                      </div>
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold truncate">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{p.category}</p>
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-2 font-mono font-bold">₹{p.code_price}</div>
                    <div className="hidden sm:block sm:col-span-2 font-mono font-bold text-cyan-600 dark:text-cyan-400">₹{p.ready_price}</div>
                    <div className="hidden sm:block sm:col-span-2">
                      {p.is_hidden ? (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><EyeOff className="w-3 h-3"/> Hidden</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
                      )}
                    </div>
                    <div className="col-span-3 sm:col-span-1 flex justify-end gap-1">
                      <button onClick={() => { setProductForm(p); setShowProductModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500 cursor-pointer"><Edit2 className="w-3.5 h-3.5"/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* BUNDLES TAB */}
            {activeTab === 'bundles' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="bundles" className="space-y-3">
                {filteredData.bundles.map(b => {
                  let emojis = ["🎁"];
                  try { emojis = JSON.parse(b.emoji_list); } catch { /* ignore */ }

                  return (
                    <motion.div variants={itemVariants} key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/5 text-xs">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${b.gradient || 'from-slate-800 to-slate-900'} flex items-center justify-center text-xl shrink-0 shadow-inner`}>
                          {emojis[0] || '🎁'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{b.title}</h4>
                          <p className="text-slate-400 line-clamp-1 max-w-md mt-0.5">{b.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <span className="font-mono font-black text-sm">₹{b.price}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setBundleForm({ ...b, included_items: JSON.stringify(b.included_items), emoji_list: JSON.stringify(b.emoji_list, null, 2) }); setShowBundleModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500 cursor-pointer"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => deleteBundle(b.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* SUBSCRIBERS TAB */}
            {activeTab === 'subscribers' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="subscribers" className="space-y-2">
                {filteredData.subscribers.map((sub) => (
                  <motion.div variants={itemVariants} key={sub.id} className="flex justify-between items-center p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-black/5 dark:border-white/5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[var(--color-text-primary)] block">{sub.email}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Subscribed: {new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteSubscriber(sub.id)} className="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                {subscribers.length >= subscriberLimit && (
                  <div className="pt-4 text-center">
                    <button onClick={() => setSubscriberLimit(subscriberLimit + 50)} className="text-[var(--color-accent-purple)] font-bold text-xs hover:underline cursor-pointer">
                      Load More Subscribers...
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} key="messages" className="flex flex-col sm:flex-row gap-6 min-h-[450px]">
                <div className="w-full sm:w-1/3 flex flex-col gap-2 overflow-y-auto max-h-[450px] pr-1 custom-scrollbar">
                  {filteredData.messages.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => setReplyState(m)} 
                      className={`p-3.5 rounded-xl cursor-pointer transition-all border text-xs ${
                        replyState?.id === m.id 
                          ? 'bg-[var(--color-text-primary)] text-white shadow-sm' 
                          : 'bg-white dark:bg-slate-950 border-black/5 dark:border-white/5 hover:border-[var(--color-accent-purple)]/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-bold truncate">{m.name}</h5>
                        <span className={`text-[9px] font-mono ${replyState?.id === m.id ? 'text-white/60' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`line-clamp-2 leading-relaxed ${replyState?.id === m.id ? 'text-white/80' : 'text-slate-500'}`}>{m.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-black/5 dark:border-white/5 p-5 flex flex-col">
                  {replyState ? (
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-base">{replyState.name}</h4>
                          <a href={`mailto:${replyState.email}`} className="text-xs text-[var(--color-accent-mint)] font-bold">{replyState.email}</a>
                        </div>
                        <button onClick={() => deleteMessage(replyState.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 mb-4 flex-1 overflow-y-auto leading-relaxed italic border border-black/5 dark:border-white/5">
                        "{replyState.message}"
                      </div>
                      <textarea
                        rows={3}
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder="Write your email reply..."
                        className="w-full p-3 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:border-[var(--color-accent-purple)] resize-none mb-3"
                      />
                      <div className="flex justify-end">
                        <button 
                          onClick={handleSendReply} 
                          disabled={!replyContent.trim() || isSendingReply} 
                          className="bg-[var(--color-text-primary)] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[var(--color-accent-purple)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {isSendingReply ? "Sending..." : "Send Reply via Gmail"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                      <Mail className="w-6 h-6 mb-2 opacity-50" />
                      Select a message from the list to view and reply
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* PROMO MODAL */}
      <AnimatePresence>
        {showPromoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border border-white/10">
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg">{promoForm.id ? 'Edit Promo Code' : 'New Promo Code'}</h3>
                <button onClick={() => setShowPromoModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={handleSavePromo} className="p-6 flex flex-col gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Promo Code (e.g. FESTIVAL20)</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none uppercase font-mono" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Discount Percentage (%)</label>
                  <input required type="number" min="1" max="100" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={promoForm.discount_percentage} onChange={e => setPromoForm({...promoForm, discount_percentage: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Max Uses Allowed</label>
                  <input required type="number" min="1" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={promoForm.max_uses} onChange={e => setPromoForm({...promoForm, max_uses: Number(e.target.value)})} />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="activePromo" className="rounded" checked={promoForm.is_active || false} onChange={e => setPromoForm({...promoForm, is_active: e.target.checked})} />
                  <label htmlFor="activePromo" className="font-bold cursor-pointer">Code is currently Active</label>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[var(--color-accent-purple)] text-white py-3 rounded-xl font-bold hover:bg-[#6b46c1] transition-colors cursor-pointer">
                    Save Promo Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* PRODUCT MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg">{productForm.id ? 'Edit Template' : 'New Template'}</h3>
                <button onClick={() => setShowProductModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Category</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Title</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Code Price (₹)</label>
                  <input required type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={productForm.code_price} onChange={e => setProductForm({...productForm, code_price: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Ready Price (₹)</label>
                  <input required type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={productForm.ready_price} onChange={e => setProductForm({...productForm, ready_price: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-400 uppercase mb-1">Storage ZIP Filename <span className="text-rose-500">*</span></label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none"
                      value={productForm.zip_filename || ''} 
                      onChange={e => setProductForm({...productForm, zip_filename: e.target.value})}
                    >
                      <option value="">Select a ZIP file...</option>
                      {availableZipFiles.map(file => <option key={file} value={file}>{file}</option>)}
                    </select>
                    <div className="relative">
                      <input type="file" accept=".zip" onChange={handleZipUpload} disabled={isUploadingZip} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <button type="button" disabled={isUploadingZip} className="h-full px-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold flex items-center gap-1.5">
                        {isUploadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
                      </button>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input type="checkbox" id="hideP" className="rounded" checked={productForm.is_hidden || false} onChange={e => setProductForm({...productForm, is_hidden: e.target.checked})} />
                  <label htmlFor="hideP" className="font-bold cursor-pointer">Hide this template from the store</label>
                </div>
                <div className="sm:col-span-2 pt-4">
                  <button type="submit" className="w-full bg-[var(--color-text-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-accent-mint)] transition-colors cursor-pointer">
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* BUNDLE MODAL */}
        {showBundleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg">{bundleForm.id ? 'Edit Bundle' : 'New Bundle'}</h3>
                <button onClick={() => setShowBundleModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={handleSaveBundle} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-400 uppercase mb-1">Bundle Title</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={bundleForm.title} onChange={e => setBundleForm({...bundleForm, title: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows={2} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none resize-none" value={bundleForm.description} onChange={e => setBundleForm({...bundleForm, description: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Price String (e.g. ₹499)</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={bundleForm.price} onChange={e => setBundleForm({...bundleForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Original Price (For active sales only)</label>
                  <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl outline-none" value={bundleForm.original_price} onChange={e => setBundleForm({...bundleForm, original_price: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-400 uppercase mb-2">Select Included Products</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl max-h-36 overflow-y-auto custom-scrollbar border border-black/5 dark:border-white/5">
                    {products.map(p => {
                      const isSelected = isProductInBundle(p.title);
                      return (
                        <div key={p.id} onClick={() => toggleBundleProduct(p.title)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs ${isSelected ? 'bg-emerald-500/10 text-emerald-600 font-bold' : 'opacity-60'}`}>
                          {isSelected ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0 opacity-40" />}
                          <span className="truncate">{p.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input type="checkbox" id="hideB" className="rounded" checked={bundleForm.is_hidden || false} onChange={e => setBundleForm({...bundleForm, is_hidden: e.target.checked})} />
                  <label htmlFor="hideB" className="font-bold cursor-pointer">Hide this bundle from the store</label>
                </div>
                <div className="sm:col-span-2 pt-4">
                  <button type="submit" className="w-full bg-[var(--color-text-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-accent-mint)] transition-colors cursor-pointer">
                    Save Bundle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};