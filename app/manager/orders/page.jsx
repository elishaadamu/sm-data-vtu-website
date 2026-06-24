"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { fetchAdminUsers } from "@/lib/adminStore";
import {
  formatCurrency,
  isOrderTransaction,
  normalizeTransaction,
  unwrapList,
} from "@/lib/managerTransactions";
import { FaFilter, FaHistory, FaSearch, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const statusClass = (status) => {
  const value = String(status).toLowerCase();
  if (value.includes("success") || value.includes("completed")) return "bg-emerald-100 text-emerald-700";
  if (value.includes("fail")) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

export default function OrderHistory() {
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
        console.error("Error loading transaction history:", error);
        setTransactions([]);
        toast.error(error?.response?.data?.message || "Failed to load transaction history.");
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [adminId]);


  const filteredOrders = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return transactions
      .filter(isOrderTransaction)
      .map(normalizeTransaction)
      .filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(q) ||
          order.phone.includes(searchTerm) ||
          order.agentPhone.includes(searchTerm) ||
          order.network.toLowerCase().includes(q) ||
          order.plan.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "All" ||
          order.status.toLowerCase().includes(statusFilter.toLowerCase());
        return matchesSearch && matchesStatus;
      });
  }, [transactions, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
          <p className="text-slate-500 mt-1">Review all data and service purchases across the platform.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, phone, network..."
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
            <FaHistory className="text-slate-500" />
            <h2 className="font-bold text-slate-800">Recent Orders</h2>
          </div>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount / Plan</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Prev Bal</th>
                <th className="px-4 py-3 text-right">New Bal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyLoading || filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-400">
                    {historyLoading
                        ? "Loading order history..."
                        : "No order transactions found."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{order.id}</td>
                    <td className="px-4 py-3 text-xs">{order.date}</td>
                    <td className="px-4 py-3 font-semibold">{order.network}</td>
                    <td className="px-4 py-3">{order.type}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {formatCurrency(order.amount)} / {order.plan}
                    </td>
                    <td className="px-4 py-3">{order.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(order.prevBal)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.newBal)}</td>
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
