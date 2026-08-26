import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Heart, Clock, Sparkles, ArrowRight, ShieldCheck, Trash2, Loader2, Download, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react';
import { useAppContext } from './AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

export const CustomerDashboard = () => {
  const { user, addToast } = useAppContext();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setIsLoadingOrders(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        if (data) setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        addToast("Failed to load your order history.", "info");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || 'Valued Customer';
  const firstName = fullName.split(' ')[0];

  const handleDataDeletion = async () => {
    const confirmDelete = window.confirm(
      "DPDP Act Right to Erasure: Are you sure you want to permanently delete your account and all associated personal data? This action cannot be undone."
    );
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      
      addToast("Account and personal data successfully erased.", "success");
      await supabase.auth.signOut();
      navigate('/');
    } catch (err: any) {
      console.error("Deletion error:", err);
      addToast("Automated deletion failed. Please email canvasbuildsofficial@gmail.com to process your DPDP erasure request.", "info");
    } finally {
      setIsDeleting(false);
    }
  };

  const checkIsWithin24Hours = (dateString: string) => {
    const orderDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    return (now - orderDate) < (24 * 60 * 60 * 1000);
  };

  const handleDownload = async (item: any, id: string) => {
    setDownloadingId(id);
    try {
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('zip_filename')
        .eq('id', item.id)
        .single();
        
      if (prodError || !product?.zip_filename) {
        throw new Error("No zip file mapped to this product.");
      }

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('templates')
        .createSignedUrl(product.zip_filename, 60);
        
      if (storageError) throw storageError;
      
      if (storageData?.signedUrl) {
        window.location.href = storageData.signedUrl;
      }
    } catch (err) {
      console.error("Download error:", err);
      addToast("Failed to download file. Please contact support.", "info");
    } finally {
      setDownloadingId(null);
    }
  };

  // Animation Variants for staggering
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden w-full">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-b from-[var(--color-accent-purple)]/10 via-[var(--color-accent-mint)]/5 to-transparent blur-3xl pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-accent-mint)] to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-slate-800 shadow-xl">
                  {firstName.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-[var(--color-bg-secondary)] dark:border-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight mb-1">
                Hi, {firstName}
              </h1>
              <div className="inline-flex items-center gap-2 bg-[var(--color-bg-secondary)] dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-[var(--color-text-primary)]/70">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Account
              </div>
            </div>
          </div>
          
          <Link to="/store" className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            Browse Store <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Orders Area */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-serif font-bold flex items-center gap-3 text-[var(--color-text-primary)]">
              <Package className="w-6 h-6 text-[var(--color-accent-purple)]" /> Digital Library
            </h3>
            
            {isLoadingOrders ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[2.5rem] p-20 flex flex-col justify-center items-center">
                <Loader2 className="w-10 h-10 text-[var(--color-accent-purple)] animate-spin mb-4" />
                <p className="font-bold text-[var(--color-text-primary)]/50 tracking-widest uppercase text-xs">Syncing Purchases...</p>
              </div>
            ) : orders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-[var(--color-bg-secondary)] dark:border-slate-800 rounded-[2.5rem] p-12 sm:p-20 text-center shadow-sm flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-[var(--color-bg-primary)] dark:bg-slate-950 rounded-full flex items-center justify-center mb-6 shadow-inner border border-black/5 dark:border-white/5">
                  <Heart className="w-10 h-10 text-[var(--color-text-primary)]/20 dark:text-slate-700" />
                </div>
                <h4 className="text-3xl font-serif font-bold text-[var(--color-text-primary)] mb-3 tracking-tight">Your library is empty</h4>
                <p className="text-[var(--color-text-primary)]/60 max-w-md mx-auto mb-8 leading-relaxed text-sm sm:text-base">
                  When you purchase a template or a ready-made website, it will securely appear here along with your download links.
                </p>
                <Link to="/store" className="bg-white dark:bg-slate-800 border border-[var(--color-bg-secondary)] dark:border-slate-700 text-[var(--color-text-primary)] px-8 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                  Explore Templates
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
                {orders.map((order) => {
                  const isWithin24h = checkIsWithin24Hours(order.created_at);
                  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  });

                  return (
                    <motion.div variants={itemVariants} key={order.id} className="bg-white dark:bg-slate-900 border border-[var(--color-bg-secondary)] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
                      {/* Status Ribbon */}
                      {order.status === 'paid' ? (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">Paid</div>
                      ) : (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">Pending</div>
                      )}
                      
                      <div className="flex justify-between items-end mb-6 border-b border-[var(--color-bg-secondary)] dark:border-slate-800 pb-5">
                        <div>
                          <p className="text-[10px] text-[var(--color-text-primary)]/50 font-bold uppercase tracking-widest mb-1.5">Order Info</p>
                          <p className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            {orderDate} <span className="text-[var(--color-bg-secondary)] dark:text-slate-700">•</span> <span className="text-xs font-mono text-[var(--color-text-primary)]/40">{order.id.split('-')[0]}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[var(--color-text-primary)]/50 font-bold uppercase tracking-widest mb-1.5">Total</p>
                          <p className="font-black text-[var(--color-text-primary)] text-xl">₹ {order.total_amount}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => {
                          const itemId = `${order.id}-${idx}`;
                          
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--color-bg-primary)]/60 dark:bg-slate-950/60 rounded-2xl border border-[var(--color-bg-secondary)]/50 dark:border-slate-800/50 hover:bg-[var(--color-bg-primary)] dark:hover:bg-slate-950 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient || 'from-slate-800 to-slate-900'} flex items-center justify-center text-2xl shadow-inner shrink-0 border border-black/5 dark:border-white/5`}>
                                  {item.emoji || '🎁'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-[var(--color-text-primary)] text-base mb-0.5">{item.title}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${item.priceType === 'ready' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>
                                      {item.priceType === 'ready' ? 'Ready Website' : 'Premium Code'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="sm:ml-auto">
                                {order.status === 'pending' ? (
                                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-900/50"><AlertCircle className="w-4 h-4"/> Awaiting Payment</span>
                                ) : item.priceType === 'ready' ? (
                                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center sm:justify-start gap-1.5 bg-cyan-50 dark:bg-cyan-950/30 px-4 py-2.5 rounded-xl border border-cyan-100 dark:border-cyan-900/50 w-full sm:w-auto">
                                      <CheckCircle className="w-4 h-4"/> Payment Confirmed
                                    </span>
                                    <a
                                      href={`https://wa.me/917906568743?text=${encodeURIComponent(`Hi! I just ordered the Ready Website for '${item.title}'. \nOrder ID: ${order.id.split('-')[0]}\n\nHere are the details and Google Drive link for my photos:`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer animate-pulse hover:animate-none"
                                    >
                                      <MessageCircle className="w-4 h-4" /> Send Content via WhatsApp
                                    </a>
                                  </div>
                                ) : isWithin24h ? (
                                  <button
                                    onClick={() => handleDownload(item, itemId)}
                                    disabled={downloadingId === itemId}
                                    className="w-full sm:w-auto bg-[var(--color-text-primary)] hover:bg-[var(--color-accent-purple)] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                                  >
                                    {downloadingId === itemId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Download Source Code
                                  </button>
                                ) : (
                                  <span className="text-xs font-bold text-[var(--color-text-primary)]/50 flex items-center justify-center gap-1.5 bg-[var(--color-bg-secondary)] dark:bg-slate-800 px-4 py-3 rounded-xl"><AlertCircle className="w-4 h-4 opacity-50"/> Link Expired (24h)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Side Info Panels */}
          <div className="space-y-6 lg:mt-[52px]">
            <div className="bg-gradient-to-br from-[var(--color-bg-secondary)]/50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-[2rem] p-8 border border-[var(--color-bg-secondary)] dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-800">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-3">Order Status</h4>
              <p className="text-sm text-[var(--color-text-primary)]/70 leading-relaxed mb-6">
                If you recently placed an order via WhatsApp or UPI, please allow up to <span className="font-bold text-[var(--color-accent-mint)]">2 hours</span> for it to automatically sync with your library.
              </p>
              <a href="https://wa.me/917906568743" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white dark:bg-slate-950 border border-[var(--color-bg-secondary)] dark:border-slate-700 py-3.5 rounded-xl text-sm font-bold hover:border-[var(--color-accent-mint)] hover:text-[var(--color-accent-mint)] transition-colors shadow-sm">
                Contact Support
              </a>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/10 rounded-[2rem] p-8 border border-rose-100 dark:border-rose-900/30 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-5 border border-rose-200 dark:border-rose-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-rose-900 dark:text-rose-300 mb-3">Data & Privacy</h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80 leading-relaxed mb-6 font-medium">
                Under the DPDP Act (2023), you have the right to withdraw consent and request the permanent erasure of your personal data from Canvas Builds.
              </p>
              <button 
                onClick={handleDataDeletion}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-rose-600 dark:text-rose-400 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Erasing Data..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};