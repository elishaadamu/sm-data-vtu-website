"use client";
import React, { useState, useEffect } from "react";
import { getAdminPlans, addAdminPlan, deleteAdminPlan } from "@/lib/adminStore";
import { FaTrash, FaPlus, FaTag } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    network: "",
    type: "Data",
    planId: "",
    name: "",
    price: "",
    duration: "30 days"
  });

  useEffect(() => {
    setPlans(getAdminPlans());
  }, []);

  const handleAddPlan = (e) => {
    e.preventDefault();
    if (!formData.network || !formData.planId || !formData.name || !formData.price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const updated = addAdminPlan(formData);
    setPlans(updated);
    toast.success("Plan added successfully!");
    
    // Reset form
    setFormData({
      ...formData,
      planId: "",
      name: "",
      price: ""
    });
  };

  const handleDelete = (planId, name) => {
    if (confirm(`Are you sure you want to delete the plan: ${name}?`)) {
      const updated = deleteAdminPlan(planId);
      setPlans(updated);
      toast.success("Plan deleted successfully.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Plans</h1>
        <p className="text-slate-500 mt-1">Create new subscription plans or remove old ones.</p>
      </div>

      {/* Create Plan Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <FaPlus className="text-blue-500" />
          <h2 className="font-bold text-slate-800">Create New Plan</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddPlan} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Network</label>
              <select 
                value={formData.network}
                onChange={(e) => setFormData({...formData, network: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                required
              >
                <option value="" disabled>Select Network</option>
                <option value="MTN">MTN</option>
                <option value="Airtel">Airtel</option>
                <option value="Glo">Glo</option>
                <option value="9mobile">9mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Data">Data (SME, CG, Gifting)</option>
                <option value="Airtime">Airtime</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan ID / Code</label>
              <input 
                type="text" 
                value={formData.planId}
                onChange={(e) => setFormData({...formData, planId: e.target.value})}
                placeholder="e.g. 101 or sme_1gb"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. MTN SME 1GB"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan Price (₦)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="e.g. 250"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
              <input 
                type="text" 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="e.g. 30 days"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
              <button 
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <FaPlus /> Add Plan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <FaTag className="text-purple-500" />
          <h2 className="font-bold text-slate-800">Active Plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Network</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Plan ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    No active plans available.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        plan.network.toUpperCase() === "MTN" ? "bg-yellow-100 text-yellow-800" :
                        plan.network.toUpperCase() === "AIRTEL" ? "bg-red-100 text-red-800" :
                        plan.network.toUpperCase() === "GLO" ? "bg-green-100 text-green-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {plan.network}
                      </span>
                    </td>
                    <td className="px-6 py-4">{plan.type}</td>
                    <td className="px-6 py-4 font-mono text-xs">{plan.planId}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{plan.name}</td>
                    <td className="px-6 py-4">{plan.duration}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">₦{Number(plan.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(plan.id, plan.name)}
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
    </div>
  );
}
