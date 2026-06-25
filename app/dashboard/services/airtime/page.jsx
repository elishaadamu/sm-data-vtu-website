"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";
import {
  FaWallet,
  FaMobileAlt,
  FaRegMoneyBillAlt,
  FaWifi,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const AirtimePage = () => {
  const { userData } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
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
    const payload = {
      network,
      amount: parseFloat(amount),
      phone: phoneNumber,
      userId,
    };
    console.log(payload);
    try {
      setLoading(true);
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AIRTIME.CREATE),
        payload
      );
      const transactionData = response.data.data;
      MySwal.fire({
        icon: "success",
        title: "Transaction Successful",
        html: (
          <div className="text-left">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Status:</span>
              <span className="font-bold text-green-600">{transactionData.status}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Network:</span>
              <span className="font-bold">{transactionData.network}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Mobile Number:</span>
              <span className="font-bold">{transactionData.mobile_number}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Amount:</span>
              <span className="font-bold">₦{transactionData.amount}</span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">{transactionData.message}</p>
            </div>
          </div>
        ),
        confirmButtonColor: "#a855f7",
        confirmButtonText: "Close",
      });

      // Reset form
      setNetwork("");
      setPhoneNumber("");
      setAmount("");

      // Refresh wallet balance
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
        text: error.response?.data?.message || "Failed to purchase airtime. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const networks = [
    { id: "1", name: "MTN" },
    { id: "2", name: "Glo" },
    { id: "4", name: "Airtel" },
    { id: "3", name: "9mobile" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Airtime Top-up
        </h1>
        <p className="text-slate-600 mt-2">
          Quickly and easily recharge any mobile phone.
        </p>
      </div>

      {/* Wallet Balance */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
            <FaWallet className="w-6 h-6 text-white" />
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

      {/* Airtime Form */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
        <form onSubmit={handlePurchase} className="space-y-6">
          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Network
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {networks.map((net) => (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setNetwork(net.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${network === net.id
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-slate-200 bg-slate-50 hover:border-purple-300"
                    }`}
                >
                  <FaWifi className="w-5 h-5 text-slate-500" />
                  <span className="font-semibold text-slate-800">
                    {net.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="relative">
            <FaMobileAlt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              required
            />
          </div>

          {/* Amount Input */}
          <div className="relative">
            <FaRegMoneyBillAlt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Purchase Airtime"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AirtimePage;
