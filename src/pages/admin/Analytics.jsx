import React, { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  CurrencyDollarIcon,
  HomeIcon,
  HandRaisedIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  IdentificationIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Loading from "../../components/ui/Loading";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  PointElement,
  LineElement
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-500`} />
    </div>
  </div>
);

const CategoryTab = ({ id, title, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center px-4 py-2.5 rounded-md transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    <Icon className="w-5 h-5 mr-2" />
    <span className="font-medium">{title}</span>
  </button>
);

const Analytics = () => {
  const [activeCategory, setActiveCategory] = useState("district_wise");
  const { useAnalytics } = useAdmin();
  const { data, isLoading } = useAnalytics();
  const { isAuthenticated } = useAuthStore();

  // Data for various statistics
  const totalRegistrations =
    (data?.registrationTypeCount?.alumni || 0) +
    (data?.registrationTypeCount?.staff || 0) +
    (data?.registrationTypeCount?.other || 0);

  const totalRevenue =
    data?.pendingPayments?.reduce(
      (acc, payment) => acc + (payment.amountDue || 0),
      0
    ) || 0;

  // Summary statistics cards
  const statCards = [
    {
      title: "Total Registrations",
      value: totalRegistrations,
      icon: IdentificationIcon,
      color: "blue",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue}`,
      icon: CurrencyDollarIcon,
      color: "green",
    },
    {
      title: "Alumni Count",
      value: data?.registrationTypeCount?.alumni || 0,
      icon: AcademicCapIcon,
      color: "yellow",
    },
    {
      title: "Completed Payments",
      value: data?.paymentStatusCount?.completed || 0,
      icon: BanknotesIcon,
      color: "purple",
    },
  ];

  // Category tabs for different analytics views
  const categoryTabs = [
    {
      id: "district_wise",
      title: "District Analysis",
      icon: ChartBarIcon,
    },
    {
      id: "school_participation",
      title: "School Distribution",
      icon: AcademicCapIcon,
    },
    {
      id: "registration_types",
      title: "Registration Types",
      icon: IdentificationIcon,
    },
    {
      id: "payment_status",
      title: "Payment Status",
      icon: BanknotesIcon,
    },
    {
      id: "pending_payment",
      title: "Pending Payments",
      icon: CurrencyDollarIcon,
    },
    {
      id: "need_accommodation",
      title: "Need Accommodation",
      icon: HomeIcon,
    },
    {
      id: "volunteers",
      title: "Volunteers",
      icon: HandRaisedIcon,
    },
    {
      id: "ride_share",
      title: "Ride Share",
      icon: TruckIcon,
    },
    {
      id: "sponsors",
      title: "Potential Sponsors",
      icon: UserGroupIcon,
    },
  ];

  // Chart data preparations
  const districtData = {
    labels: data?.districtWise?.map((d) => d.district) || [],
    datasets: [
      {
        label: "Registrations",
        data: data?.districtWise?.map((d) => d.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const schoolData = {
    labels: data?.schoolWise?.map((s) => s.school) || [],
    datasets: [
      {
        label: "Alumni",
        data: data?.schoolWise?.map((s) => s.count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(236, 72, 153, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(20, 184, 166, 0.7)",
          "rgba(217, 119, 6, 0.7)",
          "rgba(124, 58, 237, 0.7)",
          "rgba(221, 214, 254, 0.7)",
          "rgba(254, 202, 202, 0.7)",
          "rgba(209, 250, 229, 0.7)",
          "rgba(252, 211, 77, 0.7)",
          "rgba(167, 139, 250, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const registrationTypeData = {
    labels: ["Alumni", "Staff", "Other"],
    datasets: [
      {
        data: [
          data?.registrationTypeCount?.alumni || 0,
          data?.registrationTypeCount?.staff || 0,
          data?.registrationTypeCount?.other || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentStatusData = {
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        data: [
          data?.paymentStatusCount?.completed || 0,
          data?.paymentStatusCount?.pending || 0,
          data?.paymentStatusCount?.failed || 0,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!isAuthenticated) return null;

  // Render data tables for list categories
  const renderDetailsList = () => {
    const listData = data?.[activeCategory] || [];

    if (listData.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">No data available for this category</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {categoryTabs.find((c) => c.id === activeCategory)?.title ||
              "Details"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                {activeCategory === "pending_payment" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Due
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.phone}</div>
                  </td>
                  {activeCategory === "pending_payment" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        ₹{item.amountDue}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render appropriate content based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case "district_wise":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              District-wise Registration Analysis
            </h3>
            <div className="h-[400px]">
              <Bar
                data={districtData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                    x: {
                      ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                  plugins: {
                    legend: { position: "top" },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        );

      case "school_participation":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              JNV School Participation Analysis
            </h3>
            <div className="h-[500px]">
              <Bar
                data={schoolData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 },
                    },
                    x: {
                      ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                  plugins: {
                    legend: { position: "top" },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        );

      case "registration_types":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registration Type Distribution
            </h3>
            <div className="flex justify-center h-[400px]">
              <div className="w-full max-w-md">
                <Pie
                  data={registrationTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );

      case "payment_status":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Payment Status Distribution
            </h3>
            <div className="flex justify-center h-[400px]">
              <div className="w-full max-w-md">
                <Pie
                  data={paymentStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );

      default:
        return renderDetailsList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive analytics for UNMA 2025 registrations and contributions
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loading />
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Quick Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>
          </section>

          {/* Analytics Categories */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Detailed Analytics
            </h2>

            {/* Category Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {categoryTabs.map((category) => (
                  <CategoryTab
                    key={category.id}
                    id={category.id}
                    title={category.title}
                    icon={category.icon}
                    isActive={activeCategory === category.id}
                    onClick={setActiveCategory}
                  />
                ))}
              </div>
            </div>

            {/* Content Area */}
            {renderContent()}
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;
