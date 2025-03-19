import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../api";

const Login = () => {
  const navigate = useNavigate();

  // Use mutation hook directly instead of through useAdmin
  const loginMutation = useMutation({
    mutationFn: adminApi.login,
    onSuccess: (data) => {
      // Store token and redirect
      localStorage.setItem("adminToken", data.token || "mock-jwt-token");
      navigate("/admin/dashboard");
    },
  });

  // Form state without useState
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    loginMutation.mutate({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  };

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">UNMA 2025</h2>
          <p className="mt-2 text-gray-600">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {loginMutation.error?.message || "Invalid email or password"}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              defaultValue=""
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              defaultValue=""
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn btn-primary w-full"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Use the following credentials for testing:</p>
          <p className="mt-1">Email: admin@unma2025.org</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
