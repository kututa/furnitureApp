import { useEffect, useState } from "react";
import UsersTable from "../components/UsersTable";
import { useAdminStore } from "../store";
import "./UsersPage.css";

const UsersPage = () => {
  const { users, isLoading, error, loadUsers, approve, suspend, remove } =
    useAdminStore();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    if (activeTab === "buyers") return user.role === "buyer";
    if (activeTab === "sellers") return user.role === "seller";
    return true; // "all"
  });

  return (
    <div className="users-page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Users Management</h1>
        <p>Manage and monitor all users on your platform</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          onClick={() => setActiveTab("all")}
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-label">All Users</span>
          <span className="tab-count">{users.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("buyers")}
          className={`tab-button ${activeTab === "buyers" ? "active" : ""}`}
        >
          <span className="tab-icon">🛍️</span>
          <span className="tab-label">Buyers</span>
          <span className="tab-count">
            {users.filter((u) => u.role === "buyer").length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("sellers")}
          className={`tab-button ${activeTab === "sellers" ? "active" : ""}`}
        >
          <span className="tab-icon">🏪</span>
          <span className="tab-label">Sellers</span>
          <span className="tab-count">
            {users.filter((u) => u.role === "seller").length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="users-content">
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <div className="users-info">
              <p>
                Showing {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""}
              </p>
            </div>
            <UsersTable
              users={filteredUsers}
              onApprove={approve}
              onSuspend={suspend}
              onDelete={remove}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
