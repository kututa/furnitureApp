import { useEffect } from "react";
import UsersTable from "../components/UsersTable";
import { useAdminStore } from "../store";

const UsersPage = () => {
  const { users, isLoading, error, loadUsers, approve, suspend, remove } =
    useAdminStore();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div style={{ padding: 32 }}>
      <h2>All Users</h2>
      {error && <p>{error}</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <UsersTable
          users={users}
          onApprove={approve}
          onSuspend={suspend}
          onDelete={remove}
        />
      )}
    </div>
  );
};

export default UsersPage;
