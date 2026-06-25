"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdSignalCellularAlt } from "react-icons/md";

const NETWORKS = [
  { name: "MTN", identifier: "MTN" },
  { name: "Airtel", identifier: "AIRTEL" },
  { name: "9Mobile", identifier: "9MOBILE" },
  { name: "Glo", identifier: "GLO" },
];

const DataPage = () => {
  const { userData } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networks, setNetworks] = useState(NETWORKS);
  const [networksLoading, setNetworksLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
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
            API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId,
          ),
        );
        setWalletBalance(response.data?.wallet?.balance || 0);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletBalance();
  }, [userData]);

  // Fetch network-specific plans when network is selected
  useEffect(() => {
    if (!selectedNetwork) {
      setPlans([]);
      return;
    }

    const fetchNetworkPlans = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          apiUrl(
            API_CONFIG.ENDPOINTS.DATA.GET_BY_NETWORK + selectedNetwork,
          ),
        );
        // Our database returns plans under response.data.data or response.data.plans
        const plansData = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.plans || response.data.dataPlans || [];

        if (plansData && Array.isArray(plansData)) {
          const formattedPlans = plansData
            .filter((p) => p.isActive !== false)
            .map((p) => ({
              ...p,
              plan_code: p.planId || p.plan_code || "",
              label: p.planName || p.label || "Data Plan",
              amount: p.price ?? p.amount ?? 0,
              validity: p.validity || "30",
            }));
          setPlans(formattedPlans);
        } else {
          setPlans([]);
        }
      } catch (error) {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkPlans();
  }, [selectedNetwork]);

  const handleNetworkSelect = (identifier) => {
    setSelectedNetwork(identifier);
    setSelectedPlanId(""); // Reset plan selection when network changes
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    const userId = userData?.id || userData?._id;
    if (!userId) {
      message.error("User not found. Please log in again.");
      return;
    }

    const selectedPlan = plans.find((p) => p.plan_code === selectedPlanId);
    if (!selectedPlan) {
      message.error("Please select a valid data plan.");
      return;
    }

    const getNetworkNumber = (net) => {
      switch (net?.toUpperCase()) {
        case "MTN": return "1";
        case "GLO": return "2";
        case "9MOBILE": return "3";
        case "AIRTEL": return "4";
        default: return net;
      }
    };

    const payload = {
      network: getNetworkNumber(selectedNetwork),
      phone: phoneNumber,
      PlanId: selectedPlanId,
      userId,
      amount: selectedPlan.amount,
    };
    try {
      setLoading(true);
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.DATA.CREATE),
        payload,
      );
      const transactionData = response.data.data;
      MySwal.fire({
        icon: "success",
        title: "Transaction Successful",
        html: (
          <div className="text-left">

            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Network:</span>
              <span className="font-bold">{transactionData.network}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Mobile Number:</span>
              <span className="font-bold">{transactionData.mobile_number}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Plan:</span>
              <span className="font-bold">{transactionData.plan_name || transactionData.data_plan || "Data Plan"}</span>
            </div>
             <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-semibold text-gray-600">Amount:</span>
              <span className="font-bold">₦{transactionData?.amount || payload.amount}</span>
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
      setSelectedNetwork("");
      setPhoneNumber("");
      setSelectedPlanId("");
      setPlans([]);

      // Refresh wallet balance
      const balanceResponse = await axios.get(
        apiUrl(
          API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId,
        ),
      );
      setWalletBalance(balanceResponse.data?.wallet?.balance || 0);
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Transaction Failed",
        text: error.response?.data?.message || "Failed to purchase data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans;
  }, [plans]);

  const selectedPlanDetails = useMemo(() => {
    if (!selectedPlanId) return null;
    return plans.find((p) => p.plan_code === selectedPlanId);
  }, [selectedPlanId, plans]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Data Subscription
        </h1>
        <p className="text-slate-600 mt-2">
          Get connected instantly with our data plans.
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

      {/* Data Form */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
        <form onSubmit={handlePurchase} className="space-y-6">
          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              1. Select Network
            </label>
            {networksLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {networks.map((net) => (
                  <button
                    key={net.identifier}
                    type="button"
                    onClick={() => handleNetworkSelect(net.identifier)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedNetwork === net.identifier
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-slate-200 bg-slate-50 hover:border-purple-300"
                    }`}
                  >
                    <MdSignalCellularAlt className="w-5 h-5 text-slate-500" />
                    <span className="font-semibold text-slate-800 text-xs">
                      {net.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              2. Enter Phone Number
            </label>
            <FaMobileAlt className="absolute left-4 top-1/2 -translate-y-1/2 mt-3.5 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              required
            />
          </div>

          {/* Plan Selection */}
          {selectedNetwork && (
            <div>
              <label
                htmlFor="plan-select"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                3. Select Plan
              </label>
              <div className="relative">
                <FaWifi className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  id="plan-select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition appearance-none bg-white"
                  required
                  disabled={filteredPlans.length === 0}
                >
                  <option value="" disabled>
                    {loading
                      ? "Loading plans..."
                      : filteredPlans.length > 0
                        ? "Choose a data plan"
                        : "No plans available for this network"}
                  </option>
                  {filteredPlans.map((plan, index) => (
                    <option
                      key={`${plan.plan_code}-${index}`}
                      value={plan.plan_code}
                    >
                      {plan.label} - ₦{plan.amount}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Price Display */}
          {selectedPlanDetails && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-md flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">
                  {selectedPlanDetails.label}
                </p>
              </div>
              <p className="text-xl font-bold text-purple-600">
                ₦{selectedPlanDetails.amount}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedPlanId || !phoneNumber}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Purchase Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataPage;
