"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAdminUsers,
  fetchUserStats,
  apiUpdateUser,
  apiDeleteUser,
  apiAddBalance,
  apiDebitBalance,
  apiUpgradeUser,
  apiDowngradeUser,
} from "@/lib/adminStore";
import { useAppContext } from "@/context/AppContext";
import {
  FaSearch,
  FaWallet,
  FaTrash,
  FaTimes,
  FaSave,
  FaEdit,
  FaChartBar,
  FaSpinner,
  FaEllipsisV,
} from "react-icons/fa";
import { toast } from "react-toastify";

// ─── Stat Pill ─────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-xl ${color} text-center`}>
    <p className="text-xs uppercase tracking-wide opacity-70 font-medium">{label}</p>
    <p className="text-lg mt-1 font-semibold">{value}</p>
  </div>
);

// ─── Modal Wrapper ─────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ManageUsers() {
  const { managerData } = useAppContext();
  const adminId = managerData?._id || managerData?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [fundModal, setFundModal] = useState(null);    // user object
  const [editModal, setEditModal] = useState(null);    // user object
  const [statsModal, setStatsModal] = useState(null);  // { user, stats }
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [debitModal, setDebitModal] = useState(null);
  const [debitAmount, setDebitAmount] = useState("");
  const [actionMenuPos, setActionMenuPos] = useState({ x: 0, y: 0 });

  // Form states
  const [fundAmount, setFundAmount] = useState("");
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "" });

  // ─── Load users ───────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    if (!adminId) return;
    setLoading(true);
    try {
      const data = await fetchAdminUsers(adminId);
      const list = Array.isArray(data) ? data : data?.users || [];
      setUsers(list);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest(".action-menu-wrapper")) return;
      setActionMenuOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isSuperAdmin = managerData?.role === "super" || managerData?.isSuperAdmin;

  // ─── Filter & Pagination ──────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.fullName || u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // ─── View Stats ───────────────────────────────────────────────────────────
  const openStats = async (user) => {
    setStatsLoading(true);
    setStatsModal({ user, stats: null });
    try {
      const userId = user._id || user.id;
      const stats = await fetchUserStats(userId, adminId);
      console.log(stats);
      setStatsModal({ user, stats });
    } catch {
      toast.error("Failed to load user stats.");
      setStatsModal(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // ─── Edit User ────────────────────────────────────────────────────────────
  const openEdit = (user) => {
    setEditForm({
      fullName: user.fullName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setEditModal(user);
  };

  const saveEdit = async () => {
    if (!editForm.fullName || !editForm.email || !editForm.phone) {
      toast.error("All fields are required.");
      return;
    }
    setActionLoading(true);
    try {
      const userId = editModal._id || editModal.id;
      await apiUpdateUser(adminId, { userId, ...editForm });
      toast.success(`User ${editForm.fullName} updated successfully.`);
      setEditModal(null);
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Delete User ──────────────────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!confirm(`Delete ${user.fullName || user.name}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const userId = user._id || user.id;
      await apiDeleteUser(adminId, userId);
      toast.success("User deleted successfully.");
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
    } catch (err) {
      toast.error(err?.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Add Balance ──────────────────────────────────────────────────────────
  const openFund = (user) => {
    setFundAmount("");
    setFundModal(user);
  };

  const saveFund = async () => {
    const amount = Number(fundAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setActionLoading(true);
    try {
      const userId = fundModal._id || fundModal.id;
      await apiAddBalance(adminId, { phone: fundModal.phone, userId, amount });
      toast.success(`₦${amount.toLocaleString()} added to ${fundModal.fullName || fundModal.name}'s wallet.`);
      setFundModal(null);
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to add balance.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Debit Balance ──────────────────────────────────────────────────────
  const openDebit = (user) => {
    setDebitAmount("");
    setDebitModal(user);
  };

  const saveDebit = async () => {
    const amount = Number(debitAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setActionLoading(true);
    try {
      const userId = debitModal._id || debitModal.id;
      await apiDebitBalance(adminId, { phone: debitModal.phone, userId, amount });
      toast.success(`₦${amount.toLocaleString()} debited from ${debitModal.fullName || debitModal.name}'s wallet.`);
      setDebitModal(null);
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to debit balance.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Upgrade / Downgrade (super admin only) ─────────────────────────────
  const handleUpgrade = async (user) => {
    if (!confirm(`Upgrade ${user.fullName || user.name} to admin?`)) return;
    setActionLoading(true);
    try {
      const userId = user._id || user.id;
      await apiUpgradeUser(adminId, userId);
      toast.success("User upgraded to admin.");
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to upgrade user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngrade = async (user) => {
    if (!confirm(`Downgrade ${user.fullName || user.name} to user?`)) return;
    setActionLoading(true);
    try {
      const userId = user._id || user.id;
      await apiDowngradeUser(adminId, userId);
      toast.success("Admin downgraded to user.");
      loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to downgrade user.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 mt-1 text-sm font-normal">
            {loading ? "Loading..." : `${users.length} user${users.length !== 1 ? "s" : ""} registered`}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-normal text-sm"
          />
        </div>
      </div>

      {/* Table & Pagination Wrapper */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full max-w-full">
        <div 
          className="overflow-x-auto w-full"
          onScroll={() => setActionMenuOpen(null)}
        >
          <table className="w-full text-left text-sm text-slate-600 border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4 bg-slate-50 font-medium">S/N</th>
                <th className="px-6 py-4 bg-slate-50 font-medium">Full Name</th>
                <th className="px-6 py-4 bg-slate-50 font-medium">Phone</th>
                <th className="px-6 py-4 bg-slate-50 font-medium">Email</th>
                <th className="px-6 py-4 bg-slate-50 font-medium">Wallet Balance</th>
                <th className="px-6 py-4 text-right bg-slate-50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FaSpinner className="animate-spin w-5 h-5 text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentItems.map((user, idx) => {
                  const serialNumber = indexOfFirstItem + idx + 1;
                  return (
                    <tr key={user._id || user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-normal">{serialNumber}</td>
                      <td className="px-6 py-4 font-normal text-slate-800">
                        {user.fullName || user.name || "—"}
                      </td>
                      <td className="px-6 py-4 font-normal">{user.phone || "—"}</td>
                      <td className="px-6 py-4 font-normal">{user.email || "—"}</td>
                      <td className="px-6 py-4 font-medium text-emerald-600">
                        ₦{(user.balance || user.walletBalance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 relative text-right">
                        <div className="action-menu-wrapper relative inline-flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              const userId = user._id || user.id;
                              if (actionMenuOpen === userId) {
                                setActionMenuOpen(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActionMenuPos({ x: rect.right, y: rect.bottom });
                                setActionMenuOpen(userId);
                              }
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-850 hover:border-slate-300 transition-colors"
                            aria-label="Open actions"
                          >
                            <FaEllipsisV className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-normal">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Showing <span className="font-medium text-slate-700">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(indexOfLastItem, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium text-slate-700">{filteredUsers.length}</span> entries
              </span>
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-normal"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-colors font-normal"
              >
                Previous
              </button>

              {(() => {
                const pages = [];
                const maxVisible = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1.5 rounded-lg border transition-all font-normal ${
                        currentPage === i
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm font-medium"
                          : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-colors font-normal"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fund Modal ────────────────────────────────────────────────────── */}
      {fundModal && (
        <Modal title="Add Wallet Balance" onClose={() => setFundModal(null)}>
          <div className="mb-4 text-sm">
            <p className="text-slate-500">User</p>
            <p className="font-medium text-slate-800">{fundModal.fullName || fundModal.name}</p>
            <p className="text-slate-400 text-xs">{fundModal.phone}</p>
          </div>
          <div className="mb-6">
            <label className="block text-xs font-normal text-slate-600 mb-2">
              Amount to Add (₦)
            </label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base font-normal text-slate-800"
            />
          </div>
          <button
            onClick={saveFund}
            disabled={actionLoading}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
          >
            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaWallet />}
            {actionLoading ? "Processing..." : "Add Balance"}
          </button>
        </Modal>
      )}

      {/* ── Debit Modal ────────────────────────────────────────────────────── */}
      {debitModal && (
        <Modal title="Debit Wallet Balance" onClose={() => setDebitModal(null)}>
          <div className="mb-4 text-sm">
            <p className="text-slate-500">User</p>
            <p className="font-medium text-slate-800">{debitModal.fullName || debitModal.name}</p>
            <p className="text-slate-400 text-xs">{debitModal.phone}</p>
          </div>
          <div className="mb-6">
            <label className="block text-xs font-normal text-slate-600 mb-2">Amount to Debit (₦)</label>
            <input
              type="number"
              value={debitAmount}
              onChange={(e) => setDebitAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-base font-normal text-slate-800"
            />
          </div>
          <button
            onClick={saveDebit}
            disabled={actionLoading}
            className="w-full py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
          >
            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaWallet />}
            {actionLoading ? "Processing..." : "Debit Balance"}
          </button>
        </Modal>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {editModal && (
        <Modal title="Edit User Info" onClose={() => setEditModal(null)}>
          <div className="space-y-4 mb-6 text-sm">
            {[
              { label: "Full Name", key: "fullName", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-normal text-slate-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={editForm[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-base font-normal text-slate-800"
                />
              </div>
            ))}
          </div>
          <button
            onClick={saveEdit}
            disabled={actionLoading}
            className="w-full py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
          >
            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {actionLoading ? "Saving..." : "Save Changes"}
          </button>
        </Modal>
      )}

      {/* ── Stats Modal ───────────────────────────────────────────────────── */}
      {statsModal && (
        <Modal
          title={`Stats — ${statsModal.user.fullName || statsModal.user.name}`}
          onClose={() => setStatsModal(null)}
        >
          {statsLoading || !statsModal.stats ? (
            <div className="flex items-center justify-center py-10">
              <FaSpinner className="animate-spin w-6 h-6 text-indigo-500" />
            </div>
          ) : (
            <div className="space-y-4 text-sm font-normal">
              <div className="grid grid-cols-2 gap-3">
                <StatPill
                  label="Role"
                  value={statsModal.stats.role || "user"}
                  color="bg-slate-50 text-slate-700"
                />
                <StatPill
                  label="Account Status"
                  value={statsModal.stats.isLocked ? "Locked" : statsModal.stats.isVerified ? "Verified" : "Unverified"}
                  color="bg-amber-50 text-amber-700"
                />
                <StatPill
                  label="Wallet Balance"
                  value={`₦${(statsModal.stats.currentBalance || statsModal.stats.balance || statsModal.stats.walletBalance || 0).toLocaleString()}`}
                  color="bg-emerald-50 text-emerald-700"
                />
                <StatPill
                  label="Total Transactions"
                  value={
                    (statsModal.stats.transactionStats?.totalTransactions || statsModal.stats.totalTransactions || statsModal.stats.transactions || 0).toLocaleString()
                  }
                  color="bg-blue-50 text-blue-700"
                />
                <StatPill
                  label="Total Orders"
                  value={
                    (statsModal.stats.transactionStats?.totalOrders || statsModal.stats.totalOrders || 0).toLocaleString()
                  }
                  color="bg-indigo-50 text-indigo-700"
                />
                <StatPill
                  label="Total Payments"
                  value={
                    (statsModal.stats.transactionStats?.totalPayments || statsModal.stats.totalPayments || 0).toLocaleString()
                  }
                  color="bg-purple-50 text-purple-700"
                />
                <StatPill
                  label="Total Spent"
                  value={`₦${(
                    statsModal.stats.transactionStats?.totalSpent || statsModal.stats.totalSpent || statsModal.stats.totalAmount || 0
                  ).toLocaleString()}`}
                  color="bg-fuchsia-50 text-fuchsia-700"
                />
                <StatPill
                  label="Total Credit"
                  value={`₦${(
                    statsModal.stats.transactionStats?.totalCredit || statsModal.stats.totalCredit || 0
                  ).toLocaleString()}`}
                  color="bg-cyan-50 text-cyan-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 font-normal">
                <div>
                  <p className="font-medium text-slate-700">Created</p>
                  <p>{new Date(statsModal.stats.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Last Login</p>
                  <p>{new Date(statsModal.stats.lastLogin).toLocaleString()}</p>
                </div>
              </div>
              {/* Raw data fallback */}
              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer hover:text-slate-600 font-normal">View raw response</summary>
                <pre className="mt-2 bg-slate-50 p-3 rounded-lg overflow-auto max-h-40 text-slate-600 font-normal font-mono text-[10px]">
                  {JSON.stringify(statsModal.stats, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Modal>
      )}

      {/* ── Action Dropdown Menu (Floating) ───────────────────────────────── */}
      {actionMenuOpen && (
        <div className="action-menu-wrapper font-normal">
          <div
            className="fixed z-[100] w-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1"
            style={{
              left: `${actionMenuPos.x - 160}px`,
              top: `${actionMenuPos.y - 10}px`,
            }}
          >
            {(() => {
              const user = users.find((u) => (u._id || u.id) === actionMenuOpen);
              if (!user) return null;
              return (
                <div className="flex flex-col gap-1 px-1 font-normal">
                  <button
                    onClick={() => {
                      setActionMenuOpen(null);
                      openStats(user);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Stats
                  </button>
                  <button
                    onClick={() => {
                      setActionMenuOpen(null);
                      openEdit(user);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setActionMenuOpen(null);
                      openDebit(user);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                  >
                    Debit
                  </button>
                  <button
                    onClick={() => {
                      setActionMenuOpen(null);
                      openFund(user);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Fund
                  </button>
                  {isSuperAdmin && !(user.role === "admin" || user.isAdmin) && (
                    <button
                      onClick={() => {
                        setActionMenuOpen(null);
                        handleUpgrade(user);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                      Upgrade to Admin
                    </button>
                  )}
                  {isSuperAdmin && (user.role === "admin" || user.isAdmin) && (
                    <button
                      onClick={() => {
                        setActionMenuOpen(null);
                        handleDowngrade(user);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      Downgrade to User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActionMenuOpen(null);
                      handleDelete(user);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-normal rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
