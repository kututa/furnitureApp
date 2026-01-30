import { useEffect, useState } from "react";
import { approveUser, deleteUser, fetchUsers, suspendUser } from "../api/users";
import UsersTable from "../components/UsersTable";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await fetchUsers();
      setUsers(data);
    } catch (err) {
      alert("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (id) => {
    await approveUser(id);
    loadUsers();
  };

  const handleSuspend = async (id) => {
    await suspendUser(id);
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>
      {loading ? (
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
