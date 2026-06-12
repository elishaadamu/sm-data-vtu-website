"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import VendorCard from "./VendorCard";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Loading from "./Loading";

const VendorSection = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL)
        );
        const sortedVendors = (response.data || []).sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
        );
        setVendors(sortedVendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);
  return (
    <div className="my-16">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Our Top Vendors</h2>
        <p className="text-gray-500 mt-2">
          Discover products from our most trusted sellers.
        </p>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-0">
          {vendors.slice(0, 4).map((vendor) => (
            <VendorCard key={vendor._id} {...vendor} />
          ))}
        </div>
      )}
      <div className="text-center mt-12">
        <Link
          href="/all-vendors"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          View All Vendors
        </Link>
      </div>
    </div>
  );
};

export default VendorSection;
