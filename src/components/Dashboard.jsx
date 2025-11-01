"use client";

import React from "react";
import { Chart, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";

Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Tooltip, Legend);

const Dashboard = () => {
  // Example data (replace with real data from backend)
  const userStats = { active: 120, inactive: 15 };
  const dealStats = { pending: 10, won: 25, lost: 5 };
  const walletStats = [
    { name: "Cash", balance: 5000 },
    { name: "Bank", balance: 12000 },
    { name: "Mobile", balance: 3000 },
  ];

  // Chart data samples
  const barData = {
    labels: ["Active", "Inactive"],
    datasets: [{ label: "Users", data: [userStats.active, userStats.inactive], backgroundColor: ["#00f2fe", "#4e54c8"] }],
  };
  const doughnutData = {
    labels: ["Pending", "Won", "Lost"],
    datasets: [{ data: [dealStats.pending, dealStats.won, dealStats.lost], backgroundColor: ["#43cea2", "#185a9d", "#f7971e"] }],
  };
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ label: "Revenue", data: [1200, 1900, 1700, 2200, 2500], borderColor: "#00f2fe", backgroundColor: "rgba(0,242,254,0.1)", tension: 0.4 }],
  };

  return (
    <div className="pt-20 md:pl-72 p-6 md:p-10 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 min-h-screen animate-fade-in text-gray-900 dark:text-white">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-3xl font-bold mb-8 mt-20 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
        XhenVault Dashboard
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-lg font-semibold mb-2">Users</span>
          <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-lg font-semibold mb-2">Deals</span>
          <Doughnut data={doughnutData} />
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-lg font-semibold mb-2">Revenue</span>
          <Line data={lineData} />
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Wallet Balances</h2>
          <ul>
            {walletStats.map((wallet) => (
              <li key={wallet.name} className="flex justify-between py-2 border-b border-gray-700">
                <span>{wallet.name}</span>
                <span className="font-mono text-cyan-400">${wallet.balance.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <span className="block text-sm">Companies</span>
              <span className="text-2xl font-bold text-blue-400">8</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <span className="block text-sm">Assets</span>
              <span className="text-2xl font-bold text-green-400">15</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <span className="block text-sm">Events</span>
              <span className="text-2xl font-bold text-purple-400">12</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <span className="block text-sm">Tasks</span>
              <span className="text-2xl font-bold text-pink-400">23</span>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Add more advanced charts, animated visuals, and futuristic graphics as needed */}
    </div>
  );
};

export default Dashboard;