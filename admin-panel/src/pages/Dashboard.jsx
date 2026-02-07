import { useEffect } from "react";
import { useAdminStore } from "../store";
import "./Dashboard.css";

const Dashboard = () => {
  const { users, isLoading, error, loadUsers } = useAdminStore();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Calculate stats
  const totalUsers = users.length;
  const totalBuyers = users.filter((u) => u.role === "buyer").length;
  const totalSellers = users.filter((u) => u.role === "seller").length;
  const pendingApprovals = users.filter((u) => !u.isApproved).length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Manage and monitor your furniture marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{totalUsers}</p>
          </div>
        </div>

        <div className="stat-card buyers">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <p className="stat-label">Buyers</p>
            <p className="stat-value">{totalBuyers}</p>
          </div>
        </div>

        <div className="stat-card sellers">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <p className="stat-label">Sellers</p>
            <p className="stat-value">{totalSellers}</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pending Approval</p>
            <p className="stat-value">{pendingApprovals}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
