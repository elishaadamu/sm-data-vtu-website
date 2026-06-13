"use client";
import Image from "next/image";
import Logo from "@/assets/logo/sm-data.png";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { encryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Swal from "sweetalert2";

const ManagerLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email, password };
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN),
        payload
      );

      if (!response.data) {
        throw new Error("No data received from server");
      }

      const userData = response.data;

      // Ensure that only admins or managers can login here
      if (userData.role !== "admin" && userData.role !== "manager") {
        setLoading(false);
        Swal.fire({
          title: "Access Denied",
          text: "You are not an administrator. Please log in through the regular user portal.",
          icon: "error",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go to User Login",
          cancelButtonText: "Cancel"
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/signin");
          }
        });
        return;
      }

      // Valid admin -> Encrypt and save session
      const encryptedAdmin = encryptData(userData);
      localStorage.setItem("manager_user", encryptedAdmin);
      toast.success(`Welcome back, ${userData.firstName || userData.fullName || 'Administrator'}!`);
      
      router.push("/manager");

    } catch (error) {
      console.error("Error signing in as admin:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during admin signin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

        <form onSubmit={handleSignin} className="relative z-10 flex flex-col gap-5 text-white">
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full p-4 flex items-center justify-center mb-4 backdrop-blur-md">
               <FaShieldAlt className="w-10 h-10 text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-center">Manager Access</h2>
            <p className="text-sm text-slate-300 text-center mt-1">Authorized personnel only</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Admin Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-black/20 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400"
              type="email"
              placeholder="admin@smdata.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative flex items-center w-full">
               <input
                 onChange={(e) => setPassword(e.target.value)}
                 value={password}
                 className="bg-black/20 border border-white/10 p-3 rounded-xl pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 w-full"
                 type={showPassword ? "text" : "password"}
                 placeholder="••••••••"
                 required
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 text-slate-400 hover:text-white transition-colors flex items-center justify-center h-full"
               >
                 {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
               </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Secure Login"
            )}
          </button>
          
          <Link href="/" className="text-center text-sm text-slate-400 hover:text-white transition mt-2">
            ← Back to main website
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ManagerLogin;
