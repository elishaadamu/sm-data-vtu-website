"use client";
import Image from "next/image";
import Logo from "@/assets/logo/sm-data.png";

import Link from "next/link";
import React, { useState, useEffect } from "react";
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
  // const searchParams = useSearchParams(); // Removed direct call to avoid SSR issues
  const { fetchUserData } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChars: false,
  });

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    let strength = "Weak";
    const meetsRequirements =
      hasMinLength + hasUpperCase + hasLowerCase + hasNumbers + hasSpecialChars;

    if (meetsRequirements >= 5) {
      strength = "Strong";
    } else if (meetsRequirements >= 3) {
      strength = "Medium";
    }

    setPasswordStrength({
      strength,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (
      !passwordStrength.hasUpperCase ||
      !passwordStrength.hasLowerCase ||
      !passwordStrength.hasNumbers ||
      !passwordStrength.hasSpecialChars
    ) {
      toast.error(
        "Password must contain uppercase, lowercase, numbers, and special characters."
      );
      setLoading(false);
      return;
    }

    console.log("Signup payload:", formData);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP),
        formData
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
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-1/2">
            <label>First Name</label>
            <input
              name="firstName"
              onChange={handleChange}
              value={formData.firstName}
              className="border p-2 rounded-md"
              type="text"
              placeholder="Enter your first name"
            />
          </div>
          <div className="flex flex-col gap-1 w-1/2">
            <label>Last Name</label>
            <input
              name="lastName"
              onChange={handleChange}
              value={formData.lastName}
              className="border p-2 rounded-md"
              type="text"
              placeholder="Enter your last name"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label>Email</label>
          <input
            name="email"
            onChange={handleChange}
            value={formData.email}
            className="border p-2 rounded-md"
            type="email"
            placeholder="Enter your email"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label>Phone Number</label>
          <input
            name="phone"
            onChange={handleChange}
            value={formData.phone}
            className="border p-2 rounded-md"
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label>NIN (National Identification Number)</label>
          <input
            name="nin"
            onChange={handleChange}
            value={formData.nin}
            className="border p-2 rounded-md"
            type="text"
            placeholder="Enter your NIN"
          />
        </div>

        <div className="flex flex-col gap-1 relative">
          <label>Password</label>
          <input
            name="password"
            onChange={handleChange}
            value={formData.password}
            className="border p-2 rounded-md pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <FaEyeSlash className="w-5 h-5" />
            ) : (
              <FaEye className="w-5 h-5" />
            )}
          </button>
        </div>

        {formData.password && (
          <div className="border p-3 rounded-md bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Password Strength:</span>
              <span
                className={`text-sm font-bold ${
                  passwordStrength.strength === "Strong"
                    ? "text-green-600"
                    : passwordStrength.strength === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {passwordStrength.strength}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordStrength.hasMinLength
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {passwordStrength.hasMinLength && "✓"}
                </span>
                <span>At least 8 characters</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordStrength.hasUpperCase
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {passwordStrength.hasUpperCase && "✓"}
                </span>
                <span>Uppercase letter (A-Z)</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordStrength.hasLowerCase
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {passwordStrength.hasLowerCase && "✓"}
                </span>
                <span>Lowercase letter (a-z)</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordStrength.hasNumbers
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {passwordStrength.hasNumbers && "✓"}
                </span>
                <span>Number (0-9)</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordStrength.hasSpecialChars
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {passwordStrength.hasSpecialChars && "✓"}
                </span>
                <span>Special character (!@#$%^&* etc.)</span>
              </div>
            </div>
          </div>
        )}
        <button
          disabled={loading}
          className="bg-gray-800 text-white p-2 rounded-md flex items-center justify-center"
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
            "Sign up"
          )}
        </button>
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link className="text-blue-500" href={"/signin"}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default page;
