"use client";
import React, { useState, useEffect } from "react";
import {
  FaWallet,
  FaPhone,
  FaCheckCircle,
  FaShieldAlt,
  FaSearch,
  FaInfoCircle,
} from "react-icons/fa";
import { message, Modal, Spin } from "antd";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const FreeIpeCheckPage = () => {
  const router = useRouter();
  const { userData } = useAppContext();
  const [trackingId, setTrackingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userData) return;
      const userId = userData?.id || userData?._id;
      if (!userId) return;

      try {
        setWalletLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId)
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

  const handleCheck = async (e) => {
    e.preventDefault();
    
    if (!trackingId) {
      message.error("Please enter a tracking ID");
      return;
    }

    setIsLoading(true);
    setCheckResult(null);

    try {
      if (!userData) {
        message.error("User session not found. Please login again.");
        setIsLoading(false);
        return;
      }

      const userId = userData?.id || userData?._id;

      if (!userId) {
        message.error("Invalid user session.");
        setIsLoading(false);
        return;
      }

      const payload = {
        trackingId,
        userId,
      };

      console.log("Free IPE Check Payload:", payload);

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.IPE_VERIFICATION?.CHECK),
        payload
      );

      console.log("Free IPE Check Response:", response.data);

      setCheckResult(response.data);

      // Show success modal with results
      const modal = Modal.success({
        title: (
          <span className="text-xl font-bold text-gray-800">
            IPE Check Result
          </span>
        ),
        width: 600,
        centered: true,
        content: (
          <div className="py-4">
            <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Tracking ID</span>
                <span className="font-semibold text-gray-800 font-mono">
                {response.data.data.data.result?.reply || ""}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-green-600">
                  {response.data.data.data.result?.status || ""}
                </span>
              </div>
              {response.data?.message && (
                <div className="pt-2">
                  <p className="text-sm text-gray-600">
                    {response.data.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        ),
        okText: "View History",
        cancelText: "Close",
        okButtonProps: { 
          className: "bg-blue-600 hover:bg-blue-700",
        },
        onOk: () => {
          modal.destroy();
          router.push("/dashboard/history/ipe");
        },
      });

      // Reset form
      setTrackingId("");
    } catch (error) {
      console.error("Free IPE Check Error:", error);
      
      const errorMessage = error.response?.data?.message || 
        "Failed to check IPE status. Please try again.";
      
      message.error(errorMessage);
      
      // Show error details in modal if available
      if (error.response?.data) {
        Modal.error({
          title: "Check Failed",
          content: errorMessage,
          okButtonProps: { className: "bg-red-600 hover:bg-red-700" },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Wallet Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Free IPE Check</h1>
          <p className="text-gray-500 text-sm">
            Check your IPE enrollment status for free
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-4 w-full md:w-fit">
          <div className="bg-white/10 p-2 rounded-lg">
            <FaWallet className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Wallet Balance</p>
            {walletLoading ? (
              <div className="h-6 w-24 bg-white/20 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-lg font-bold">
                ₦ {walletBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaInfoCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              How to Use Free IPE Check
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Enter your tracking ID to check your IPE enrollment status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>This service is completely free - no charges apply</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Get instant results about your IPE verification status</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          {/* Input Form */}
          <form onSubmit={handleCheck} className="space-y-6 max-w-2xl mx-auto">
            {/* Tracking ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your tracking ID"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter the tracking ID you received during IPE enrollment
              </p>
            </div>

            {/* Free Service Notice */}
            <div className="bg-green-50 p-4 rounded-xl flex items-start gap-3 border border-green-200">
              <div className="pt-1">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium">
                  Free Service - No Charges
                </p>
                <p className="text-xs text-green-700 mt-1">
                  This IPE status check is completely free. Your wallet will not be charged.
                </p>
              </div>
            </div>

            {/* Check Button */}
            <button
              type="submit"
              disabled={isLoading || !trackingId}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isLoading || !trackingId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/30"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Checking Status...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaSearch />
                  Check IPE Status
                </span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-200">
              <FaShieldAlt className="text-gray-600 w-5 h-5" />
              <p className="text-xs text-gray-600">
                Your information is secure and protected. We use industry-standard encryption to keep your data safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeIpeCheckPage;
