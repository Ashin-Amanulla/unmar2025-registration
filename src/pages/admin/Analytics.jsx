import { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  CurrencyDollarIcon,
  HomeIcon,
  HandRaisedIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const AnalyticCard = ({
  title,
  count,
  icon: Icon,
  color,
  onClick,
  isActive,
}) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-lg ${
      isActive ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white"
    } shadow-sm hover:shadow-md transition-all`}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">{count}</p>
      </div>
    </div>
  </button>
);

const Analytics = () => {
  const [selectedCategory, setSelectedCategory] = useState("pending_payment");
  const { useAnalytics } = useAdmin();
  const { data, isLoading } = useAnalytics();
  const { isAuthenticated } = useAuthStore();

  const categories = [
    {
      id: "pending_payment",
      title: "Pending Payments",
      icon: CurrencyDollarIcon,
      color: "bg-red-500",
      count: data?.pendingPayments || 0,
    },
    {
      id: "need_accommodation",
      title: "Need Accommodation",
      icon: HomeIcon,
      color: "bg-blue-500",
      count: data?.needAccommodation || 0,
    },
    {
      id: "volunteers",
      title: "Volunteers",
      icon: HandRaisedIcon,
      color: "bg-green-500",
      count: data?.volunteers || 0,
    },
    {
      id: "ride_share",
      title: "Ride Share",
      icon: TruckIcon,
      color: "bg-yellow-500",
      count: data?.rideShare || 0,
    },
    {
      id: "sponsors",
      title: "Potential Sponsors",
      icon: UserGroupIcon,
      color: "bg-purple-500",
      count: data?.sponsors || 0,
    },
    {
      id: "district_wise",
      title: "District Analysis",
      icon: ChartBarIcon,
      color: "bg-indigo-500",
      count: "View",
    },
  ];

  const districtData = {
    labels: data?.districtWise?.map((d) => d.district) || [],
    datasets: [
      {
        label: "Registrations",
        data: data?.districtWise?.map((d) => d.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  if (!isAuthenticated) return null;

  const renderDetailsList = () => {
    const listData = data?.[selectedCategory] || [];

    return (
      <div className="bg-white rounded-lg shadow-sm mt-6">
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
                {selectedCategory === "pending_payment" && (
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
                  {selectedCategory === "pending_payment" && (
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Detailed analysis of registrations and participant preferences
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <AnalyticCard
                key={category.id}
                {...category}
                isActive={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>

          {selectedCategory === "district_wise" ? (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            renderDetailsList()
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
