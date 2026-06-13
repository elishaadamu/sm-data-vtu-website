"use client";
import React, { useState, useEffect } from "react";
import { getAdminUsers, updateAdminUserBalance, deleteAdminUser } from "@/lib/adminStore";
import { FaSearch, FaWallet, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  useEffect(() => {
    setUsers(getAdminUsers());
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((u) => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  const openFundModal = (user) => {
    setEditingUser(user);
    setNewBalance(user.balance);
  };

  const closeFundModal = () => {
    setEditingUser(null);
    setNewBalance("");
  };

  const saveBalance = () => {
    if (isNaN(newBalance) || newBalance === "") {
      toast.error("Please enter a valid amount");
      return;
    }
    const updated = updateAdminUserBalance(editingUser.id, newBalance);
    setUsers(updated);
    toast.success(`Wallet updated for ${editingUser.fullName}`);
    closeFundModal();
  };

  const handleDelete = (userId, name) => {
    if (confirm(`Are you sure you want to delete user ${name}?`)) {
      const updated = deleteAdminUser(userId);
      setUsers(updated);
      toast.success("User deleted successfully.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 mt-1">View and manage all registered users.</p>
        </div>
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">S/N</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">{user.sn}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{user.fullName}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ₦{user.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openFundModal(user)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <FaWallet /> Fund
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.fullName)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Edit Wallet Balance</h3>
              <button onClick={closeFundModal} className="text-slate-400 hover:text-slate-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500">User</p>
                <p className="font-semibold text-slate-800">{editingUser.fullName}</p>
                <p className="text-xs text-slate-500">{editingUser.phone}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">New Balance (₦)</label>
                <input 
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold text-slate-800"
                />
              </div>
              <button 
                onClick={saveBalance}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaSave /> Save Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
