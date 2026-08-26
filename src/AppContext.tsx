import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabaseClient";
import { User, Session } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import { getProductIcon } from "./iconHelper";

export type CartItem = {
  id: number;
  title: string;
  price: number;
  priceType: "code" | "ready";
  gradient: string;
  emoji: ReactNode;
};

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthOpen: boolean;
  setIsAuthOpen: (isOpen: boolean) => void;
  handleLogout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartIndex: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  toasts: { id: number; message: string; type: "success" | "info" }[];
  addToast: (message: string, type?: "success" | "info") => void;
  removeToast: (id: number) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  legalModal: "privacy" | "terms" | null;
  setLegalModal: (type: "privacy" | "terms" | null) => void;
  clearCart: () => void;
  globalProducts: any[];
  globalBundles: any[];
  isCatalogLoading: boolean;
  expectedProductCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Global Catalog State
  const [globalProducts, setGlobalProducts] = useState<any[]>([]);
  const [globalBundles, setGlobalBundles] = useState<any[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [expectedProductCount, setExpectedProductCount] = useState<number>(() => {
    const cached = localStorage.getItem("canvas_expected_products");
    return cached ? parseInt(cached, 10) : 8;
  });

  // PRE-FETCH ON INITIAL LOAD
  useEffect(() => {
    const prefetchCatalog = async () => {
      try {
        const [prodRes, bundRes] = await Promise.all([
          supabase.from("products").select("*").eq("is_hidden", false).order("id", { ascending: true }),
          supabase.from("bundles").select("*").eq("is_hidden", false).order("id", { ascending: true })
        ]);

        if (prodRes.data) {
          const formatted = prodRes.data.map((item) => ({
            ...item,
            emoji: getProductIcon(item.icon_name),
          }));
          setGlobalProducts(formatted);
          setExpectedProductCount(formatted.length);
          localStorage.setItem("canvas_expected_products", formatted.length.toString());
        }

        if (bundRes.data) {
          setGlobalBundles(bundRes.data);
        }
      } catch (err) {
        console.error("Failed to pre-fetch catalog:", err);
      } finally {
        setIsCatalogLoading(false);
      }
    };
    prefetchCatalog();
  }, []);

  useEffect(() => {
    const verifyAdminStatus = async (session: Session | null) => {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }

      // Query the user_roles table directly 
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (data && (data.role === 'admin' || data.user_role === 'admin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      verifyAdminStatus(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      verifyAdminStatus(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    addToast("Logged out successfully", "info");
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => setCart([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (item: CartItem) => {
    const exists = cart.some((i) => i.id === item.id && i.priceType === item.priceType);
    if (exists) {
      addToast(`${item.title} (${item.priceType === 'ready' ? 'Ready Website' : 'Code'}) is already in your cart!`, "info");
      setIsCartOpen(true);
      return;
    }
    setCart((prev) => [...prev, item]);
    addToast(`Added ${item.title} to cart!`, "success");
    setIsCartOpen(true);
  };

  const removeFromCart = (cartIndex: number) => {
    setCart((prev) => prev.filter((_, index) => index !== cartIndex));
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        user, isAdmin, isAuthOpen, setIsAuthOpen, handleLogout,
        cart, addToCart, removeFromCart, clearCart,
        isCartOpen, setIsCartOpen, isSearchOpen, setIsSearchOpen,
        toasts, addToast, removeToast,
        isDarkMode, toggleDarkMode,
        legalModal, setLegalModal,
        globalProducts, globalBundles, isCatalogLoading, expectedProductCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};