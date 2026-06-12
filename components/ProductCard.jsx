"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import { FaStar, FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import Image from "next/image";

const ProductCard = ({ product }) => {
  const {
    currency,
    router,
    addToWishlist,
    wishlistItems,
    isLoggedIn,
    addToCart,
  } = useAppContext();

  const productImage =
    (product?.image && product.image.length > 0 ? product.image[0] : null) ||
    (product?.images && product.images.length > 0
      ? product.images[0]?.url
      : null) ||
    "https://picsum.photos/seed/product/300/300";

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error("Please sign in to add items to your wishlist.");
      router.push("/signin");
      return;
    }
    addToWishlist(product._id);
    toast.success(
      wishlistItems.includes(product._id)
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`
    );
  };

  const hasOffer = product.offerPrice && product.offerPrice < product.price;

  return (
    <div
      onClick={() => {
        router.push(`/product/${product._id}`);
        scrollTo(0, 0);
      }}
      className="group relative flex w-full  max-w-xs cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
    >
      {/* Product Image */}
      <div className="relative h-32 overflow-hidden rounded-t-2xl bg-gray-50">
        <Image
          src={productImage}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {hasOffer && (
          <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
            {Math.round(
              ((product.price - product.offerPrice) / product.price) * 100
            )}
            % OFF
          </span>
        )}
        {/* Wishlist Icon */}
        <div
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm transition hover:bg-white"
        >
          {wishlistItems.includes(product._id) ? (
            <FaHeart className="h-5 w-5 text-red-500" />
          ) : (
            <FiHeart className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {/* Price + Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {currency}
              {hasOffer ? product.offerPrice : product.price}
            </span>
            {hasOffer && (
              <span className="text-sm text-gray-400 line-through">
                {currency}
                {product.price}
              </span>
            )}
          </div>
          <div className="flex items-center text-xs">
            <FaStar className="mr-1 h-3 w-3 text-yellow-400" />
            <span className="font-medium text-gray-700">
              {product.averageRating?.toFixed(1) || "4.5"}
            </span>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoggedIn) {
              toast.error("Please sign in to buy items.");
              router.push("/signin");
              return;
            }
            addToCart(product._id);
            router.push("/cart");
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 
                0a2 2 0 100 4 2 2 0 000-4zm-8 
                2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
