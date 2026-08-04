"use client";
import Image from "next/image";
import Logo from "@/assets/logo/sm-data.png";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { encryptData, decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const page = () => {
  const router = useRouter();
  const { fetchUserData, fetchManagerData } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkExistingSession = () => {
      const managerUser = localStorage.getItem("manager_user");
      if (managerUser) {
        router.push("/manager");
        return;
      }
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const decrypted = decryptData(user);
          const role = (decrypted?.role || "").toLowerCase();
          const isAdminOrManager =
            role === "admin" ||
            role === "manager" ||
            role === "super-admin" ||
            role === "super" ||
            !!decrypted?.isAdmin ||
            !!decrypted?.isSuperAdmin;

          if (isAdminOrManager) {
            router.push("/manager");
          } else {
            router.push("/dashboard");
          }
        } catch (e) {
          // ignore error
        }
      }
    };
    checkExistingSession();
  }, [router]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    const payload = { email, password };
    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN),
        payload
      );
      
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const userData = response.data;
      const encryptedUser = encryptData(userData);

      if (!encryptedUser) {
        throw new Error("Failed to encrypt user data");
      }

      const role = (userData.role || "").toLowerCase();
      const isAdminOrManager =
        role === "admin" ||
        role === "manager" ||
        role === "super-admin" ||
        role === "super" ||
        !!userData.isAdmin ||
        !!userData.isSuperAdmin;

      if (isAdminOrManager) {
        localStorage.setItem("manager_user", encryptedUser);
        localStorage.setItem("user", encryptedUser);
        fetchManagerData();
        fetchUserData();
        toast.success("Signin successful! Redirecting to Admin Dashboard...");
        router.push("/manager");
      } else {
        localStorage.setItem("user", encryptedUser);
        fetchUserData();
        toast.success("Signin successful!");
        router.push("/dashboard");
      }
    } catch (error) {
      
      toast.error(
        error.response?.data?.message || "An error occurred during signin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-16">
      <ToastContainer />
      <form
        onSubmit={handleSignin}
        className="flex flex-col gap-4 w-[90%] md:w-[450px] text-gray-700"
      >
        <Link href={"/"}>
          <Image
            className="cursor-pointer w-[100px] md:w-[150px] mx-auto"
            src={Logo}
            alt="MISAL SUB"
          />
        </Link>

        <p className="text-center font-semibold text-xl">Welcome back!</p>
        <h2 className="text-left text-gray-500">Sign in to your account</h2>
        <div className="flex flex-col gap-1">
          <label>Email Address</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Password</label>
          <div className="relative flex items-center w-full">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="border p-2 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 outline-none w-full"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center h-full"
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <button
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-900 transition-colors text-white p-2 rounded-md flex items-center justify-center mt-2"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Sign in"
          )}
        </button>
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link className="text-blue-500 hover:text-blue-600 font-medium" href={"/signup"}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default page;
