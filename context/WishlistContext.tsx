"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface WishlistItem {
  id: number;
  user_id: string | number;
  productId: number;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  setWishlist: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number, product?: any) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isProductInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishlist');
      if (!res.ok) {
        setWishlist([]);
        return;
      }
      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Dentro de WishlistContext, función addToWishlist
const addToWishlist = async (productId: number, product?: any) => {
  try {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product ? { productId, product } : { productId }),
    });

    if (res.status === 401) {
      toast.info("Debes iniciar sesión para añadir a favoritos.");
      return { message: "auth" };
    }

    if (!res.ok) {
      let errorData = { error: 'Error al añadir a favoritos' };
      try {
        errorData = await res.json();
      } catch (e) {
        console.error("Error al procesar la respuesta:", await res.text());
      }
      toast.error(errorData.error || `Error ${res.status}`);
      return { message: "error" };
    }

    const data = await res.json();
    await fetchWishlist();
    return data;
  } catch (error) {
    console.error('Error al añadir a favoritos:', error);
    toast.error("Error al añadir a favoritos");
    return { message: "error" };
  }
};

// La función removeFromWishlist (para DELETE) ya tiene el toast correcto.
  
const removeFromWishlist = async (productId: number) => {
  try {
    const res = await fetch(`/api/wishlist?productId=${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Error al eliminar de favoritos');
    }

    await fetchWishlist();
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    throw error;
  }
};
  
  const isProductInWishlist = useCallback((productId: number): boolean => {
    return Array.isArray(wishlist) && wishlist.some(item => item.productId === productId);
  }, [wishlist]);

  // Añadir useEffect para cargar la wishlist al iniciar
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      setWishlist,
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      isProductInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
