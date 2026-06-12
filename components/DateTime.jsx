"use client";
import React, { useState, useEffect } from "react";

export default function DateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm px-4 p-2 rounded-2xl shadow-sm border border-slate-200 text-center">
      <p className="text-xs text-slate-600 mb-1">
        {currentTime.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="text-medium md:text-lg font-semibold text-slate-900 font-mono tracking-wider">
        {currentTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
    </div>
  );
}
