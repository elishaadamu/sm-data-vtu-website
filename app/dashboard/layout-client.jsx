"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { decryptData } from "../../lib/encryption";
import Logo from "@/assets/logo/sm-data.png";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/dashboard/Sidebar";
import DateTime from "@/components/DateTime";
import { FaWifi, FaPhone, FaLightbulb, FaTv, FaWhatsapp } from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [openOrders, setOpenOrders] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openDelivery, setOpenDelivery] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [hasWallet, setHasWallet] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/signin");
    } else {
      const decryptedData = decryptData(user);
      setUserData(decryptedData);
    }
  }, [router]);



  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />



      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
        openOrders={openOrders}
        setOpenOrders={setOpenOrders}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        openDelivery={openDelivery}
        setOpenDelivery={setOpenDelivery}
        openProducts={openProducts}
        setOpenProducts={setOpenProducts}
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile/Tablet Header */}
        <div className="bg-white lg:hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href={"/"}>
              <Image className="w-[5rem]" src={Logo} alt="MISAL SUB" />
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b">
          <div className="flex items-center justify-end p-2">
            <DateTime />
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-8 pb-[90px] lg:pb-8">{children}</main>

        {/* Mobile/Tablet Bottom Navigation - Floating Card */}
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30">
          <div className="bg-[#0d1f6e] rounded-3xl shadow-[0_8px_32px_rgba(5,28,114,0.5)] px-3 py-3 flex items-center justify-around">

            <Link
              href="/dashboard/services/data"
              className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-150 ${
                pathname === "/dashboard/services/data" ? "opacity-100" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                pathname === "/dashboard/services/data"
                  ? "bg-[#1a2d8a]"
                  : "bg-[#162580] hover:bg-[#1a2d8a]"
              }`}>
                <FaWifi className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-white">Data</span>
            </Link>

            <Link
              href="/dashboard/services/airtime"
              className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-150 ${
                pathname === "/dashboard/services/airtime" ? "opacity-100" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                pathname === "/dashboard/services/airtime"
                  ? "bg-[#1a2d8a]"
                  : "bg-[#162580] hover:bg-[#1a2d8a]"
              }`}>
                <FaPhone className="w-5 h-5 text-white rotate-90" />
              </div>
              <span className="text-[11px] font-medium text-white">Airtime</span>
            </Link>

            <Link
              href="/dashboard/services/electric"
              className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-150 ${
                pathname === "/dashboard/services/electric" ? "opacity-100" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                pathname === "/dashboard/services/electric"
                  ? "bg-[#1a2d8a]"
                  : "bg-[#162580] hover:bg-[#1a2d8a]"
              }`}>
                <FaLightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-white">Electricity</span>
            </Link>

            <Link
              href="/dashboard/services/cable"
              className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-150 ${
                pathname === "/dashboard/services/cable" ? "opacity-100" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                pathname === "/dashboard/services/cable"
                  ? "bg-[#1a2d8a]"
                  : "bg-[#162580] hover:bg-[#1a2d8a]"
              }`}>
                <FaTv className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-white">Cable</span>
            </Link>

          </div>
        </div>
      </div>

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/2347073775347"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-40 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 group animate-bounce"
        style={{ animationDuration: "3s" }}
        title="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-8 h-8" />
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
          WhatsApp Support
        </span>
      </a>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
