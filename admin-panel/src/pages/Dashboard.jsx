import { useEffect } from "react";
import UsersTable from "../components/UsersTable";
import { useAdminStore } from "../store";

const Dashboard = () => {
  const { users, isLoading, error, loadUsers, approve, suspend, remove } =
    useAdminStore();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleApprove = async (id) => {
    await approve(id);
  };

  const handleSuspend = async (id) => {
    await suspend(id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await remove(id);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>
      {error && <p>{error}</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <UsersTable
          users={users}
          onApprove={handleApprove}
          onSuspend={handleSuspend}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Dashboard;
