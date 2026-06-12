"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const HeaderSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        // Assuming the endpoint is configured in API_CONFIG
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.BANNERS.GET_ALL)
        );
        console.log(response.data);
        setBanners(response.data.banners);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setError("Could not load banners at the moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full md:flex-[80%] pr-0 md:mr-6">
      {loading ? (
        <div className="flex items-center justify-center bg-gray-200 mt-6 rounded-xl min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error || banners.length === 0 ? (
        <div className="flex items-center justify-center bg-gray-200 mt-6 rounded-xl min-h-[300px]">
          <p className="text-gray-600">{error || "No banners available."}</p>
        </div>
      ) : (
        <>
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
              >
                <div className="md:pl-8 mt-10 md:mt-0">
                  <p className="md:text-base text-blue-600 pb-1">
                    {banner.offer}
                  </p>
                  <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                    {banner.title}
                  </h1>
                  <div className="flex items-center mt-4 md:mt-6 ">
                    <Link
                      href={banner.link || "#"}
                      className="md:px-10 px-7 md:py-2.5 py-2 bg-blue-600 rounded-full text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
                <div className="flex items-center flex-1 justify-center">
                  <Image
                    className="md:w-[90%] w-48 object-contain"
                    src={banner.image.url}
                    alt={banner.title}
                    width={288}
                    height={288}
                    priority={true}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-8">
            {banners.map((_, index) => (
              <div
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${
                  currentSlide === index ? "bg-blue-600" : "bg-gray-500/30"
                }`}
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderSlider;
