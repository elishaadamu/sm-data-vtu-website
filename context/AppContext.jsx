"use client";
import { decryptData } from "@/lib/encryption";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const isLoggedIn = !!userData; // Derive isLoggedIn from userData
  const [states] = useState(statesData.state || []);
  const [lgas, setLgas] = useState([]);

  const [cartItems, setCartItems] = useState({});

  const [wishlistItems, setWishlistItems] = useState([]);

  // BVN Slip Context
  const [bvnSlipData, setBvnSlipData] = useState(null);
  const [bvnSlipType, setBvnSlipType] = useState(null);

  // NIN Slip Context
  const [ninSlipData, setNinSlipData] = useState(null);
  const [ninSlipLayout, setNinSlipLayout] = useState(null);

  const fetchUserData = async () => {
    try {
      const encryptedUser = localStorage.getItem("user");

      if (!encryptedUser) {
        setUserData(null);
        return;
      }

      const decryptedUser = decryptData(encryptedUser);
      console.log("Decryption result:", {
        decryptedUser,
      });

      if (decryptedUser) {
        setUserData(decryptedUser);
      } else {
        localStorage.removeItem("user");
        setUserData(null);
      }
    } catch (error) {
      console.error("Error in fetchUserData:", {
        message: error.message,
        stack: error.stack,
      });
      localStorage.removeItem("user");
      setUserData(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUserData(null);
    setCartItems({}); // Clear cart on logout
    setWishlistItems([]); // Clear wishlist on logout
    console.log("Logging out and redirecting to homepage...");
    // It's better to show toast notifications in the component that calls logout.
    router.push("/"); // Redirect to the homepage
  };

  const fetchLgas = (stateName) => {
    if (!stateName) return;
    const lgasForState = lgasData[stateName] || [];
    setLgas(lgasForState);
  };
  const addToCart = async (itemId) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add items to cart.");
      router.push("/signin");
      return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.price * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  const addToWishlist = (itemId) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add items to wishlist.");
      router.push("/signin");
      return;
    }
    let wishlistData = structuredClone(wishlistItems);
    if (wishlistData.includes(itemId)) {
      wishlistData = wishlistData.filter((id) => id !== itemId);
    } else {
      wishlistData.push(itemId);
    }
    setWishlistItems(wishlistData);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const viewBvnSlip = (data, slipType) => {
    setBvnSlipData(data);
    setBvnSlipType(slipType);
  };

  const clearBvnSlip = () => {
    setBvnSlipData(null);
    setBvnSlipType(null);
  };

  const viewNinSlip = (data, slipLayout) => {
    setNinSlipData(data);
    setNinSlipLayout(slipLayout);
  };

  const clearNinSlip = () => {
    setNinSlipData(null);
    setNinSlipLayout(null);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Effect to load cart and wishlist based on userData
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (userData && userData._id) {
        const userId = userData._id;
        const cartStorageKey = `cartItems_storage_${userId}`;
        const wishlistStorageKey = `wishlistItems_storage_${userId}`;

        // Load cart items
        const storedCart = localStorage.getItem(cartStorageKey);
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);
            if (
              parsedCart.timestamp &&
              Date.now() - parsedCart.timestamp < 24 * 60 * 60 * 1000
            ) {
              setCartItems(parsedCart.data);
            } else {
              localStorage.removeItem(cartStorageKey); // Data expired
              setCartItems({});
            }
          } catch (e) {
            console.error("Error parsing cart data from localStorage", e);
            localStorage.removeItem(cartStorageKey);
            setCartItems({});
          }
        } else {
          setCartItems({});
        }

        // Load wishlist items
        const storedWishlist = localStorage.getItem(wishlistStorageKey);
        if (storedWishlist) {
          try {
            const parsedWishlist = JSON.parse(storedWishlist);
            if (
              parsedWishlist.timestamp &&
              Date.now() - parsedWishlist.timestamp < 24 * 60 * 60 * 1000
            ) {
              setWishlistItems(parsedWishlist.data);
            } else {
              localStorage.removeItem(wishlistStorageKey); // Data expired
              setWishlistItems([]);
            }
          } catch (e) {
            console.error("Error parsing wishlist data from localStorage", e);
            localStorage.removeItem(wishlistStorageKey);
            setWishlistItems([]);
          }
        } else {
          setWishlistItems([]);
        }
      } else {
        // Clear cart and wishlist if no user is logged in
        setCartItems({});
        setWishlistItems([]);
      }
    }
  }, [userData]); // Re-run when userData changes

  // Save cartItems to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (typeof window !== "undefined" && userData && userData._id) {
      const userId = userData._id;
      const cartStorageKey = `cartItems_storage_${userId}`;
      localStorage.setItem(
        cartStorageKey,
        JSON.stringify({ data: cartItems, timestamp: Date.now() })
      );
    }
  }, [cartItems, userData]); // Depend on userData to get the key

  // Save wishlistItems to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (typeof window !== "undefined" && userData && userData._id) {
      const userId = userData._id;
      const wishlistStorageKey = `wishlistItems_storage_${userId}`;
      localStorage.setItem(
        wishlistStorageKey,
        JSON.stringify({ data: wishlistItems, timestamp: Date.now() })
      );
    }
  }, [wishlistItems, userData]); // Depend on userData to get the key

  const value = {
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    wishlistItems,
    addToWishlist,
    getWishlistCount,
    isLoggedIn,
    logout,
    authLoading,
    states,
    lgas,
    fetchLgas,
    bvnSlipData,
    bvnSlipType,
    viewBvnSlip,
    clearBvnSlip,
    ninSlipData,
    ninSlipLayout,
    viewNinSlip,
    clearNinSlip,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
