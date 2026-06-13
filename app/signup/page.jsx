"use client";
import Image from "next/image";
import Logo from "@/assets/logo/sm-data.png";
import Link from "next/link";
import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { encryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

const page = () => {
  const router = useRouter();
  const { fetchUserData } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Exclude confirmPassword from the payload sent to the backend
    const { confirmPassword, ...payload } = formData;
    
    console.log("Signup payload:", payload);

    try {
      // 1. Perform Signup
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP),
        payload
      );

      // 2. Automatically Perform Login
      const loginPayload = {
        phone: payload.phone,
        password: payload.password,
      };

      const loginResponse = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN),
        loginPayload
      );

      if (!loginResponse.data) {
        throw new Error("No data received from login server");
      }

      // 3. Encrypt and store user data exactly as login does
      const encryptedUser = encryptData(loginResponse.data);
      localStorage.setItem("user", encryptedUser);

      // 4. Update global state
      fetchUserData(); 

      // 5. Show custom alert and redirect to dashboard
      Swal.fire({
        title: "Account Created!",
        text: "You have been successfully signed up and logged in.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Go to Dashboard",
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        router.push("/dashboard");
      });

    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during signup."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-16">
      <ToastContainer />
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 w-[90%] md:w-[450px] text-gray-700"
      >
        <Link href={"/"}>
          <Image
            className="cursor-pointer w-[100px] md:w-[150px] mx-auto"
            src={Logo}
            alt="MISAL SUB"
          />
        </Link>
        <p className="text-center font-semibold text-xl">Create an account</p>
        
        <div className="flex flex-col gap-1">
          <label>Full Name</label>
          <input
            name="fullName"
            onChange={handleChange}
            value={formData.fullName}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type="text"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label>Phone Number</label>
          <input
            name="phone"
            onChange={handleChange}
            value={formData.phone}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type="tel"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label>Email</label>
          <input
            name="email"
            onChange={handleChange}
            value={formData.email}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-1/2">
            <label>Password</label>
            <div className="relative flex items-center w-full">
              <input
                name="password"
                onChange={handleChange}
                value={formData.password}
                className="border p-2 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center h-full"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-1/2">
            <label>Confirm Password</label>
            <div className="relative flex items-center w-full">
              <input
                name="confirmPassword"
                onChange={handleChange}
                value={formData.confirmPassword}
                className="border p-2 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center h-full"
              >
                {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label>Referral Code <span className="text-gray-400 text-sm">(Optional)</span></label>
          <input
            name="referralCode"
            onChange={handleChange}
            value={formData.referralCode}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            type="text"
            placeholder="Enter referral code"
          />
        </div>

        <button
          disabled={loading}
          className="bg-gray-800 text-white p-2 rounded-md flex items-center justify-center hover:bg-gray-900 transition-colors mt-2"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Sign up"
          )}
        </button>
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link className="text-blue-500 hover:text-blue-600 font-medium" href={"/signin"}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default page;
