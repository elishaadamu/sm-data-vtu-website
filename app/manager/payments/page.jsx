"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { fetchAdminUsers } from "@/lib/adminStore";
import {
  formatCurrency,
  isPaymentTransaction,
  normalizeTransaction,
  unwrapList,
} from "@/lib/managerTransactions";
import { FaFilter, FaMoneyCheckAlt, FaSearch, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const statusClass = (status) => {
  const value = String(status).toLowerCase();
  if (value.includes("success") || value.includes("completed")) return "bg-emerald-100 text-emerald-700";
  if (value.includes("fail")) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

export default function PaymentHistory() {
  const { managerData } = useAppContext();
  const adminId = managerData?._id || managerData?.id;

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadUsers = useCallback(async () => {
    if (!adminId) return;
    setUsersLoading(true);
    try {
      const data = await fetchAdminUsers(adminId);
      setUsers(unwrapList(data, ["users"]));
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!adminId) return;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await axios.get(apiUrl(`/admin/transactions/${adminId}`));
        console.log("Admin Transactions API Response:", response.data);
        setTransactions(unwrapList(response.data, ["transactions", "history", "data"]));
      } catch (error) {
        console.error("Error loading payment history:", error);
        setTransactions([]);
        toast.error(error?.response?.data?.message || "Failed to load payment history.");
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [adminId]);


  const filteredPayments = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return transactions
      .filter(isPaymentTransaction)
      .map(normalizeTransaction)
      .filter((payment) => {
        const matchesSearch =
          payment.id.toLowerCase().includes(q) ||
          payment.agentPhone.includes(searchTerm) ||
          payment.type.toLowerCase().includes(q) ||
          payment.plan.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "All" ||
          payment.status.toLowerCase().includes(statusFilter.toLowerCase());
        return matchesSearch && matchesStatus;
      });
  }, [transactions, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
          <p className="text-slate-500 mt-1">Review all wallet funding and deposits across the platform.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, phone, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            />
          </div>
          <div className="relative w-full sm:w-40">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Success">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <FaMoneyCheckAlt className="text-green-500" />
            <h2 className="font-bold text-slate-800">Deposit Records</h2>
          </div>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Agent Phone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Prev Balance</th>
                <th className="px-4 py-3 text-right">New Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyLoading || filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    {historyLoading
                        ? "Loading payment history..."
                        : "No payment records found."}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs">{payment.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{payment.id}</td>
                    <td className="px-4 py-3">{payment.agentPhone}</td>
                    <td className="px-4 py-3">{payment.type}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(payment.prevBal)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {formatCurrency(payment.newBal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
