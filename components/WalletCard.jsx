"use client";
import React, { useState, useEffect, useRef } from "react";

const WalletCard = ({ walletBalance, isLoading = false }) => {
  // Wallet Cards Data
  const walletCards = [
    {
      bankName: "Wema Bank",
      accountNumber: "8573368088",
      accountName: "NORTHENCONNECT - Alkasim Khalil Ashana",
      balance: walletBalance,
      charge: "CHARGE 1.08%",
      gradient: "from-blue-600 via-blue-500 to-blue-700",
      accentColor: "bg-orange-400",
    },
    {
      bankName: "Sterling Bank",
      accountNumber: "8234567890",
      accountName: "NORTHENCONNECT - Alkasim Khalil",
      balance: walletBalance,
      charge: "CHARGE 0.95%",
      gradient: "from-purple-600 via-purple-500 to-indigo-600",
      accentColor: "bg-pink-400",
    },
    {
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "NORTHENCONNECT - Business Account",
      balance: walletBalance,
      charge: "CHARGE 1.20%",
      gradient: "from-orange-600 via-orange-500 to-red-600",
      accentColor: "bg-yellow-400",
    },
  ];

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % walletCards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, walletCards.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % walletCards.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + walletCards.length) % walletCards.length
    );
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide();
    }
  };

  return (
    <div className="mb-10 lg:mb-8">
      <div className="relative">
        {/* Carousel Container */}
        <div
          className="relative overflow-hidden rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Cards Wrapper */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {walletCards.map((card, index) => (
              <div key={index} className="min-w-full px-2 sm:px-0">
                {/* Bank Card */}
                <div
                  className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-4 sm:p-5 lg:p-4 shadow-2xl overflow-hidden`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16"></div>

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Top Section - Bank Name and Charge */}
                    <div className="flex items-start justify-between mb-4 sm:mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded"></div>
                          </div>
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-lg"></div>
                        </div>
                        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-white mt-2">
                          {card.bankName}
                        </h2>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {card.charge}
                        </p>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-2 sm:space-y-2.5">
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm mb-1">
                          Acc. No:
                        </p>
                        <p className="text-white text-base sm:text-lg lg:text-xl font-bold tracking-wider">
                          {card.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm mb-1">
                          Acc. Name:
                        </p>
                        <p className="text-white text-xs sm:text-sm lg:text-base font-semibold">
                          {card.accountName}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-white/80 text-xs sm:text-sm mb-1">
                          Wallet Balance:
                        </p>
                  {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span className="text-white/80 text-sm">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                              ₦ {Number(walletBalance).toFixed(2)}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Decorative Chip */}
                    <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-lg backdrop-blur-sm border border-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {walletCards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === index
                  ? "w-8 sm:w-10 h-2.5 sm:h-3 bg-gradient-to-r from-blue-600 to-indigo-600"
                  : "w-2.5 sm:w-3 h-2.5 sm:h-3 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
