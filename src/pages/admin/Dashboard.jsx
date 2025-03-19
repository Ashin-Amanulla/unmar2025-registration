import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalContributions: 0,
    pendingVerifications: 0,
    activeEvents: 0,
  });

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setStats(data);
    },
  });

  const statCards = [
    {
      title: "Total Registrations",
      value: stats.totalRegistrations,
      icon: UserGroupIcon,
      color: "bg-blue-500",
    },
    {
      title: "Total Contributions",
      value: `₹${stats.totalContributions.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: CalendarIcon,
      color: "bg-yellow-500",
    },
    {
      title: "Active Events",
      value: stats.activeEvents,
      icon: ChartBarIcon,
      color: "bg-purple-500",
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your registrations today.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
              <div className="h-4 w-24 bg-gray-200 mb-2"></div>
              <div className="h-6 w-16 bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-600">
                {stat.title}
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Add your recent activity table or list here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
