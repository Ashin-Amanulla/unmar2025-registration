import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api";
import { useAdminStore } from "../../store";
import { useState } from "react";

const Registrations = () => {
  const queryClient = useQueryClient();
  const { registrationsFilters, updateRegistrationsFilters } = useAdminStore();
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Use React Query directly
  const {
    data: registrationsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["registrations", registrationsFilters],
    queryFn: () => adminApi.getRegistrations(registrationsFilters),
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => adminApi.exportRegistrations(registrationsFilters),
    onSuccess: (data) => {
      // Create a downloadable blob
      const blob = new Blob([data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "registrations.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateRegistration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      setSelectedRegistration(null);
    },
  });

  // Handle search
  const handleSearch = (e) => {
    updateRegistrationsFilters({
      searchTerm: e.target.value,
      page: 1,
    });
  };

  // Change filter
  const handleFilterChange = (filterName, value) => {
    updateRegistrationsFilters({
      [filterName]: value,
      page: 1,
    });
  };

  // Change page
  const handlePageChange = (page) => {
    updateRegistrationsFilters({ page });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !registrationsData) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Unable to load registrations
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { registrations, schools, totalCount, currentPage, totalPages } =
    registrationsData;

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Registrations
          </h1>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="btn btn-primary"
          >
            {exportMutation.isPending ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email or phone"
                className="form-input"
                value={registrationsFilters.searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="w-full md:w-48">
              <select
                className="form-select"
                value={registrationsFilters.school}
                onChange={(e) => handleFilterChange("school", e.target.value)}
              >
                <option value="All">All Schools</option>
                {schools?.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                className="form-select"
                value={registrationsFilters.paymentStatus}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email/Phone</th>
                  <th className="table-th">School</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="table-td font-medium">{reg.id}</td>
                      <td className="table-td">{reg.name}</td>
                      <td className="table-td">
                        <div>{reg.email}</div>
                        <div className="text-xs text-gray-500">{reg.phone}</div>
                      </td>
                      <td className="table-td">{reg.school}</td>
                      <td className="table-td">{reg.registrationType}</td>
                      <td className="table-td">₹{reg.amount}</td>
                      <td className="table-td">
                        <span
                          className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                            reg.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : reg.paymentStatus === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td className="table-td">
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="table-td">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRegistration(reg)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this registration?"
                                )
                              ) {
                                updateMutation.mutate({
                                  id: reg.id,
                                  data: { status: "deleted" },
                                });
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * registrationsFilters.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * registrationsFilters.limit,
                        totalCount
                      )}
                    </span>{" "}
                    of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn rounded-l-md"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`pagination-btn ${
                          currentPage === i + 1
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn rounded-r-md"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registrations;
