"use client";
import React, { useState, useEffect } from "react";
import { getAdminStats } from "@/lib/adminStore";
import { FaUsers, FaUserCheck, FaWallet, FaUserPlus } from "react-icons/fa";
import { format, subDays } from "date-fns";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);

const CustomBarChart = ({ data, labels, title, prefix = "" }) => {
  const maxVal = Math.max(...data, 1000); // Ensure there's some scale
  
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">{title}</h3>
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((val, i) => {
          const heightPct = Math.max((val / maxVal) * 100, 2); // min 2% height
          return (
            <div key={i} className="flex flex-col items-center flex-1 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {prefix}{val.toLocaleString()}
              </div>
              {/* Bar */}
              <div className="w-full max-w-[40px] bg-slate-100 rounded-t-lg relative overflow-hidden h-full flex items-end">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-blue-600"
                  style={{ height: `${heightPct}%` }}
                ></div>
              </div>
              {/* Label */}
              <span className="text-xs text-slate-500 font-medium mt-3 text-center truncate w-full">
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to simulate data loading and let animation play
    const timer = setTimeout(() => {
      setStats(getAdminStats());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate labels
  const dailyLabels = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), "MMM dd"));
  const weeklyLabels = ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={FaUsers} 
          colorClass="text-blue-600" 
          bgClass="bg-blue-50" 
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers.toLocaleString()} 
          icon={FaUserCheck} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-50" 
        />
        <StatCard 
          title="Total Funds" 
          value={`₦${stats.totalFunds.toLocaleString()}`} 
          icon={FaWallet} 
          colorClass="text-purple-600" 
          bgClass="bg-purple-50" 
        />
        <StatCard 
          title="New Users (Today)" 
          value={stats.newUsersToday.toLocaleString()} 
          icon={FaUserPlus} 
          colorClass="text-amber-600" 
          bgClass="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomBarChart 
          title="Daily Revenue (Last 7 Days)" 
          data={stats.dailySales} 
          labels={dailyLabels} 
          prefix="₦"
        />
        <CustomBarChart 
          title="Weekly Revenue (Last 4 Weeks)" 
          data={stats.weeklySales} 
          labels={weeklyLabels} 
          prefix="₦"
        />
      </div>
    </div>
  );
}
