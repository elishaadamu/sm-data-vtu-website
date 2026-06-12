"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { message } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Image from "next/image";
import { FaWallet, FaMobileAlt, FaEnvelope, FaLock, FaCreditCard, FaGraduationCap, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";
import WaecLogo from "@/assets/Waec-logo.jpg";
import WaecStudents from "@/assets/waec-students.jpeg";

const MySwal = withReactContent(Swal);

const WaecPage = () => {
  const { userData } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState("result_checker");
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const cardPrice = 3800; // default WAEC Scratch Card price
  const totalAmount = useMemo(() => cardPrice * quantity, [quantity]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userData) return;
      const userId = userData?.id || userData?._id;
      if (!userId) return;

      try {
        setWalletLoading(true);
        const response = await axios.get(
          apiUrl(
            API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId
          )
        );
        setWalletBalance(response.data?.wallet?.balance || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletBalance();
  }, [userData]);

  const handlePurchase = async (e) => {
    e.preventDefault();

    const userId = userData?.id || userData?._id;
    if (!userId) {
      message.error("User not found. Please log in again.");
      return;
    }

    // Confirm purchase using SweetAlert2
    MySwal.fire({
      title: "Confirm Purchase",
      html: `
        <div class="text-left space-y-2 text-slate-700">
          <p>You are about to purchase <strong>${quantity} WAEC Scratch Card(s)</strong>.</p>
          <div class="bg-slate-50 p-4 rounded-xl border space-y-1 text-sm">
            <div class="flex justify-between"><span>Exam:</span> <strong>WAEC</strong></div>
            <div class="flex justify-between"><span>Quantity:</span> <strong>${quantity}</strong></div>
            <div class="flex justify-between"><span>Unit Price:</span> <strong>₦${cardPrice.toLocaleString()}</strong></div>
            <div class="flex justify-between border-t pt-1 font-bold text-slate-900"><span>Total Cost:</span> <span class="text-blue-600">₦${totalAmount.toLocaleString()}</span></div>
          </div>
          <p class="text-xs text-slate-500 mt-2">PINs will be sent to <strong>${phoneNumber}</strong></p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Proceed",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          examType,
          quantity,
          phoneNumber,
          email,
          amount: totalAmount,
          userId,
        };

        try {
          setLoading(true);
          const response = await axios.post(
            apiUrl(API_CONFIG.ENDPOINTS.WAEC.BUY_PIN),
            payload
          );

          MySwal.fire({
            icon: "success",
            title: "Purchase Successful",
            text: response.data?.message || "WAEC Scratch Card PIN purchased successfully!",
            confirmButtonColor: "#16a34a",
          });

          // Reset Form
          setQuantity(1);
          setPhoneNumber("");
          setEmail("");

          // Refresh Wallet Balance
          const balanceResponse = await axios.get(
            apiUrl(
              API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId
            )
          );
          setWalletBalance(balanceResponse.data?.wallet?.balance || 0);
        } catch (error) {
          MySwal.fire({
            icon: "error",
            title: "Transaction Failed",
            text: error.response?.data?.message || "Failed to purchase WAEC Scratch Card. Please try again.",
            confirmButtonColor: "#dc2626",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 md:p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={WaecStudents}
            alt="WAEC Students"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900/90 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              Education Services
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              WAEC Scratch Card
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Buy WAEC Result Checker PINs & Scratch Cards instantly. Secure payments, instant delivery.
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-lg self-start md:self-center">
            <Image
              src={WaecLogo}
              alt="WAEC Logo"
              width={80}
              height={80}
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Wallet Balance Info */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg text-white">
                <FaWallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Available Balance</p>
                {walletLoading ? (
                  <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-slate-900">
                    ₦ {walletBalance.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handlePurchase} className="space-y-6">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Exam Type
                </label>
                <div className="relative">
                  <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800 text-xs sm:text-sm font-medium appearance-none"
                    required
                  >
                    <option value="result_checker">WAEC Result Checker PIN</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quantity
                </label>
                {/* Desktop: buttons */}
                <div className="hidden sm:grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                        quantity === q
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                {/* Mobile: select dropdown */}
                <div className="sm:hidden relative">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm font-medium"
                  >
                    {[1, 2, 3, 4, 5].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number (for PIN delivery)
                </label>
                <div className="relative">
                  <FaMobileAlt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Price Calculation Display */}
              <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Amount</p>
                  <p className="text-slate-800 text-sm font-medium mt-1">
                    ₦{cardPrice.toLocaleString()} × {quantity} card(s)
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-100/50">
                  <span className="text-slate-400 text-xs block sm:hidden uppercase font-semibold tracking-wider mb-1">Total to Pay</span>
                  <p className="text-2xl font-black text-blue-600">
                    ₦{totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Buy Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="flex-shrink-0" />
                    <span className="hidden sm:inline">Purchase Scratch Card</span>
                    <span className="sm:hidden">Purchase Card</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              How to Check Result
            </h3>
            <ol className="space-y-3 text-sm text-slate-600 list-decimal pl-4">
              <li>Visit the WAEC Direct website (www.waecdirect.org).</li>
              <li>Enter your WAEC Examination Number.</li>
              <li>Select your Examination Year.</li>
              <li>Select your Examination Type (e.g. SCHOOL CANDIDATE).</li>
              <li>Enter the Card Serial Number purchased here.</li>
              <li>Enter the 12-digit PIN purchased here.</li>
              <li>Click Submit and wait for your result window to open.</li>
            </ol>
          </div>

          {/* Quick Notice */}
          <div className="bg-yellow-50/50 border border-yellow-200 rounded-3xl p-6 shadow-sm">
            <h4 className="font-semibold text-yellow-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              Important Notice
            </h4>
            <p className="text-xs text-yellow-700/95 leading-relaxed">
              This card can only be used to check one candidate's result up to 5 times. Please ensure you type candidate details correctly during verification on WAEC portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaecPage;
