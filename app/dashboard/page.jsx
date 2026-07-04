"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaDatabase,
  FaBolt,
  FaTv,
  FaFileAlt,
  FaIdCard,
  FaShoppingBag,
  FaWallet,
  FaChartLine,
  FaMobileAlt,
  FaClipboardList,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowRight,
  FaArrowUp,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import WalletCard from "@/components/WalletCard";

const ServicesLayout = () => {
  const { userData, authLoading } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [getCount, setgetCount] = useState(0);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [bvn, setBvn] = useState("");
  const [accountDetails, setAccountDetails] = useState(null);
  const [fundingsCount, setFundingsCount] = useState(0);

  const services = [
    {
      name: "Data",
      icon: <FaDatabase className="w-5 h-5" />,
      description: "Mobile data plans and bundles",
      path: "dashboard/services/data",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      name: "Airtime",
      icon: <FaMobileAlt className="w-5 h-5" />,
      description: "Mobile airtime top-up",
      path: "dashboard/services/airtime",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      name: "Electric",
      icon: <FaBolt className="w-5 h-5" />,
      description: "Electricity bill payments",
      path: "dashboard/services/electric",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    {
      name: "Cable",
      icon: <FaTv className="w-5 h-5" />,
      description: "Cable TV subscriptions",
      path: "dashboard/services/cable",
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50",
    },
    {
      name: "WAEC",
      icon: <FaFileAlt className="w-5 h-5" />,
      description: "Purchase WAEC scratch cards instantly",
      path: "dashboard/services/waec",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      name: "NECO",
      icon: <FaIdCard className="w-5 h-5" />,
      description: "Purchase NECO token / scratch cards instantly",
      path: "dashboard/services/neco",
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-50",
    },
  ];

  const transactions = [
    // {
    //   name: "My Orders",
    //   icon: <FaShoppingBag className="w-5 h-5" />,
    //   path: "/transactions/orders",
    //   count: 12,
    //   color: "blue",
    // },
    // {
    //   name: "Wallet Summary",
    //   icon: <FaWallet className="w-5 h-5" />,
    //   path: "/transactions/wallet",
    //   count: null,
    //   color: "green",
    // },
    // {
    //   name: "Dashboard",
    //   icon: <FaChartLine className="w-5 h-5" />,
    //   path: "/dashboard",
    //   count: null,
    //   color: "purple",
    // },
    {
      name: "All Orders",
      icon: <FaClipboardList className="w-5 h-5" />,
      path: "/dashboard/history/all-orders",
      count: getCount,
      color: "yellow",
    },
    {
      name: "Fundings",
      icon: <FaCreditCard className="w-5 h-5" />,
      path: "/dashboard/history/funding",
      count: fundingsCount,
      color: "blue",
    },
    {
      name: "Add Money",
      icon: <FaMoneyBillWave className="w-5 h-5" />,
      path: "/add-money",
      count: null,
      color: "blue",
    },
  ];

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userData) return;
      const userId = userData?.id || userData?._id;
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          apiUrl(
            API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + "balance/" + userId,
          ),
        );
        console.log("Wallet Balance Response:", response.data);
        setWalletBalance(response.data?.wallet?.balance ?? 0);
        setAccountDetails(response.data?.wallet || null);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
        setAccountDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, [userData]);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!userData) return;
      const userId = userData?.id || userData?._id;
      if (!userId) return;

      try {
        setTransactionsLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.ALL_HISTORY + userId),
        );
        const allTransactions =
          response.data?.transactions || response.data?.data || [];
        setgetCount(response.data?.count || allTransactions.length);

        const credits = allTransactions.filter((t) => t.type === "credit");
        setFundingsCount(credits.length);

        console.log("All Transactions:", response.data);
        // Process transactions to extract network and phone from description
        const processedTransactions = allTransactions.map((transaction) => {
          let network = transaction.network;
          let phone = transaction.phone || transaction.phoneNumber;

          // Extract network from description
          if (!network && transaction.description) {
            const networkMatch =
              transaction.description.match(/:\s*([^-]+)\s*-/);
            if (networkMatch) {
              network = networkMatch[1].trim();
            }
          }

          // Extract phone from description
          if (!phone && transaction.description) {
            const phoneMatch =
              transaction.description.match(/(?:for|-)\s*(\d{11})/);
            if (phoneMatch) {
              phone = phoneMatch[1];
            }
          }

          return {
            ...transaction,
            network: network || "N/A",
            phoneNumber: phone || "N/A",
            reference:
              transaction.transactionReference ||
              transaction.reference ||
              transaction.transactionId,
          };
        });

        // Get the 5 most recent transactions
        const recent = processedTransactions
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentTransactions(recent);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [userData]);

  // Handle Create Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!bvn.trim()) {
      toast.error("Please enter your BVN");
      return;
    }

    const userId = userData?.id || userData?._id;
    if (!userId) {
      toast.error("User not found");
      return;
    }

    setLoading(true);
    const payload = { number: bvn };

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.CREATE_VIRTUAL + userId),
        payload,
      );
      console.log("Account created:", response.data);
      toast.success("Virtual account created successfully!");
      setShowCreateAccount(false);
      setBvn("");
      const details = response.data?.data || response.data?.account || response.data?.wallet;
      setAccountDetails(details);
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error(error.response?.data?.message || "Failed to create virtual account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200  rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto  sm:px-6 lg:px-8 ">
          {/* Header Section */}
          {/* <div className="mb-10 lg:mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-3">
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Welcome
                    </span>
                    <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Welcome {userData?.firstName || userData?.username}
                    </span>{" "}
                    <span>🙂</span>
                  </>
                )}
              </h1>
              <p className="text-base lg:text-lg text-slate-600 max-w-2xl">
                All your premium services and transactions in one place
              </p>
            </div>
          </div> */}

          {/* Wallet Carousel Section */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl hidden sm:block">
                    <FaWallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm mb-1 font-medium">Wallet balance</p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white">
                      ₦
                      {walletBalance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:text-right w-full md:w-auto flex flex-col md:items-end border border-white/10 min-h-[82px] justify-center">
                  <p className="text-blue-100 text-xs mb-1 font-medium">Virtual Account</p>
                  {accountDetails?.accountNumber ? (
                    <>
                      <p className="text-white font-semibold text-lg font-mono tracking-wider">
                        {accountDetails.accountNumber}
                      </p>
                      <p className="text-white/90 text-xs mt-0.5">
                        {accountDetails.bankName} • {accountDetails.accountName}
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="mt-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition duration-200 active:scale-95"
                    >
                      Create Virtual Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Total Fund and Total Spent
        <div className="grid grid-cols-2 gap-4 mb-10 lg:mb-14">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-5 lg:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <FaArrowUp className="w-5 h-5 text-white rotate-180" />
              </div>
              <p className="text-sm lg:text-base text-slate-600 font-medium">
                Total Fund
              </p>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900">
              ₦ 0.00
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-5 lg:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-600 p-3 rounded-xl shadow-lg">
                <FaArrowUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm lg:text-base text-slate-600 font-medium">
                Total Spent
              </p>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900">₦ 0</p>
          </div>
        </div> */}

          {/* Main Grid Layout - Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5">
            {/* Services Section - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                      <FaDatabase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                        Our Services
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {services.length} premium services available
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-5">
                  {services.map((service, index) => (
                    <Link
                      key={index}
                      href={service.path}
                      className="group relative bg-white rounded-xl p-2 lg:p-6 transition-all duration-300 hover:scale-105 hover:shadow-md border border-slate-100 overflow-hidden"
                    >
                      {/* Gradient Background on Hover */}
                      <div
                        className={`absolute inset-0 border-1  opacity-0 group-hover:opacity-100  transition-opacity duration-300`}
                      ></div>
                      <div className="relative z-10">
                        <div className="flex flex-row md:flex-row justify-center items-center gap-2 py-4">
                          <div
                            className={`text-blue-600 bg-blue-50 p-3 md:p-3.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300`}
                          >
                            {service.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className=" text-[13px] text-blue-950 md:text-lg text-center md:text-left group-hover:text-slate-800 mb-1">
                              {service.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions & Stats Section - Takes 1 column on desktop */}
            <div className="space-y-6 lg:space-y-8">
              {/* Transactions List */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                    <FaWallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                      Quick Actions
                    </h2>
                    <p className="text-sm text-slate-600">Manage activities</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {transactions.map((item, index) => (
                    <Link
                      key={index}
                      href={item.path}
                      className="group p-2 flex items-center justify-between  rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`bg-${item.color}-100 p-2.5 rounded-lg group-hover:bg-${item.color}-200 transition-colors text-${item.color}-600`}
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium text-slate-900 group-hover:text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.count !== null && (
                          <span
                            className={`bg-${item.color}-100 text-${item.color}-700 text-xs font-bold px-2.5 py-1 rounded-full`}
                          >
                            {item.count}
                          </span>
                        )}
                        <FaArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                      <FaClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                        Recent Transactions
                      </h2>
                      <p className="text-sm text-slate-600">
                        Last 5 activities
                      </p>
                    </div>
                  </div>
                </div>

                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-slate-200 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : recentTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            Transaction
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            Description
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recentTransactions.map((transaction, index) => (
                          <tr
                            key={transaction._id || index}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                                  {transaction.TransactionType ===
                                  "Data-Purchase" ? (
                                    <FaDatabase className="w-4 h-4 text-purple-600" />
                                  ) : (
                                    <FaMobileAlt className="w-4 h-4 text-purple-600" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-900">
                                    {transaction.TransactionType}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {transaction.network !== "N/A"
                                      ? transaction.network
                                      : "-"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                              {transaction.phoneNumber !== "N/A"
                                ? transaction.phoneNumber
                                : transaction.description}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                              ₦
                              {parseFloat(
                                transaction.amount || 0,
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs text-slate-500">
                              {new Date(
                                transaction.createdAt,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      No transactions yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-12 lg:mt-16 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <p className="text-slate-700 font-medium mb-2">
                Need help? Contact our 24/7 support team
              </p>
              <p className="text-sm text-slate-600">
                All services are available 24/7 • Secure transactions guaranteed
                • Premium customer support
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
      {/* Create Virtual Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Create Virtual Account
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Enter your Bank Verification Number (BVN) to create a virtual account and start receiving
              payments.
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium text-sm">
                  Bank Verification Number (BVN)
                </label>
                <input
                  type="text"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  placeholder="Enter your 11-digit BVN"
                  maxLength="11"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !bvn.trim()}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAccount(false);
                    setBvn("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{" "}
    </>
  );
};

export default ServicesLayout;
