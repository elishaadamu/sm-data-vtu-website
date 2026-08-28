"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaIdCard,
  FaFileAlt,
  FaBolt,
  FaDatabase,
  FaPhone,
  FaTv,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaHome,
  FaUser,
  FaKey,
  FaChevronDown,
  FaHistory,
  FaCogs,
  FaSearch,
  FaGift,
  FaUserCog,
} from "react-icons/fa";
import Image from "next/image";
import Logo from "@/assets/logo/sm-data.png";
import { decryptData } from "@/lib/encryption";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const getUserRoleFromStorage = () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        const user = decryptData(raw) || null;
        return user?.role || null;
      } catch (err) {
        return null;
      }
    };
    setUserRole(getUserRoleFromStorage());
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/services")) {
      setOpenMenus((prev) => ({ ...prev, services: true }));
    }
    if (pathname.startsWith("/dashboard/history")) {
      setOpenMenus((prev) => ({ ...prev, history: true }));
    }
  }, [pathname]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src={Logo} alt="Logo" className="w-12  h-12 rounded-full" />
              <h2 className="text-xl font-bold text-white italic">
                <span className="text-blue-500">SM</span>
                <span className="text-yellow-500">DATA</span>
              </h2>
            </Link>
          </div>
          <button
            className="p-2 rounded-md hover:bg-gray-700 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard" ? "bg-gray-700" : ""
              }`}
            >
              <FaHome className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            {/* Services Dropdown */}
            <div>
              <button
                onClick={() => toggleMenu("services")}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <FaCogs className="w-5 h-5" />
                  <span>Services</span>
                </div>
                <FaChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openMenus.services ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMenus.services && (
                <div className="pl-6 mt-1 space-y-1">
                  {[
                    {
                      href: "/dashboard/services/waec",
                      label: "WAEC Scratch Card",
                      icon: FaFileAlt,
                    },
                    {
                      href: "/dashboard/services/neco",
                      label: "NECO Scratch Card",
                      icon: FaIdCard,
                    },

                    {
                      href: "/dashboard/services/data",
                      label: "Data Subscription",
                      icon: FaDatabase,
                    },
                    {
                      href: "/dashboard/services/airtime",
                      label: "Airtime Purchase",
                      icon: FaPhone,
                    },
                    {
                      href: "/dashboard/services/cable",
                      label: "Cable Subscription",
                      icon: FaTv,
                    },
                    {
                      href: "/dashboard/services/electric",
                      label: "Electricity Bills",
                      icon: FaBolt,
                    },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                        pathname === href ? "bg-gray-700" : ""
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction History Dropdown */}
            <div>
              <button
                onClick={() => toggleMenu("history")}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <FaHistory className="w-5 h-5" />
                  <span>Transaction History</span>
                </div>
                <FaChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openMenus.history ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMenus.history && (
                <div className="pl-6 mt-1 space-y-1">
                  {[
                    {
                      href: "/dashboard/history/all-orders",
                      label: "All Orders",
                      icon: FaHistory,
                    },
                    {
                      href: "/dashboard/history/waec",
                      label: "WAEC History",
                      icon: FaFileAlt,
                    },
                    {
                      href: "/dashboard/history/neco",
                      label: "NECO History",
                      icon: FaIdCard,
                    },

                    {
                      href: "/dashboard/history/airtime",
                      label: "Airtime History",
                      icon: FaPhone,
                    },
                    {
                      href: "/dashboard/history/cable",
                      label: "Cable bill History",
                      icon: FaTv,
                    },
                    {
                      href: "/dashboard/history/data",
                      label: "Data History",
                      icon: FaDatabase,
                    },
                    {
                      href: "/dashboard/history/funding",
                      label: "Funding History",
                      icon: FaMoneyBillWave,
                    },
                    {
                      href: "/dashboard/history/electric",
                      label: "Electric bill History",
                      icon: FaBolt,
                    },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                        pathname === href ? "bg-gray-700" : ""
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Info Section Label */}
            <div className="pt-4 pb-2 px-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Personal Info
              </h3>
            </div>

            {/* Personal Details */}
            <Link
              href="/dashboard/personal-details"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/personal-details" ? "bg-gray-700" : ""
              }`}
            >
              <FaUser className="w-5 h-5" />
              <span>Personal Details</span>
            </Link>

            {/* Refer & Earn */}
            <Link
              href="/dashboard/referrals"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/referrals" ? "bg-gray-700" : ""
              }`}
            >
              <FaGift className="w-5 h-5 text-yellow-500" />
              <span>Refer & Earn</span>
            </Link>

            {/* Change Pin */}
            <Link
              href="/dashboard/set-pin"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/set-pin" ? "bg-gray-700" : ""
              }`}
            >
              <FaKey className="w-5 h-5" />
              <span>Set Pin</span>
            </Link>

            <Link
              href="/dashboard/account"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/account" ? "bg-gray-700" : ""
              }`}
            >
              <FaUserCog className="w-5 h-5" />
              <span>Account Controls</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
