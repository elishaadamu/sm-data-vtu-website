"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/assets/logo/sm-data.png";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import { decryptData } from "@/lib/encryption";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaHistory,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaBell
} from "react-icons/fa";

const ManagerLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { managerData, fetchManagerData } = useAppContext();

  useEffect(() => {
    setIsClient(true);
    let adminUser = localStorage.getItem("manager_user");
    let isValidManager = false;

    if (adminUser) {
      try {
        const decrypted = decryptData(adminUser);
        const role = (decrypted?.role || "").toLowerCase();
        isValidManager =
          role === "admin" ||
          role === "manager" ||
          role === "super-admin" ||
          role === "super" ||
          !!decrypted?.isAdmin ||
          !!decrypted?.isSuperAdmin;
      } catch (e) {
        isValidManager = false;
      }
    }

    if (!isValidManager) {
      const normalUser = localStorage.getItem("user");
      if (normalUser) {
        try {
          const decrypted = decryptData(normalUser);
          const role = (decrypted?.role || "").toLowerCase();
          const isAdminOrManager =
            role === "admin" ||
            role === "manager" ||
            role === "super-admin" ||
            role === "super" ||
            !!decrypted?.isAdmin ||
            !!decrypted?.isSuperAdmin;
          if (isAdminOrManager) {
            localStorage.setItem("manager_user", normalUser);
            isValidManager = true;
            fetchManagerData();
          }
        } catch (e) {
          console.error("Error decrypting user data:", e);
        }
      }
    }

    if (!isValidManager) {
      localStorage.removeItem("manager_user");
      router.push("/manager-login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("manager_user");
    router.push("/manager-login");
  };

  const navLinks = [
    { href: "/manager", label: "Dashboard", icon: FaHome },
    { href: "/manager/users", label: "Manage Users", icon: FaUsers },
    { href: "/manager/plans", label: "Manage Plans", icon: FaClipboardList },
    { href: "/manager/orders", label: "Order History", icon: FaHistory },
    { href: "/manager/payments", label: "Payment History", icon: FaMoneyBillWave },
    { href: "/manager/send-notification", label: "Send Notification", icon: FaBell },
  ];

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ToastContainer />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <Link href="/manager" className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-xl">
               <FaShieldAlt className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Admin Panel
              </h2>
              <p className="text-xs text-blue-400 font-medium">SM DATA VTU</p>
            </div>
          </Link>
          <button
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Menu
          </p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <link.icon
                  className={`w-5 h-5 ${isActive ? "text-blue-200" : "text-slate-500 group-hover:text-blue-400"}`}
                />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="font-medium">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden sticky top-0 z-10">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-slate-800">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-8 h-8 object-contain" src={Logo} alt="Logo" />
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-10 justify-end items-center px-8">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">
                    {managerData?.name || managerData?.username || "System Admin"}
                  </p>
                  {managerData?.email && (
                    <p className="text-xs text-slate-500">{managerData.email}</p>
                  )}
               </div>
               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                 {(managerData?.name?.[0] || managerData?.username?.[0] || "A").toUpperCase()}
               </div>
             </div>
             <div className="h-8 w-px bg-slate-200"></div>
             <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </button>
           </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
