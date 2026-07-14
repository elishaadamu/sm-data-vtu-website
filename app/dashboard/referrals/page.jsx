"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import {
  FaGift,
  FaCopy,
  FaCheck,
  FaShareAlt,
  FaUserFriends,
  FaMoneyBillWave,
  FaClock,
  FaInfoCircle,
  FaWhatsapp,
  FaSpinner,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const ReferralsPage = () => {
  const { userData } = useAppContext();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Referral states from APIs
  const [commissions, setCommissions] = useState([]);
  const [referredUsers, setReferredUsers] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  // Deriving referral code and link
  useEffect(() => {
    if (typeof window !== "undefined" && userData) {
      // Use the referralCode from the login response, fallback to phone or username
      const code = userData.referralCode || userData.phone || userData.username || userData._id?.substring(0, 8) || "SMDATAUSER";
      setReferralCode(code);
      setReferralLink(`${window.location.origin}/signup?ref=${code}`);
    }
  }, [userData]);

  // Fetch and console log referral data
  useEffect(() => {
    const fetchReferralData = async () => {
      const userId = userData?._id || userData?.id;
      if (!userId) return;

      setLoadingData(true);
      
      // Fetch Commissions
      try {
        const commissionsRes = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REFERRALS.COMMISSIONS + userId));
        console.log("Referral Commissions Response:", commissionsRes.data);
        const data = commissionsRes.data?.data;
        const commissionsList = data?.transactions || [];
        setCommissions(Array.isArray(commissionsList) ? commissionsList : []);
        setTotalEarnings(data?.summary?.totalEarnings ?? 0);
      } catch (error) {
        console.error("Error fetching referral commissions:", error);
      }

      // Fetch Referred Users
      try {
        const referredUsersRes = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REFERRALS.REFERRED_USERS + userId));
        console.log("Referred Users Response:", referredUsersRes.data);
        const data = referredUsersRes.data?.data;
        const usersList = data?.referredUsers || [];
        setReferredUsers(Array.isArray(usersList) ? usersList : []);
      } catch (error) {
        console.error("Error fetching referred users:", error);
      }

      setLoadingData(false);
    };

    fetchReferralData();
  }, [userData]);

  const copyToClipboard = (text, isLink = true) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Sign up on SM DATA using my referral link and enjoy instant, cheap data and airtime recharges: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Derive dynamic stats
  const totalCommission = useMemo(() => {
    if (totalEarnings !== undefined && totalEarnings !== null) return totalEarnings;
    return commissions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [commissions, totalEarnings]);

  // Mock list of referrals for rich frontend presentation (only used as fallback or fallback design)
  const mockReferrals = [
    {
      id: "ref1",
      name: "Tunde Bakare",
      dateJoined: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 5 days ago
      commissionEarned: 350.0,
      daysRemaining: 45,
      status: "Active",
    },
    {
      id: "ref2",
      name: "Chioma Nnaji",
      dateJoined: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 15 days ago
      commissionEarned: 620.5,
      daysRemaining: 35,
      status: "Active",
    },
    {
      id: "ref3",
      name: "Ibrahim Musa",
      dateJoined: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 55 days ago
      commissionEarned: 1200.0,
      daysRemaining: 0,
      status: "Expired",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ToastContainer />
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-8 mb-8 shadow-xl">
        {/* Abstract Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              <FaGift className="w-3.5 h-3.5" />
              Referral Program
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Refer & Earn <span className="text-yellow-400">Commissions</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Earn commissions automatically on every transaction (Wallet Top-up, Airtime, and Data purchases) made by users you refer.
            </p>
          </div>
          <div className="flex items-center justify-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-200">Commission Window</p>
              <h2 className="text-4xl font-extrabold text-yellow-400 mt-1">50 Days</h2>
              <p className="text-[11px] text-blue-100 mt-2 max-w-[150px] mx-auto">
                Enjoy rewards on all their operations for 50 days!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Referral Code and Link Sharing (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaShareAlt className="text-blue-600" />
              Invite Your Friends
            </h3>

            <div className="space-y-5">
              {/* Referral Link */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Your Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink, true)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition shadow-md"
                  >
                    {copiedLink ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Social Sharing Buttons */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Or share directly via</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition shadow-md"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Statistics (Span 1) */}
        <div className="space-y-6">
          {/* Total Referrals Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
            <div className="space-y-1 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Referred</p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {loadingData ? (
                  <FaSpinner className="animate-spin text-slate-400 text-2xl inline" />
                ) : (
                  `${referredUsers.length} User${referredUsers.length !== 1 ? "s" : ""}`
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Directly signed up with your link</p>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <FaUserFriends className="w-6 h-6" />
            </div>
          </div>

          {/* Commission Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center justify-between">
            <div className="space-y-1 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commission</p>
              <h3 className="text-3xl font-extrabold text-green-600">
                {loadingData ? (
                  <FaSpinner className="animate-spin text-green-600 text-2xl inline" />
                ) : (
                  `₦${totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Paid directly to your wallet</p>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
              <FaMoneyBillWave className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Program Details */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 md:p-8 mb-8">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          Referral Commission Matrix
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          For every friend you refer to SM DATA, you get a flat commission on all of their transactions during their first 50 days of membership.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Wallet Funding</h4>
              <p className="text-xs text-slate-500 mt-1">Earn ₦5 commission on all their wallet deposits. (Note: Funding charges are processed on the backend and do not affect the commission amount)</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Airtime Purchase</h4>
              <p className="text-xs text-slate-500 mt-1">Earn ₦1 commission on every airtime transaction.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Data Subscription</h4>
              <p className="text-xs text-slate-500 mt-1">Earn ₦5 commission on every data plan they buy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FaUserFriends className="text-blue-600" />
          Referral History
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Friend</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Registered</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Commission Gained</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Commission Window</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loadingData ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <FaSpinner className="animate-spin w-6 h-6 text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : referredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No referred users yet. Share your link to start earning!
                  </td>
                </tr>
              ) : (
                referredUsers.map((ref, idx) => {
                  // Find commissions for this user
                  const userCommissions = commissions.filter(c => 
                    c.referredUserId === ref._id || 
                    c.referredUserId === ref.id || 
                    (c.referredUser && (c.referredUser._id === ref._id || c.referredUser.id === ref.id || c.referredUser === ref._id || c.referredUser === ref.id))
                  );
                  const commissionEarned = userCommissions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
                  
                  // Calculate registration date and days remaining in the 50-day window
                  const regDate = new Date(ref.createdAt || ref.dateJoined || Date.now());
                  const diffTime = Date.now() - regDate.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  const daysRemaining = Math.max(0, 50 - diffDays);
                  const isActive = daysRemaining > 0;

                  return (
                    <tr key={ref._id || ref.id || idx} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 text-left">
                        {ref.fullName || `${ref.firstName || ""} ${ref.lastName || ""}`.trim() || ref.username || "Anonymous Friend"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-left">
                        {regDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                        ₦{commissionEarned.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-slate-600">
                        <span className="flex items-center justify-center gap-1">
                          <FaClock className="w-3.5 h-3.5 text-slate-400" />
                          {isActive ? `${daysRemaining} days left` : "Ended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {isActive ? "Active" : "Expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default ReferralsPage;
