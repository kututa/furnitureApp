import { useState } from "react";
import "./UsersTable.css";

const UsersTable = ({ users = [], onApprove, onSuspend, onDelete }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const handleApprove = async (userId) => {
    setLoadingId(userId);
    setError(null);
    try {
      await onApprove(userId);
    } catch (err) {
      setError(`Failed to approve user: ${err.message}`);
      console.error("Approve error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuspend = async (userId) => {
    setLoadingId(userId);
    setError(null);
    try {
      await onSuspend(userId);
    } catch (err) {
      setError(`Failed to suspend user: ${err.message}`);
      console.error("Suspend error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    setLoadingId(userId);
    setError(null);
    try {
      await onDelete(userId);
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Suspended</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName || "N/A"}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isApproved ? "Yes" : "No"}</td>
                <td>{user.isSuspended ? "Yes" : "No"}</td>
                <td>
                  {!user.isApproved && (
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(user._id)}
                      disabled={loadingId === user._id}
                    >
                      {loadingId === user._id ? "Approving..." : "Approve"}
                    </button>
                  )}
                  <button
                    className="suspend-btn"
                    onClick={() => handleSuspend(user._id)}
                    disabled={loadingId === user._id}
                  >
                    {loadingId === user._id
                      ? "Processing..."
                      : user.isSuspended
                        ? "Reactivate"
                        : "Suspend"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user._id)}
                    disabled={loadingId === user._id}
                  >
                    {loadingId === user._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};

export default UsersTable;
