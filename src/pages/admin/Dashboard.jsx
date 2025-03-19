import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSection from "../../components/AdminSection";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  return <AdminSection />;
};

export default Dashboard;
