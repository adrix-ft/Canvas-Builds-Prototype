import { AuthModal } from './AuthModal';
import { AdminDashboard } from './AdminDashboard';
import { DemoUnavailablePage } from './DemoUnavailablePage';
import { AIAssistant } from './AIAssistant';
import { LegalModal } from "./LegalModal";
import { CustomerDashboard } from './CustomerDashboard';
import React, { useState, useEffect, useRef } from "react";
import { UnsubscribePage } from "./UnsubscribePage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useAppContext } from "./AppContext";
import {
  ToastContainer,
  CartDrawer,
  SearchModal,
  DatabaseBundles,
} from "./NewComponents";
import {
  Search,
  User,
  ShoppingCart,
  Heart,
  Star,
  ArrowRight,
  Mail,
  Menu,
  X,
  Play,
  Sparkles,
  ChevronRight,
  Github,
  Instagram,
  ChevronDown,
  MessageCircle,
  Check,
  Code,
  Terminal,
  Users,
  Book,
  Moon,
  Clock,
  MapPin,
  Zap,
  Shield,
  Sun,
  Package,
  Gift
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { getProductIcon } from "./iconHelper";

export type ProductItem = {
  id: number;
  category: string;
  title: string;
  code_price: number;
  ready_price: number;
  original_price?: number;
  rating: string;
  emoji: React.ReactNode;
  gradient: string;
  tag?: string;
  youtube_url?: string | null;
  file_url?: string | null;
};

const INITIAL_TESTIMONIALS = [
  {
    name: "Adrix S.",
    role: "Bought for Anniversary",
    text: "This saved my anniversary! I have zero coding experience but the guide was so easy to follow. My boyfriend loved it!",
  },
  {
    name: "Rahul K.",
    role: "Bought for Apology",
    text: "She was so mad at me, but this cute apology template actually made her smile. Worth every penny.",
  },
  {
    name: "Ananya M.",
    role: "Bought for Bestie",
    text: "My best friend literally cried when she opened the link. Such a unique and thoughtful gift idea!",
  },
  {
    name: "Vikram D.",
    role: "Bought for Girlfriend",
    text: "The animations are so smooth and it looks amazing on mobile. Hosted it for free on Vercel in 5 mins.",
  },
  {
    name: "Neha R.",
    role: "Bought for Anniversary",
    text: "Beautifully crafted code. As a dev myself, I appreciate the clean React structure and Tailwind styling.",
  },
];

const FAQS = [
  {
    q: "Do I need coding experience?",
    a: "Not at all! We provide an easy guide to edit the raw code yourself. Or, skip the hassle—we can customize and deploy the site for you!",
  },
  {
    q: "How do I embed my own Spotify, YouTube, or Instagram content?",
    a: "It's super simple! You just copy the 'Embed Code' or 'Share Link' directly from the app (like a Spotify playlist or YouTube video) and paste it into the designated spot in our template. If you purchase the 'Ready Website' option, just send us the links and we'll handle the embedding for you!",
  },
  {
    q: "Can I add a Google Map of where we first met?",
    a: "Absolutely. You can easily embed a custom Google Maps location to highlight a special memory, like your first date, proposal spot, or favorite vacation destination.",
  },
  {
    q: "Do I need premium accounts to embed these features?",
    a: "No premium subscriptions are required! Standard public links from platforms like Spotify, Apple Music, Netflix, and YouTube work perfectly well inside our templates.",
  },
  {
    q: "Is this a one-time payment?",
    a: "Yes, a one-time fee gives you lifetime access to the raw code. If you want us to handle customization and deployment, simply reach out after purchase.",
  },
  {
    q: "How do I host the website?",
    a: "You can host it yourself for FREE using our 5-minute guide. Alternatively, ask us to deploy it and we'll send you a ready-to-share live link.",
  },
  {
    q: "What do I get after purchasing?",
    a: "You instantly receive a zip file with the raw source code and instructions. From there, choose your path: DIY or let us customize it!",
  },
];

const MagneticButton = ({ children, className, onClick }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

const Navbar = () => {
  const { user, isAdmin, cart, setIsCartOpen, setIsSearchOpen, isDarkMode, toggleDarkMode, setIsAuthOpen } = useAppContext();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fallbackInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-2 sm:py-3" : "py-3 sm:py-5"}`}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center bg-[var(--color-bg-primary)]/90 backdrop-blur-xl rounded-full px-4 sm:px-8 transition-all duration-300 ${isScrolled ? "h-14 sm:h-16 shadow-sm border border-[var(--color-text-primary)]/5" : "h-14 sm:h-16"}`}
          >
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 group"
            >
              <img src="/icon.png" alt="Canvas Builds Icon" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm dark:hidden" />
              <img src="/icon2.png" alt="Canvas Builds Icon" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm hidden dark:block" />
              <span className="text-xl tracking-tight flex items-baseline font-bold text-[var(--color-text-primary)]">
                Canvas<span className="text-[var(--color-accent-mint)]">Builds</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { name: "Home", path: "/" },
                { name: "Templates", path: "/store" },
                { name: "Reviews", path: "/reviews" },
                { name: "FAQ", path: "/faq" },
                { name: "About Us", path: "/about" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className={`text-sm font-semibold transition-colors relative py-2 ${pathname === item.path ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)]/60 hover:text-[var(--color-text-primary)]"}`}
                >
                  {item.name}
                  {pathname === item.path && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-accent-mint)] rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-full font-bold text-xs transition-colors cursor-pointer mr-1"
                >
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <button
                onClick={toggleDarkMode}
                className="hover:bg-[var(--color-bg-secondary)] p-2 sm:p-2.5 rounded-full transition-colors text-[var(--color-text-primary)]/80 cursor-pointer"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-[var(--color-bg-secondary)] p-2 sm:p-2.5 rounded-full transition-colors text-[var(--color-text-primary)]/80 cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hover:bg-[var(--color-bg-secondary)] p-2 sm:p-2.5 rounded-full transition-colors text-[var(--color-text-primary)]/80 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[var(--color-accent-mint)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cart.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:flex hover:bg-[var(--color-bg-secondary)] p-1.5 rounded-full transition-colors cursor-pointer items-center justify-center border border-transparent hover:border-black/5 dark:hover:border-white/5 ml-1"
              >
                {user ? (
                  avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-mint)] to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {fallbackInitial}
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#ffeddb] dark:bg-slate-800 text-[#493129] dark:text-slate-300 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>
              <button
                className="lg:hidden p-2 text-[var(--color-text-primary)]/80 hover:bg-[var(--color-bg-secondary)] rounded-full cursor-pointer"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[var(--color-bg-primary)] shadow-2xl flex flex-col rounded-l-[2rem] overflow-hidden will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 flex justify-between items-center border-b border-[var(--color-bg-secondary)]/50 bg-[var(--color-bg-primary)]/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <img src="/icon.png" alt="Canvas Builds Icon" className="w-8 h-8 object-contain dark:hidden" />
                  <img src="/icon2.png" alt="Canvas Builds Icon" className="w-8 h-8 object-contain hidden dark:block" />
                  <span className="font-bold text-xl tracking-tight text-[var(--color-text-primary)] font-serif">
                    Menu
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-3">
                <div
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 bg-[var(--color-bg-primary)]/60 backdrop-blur-sm p-3.5 rounded-2xl mb-2 border border-[var(--color-bg-secondary)] cursor-pointer hover:bg-[var(--color-bg-primary)] transition-colors"
                >
                  <Search className="w-5 h-5 text-[var(--color-text-primary)]/50" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    readOnly
                    className="bg-transparent border-none outline-none w-full text-[var(--color-text-primary)] text-[15px] cursor-pointer pointer-events-none"
                  />
                </div>

                {[
                  { name: "Home", path: "/" },
                  { name: "Templates", path: "/store" },
                  { name: "Reviews", path: "/reviews" },
                  { name: "FAQ", path: "/faq" },
                  { name: "About Us", path: "/about" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between text-[15px] font-bold p-4 rounded-2xl transition-colors ${pathname === item.path ? "bg-[var(--color-bg-secondary)] text-[var(--color-accent-mint)] shadow-sm" : "text-[var(--color-text-primary)]/80 hover:bg-[var(--color-bg-secondary)]/50"}`}
                    >
                      {item.name}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-[var(--color-bg-secondary)]/50 flex flex-col gap-3">
                {isAdmin && (
                  <Link 
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-rose-500 text-white font-bold hover:bg-rose-600 rounded-2xl transition-colors shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    <Shield className="w-5 h-5" /> Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-[#493129] text-white font-bold hover:bg-[#8b597b] rounded-2xl transition-colors shadow-lg shadow-[#493129]/20 cursor-pointer"
                >
                  <User className="w-5 h-5" /> {user ? "My Account" : "Sign In / Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Cursor = ({ color, name, x, y, delay, img, durationX = 12, durationY = 15, moveX = 40, moveY = -40 }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 0, y: 20 }}
    animate={{ opacity: 1, x: [0, moveX, -moveX / 2, 0], y: [0, moveY, -moveY / 2, 0] }}
    transition={{
      opacity: { duration: 0.8, delay },
      x: { duration: durationX, repeat: Infinity, ease: "easeInOut", delay },
      y: { duration: durationY, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className="absolute pointer-events-none flex flex-col items-start scale-75 sm:scale-100 will-change-transform transform-gpu"
    style={{ left: x, top: y }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="z-30 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 3.5L18.5 10.5L11.5 12.5L8.5 19.5L5.5 3.5Z" fill={color} stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow-md border border-slate-100 ml-3 -mt-1 z-40">
      {img && <img src={img} alt={name} className="w-4 h-4 rounded-full object-cover" />}
      <span className="text-[10px] font-bold text-slate-800">{name}</span>
    </div>
  </motion.div>
);

const Hero = () => {
  return (
    <div className="relative overflow-hidden min-h-[90dvh] flex flex-col items-center justify-center w-full pt-28 bg-[var(--color-bg-primary)]">
      <div 
        className="absolute inset-0 z-0 bg-blueprint-grid opacity-100 pointer-events-none"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 20%, transparent 100%)'
        }}
      ></div>

      <div className="absolute inset-0 max-w-[1200px] mx-auto z-10 pointer-events-none">
        <Cursor color="#10b981" name="Adarsh" x="65%" y="15%" delay={0.2} img="/assets/3.webp" moveX={30} moveY={40} durationX={14} />
        <Cursor color="#ec4899" name="Akshara" x="75%" y="20%" delay={1.2} img="/assets/5.webp" moveX={-30} moveY={30} durationX={12} />
        <Cursor color="#3b82f6" name="Adrix" x="82%" y="28%" delay={0.5} img="/assets/4.webp" moveX={-20} moveY={20} durationX={13} />
        <Cursor color="#8b5cf6" name="Shantanu" x="20%" y="25%" delay={2.0} img="/assets/1.webp" moveX={40} moveY={-20} durationX={15} />
        <Cursor color="#f59e0b" name="Ayush" x="15%" y="65%" delay={0.8} img="/assets/2.webp" moveX={-40} moveY={-30} durationY={16} />
        <Cursor color="#06b6d4" name="Batit" x="40%" y="75%" delay={1.5} img="/assets/6.webp" moveX={20} moveY={-40} durationX={11} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 relative z-20 w-full text-center flex flex-col items-center pointer-events-none"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[var(--color-bg-secondary)] shadow-sm mb-8">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-widest">
            Create a website in minutes
          </span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-extrabold text-[var(--color-text-primary)] tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
          Canvas<span className="relative inline-block ml-3">
            <span className="relative z-10 text-[var(--color-accent-mint)]">Builds</span>
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-accent-mint)]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="6" fill="transparent" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="text-[var(--color-text-primary)]/60 dark:text-slate-400 text-lg sm:text-xl leading-relaxed max-w-xl font-medium mb-10">
          Crafting aesthetic, code-driven digital gifts for the people you cherish most.
        </p>

        <div className="flex items-center gap-4 pointer-events-auto">
          <Link
            to="/store"
            className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl flex items-center gap-2"
          >
            Explore Templates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-5xl mx-auto px-6 mt-24 relative z-20 flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-[var(--color-text-primary)]/5 pointer-events-none"
      >
        <p className="text-sm font-bold text-[var(--color-text-primary)]/40 uppercase tracking-widest text-center sm:text-left">
          Crafted for memorable <br/> digital celebrations
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40 grayscale">
          <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text-primary)]">
            <svg width="28" height="28" viewBox="-11.5 -10.23174 23 20.46348" xmlns="http://www.w3.org/2000/svg"><circle cx="0" cy="0" r="2.05" fill="currentColor"/><g stroke="currentColor" strokeWidth="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>
            React
          </div>
          <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text-primary)] tracking-tighter">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 4L24 20H0L12 4Z"/></svg>
            Vercel
          </div>
          <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text-primary)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.493C9.339 21.585 9.522 21.276 9.522 21.011C9.522 20.774 9.513 19.986 9.508 19.124C6.726 19.728 6.139 17.96 6.139 17.96C5.684 16.806 5.029 16.498 5.029 16.498C4.123 15.879 5.101 15.892 5.101 15.892C6.102 15.962 6.629 16.915 6.629 16.915C7.518 18.435 8.956 17.995 9.541 17.742C9.631 17.078 9.898 16.638 10.193 16.388C7.973 16.136 5.636 15.277 5.636 11.472C5.636 10.388 6.023 9.499 6.653 8.796C6.551 8.544 6.214 7.534 6.749 6.166C6.749 6.166 7.578 5.901 9.492 7.198C10.28 6.979 11.139 6.87 11.992 6.866C12.845 6.87 13.704 6.979 14.493 7.198C16.406 5.901 17.234 6.166 17.234 6.166C17.77 7.534 17.433 8.544 17.332 8.796C17.963 9.499 18.348 10.388 18.348 11.472C18.348 15.289 16.009 16.133 13.784 16.38C14.154 16.699 14.484 17.329 14.484 18.283C14.484 19.648 14.472 20.745 14.472 21.011C14.472 21.279 14.652 21.59 15.161 21.492C19.132 20.163 22 16.417 22 12C22 6.477 17.523 2 12 2Z"/></svg>
            GitHub
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const services = [
  {
    id: "anniversary",
    title: "Celebrate Milestones",
    description: "Create unforgettable digital memories for your anniversaries. From timeline journeys to interactive memory books, make every year count.",
    icon: <Heart className="w-6 h-6 text-[var(--color-accent-pink)]" />,
    image: "/assets/anniversary.webp",
    align: "right",
  },
  {
    id: "friendship",
    title: "Best Friends Forever",
    description: "Because standard cards are boring. Build a custom 'Squad Goals' gallery or a hilarious inside-joke compilation for your best friend.",
    icon: <Users className="w-6 h-6 text-[var(--color-accent-purple)]" />,
    image: "/assets/friend.webp",
    align: "left",
  },
  {
    id: "special",
    title: "Apologies & Surprises",
    description: "Messed up? Say sorry with a cute, interactive page. Or just send a '100 Reasons Why I Love You' site to brighten their day randomly.",
    icon: <Sparkles className="w-6 h-6 text-[var(--color-accent-mint)]" />,
    image: "/assets/apology.webp",
    align: "right",
  },
];

const ServicesShowcase = () => {
  return (
    <div className="py-24 bg-[var(--color-bg-primary)] border-t border-[var(--color-text-primary)]/5 overflow-hidden w-full relative z-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-text-primary)] mb-6 tracking-tight">
            Bring your favorite moments to life
          </h2>
          <p className="text-[var(--color-text-primary)]/60 text-lg font-medium">
            With Canvas Builds, you unlock beautiful, code-driven templates that spark joy and help you express exactly how you feel.
          </p>
        </div>

        <div className="space-y-24 sm:space-y-32">
          {services.map((service) => {
            const isImagePath = typeof service.image === "string" && (service.image.startsWith("/") || service.image.startsWith("http") || service.image.includes("."));
            return (
              <div 
                key={service.id}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                  service.align === 'left' ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <motion.div 
                  initial={{ opacity: 0, x: service.align === 'right' ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full lg:w-1/2"
                >
                  <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-sm border border-[var(--color-bg-secondary)] group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-bg-secondary)]/50 to-transparent pointer-events-none"></div>
                    {isImagePath ? (
                      <motion.img 
                        src={service.image} 
                        alt={service.title}
                        className="relative z-10 w-full h-full object-cover object-[75%] transition-transform duration-700"
                      />
                    ) : (
                      <motion.div 
                        className="text-[8rem] sm:text-[12rem] relative z-10 drop-shadow-xl transition-transform duration-700 leading-none select-none flex justify-center items-center"
                      >
                        {service.image}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm border border-[var(--color-bg-secondary)]">
                    {service.icon}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] mb-4">
                    {service.title}
                  </h3>
                  <p className="text-[var(--color-text-primary)]/60 text-lg leading-relaxed mb-8 max-w-md">
                    {service.description}
                  </p>
                  <Link 
                    to="/store"
                    className="text-[var(--color-text-primary)] font-bold flex items-center gap-2 group hover:text-[var(--color-accent-mint)] transition-colors"
                  >
                    Explore Templates
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const IntegrationsSection = () => {
  const row1Brands = [
    { name: 'spotify', color: '1DB954' },
    { name: 'airbnb', color: 'FF5A5F' },
    { name: 'reddit', color: 'FF4500' },
    { name: 'vsco', color: '000000' },
    { name: 'x', color: '000000' },
    { name: 'tinder', color: 'FE3C72' },
    { name: 'twitch', color: '9146FF' },
    { name: 'messenger', color: '00B2FF' },
    { name: 'pinterest', color: 'E60023' },
    { name: 'apple', color: '000000' },
    { name: 'snapchat', color: 'FFFC00' },
    { name: 'discord', color: '5865F2' },
    { name: 'soundcloud', color: 'FF3300' },
    { name: 'tiktok', color: '000000' },
    { name: 'facebook', color: '1877F2' },
    { name: 'vimeo', color: '1AB7EA' }
  ];

  const row2Brands = [
    { name: 'youtube', color: 'FF0000' },
    { name: 'uber', color: '000000' },
    { name: 'telegram', color: '26A5E4' },
    { name: 'netflix', color: 'E50914' },
    { name: 'duolingo', color: '58CC02' },
    { name: 'whatsapp', color: '25D366' },
    { name: 'googlemaps', color: '4285F4' },
    { name: 'applemusic', color: 'FA243C' },
    { name: 'playstation', color: '003791' },
    { name: 'wechat', color: '07C160' },
    { name: 'instagram', color: 'E4405F' },
    { name: 'dropbox', color: '0061FF' },
    { name: 'strava', color: 'FC4C02' },
    { name: 'zoom', color: '2D8CFF' },
    { name: 'goodreads', color: '382110' },
    { name: 'line', color: '00C300' }
  ];

  const row1 = [...row1Brands, ...row1Brands, ...row1Brands];
  const row2 = [...row2Brands, ...row2Brands, ...row2Brands];

  return (
    <div className="bg-[#273e3d] dark:bg-slate-900 py-16 sm:py-24 w-full overflow-hidden relative">
      <div 
        className="absolute inset-0 z-0 opacity-100 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%)'
        }}
      ></div>

      <div className="relative z-10 w-full max-w-2xl mx-auto mb-10 sm:mb-16 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest mb-6 border border-white/10">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> Make It Personal
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 w-full break-words whitespace-normal px-2">
          Embed your favorite memories.
        </h2>
        <p className="text-white/80 font-medium mb-10 sm:mb-12 text-sm sm:text-base leading-relaxed w-full break-words whitespace-normal px-2">
          A digital gift is nothing without your shared moments. Easily integrate your favorite Spotify playlists, YouTube videos, and photo galleries directly into your custom website.
        </p>
        <a href="/faq" className="text-white font-bold underline underline-offset-4 hover:text-[#E2FB6C] transition-colors text-sm sm:text-base">
          See how it works
        </a>
      </div>

      <div 
        className="relative z-10 w-full overflow-hidden flex flex-col gap-4 sm:gap-6"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}
      >
        <div className="w-full overflow-hidden flex">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
            className="flex gap-4 sm:gap-6 w-max transform-gpu will-change-transform"
          >
            {row1.map((brand, i) => (
              <div key={`r1-${i}`} className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl cursor-pointer">
                <img 
                  src={`https://cdn.simpleicons.org/${brand.name}/${brand.color}`} 
                  alt={brand.name} 
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
          </motion.div>
        </div>
        
        <div className="w-full overflow-hidden flex">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
            className="flex gap-4 sm:gap-6 w-max transform-gpu will-change-transform"
          >
            {row2.map((brand, i) => (
              <div key={`r2-${i}`} className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl cursor-pointer">
                <img 
                  src={`https://cdn.simpleicons.org/${brand.name}/${brand.color}`} 
                  alt={brand.name} 
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="flex flex-row sm:flex-col w-full bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-sm border border-black/5 dark:border-slate-800 animate-pulse h-full">
    <div className="relative w-[40%] sm:w-full aspect-[4/5] sm:aspect-[16/9] bg-slate-200 dark:bg-slate-800/50 shrink-0">
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-slate-300 dark:bg-slate-700 w-12 h-4 sm:w-16 sm:h-5 rounded-full z-20 shadow-sm border border-transparent"></div>
    </div>
    <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-start bg-white dark:bg-slate-900 z-20 relative sm:border-t border-l sm:border-l-0 border-black/5 dark:border-slate-800">
      <div className="h-3 sm:h-3.5 w-16 sm:w-20 bg-slate-200 dark:bg-slate-800 rounded mb-1 sm:mb-2" />
      <div className="h-8 sm:h-7 w-full bg-slate-200 dark:bg-slate-800 rounded mb-3 sm:mb-4" />
      <div className="flex flex-col xl:flex-row gap-1.5 sm:gap-2 mt-auto pt-2">
        <div className="h-[34px] sm:h-[42px] w-full bg-slate-200 dark:bg-slate-800 rounded-lg sm:rounded-xl" />
        <div className="h-[34px] sm:h-[42px] w-full bg-slate-200 dark:bg-slate-800 rounded-lg sm:rounded-xl" />
      </div>
    </div>
  </div>
);

const ProductCard = ({ product }: { product: ProductItem }) => {
  const navigate = useNavigate();
  const { addToCart } = useAppContext();
  const [isHovered, setIsHovered] = React.useState(false);

  const getVideoId = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(product.youtube_url);

  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setIsHovered(true);
    }
  };

  const handleReadyWebsiteOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.ready_price,
      priceType: "ready",
      gradient: product.gradient,
      emoji: product.emoji,
    });
  };

  const handleGetCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.code_price,
      priceType: "code",
      gradient: product.gradient,
      emoji: product.emoji,
    });
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-row sm:flex-col w-full bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 dark:border-slate-800 relative h-full"
    >
      <div
        className={`relative w-[40%] sm:w-full aspect-[4/5] sm:aspect-[16/9] flex items-center justify-center overflow-hidden shrink-0 ${
          !videoId ? `bg-gradient-to-br ${product.gradient}` : "bg-black/5"
        }`}
      >
        {videoId ? (
          <>
            <img
              src={`https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-500 z-0"
              onError={(e) => {
                // Fallback to maxres if webp fails
                (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              }}
            />
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute inset-0 z-10 overflow-hidden sm:rounded-t-[2rem]"
                >
                  <div className="absolute inset-0 z-20 bg-transparent cursor-pointer pointer-events-auto"></div>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&disablekb=1&fs=0&iv_load_policy=3&loop=1&playsinline=1&rel=0&playlist=${videoId}`}
                    className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                    tabIndex={-1}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-[2.5rem] sm:text-[5.5rem] drop-shadow-xl transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 relative z-0 flex justify-center items-center">
            {product.emoji}
          </div>
        )}
        {product.tag && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 rounded-full z-30 shadow-sm border border-black/5 uppercase tracking-wider">
            {product.tag}
          </div>
        )}
      </div>
      
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-start bg-white dark:bg-slate-900 z-10 relative sm:border-t border-l sm:border-l-0 border-black/5 dark:border-slate-800">
        <div>
          <p className="h-3 sm:h-3.5 flex items-center text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-primary)]/50 mb-1 sm:mb-2">
            {product.category}
          </p>
          <h3 className="h-8 sm:h-7 font-serif font-bold text-[var(--color-text-primary)] mb-3 sm:mb-4 text-sm sm:text-xl leading-tight group-hover:text-[var(--color-accent-pink)] transition-colors line-clamp-2 sm:line-clamp-1">
            {product.title}
          </h3>
        </div>
        
        <div className="mt-auto pt-2">
          <div className="flex flex-col xl:flex-row gap-1.5 sm:gap-2">
            <button
              onClick={handleReadyWebsiteOrder}
              className="h-[34px] sm:h-[42px] w-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-100 dark:border-cyan-900 shadow-sm"
            >
              <Book className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Ready (₹ {product.ready_price})
            </button>
            <button
              onClick={handleGetCode}
              className="h-[34px] sm:h-[42px] w-full bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-[var(--color-accent-purple)] hover:text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-purple-100 dark:border-purple-900 shadow-sm"
            >
              <Code className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Code (₹ {product.code_price})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BundlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAppContext();
  const [bundle, setBundle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("bundles")
          .select("*")
          .eq("id", Number(id))
          .single();
        if (error) throw error;
        if (data) setBundle(data);
      } catch (err) {
        console.error("Error fetching bundle:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBundle();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex justify-center items-center w-full">
        <div className="w-8 h-8 border-4 border-[var(--color-accent-purple)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center w-full">
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">Bundle not found</h2>
        <button onClick={() => navigate('/store')} className="text-[var(--color-accent-purple)] font-bold hover:underline cursor-pointer">
          Return to Store
        </button>
      </div>
    );
  }

  let emojis = ["🎁"];
  if (Array.isArray(bundle.emoji_list)) emojis = bundle.emoji_list;
  else if (typeof bundle.emoji_list === 'string') {
    try { emojis = JSON.parse(bundle.emoji_list); } catch { /* ignore */ }
  }

  let items = [];
  if (Array.isArray(bundle.included_items)) items = bundle.included_items;
  else if (typeof bundle.included_items === 'string') {
    try { items = JSON.parse(bundle.included_items); } catch { /* ignore */ }
  }

  const numericPrice = Number(String(bundle.price).replace(/[^0-9.]/g, '')) || 499;

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[var(--color-bg-primary)] relative overflow-hidden w-full">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]/75 hover:text-[var(--color-text-primary)] transition-colors mb-10 font-bold cursor-pointer w-fit"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Store
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          <div className="w-full lg:w-1/2">
            <div className={`w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[2.5rem] relative flex items-center justify-center bg-gradient-to-br ${bundle.gradient || 'from-slate-800 to-slate-900'} shadow-sm border border-black/5 dark:border-white/5 overflow-hidden group`}>
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none"></div>
              
              <div className="text-[5rem] sm:text-[7rem] drop-shadow-xl flex items-center justify-center gap-2 sm:gap-4 z-10 transition-transform duration-500 group-hover:scale-105">
                 {emojis.map((emoji: string, idx: number) => (
                    <span key={idx} className={idx > 0 && emojis.length > 2 ? "-ml-4 sm:-ml-8" : ""}>{emoji}</span>
                 ))}
              </div>

              {bundle.tag && (
                 <div className="absolute top-6 left-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm text-[var(--color-text-primary)] text-[10px] font-bold px-3 py-1.5 rounded-full z-20 shadow-sm border border-black/5 uppercase tracking-wider">
                    {bundle.tag}
                 </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col pt-2 sm:pt-4">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[var(--color-text-primary)] mb-4 leading-tight tracking-tight">
              {bundle.title}
            </h1>
            
            <p className="text-[var(--color-text-primary)]/70 text-base sm:text-lg leading-relaxed mb-10 font-medium">
              {bundle.description}
            </p>

            <div className="mb-10 bg-white dark:bg-slate-900 border border-[var(--color-bg-secondary)] dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-5 flex items-center gap-2.5">
                 <Package className="w-5 h-5 text-[var(--color-accent-purple)]" /> Included in bundle
              </h3>
              
              {items.length > 0 ? (
                <ul className="space-y-4">
                  {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]/80 dark:text-slate-300 font-bold">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-accent-mint)]/10 flex items-center justify-center shrink-0 border border-[var(--color-accent-mint)]/20">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-text-primary)]/50 italic">Items will be listed here.</p>
              )}
            </div>

            <div className="mt-auto pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-[var(--color-bg-secondary)] dark:border-slate-800">
               <div className="flex flex-col">
                  {bundle.original_price && (
                    <span className="text-sm text-[var(--color-text-primary)]/40 line-through font-bold mb-0.5">
                      {bundle.original_price}
                    </span>
                  )}
                  <span className="text-4xl font-black text-[var(--color-text-primary)] leading-none">
                     {bundle.price}
                  </span>
               </div>
               
               <button
                 onClick={() => addToCart({
                   id: bundle.id + 10000,
                   title: bundle.title,
                   price: numericPrice,
                   priceType: "code",
                   gradient: bundle.gradient || "from-slate-900 to-slate-950",
                   emoji: <Gift className="w-5 h-5 text-white" />,
                 })}
                 className="w-full sm:w-auto py-4 px-8 bg-[var(--color-text-primary)] hover:bg-[var(--color-accent-purple)] text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
               >
                 <ShoppingCart className="w-5 h-5" /> Add Bundle to Cart
               </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAppContext();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", Number(id))
          .single();
        if (error) throw error;
        if (data) {
          setProduct({
            id: data.id,
            category: data.category,
            title: data.title,
            code_price: data.code_price,
            ready_price: data.ready_price,
            original_price: data.original_price,
            rating: data.rating || "5.0",
            gradient: data.gradient || "from-pink-200 to-rose-100",
            tag: data.tag,
            youtube_url: data.youtube_url,
            file_url: data.file_url,
            emoji: getProductIcon(data.icon_name),
          });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex justify-center items-center w-full">
        <div className="w-8 h-8 border-4 border-[var(--color-accent-pink)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center w-full">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button onClick={() => navigate('/store')} className="text-[var(--color-accent-pink)] hover:underline cursor-pointer">
          Return to Store
        </button>
      </div>
    );
  }

  const getEmbedDetails = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? {
      videoId: match[2],
      embedUrl: `https://www.youtube.com/embed/${match[2]}?rel=0`
    } : null;
  };

  const embedDetails = getEmbedDetails(product.youtube_url);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-bg-primary)] w-full">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]/75 hover:text-[var(--color-accent-pink)] transition-colors mb-8 font-medium cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Products
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="w-full lg:w-[55%] flex flex-col gap-4">
            <div className={`w-full aspect-[16/9] rounded-2xl overflow-hidden relative shadow-lg border border-[var(--color-bg-secondary)]/50 ${embedDetails ? 'bg-black' : `bg-gradient-to-br ${product.gradient}`}`}>
              {embedDetails ? (
                isPlaying ? (
                  <iframe
                    src={`${embedDetails.embedUrl}&autoplay=1`}
                    title={product.title}
                    className="w-full h-full absolute inset-0 border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div 
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setIsPlaying(true)}
                  >
                    <img 
                      src={`https://i.ytimg.com/vi_webp/${embedDetails.videoId}/hqdefault.webp`}
                      alt="Video Thumbnail"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${embedDetails.videoId}/maxresdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors duration-300">
                      <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[6rem] drop-shadow-2xl">
                  {product.emoji}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (product.file_url) {
                  window.open(product.file_url, "_blank");
                } else {
                  navigate("/demo-unavailable", { state: { productName: product.title } });
                }
              }}
              className="w-full py-3.5 rounded-xl border border-[var(--color-bg-secondary)] bg-white/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-[var(--color-text-primary)] font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4" /> Live Demo
            </button>
          </div>

          <div className="w-full lg:w-[45%] flex flex-col">
            {product.tag && (
              <span className="bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-4">
                {product.tag}
              </span>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--color-text-primary)] mb-4">
              {product.title}
            </h1>

            <p className="text-[var(--color-text-primary)]/75 text-sm sm:text-base leading-relaxed mb-8">
              A beautifully crafted {product.category.toLowerCase()} website template featuring smooth animations, interactive elements, and a responsive design to make your special person smile.
            </p>

            <div className="mb-10">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">What's Included</h3>
              <ul className="space-y-3">
                {[
                  "Beautiful, responsive design",
                  "Smooth animations & transitions",
                  "Easily customizable text & images",
                  "Background music support",
                  "Mobile & Desktop optimized",
                  "Clean, well-structured code"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]/80 dark:text-slate-300 font-medium">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Choose Your Option</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="border border-[var(--color-bg-secondary)] bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-bold mb-2">
                  <Book className="w-4 h-4 text-cyan-500" /> Ready Website
                </div>
                <div className="text-3xl font-black text-[var(--color-text-primary)] mb-4">₹ {product.ready_price}</div>
                <div className="bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg p-2.5 mb-4">
                  <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 font-medium leading-tight">
                    <span className="font-bold mr-1">✨</span>
                    Fully done for you. Get your live website link & QR within 24 hours.
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Fully deployed website", "Personalized text & content", "No setup required", "Shareable live link"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-[var(--color-text-primary)]/70 dark:text-slate-400">
                      <Check className="w-3 h-3 text-blue-500 shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => addToCart({
                    id: product.id,
                    title: product.title,
                    price: product.ready_price,
                    priceType: "ready",
                    gradient: product.gradient,
                    emoji: product.emoji,
                  })}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm rounded-xl transition-colors mt-auto cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>

              <div className="border border-[var(--color-bg-secondary)] bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-bold mb-2">
                  <Code className="w-4 h-4 text-[var(--color-accent-purple)]" /> Premium Code
                </div>
                <div className="text-3xl font-black text-[var(--color-text-primary)] mb-4">₹ {product.code_price}</div>
                <div className="bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-lg p-2.5 mb-4">
                  <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 font-medium leading-tight">
                    <span className="font-bold mr-1">💻</span>
                    Requires a laptop or desktop to edit the Premium Code.
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Complete source code", "Easily editable content", "Setup instructions included", "Lifetime access"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-[var(--color-text-primary)]/70 dark:text-slate-400">
                      <Check className="w-3 h-3 text-blue-500 shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => addToCart({
                    id: product.id,
                    title: product.title,
                    price: product.code_price,
                    priceType: "code",
                    gradient: product.gradient,
                    emoji: product.emoji,
                  })}
                  className="w-full py-2.5 bg-[var(--color-accent-purple)] hover:bg-[#6b46c1] text-white font-bold text-sm rounded-xl transition-colors mt-auto cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// HIGH PERFORMANCE: Reuses globalProducts and isCatalogLoading to eliminate duplicate DB requests
const PopularProducts = () => {
  const { globalProducts, isCatalogLoading } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? globalProducts
      : globalProducts.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  const categories = ["All", ...Array.from(new Set(globalProducts.map((p) => p.category)))];

  return (
    <div
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative"
      id="templates"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4 sticky top-16 sm:top-[72px] z-30 bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-primary)] sm:bg-[var(--color-bg-primary)]/95 sm:dark:bg-slate-900/95 py-4 px-2 sm:px-6 rounded-2xl shadow-sm border border-[var(--color-bg-secondary)] dark:border-slate-800 sm:backdrop-blur-md">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <span className="w-5 sm:w-8 h-px bg-[var(--color-accent-pink)]"></span>
            <span className="text-[var(--color-accent-pink)] font-bold text-[9px] sm:text-xs tracking-widest uppercase">
              Templates
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[var(--color-text-primary)]">
            Find the Perfect Gift
          </h2>
        </div>

        {/* Desktop Categories */}
        <div className="hidden sm:flex bg-[var(--color-bg-primary)] dark:bg-slate-950 p-1.5 rounded-full border border-[var(--color-bg-secondary)] dark:border-slate-800 overflow-x-auto custom-scrollbar max-w-full xl:max-w-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-md transform scale-105"
                  : "text-[var(--color-text-primary)]/60 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Categories */}
        <div className="sm:hidden relative w-full mt-4">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronDown className="w-5 h-5 text-[var(--color-text-primary)]/50" />
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-slate-950 border border-[var(--color-bg-secondary)] dark:border-slate-800 rounded-xl px-5 py-3.5 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-mint)] transition-colors shadow-sm cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "Filter by Category: All" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isCatalogLoading ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4 sm:gap-6 lg:gap-8 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={`skeleton-${i}`} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4 sm:gap-6 lg:gap-8 w-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.3, type: "spring" }}
                key={p.id}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

const PlaceholderReview = () => (
  <div className="w-[280px] h-[140px] sm:w-[350px] sm:h-[180px] bg-white dark:bg-slate-900 rounded-2xl border border-[var(--color-bg-secondary)] dark:border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-secondary)]/50 to-transparent dark:from-slate-800/50 dark:to-transparent opacity-50"></div>
    <MessageCircle className="w-8 h-8 text-[var(--color-text-primary)]/20 dark:text-slate-600 mb-2 relative z-10 group-hover:scale-110 transition-transform" />
    <span className="text-sm font-bold text-[var(--color-text-primary)]/40 dark:text-slate-500 relative z-10">
      Review Screenshot
    </span>
    <span className="text-xs text-[var(--color-text-primary)]/30 dark:text-slate-600 font-medium relative z-10 uppercase tracking-widest mt-1">
      Placeholder
    </span>
  </div>
);

const ReviewSkeletonRow = ({ reverse = false }: { reverse?: boolean }) => {
  const organicWidths = [320, 260, 380, 290, 350, 400]; 
  return (
    <div className="flex whitespace-nowrap">
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: reverse ? 60 : 50 }}
        className="flex gap-6 sm:gap-10 px-3 sm:px-5 transform-gpu will-change-transform"
      >
        {[...organicWidths, ...organicWidths].map((w, i) => (
          <div 
            key={i} 
            className="h-[180px] sm:h-[260px] shrink-0 bg-slate-100 dark:bg-slate-900/50 rounded-3xl sm:rounded-[2.5rem] border border-black/5 dark:border-white/5 relative overflow-hidden"
            style={{ width: `${w}px` }}
          >
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              className="absolute inset-0 bg-slate-200 dark:bg-slate-800/80 rounded-3xl sm:rounded-[2.5rem]"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const Testimonials = () => {
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewScreenshots = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.storage.from('reviews').list();
        if (error) throw error;
        if (data) {
          const urls = data
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => {
              const { data: publicUrlData } = supabase.storage
                .from('reviews')
                .getPublicUrl(file.name);
              return publicUrlData.publicUrl;
            });
          setReviewImages(urls);
        }
      } catch (err) {
        console.error("Error fetching review screenshots:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviewScreenshots();
  }, []);

  const third = Math.ceil(reviewImages.length / 3);
  const row1Images = reviewImages.slice(0, third);
  const row2Images = reviewImages.slice(third, third * 2);
  const row3Images = reviewImages.slice(third * 2);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedImage]);

  return (
    <div id="reviews" className="relative w-full py-24 sm:py-32 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
        />
      </div>

      <div className="relative z-20 max-w-3xl mx-auto text-center px-4 mb-20 sm:mb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            The Wall of Love
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-7xl font-serif text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]"
        >
          Moments that <br className="hidden sm:block" />
          <span className="italic font-light text-slate-500 dark:text-slate-400">mattered.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 dark:text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto"
        >
          Real messages, raw reactions, and happy tears. We couldn't script these if we tried. Click any image to view.
        </motion.p>
      </div>

      <div className="absolute left-0 bottom-0 top-1/3 w-20 sm:w-48 bg-gradient-to-r from-white to-transparent dark:from-[#050505] dark:to-transparent z-30 pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 top-1/3 w-20 sm:w-48 bg-gradient-to-l from-white to-transparent dark:from-[#050505] dark:to-transparent z-30 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-6 sm:gap-10 transform -rotate-3 scale-110 origin-center my-10">
        {isLoading ? (
          <>
            <ReviewSkeletonRow />
            <ReviewSkeletonRow reverse={true} />
            <ReviewSkeletonRow />
          </>
        ) : reviewImages.length === 0 ? (
          <div className="text-center text-sm opacity-50 py-12 relative z-20 transform rotate-3">
            No review screenshots found in the 'reviews' bucket.
          </div>
        ) : (
          <>
            {row1Images.length > 0 && (
              <div className="flex whitespace-nowrap">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
                  className="flex gap-6 sm:gap-10 px-3 sm:px-5 transform-gpu will-change-transform"
                >
                  {[...row1Images, ...row1Images].map((url, i) => (
                    <div key={`r1-${i}`} onClick={() => setSelectedImage(url)} className="h-[180px] sm:h-[260px] w-max shrink-0 cursor-zoom-in">
                      <img src={url} alt="Review Screenshot" className="h-full w-auto object-contain rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-black/10 dark:shadow-black/40 border border-black/5 dark:border-white/5" loading="lazy" />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {row2Images.length > 0 && (
              <div className="flex whitespace-nowrap">
                <motion.div
                  animate={{ x: ["-50%", "0%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
                  className="flex gap-6 sm:gap-10 px-3 sm:px-5 transform-gpu will-change-transform"
                >
                  {[...row2Images, ...row2Images].map((url, i) => (
                    <div key={`r2-${i}`} onClick={() => setSelectedImage(url)} className="h-[180px] sm:h-[260px] w-max shrink-0 cursor-zoom-in">
                      <img src={url} alt="Review Screenshot" className="h-full w-auto object-contain rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-black/10 dark:shadow-black/40 border border-black/5 dark:border-white/5" loading="lazy" />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {row3Images.length > 0 && (
              <div className="flex whitespace-nowrap">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
                  className="flex gap-6 sm:gap-10 px-3 sm:px-5 transform-gpu will-change-transform"
                >
                  {[...row3Images, ...row3Images].map((url, i) => (
                    <div key={`r3-${i}`} onClick={() => setSelectedImage(url)} className="h-[180px] sm:h-[260px] w-max shrink-0 cursor-zoom-in">
                      <img src={url} alt="Review Screenshot" className="h-full w-auto object-contain rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-black/10 dark:shadow-black/40 border border-black/5 dark:border-white/5" loading="lazy" />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-10 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md cursor-pointer z-[210]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Full Screen Review"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PromoBanners = () => (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 50 }}
        className="bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] dark:from-slate-900 dark:to-slate-950 rounded-[2rem] sm:rounded-2xl p-6 sm:p-12 flex flex-col justify-center relative overflow-hidden group min-h-[260px] sm:min-h-[380px] shadow-lg shadow-[var(--color-bg-secondary)]/30 border border-[var(--color-bg-secondary)]/50 dark:border-slate-800"
      >
        <div className="relative z-10 w-2/3 sm:w-2/3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-slate-800 sm:backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full border border-[var(--color-bg-secondary)]/50 dark:border-slate-700 mb-3 sm:mb-5">
            <span className="text-[8px] sm:text-[10px] font-black tracking-widest text-[var(--color-accent-purple)] dark:text-purple-300 uppercase">
              Request
            </span>
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-serif text-[var(--color-text-primary)] mb-1 sm:mb-4 leading-tight">
            Custom
            <br />
            Template
          </h3>
          <p className="text-[var(--color-accent-pink)] font-serif text-[15px] sm:text-2xl mb-4 sm:mb-8 italic">
            Built From Your Ideas
          </p>
          <MagneticButton 
            onClick={() => window.open("https://wa.me/917906568743?text=Hi%20Adarsh,%20I%20would%20like%20to%20request%20a%20custom%20website%20template!", "_blank")}
            className="bg-[var(--color-text-primary)] text-white dark:bg-slate-100 dark:text-slate-900 px-5 sm:px-8 py-2.5 sm:py-4 rounded-full text-[11px] sm:text-sm font-bold flex items-center gap-2 sm:gap-3 hover:bg-[var(--color-accent-purple)] transition-all duration-300 w-fit shadow-md cursor-pointer"
          >
            Request Now <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </MagneticButton>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 sm:w-64 sm:h-64 bg-[var(--color-bg-primary)]/50 dark:bg-slate-800 rounded-full absolute top-1/2 -translate-y-1/2 -right-5 sm:-right-10 blur-xl sm:blur-2xl"></div>
          <img 
            src="/assets/custom.webp" 
            alt="Custom Template Request" 
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 right-0 translate-x-[22%] sm:translate-x-[22%] h-[75%] sm:h-[85%] w-auto max-w-none object-contain object-bottom drop-shadow-2xl z-10"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 50, delay: 0.1 }}
        className="bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] dark:from-slate-900 dark:to-slate-950 rounded-[2rem] sm:rounded-2xl p-6 sm:p-12 flex flex-col justify-center relative overflow-hidden group min-h-[260px] sm:min-h-[380px] shadow-lg shadow-[var(--color-bg-secondary)]/30 border border-[var(--color-bg-secondary)]/50 dark:border-slate-800"
      >
        <div className="relative z-10 w-2/3 sm:w-2/3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-slate-800 sm:backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full border border-white dark:border-slate-700 mb-3 sm:mb-5">
            <span className="text-[8px] sm:text-[10px] font-black tracking-widest text-[var(--color-accent-purple)] dark:text-purple-300 uppercase">
              Simple Process
            </span>
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-serif text-[var(--color-text-primary)] mb-2 sm:mb-4 leading-tight">
            How It
            <br />
            Works
          </h3>
          <p className="text-[var(--color-text-primary)]/75 text-[10px] sm:text-sm mb-4 sm:mb-8 max-w-[200px] sm:max-w-[240px] font-medium leading-relaxed hidden sm:block">
            1. Choose your template <br/> 2. Download the code or let us deploy <br/> 3. Share with your special person!
          </p>
          <MagneticButton 
            onClick={() => window.location.href = "/faq"}
            className="bg-white text-[var(--color-text-primary)] dark:bg-slate-800 dark:text-slate-100 px-5 sm:px-8 py-2.5 sm:py-4 rounded-full text-[11px] sm:text-sm font-bold flex items-center gap-2 sm:gap-3 hover:bg-[var(--color-text-primary)] hover:text-white transition-all duration-300 w-fit shadow-sm border border-[var(--color-bg-secondary)]/50 dark:border-slate-700 mt-2 sm:mt-0 cursor-pointer"
          >
            View FAQ <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </MagneticButton>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 sm:w-64 sm:h-64 bg-[var(--color-bg-primary)]/60 dark:bg-slate-800 rounded-full absolute top-1/2 -translate-y-1/2 -right-5 sm:-right-10 blur-xl sm:blur-2xl"></div>
          <img 
            src="/assets/admin.webp" 
            alt="Support Admin" 
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 right-0 translate-x-[30%] sm:translate-x-[25%] h-[85%] sm:h-[95%] w-auto max-w-none object-contain object-bottom drop-shadow-2xl z-10"
          />
        </div>
      </motion.div>
    </div>
  </div>
);

const ContactSection = () => {
  const { addToast, user, setLegalModal } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
      if (user.email) setEmail(user.email);
    } else {
      setName("");
      setEmail("");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      addToast("Please enter your name and message.", "info");
      return;
    }
    if (!hasConsent) {
      addToast("Please agree to the privacy policy to submit your message.", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);
        
      if (error) throw error;

      addToast("Message sent! We'll get back to you shortly.", "success");
      setMessage("");
      setHasConsent(false);
    } catch (err) {
      console.error("Error sending message:", err);
      addToast("Something went wrong. Please try again.", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-serif text-[var(--color-text-primary)] tracking-tight">
          Still having an issue? Contact us
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full border border-[var(--color-bg-secondary)] dark:border-slate-800 flex items-center justify-center text-[var(--color-text-primary)]/60 dark:text-slate-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-primary)]/50 dark:text-slate-500 font-medium">Email us</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">canvasbuildsofficial@gmail.com</p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full border border-[var(--color-bg-secondary)] dark:border-slate-800 flex items-center justify-center text-[var(--color-text-primary)]/60 dark:text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-primary)]/50 dark:text-slate-500 font-medium">We reply within</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">5 hours</p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full border border-[var(--color-bg-secondary)] dark:border-slate-800 flex items-center justify-center text-[var(--color-text-primary)]/60 dark:text-slate-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-primary)]/50 dark:text-slate-500 font-medium">Based in</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">India <span className="text-[var(--color-text-primary)]/40">IN</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-10 shadow-sm border border-[var(--color-bg-secondary)]/50 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">
              Your name
            </label>
            <input
              type="text"
              placeholder="What should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)]/30 dark:bg-slate-950 border border-[var(--color-bg-secondary)] dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-pink)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">
              Your email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)]/30 dark:bg-slate-950 border border-[var(--color-bg-secondary)] dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-pink)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">
              What's on your mind?
            </label>
            <textarea
              rows={4}
              placeholder="Tell us what you're thinking..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[var(--color-bg-primary)]/30 dark:bg-slate-950 border border-[var(--color-bg-secondary)] dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-pink)] transition-colors resize-none"
            />
          </div>

          {/* DPDP Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-primary)]/50 dark:bg-slate-950/50 rounded-xl border border-[var(--color-bg-secondary)] dark:border-slate-800">
            <input
              type="checkbox"
              id="contact-consent"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--color-accent-pink)] focus:ring-[var(--color-accent-pink)] cursor-pointer shrink-0"
            />
            <label htmlFor="contact-consent" className="text-xs sm:text-sm text-[var(--color-text-primary)]/75 leading-relaxed cursor-pointer">
              I consent to Canvas Builds collecting and processing my name and email address to respond to this inquiry in accordance with the <button type="button" onClick={() => setLegalModal('privacy')} className="text-[var(--color-accent-pink)] font-bold hover:underline">Privacy Policy</button>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasConsent}
            className="w-full bg-[var(--color-accent-pink)] hover:bg-[var(--color-accent-purple)] text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      id="faq"
      className="max-w-3xl mx-auto px-4 sm:px-6 w-full relative"
    >
      <div className="text-center mb-10 sm:mb-14">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-8 h-px bg-[var(--color-accent-pink)]"></span>
          <span className="text-[var(--color-accent-pink)] font-bold text-xs tracking-widest uppercase">
            Support
          </span>
          <span className="w-8 h-px bg-[var(--color-accent-pink)]"></span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-[var(--color-text-primary)] mb-4">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div
            key={index}
            className="bg-white sm:bg-white/60 dark:bg-slate-900 sm:dark:bg-slate-900/60 sm:backdrop-blur-md border border-white dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
            >
              <span className="font-bold text-[var(--color-text-primary)] text-[15px] sm:text-lg pr-4">
                {faq.q}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openIndex === index ? "bg-[var(--color-text-primary)] text-white dark:bg-slate-100 dark:text-slate-900" : "bg-[var(--color-bg-primary)] dark:bg-slate-800 text-[var(--color-text-primary)]"}`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 sm:p-6 pt-0 text-[var(--color-text-primary)]/75 font-medium text-sm sm:text-base leading-relaxed border-t border-[var(--color-bg-secondary)]/30 dark:border-slate-800 mt-2">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => (
  <div className="flex flex-col items-center w-full bg-[var(--color-bg-primary)]">
    <Hero />
    <ServicesShowcase />
    <IntegrationsSection />
  </div>
);

const StorePage = () => (
  <div className="pt-28 pb-20 flex flex-col gap-16 sm:gap-24 w-full">
    <DatabaseBundles /> 
    <PopularProducts />
    <PromoBanners />
  </div>
);

const ReviewsPage = () => {
  const [reviewsList, setReviewsList] = useState(INITIAL_TESTIMONIALS);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const { addToast, user } = useAppContext();

  useEffect(() => {
    if (user && user.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    } else {
      setName("");
    }
  }, [user]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      addToast("Please enter your name and review message.", "info");
      return;
    }

    const newReview = {
      name: name.trim(),
      role: role.trim() || "Verified Buyer",
      text: text.trim(),
    };

    setReviewsList([newReview, ...reviewsList]);
    setRole("");
    setText("");
    setRating(5);
    if (!user) setName("");
    addToast("Thank you! Your review has been added.", "success");
  };

  const avatarGradients = [
    "from-blue-500 to-indigo-600",
    "from-rose-500 to-pink-600",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-purple-500 to-fuchsia-600",
    "from-cyan-400 to-blue-500"
  ];

  return (
    <div className="pt-28 pb-20 min-h-[70vh] flex flex-col gap-16 sm:gap-24 w-full">
      <Testimonials />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[var(--color-text-primary)] mb-4 tracking-tight">
            Real words from people who built with us
          </h2>
          <p className="text-[var(--color-text-primary)]/60 dark:text-slate-400 text-sm sm:text-base font-medium">
            Alongside the screenshots, here are the stories behind those launches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsList.map((review, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-[var(--color-bg-secondary)]/80 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0`}>
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-text-primary)] text-lg leading-tight">{review.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-primary)]/40 dark:text-slate-500">{review.role}</span>
                </div>
              </div>
              
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-[var(--color-text-primary)]/80 dark:text-slate-300 text-sm leading-relaxed flex-1 italic">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-10 shadow-xl border border-[var(--color-bg-secondary)]/50 dark:border-slate-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)] mb-2">
              Share Your Experience
            </h3>
            <p className="text-[var(--color-text-primary)]/75 text-sm">
              Bought a template or had a custom build? Let us know what you think!
            </p>
          </div>

          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adarsh Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)]/50 dark:bg-slate-800 border border-[var(--color-bg-secondary)] dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-pink)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1.5">
                  What did you buy? / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bought for Anniversary"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)]/50 dark:bg-slate-800 border border-[var(--color-bg-secondary)] dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-pink)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1.5">
                Rating
              </label>
              <div className="flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 cursor-pointer transition-transform hover:scale-110 ${
                      star <= rating ? "fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1.5">
                Your Review
              </label>
              <textarea
                rows={4}
                placeholder="Write your experience here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-[var(--color-bg-primary)]/50 dark:bg-slate-800 border border-[var(--color-bg-secondary)] dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-pink)] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-text-primary)] hover:bg-[var(--color-accent-purple)] text-white dark:bg-slate-100 dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[var(--color-text-primary)]/10 cursor-pointer"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => (
  <div className="pt-28 pb-20 min-h-[70vh] flex flex-col gap-16 sm:gap-24 bg-[var(--color-bg-primary)] w-full">
    <FAQSection />
    <ContactSection />
  </div>
);

const AboutPage = () => (
  <div className="pt-32 pb-24 min-h-[85vh] flex flex-col items-center bg-[var(--color-bg-primary)]">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[var(--color-text-primary)] mb-4 tracking-tight leading-tight">
          Get to Know the Creator
        </h1>
        <p className="text-[var(--color-text-primary)]/75 text-base sm:text-lg font-light leading-relaxed">
          Welcome! I build high-performance, beautiful websites and custom digital experiences.
        </p>
      </div>

      <div className="bg-gradient-to-br from-white via-white to-[var(--color-accent-pink)]/20 dark:from-slate-900 dark:to-slate-900 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl border border-white dark:border-slate-800 relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-accent-pink)]/15 to-[var(--color-accent-purple)]/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="lg:col-span-7 relative z-10 flex flex-col justify-center lg:pr-8">
          <div className="inline-flex items-center gap-2 bg-[var(--color-bg-primary)] dark:bg-slate-800 px-3.5 py-1 rounded-full text-[var(--color-accent-purple)] dark:text-purple-300 font-bold text-xs uppercase tracking-wider mb-4 border border-[var(--color-bg-secondary)] dark:border-slate-700 w-fit">
            <Code className="w-3.5 h-3.5" /> Student & Freelancer
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-text-primary)] mb-4">
            Hi, I'm Adarsh
          </h2>
          <p className="text-[var(--color-text-primary)]/80 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium mb-6">
            I am a dedicated software developer focused on crafting clean code, smooth animations, and user-centric web applications. Through Canvas Builds, I bridge the gap between technical architecture and elegant design, delivering production-ready digital solutions.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-bg-secondary)]/60 dark:border-slate-800 mb-6">
            <div className="bg-white sm:bg-white/90 dark:bg-slate-800 sm:dark:bg-slate-800 sm:backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-[var(--color-bg-secondary)] dark:border-slate-700 flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-[var(--color-accent-pink)]" />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">React, Tailwind & TypeScript</span>
            </div>
            <div className="bg-white sm:bg-white/90 dark:bg-slate-800 sm:dark:bg-slate-800 sm:backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-[var(--color-bg-secondary)] dark:border-slate-700 flex items-center gap-2 shadow-sm">
              <Terminal className="w-4 h-4 text-[var(--color-accent-purple)]" />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Logic & Performance</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a 
              href="mailto:canvasbuildsofficial@gmail.com"
              className="bg-white dark:bg-slate-800 hover:bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] dark:border-slate-700 shadow-sm px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="w-9 h-9 bg-rose-100 dark:bg-rose-950 text-[var(--color-accent-pink)] rounded-xl flex items-center justify-center text-sm shrink-0 shadow-inner">
                 <Mail className="w-5 h-5" />
              </span>
              <div className="text-left">
                <div className="font-bold text-[var(--color-text-primary)] text-xs">Email Me</div>
                <div className="text-[11px] text-[var(--color-text-primary)]/60">canvasbuildsofficial@gmail.com</div>
              </div>
            </a>
            
            <a 
              href="https://wa.me/917906568743"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-800 hover:bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] dark:border-slate-700 shadow-sm px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-950 text-[var(--color-accent-purple)] rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[var(--color-text-primary)] text-xs">WhatsApp</div>
                <div className="text-[11px] text-[var(--color-text-primary)]/60">+91 79065 68743</div>
              </div>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative flex items-end justify-center min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] mt-8 lg:mt-0">
          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white/60 dark:bg-slate-800 rounded-full absolute top-1/2 -translate-y-1/2 right-4 blur-2xl pointer-events-none"></div>
          
          <img 
            src="/assets/dev.webp" 
            alt="Adarsh Representation" 
            loading="lazy"
            decoding="async"
            className="absolute bottom-[-1rem] lg:bottom-[-3rem] right-[-9rem] lg:right-[-13rem] lg:translate-x-[5px] h-[340px] sm:h-[400px] lg:h-[115%] w-auto max-w-none object-contain object-bottom drop-shadow-2xl z-10 pointer-events-none"
          />
          
          <div className="absolute top-0 right-0 bg-white/90 dark:bg-slate-800 sm:backdrop-blur-md px-3 py-1 rounded-full border border-white dark:border-slate-700 text-[10px] font-bold text-[var(--color-text-primary)]/75 uppercase tracking-widest z-20 shadow-sm">
            The Developer
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Footer = () => {
  const { setLegalModal, addToast, user } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (user && user.email) {
        setIsChecking(true);
        setEmail(user.email);
        
        try {
          const { data } = await supabase
            .from("subscribers")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();
            
          setIsSubscribed(!!data);
        } catch (error) {
          console.error("Error checking subscription:", error);
        } finally {
          setIsChecking(false);
        }
      } else {
        setEmail("");
        setIsSubscribed(false);
        setIsChecking(false);
      }
    };
    checkSubscription();
  }, [user]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      addToast("Please enter a valid email address.", "info");
      return;
    }
    
    if (!hasConsent) {
      addToast("Please consent to the privacy policy to subscribe.", "info");
      return;
    }

    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email: email.trim() }]);
        
      if (error) {
        if (error.code === '23505') {
          addToast("You are already subscribed!", "info");
          if (user) setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        addToast("Subscribed! We'll notify you when new templates drop.", "success");
        if (user) {
          setIsSubscribed(true);
        } else {
          setEmail("");
          setHasConsent(false);
        }
      }
    } catch (err) {
      console.error("Subscription error:", err);
      addToast("Something went wrong. Please try again.", "info");
    }
  };

  const handleUnsubscribe = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.rpc("unsubscribe_user", {
        target_email: user.email
      });
      
      if (error) throw error;
      
      setIsSubscribed(false);
      addToast("You have been successfully unsubscribed.", "info");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      addToast("Failed to unsubscribe. Please try again.", "info");
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="contact"
      className="bg-[#073127] dark:bg-slate-950 border-t border-black/10 pt-12 pb-12 transition-colors"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="bg-[#273e3d] rounded-[2rem] p-8 sm:p-10 border border-white/10 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="lg:w-1/2 text-left">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
              Never miss a new template
            </h3>
            <p className="text-white/60 text-sm sm:text-base">
              Subscribe to get updates when new emotional website templates are released and never miss limited offers.
            </p>
          </div>
          
          <div className="lg:w-1/2 w-full max-w-md lg:max-w-none flex flex-col lg:items-end">
            {isChecking ? (
              <div className="h-12 w-full max-w-md bg-white/5 animate-pulse rounded-xl"></div>
            ) : user && isSubscribed ? (
              <div className="w-full lg:max-w-md bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <Check className="w-5 h-5" /> You're subscribed!
                </div>
                <button 
                  onClick={handleUnsubscribe} 
                  className="text-xs font-bold text-white/50 hover:text-rose-400 transition-colors underline underline-offset-2 cursor-pointer"
                >
                  Unsubscribe
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full lg:max-w-md">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!hasConsent}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-md cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Subscribe
                  </button>
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="newsletter-consent"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="newsletter-consent" className="text-white/60 text-[10px] text-left leading-tight cursor-pointer">
                    I consent to receiving promotional emails. I understand I can opt-out at any time in accordance with the <button type="button" onClick={(e) => { e.preventDefault(); setLegalModal('privacy'); }} className="text-blue-400 hover:underline">Privacy Policy</button>.
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="md:col-span-4 flex flex-col gap-4 text-left items-start">
            <div 
              onClick={() => handleNavClick("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src="/icon.png" alt="Canvas Builds Icon" className="w-9 h-9 object-contain shadow-sm dark:hidden" />
              <img src="/icon2.png" alt="Canvas Builds Icon" className="w-9 h-9 object-contain shadow-sm hidden dark:block" />
              <span className="text-2xl tracking-tight flex items-baseline font-bold text-white">
                Canvas<span className="text-[var(--color-accent-mint)]">Builds</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-light max-w-sm">
              Canvas Builds is India's premier digital gifting platform. Create a customisable website gift for your girlfriend, boyfriend, or best friend for birthdays, anniversaries, and every big moment.
            </p>
            <div className="flex gap-3 mt-2">
              <div className="relative group">
                <a
                  href="https://www.instagram.com/canvas_builds?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] shadow-sm"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
              <div className="relative group">
                <a
                  href="https://wa.me/917906568743"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-[#25D366] shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              <div className="relative group">
                <a
                  href="https://github.com/adrix-ft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-[#333] shadow-sm"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-1">
                Product
              </h4>
              <button onClick={() => handleNavClick("/store")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Templates
              </button>
              <button onClick={() => handleNavClick("/faq")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                How it works
              </button>
              <button onClick={() => handleNavClick("/reviews")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Reviews
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-1">
                Company
              </h4>
              <button onClick={() => handleNavClick("/about")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                About
              </button>
              <a href="https://wa.me/917906568743" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors">
                Collab
              </a>
              <a href="https://wa.me/917906568743" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors">
                Earn with us
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-1">
                Support
              </h4>
              <a href="mailto:canvasbuildsofficial@gmail.com" className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors">
                Contact
              </a>
              <button onClick={() => setLegalModal("terms")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Terms of Service
              </button>
              <button onClick={() => setLegalModal("privacy")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Privacy Policy
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-1">
                Resources
              </h4>
              <button onClick={() => handleNavClick("/store")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Website for girlfriend
              </button>
              <button onClick={() => handleNavClick("/store")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Website for boyfriend
              </button>
              <button onClick={() => handleNavClick("/store")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Anniversary website
              </button>
              <button onClick={() => handleNavClick("/store")} className="text-sm text-white/70 hover:text-[#E2FB6C] transition-colors text-left cursor-pointer">
                Birthday website
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4 text-xs text-white/50">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Canvas Builds. Made with ❤️ by Adarsh.</span>
            <span className="text-[9px] text-white/30 max-w-xl leading-relaxed">
              *All third-party trademarks, service marks, logos, and brand names referenced on this site are the property of their respective owners. Their use does not imply affiliation or endorsement.
            </span>
          </div>
          <div>
            <a href="mailto:canvasbuildsofficial@gmail.com" className="hover:text-[#E2FB6C] transition-colors">
              canvasbuildsofficial@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const ScrollHandler = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-20 min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-bg-secondary)] dark:bg-slate-800 text-[var(--color-text-primary)]/50 mb-6">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-5xl sm:text-7xl font-serif font-bold text-[var(--color-text-primary)] mb-4">
          404
        </h1>
        <p className="text-lg text-[var(--color-text-primary)]/70 mb-8 max-w-md mx-auto">
          Oops! It looks like you've wandered off the map. The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[var(--color-text-primary)] hover:bg-[var(--color-accent-mint)] text-white dark:bg-slate-100 dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold transition-colors shadow-md cursor-pointer"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { isSearchOpen } = useAppContext();

  return (
    <Router>
      <ScrollHandler />
      <div className="min-h-[100dvh] bg-[var(--color-bg-primary)] font-sans selection:bg-[var(--color-accent-mint)] selection:text-white overflow-x-hidden text-[var(--color-text-primary)] transition-colors duration-500">
        <div className="relative z-10">
          <Navbar />
          <ToastContainer />
          <CartDrawer />
          <AuthModal />
          
          <AnimatePresence>
            {isSearchOpen && <SearchModal />}
          </AnimatePresence>
          <LegalModal />
          <AIAssistant />
          
          <main>
            <Routes>
              <Route path="/demo-unavailable" element={<DemoUnavailablePage />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/bundle/:id" element={<BundlePage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/account" element={<CustomerDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </div>
    </Router>
  );
}