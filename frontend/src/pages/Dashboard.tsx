import React, { useEffect, useState } from "react";
import api from "../api/client";

import {
  Users,
  School,
  FileText,
  BookOpen,
  Layers,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    institutes: 0,
    questionSets: 0,
    tests: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, institutesRes, questionSetsRes, testsRes, coursesRes] =
        await Promise.all([
          api.get("/users"),
          api.get("/institutes"),
          api.get("/questionset/all"),
          api.get("/test/all"),
          api.get("/course/all"),
        ]);

      setStats({
        users: usersRes.data.count || 0,
        institutes: institutesRes.data.count || 0,
        questionSets: questionSetsRes.data.count || 0,
        tests: testsRes.data.count || 0,
        courses: coursesRes.data.count || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const statCard = (
    Icon: React.ElementType,
    label: string,
    value: number,
    gradient: string
  ) => (
    <motion.div
      whileHover={{ y: -6, scale: 1.04 }}
      className="relative overflow-hidden p-6 rounded-2xl shadow-lg bg-white border border-gray-100 hover:shadow-2xl transition-all"
    >
      {/* Background accent */}
      <div
        className={`absolute inset-0 opacity-5 bg-gradient-to-br ${gradient}`}
      />

      {/* Bottom accent bar */}
      <motion.div
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.4 }}
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient}`}
      />

      <div className="relative flex items-center">
        <div
          className={`p-4 rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 fade-in p-6">
      {/* 🔹 Header (like Institutes page) */}
      <div className="bg-white p-4 rounded-t-xl border shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center">
          {/* Left */}
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <LayoutDashboard size={32} className="text-gray-800" />
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Stats Section */}
      <div className="bg-white rounded-b-xl shadow-md p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {statCard(Users, "Total Users", stats.users, "from-blue-500 to-blue-700")}
          {statCard(
            School,
            "Institutes",
            stats.institutes,
            "from-green-500 to-green-700"
          )}
          {statCard(
            FileText,
            "Question Sets",
            stats.questionSets,
            "from-yellow-400 to-orange-500"
          )}
          {statCard(
            Layers,
            "Tests",
            stats.tests,
            "from-purple-500 to-indigo-600"
          )}
          {statCard(
            BookOpen,
            "Courses",
            stats.courses,
            "from-red-500 to-pink-600"
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
