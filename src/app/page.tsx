"use client";
import Image from "next/image";
import Dashboard from "../components/Dashboard";
import React from "react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text"
      >
        XhenVault
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl text-gray-300 text-center max-w-2xl"
      >
        Your comprehensive business management platform for CRM, finance, and
        operations.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="w-full max-w-3xl flex flex-col md:flex-row gap-8 justify-center items-center"
      >
        <div className="bg-gradient-to-br from-cyan-700 to-blue-800 rounded-xl shadow-xl p-8 flex-1 text-center">
          <span className="block text-2xl font-bold mb-2 text-cyan-300">
            All-in-One Management
          </span>
          <span className="block text-gray-200">
            CRM, Finance, Assets, Planning, and more
          </span>
        </div>
        <div className="bg-gradient-to-br from-blue-700 to-cyan-800 rounded-xl shadow-xl p-8 flex-1 text-center">
          <span className="block text-2xl font-bold mb-2 text-blue-300">
            Futuristic Analytics
          </span>
          <span className="block text-gray-200">
            Advanced charts, real-time dashboards, and AI-powered insights
          </span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4 }}
        className="mt-12"
      >
        <a
          href="/dashboard"
          className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl shadow-lg hover:scale-105 transition-transform"
        >
          Enter Dashboard
        </a>
      </motion.div>
    </div>
  );
}
