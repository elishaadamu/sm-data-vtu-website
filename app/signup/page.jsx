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

const page = () => {
  const router = useRouter();
  const { fetchUserData } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    passcode: "",
    confirmPasscode: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!/^\d{6}$/.test(formData.passcode)) {
      toast.error("Passcode must be exactly 6 digits.");
      setLoading(false);
      return;
    }

    if (formData.passcode !== formData.confirmPasscode) {
      toast.error("Passcodes do not match.");
      setLoading(false);
      return;
    }

    // Exclude confirmPasscode from the payload sent to the backend
    const { confirmPasscode, ...payload } = formData;
    
    console.log("Signup payload:", payload);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP),
        payload
      );
      const { user } = response.data;

      // Encrypt and store user data
      const encryptedUser = encryptData(user);
      localStorage.setItem("user", encryptedUser);

      fetchUserData(); // Call fetchUserData to update global state
      toast.success("Signup successful!", {
        onClose: () => router.push("/"),
        autoClose: 1500, // Optional: close toast faster than default
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
            <label>Passcode</label>
            <div className="relative flex items-center w-full">
              <input
                name="passcode"
                onChange={handleChange}
                value={formData.passcode}
                className="border p-2 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                type={showPasscode ? "text" : "password"}
                placeholder="6 digits"
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center h-full"
              >
                {showPasscode ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-1/2">
            <label>Confirm Passcode</label>
            <div className="relative flex items-center w-full">
              <input
                name="confirmPasscode"
                onChange={handleChange}
                value={formData.confirmPasscode}
                className="border p-2 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                type={showConfirmPasscode ? "text" : "password"}
                placeholder="6 digits"
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center h-full"
              >
                {showConfirmPasscode ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
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
